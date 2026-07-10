'use client'

/**
 * Remisiones - pantalla basica (Fase A, Venta directa vs Pedido)
 *
 * Lista con filtros basicos, creacion desde una orden por folio,
 * marcar entregada y descarga de PDF. Usa remissionService existente
 * (endpoints ya implementados en Modules/Sales).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { remissionService, salesService, REMISSION_STATUS_LABELS } from '@/modules/sales'
import type { Remission } from '@/modules/sales'
import { toast } from '@/lib/toast'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'

export default function RemissionsPage() {
  const router = useRouter()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const [remissions, setRemissions] = useState<Remission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filtros basicos
  const [statusFilter, setStatusFilter] = useState('')
  const [orderIdFilter, setOrderIdFilter] = useState('')

  // Crear desde orden por folio
  const [orderFolio, setOrderFolio] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const loadRemissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await remissionService.getAll({
        status: statusFilter || undefined,
        salesOrderId: orderIdFilter || undefined,
      })
      setRemissions(result)
    } catch {
      toast.error('Error al cargar las remisiones')
      setRemissions([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, orderIdFilter])

  useEffect(() => {
    loadRemissions()
  }, [loadRemissions])

  // Crear remision (todos los items) desde una orden buscada por folio.
  // Acepta el folio (order_number, filtro JSON:API existente) o el ID numerico.
  const handleCreateFromOrder = async () => {
    const folio = orderFolio.trim()
    if (!folio) {
      toast.error('Captura el folio de la orden de venta')
      return
    }

    setIsCreating(true)
    try {
      let orderId: string | null = null

      const response = await salesService.orders.getAll({ 'filter[order_number]': folio })
      const found = (response?.data || []) as Array<{ id: string }>
      if (found.length > 0) {
        orderId = String(found[0].id)
      } else if (/^\d+$/.test(folio)) {
        // Fallback: permitir capturar el ID directo de la orden
        orderId = folio
      }

      if (!orderId) {
        toast.error(`No se encontro una orden con folio ${folio}`)
        return
      }

      await remissionService.createFromOrderFull(orderId)
      toast.success('Remision generada correctamente')
      setOrderFolio('')
      await loadRemissions()
    } catch (err) {
      const error = err as {
        response?: {
          status?: number
          data?: {
            error?: string
            message?: string
            insufficient_items?: Array<{ product_name: string; required: number; available: number; deficit: number }>
          }
        }
      }
      if (error.response?.status === 422 && error.response.data?.insufficient_items) {
        const items = error.response.data.insufficient_items
        const detail = items
          .map((i) => `${i.product_name}: faltan ${i.deficit} (${i.available}/${i.required})`)
          .join('; ')
        toast.error(`Stock insuficiente: ${detail}`)
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            'Error al generar la remision'
        )
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handlePrint = async (remId: string) => {
    setActionLoading(`print-${remId}`)
    try {
      await remissionService.print(remId)
      toast.success('Remision marcada como impresa')
      await loadRemissions()
    } catch {
      toast.error('Error al imprimir la remision')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeliver = async (remId: string) => {
    const confirmed = await confirmModalRef.current?.confirm('Marcar remision como entregada?', {
      title: 'Confirmar entrega',
      confirmText: 'Marcar entregada',
      cancelText: 'Cancelar',
      confirmVariant: 'warning',
    })
    if (!confirmed) return
    setActionLoading(`deliver-${remId}`)
    try {
      await remissionService.deliver(remId)
      toast.success('Remision marcada como entregada')
      await loadRemissions()
    } catch {
      toast.error('Error al marcar como entregada')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownloadPdf = async (remId: string) => {
    setActionLoading(`pdf-${remId}`)
    try {
      await remissionService.downloadPdf(remId)
    } catch {
      toast.error('Error al descargar el PDF')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (remId: string) => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Cancelar esta remision? Esta accion no se puede deshacer.',
      {
        title: 'Cancelar remision',
        confirmText: 'Cancelar remision',
        cancelText: 'Volver',
        confirmVariant: 'danger',
      }
    )
    if (!confirmed) return
    setActionLoading(`cancel-${remId}`)
    try {
      await remissionService.cancel(remId)
      toast.success('Remision cancelada')
      await loadRemissions()
    } catch {
      toast.error('Error al cancelar la remision')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-truck me-3"></i>
            Remisiones
          </h1>
          <p className="text-muted">Notas de entrega generadas desde ordenes de venta</p>
        </div>
      </div>

      {/* Crear desde orden por folio */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Generar remision desde orden
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label" htmlFor="order-folio">Folio de la orden (o ID)</label>
              <input
                id="order-folio"
                type="text"
                className="form-control"
                placeholder="Ej. OV-000123"
                value={orderFolio}
                onChange={(e) => setOrderFolio(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFromOrder()}
                disabled={isCreating}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-success"
                onClick={handleCreateFromOrder}
                disabled={isCreating || !orderFolio.trim()}
              >
                {isCreating ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-truck me-2"></i>
                )}
                Generar remision
              </button>
            </div>
          </div>
          <small className="text-muted d-block mt-2">
            Genera la remision con todos los items de la orden. Requiere stock disponible.
          </small>
        </div>
      </div>

      {/* Filtros + lista */}
      <div className="card">
        <div className="card-header">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <h5 className="card-title mb-0">Lista de remisiones ({remissions.length})</h5>
            </div>
            <div className="col-md-3 ms-auto">
              <select
                className="form-select form-select-sm"
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="printed">Impresa</option>
                <option value="delivered">Entregada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="ID de orden de venta"
                aria-label="Filtrar por orden"
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando remisiones...</span>
              </div>
            </div>
          ) : remissions.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-truck display-4 mb-3 d-block"></i>
              <p className="mb-0">No hay remisiones para mostrar</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Numero</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Entrega</th>
                    <th className="text-end">Items</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {remissions.map((rem) => {
                    const statusConfig = REMISSION_STATUS_LABELS[rem.status] || REMISSION_STATUS_LABELS.draft
                    return (
                      <tr key={rem.id}>
                        <td className="fw-medium">{rem.remissionNumber || `REM-${rem.id}`}</td>
                        <td>
                          {rem.salesOrderId ? (
                            <button
                              className="btn btn-sm btn-link p-0"
                              onClick={() => router.push(`/dashboard/sales/${rem.salesOrderId}`)}
                            >
                              #{rem.salesOrderId}
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <span className={`badge ${statusConfig.badgeClass}`}>{statusConfig.label}</span>
                        </td>
                        <td>{formatDate(rem.remissionDate || rem.createdAt)}</td>
                        <td>{formatDate(rem.deliveryDate)}</td>
                        <td className="text-end">{rem.totalItems ?? '-'}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            {rem.status === 'draft' && (
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handlePrint(rem.id)}
                                disabled={actionLoading === `print-${rem.id}`}
                                title="Imprimir (genera PDF)"
                              >
                                <i className="bi bi-printer" />
                              </button>
                            )}
                            {rem.status === 'printed' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleDeliver(rem.id)}
                                disabled={actionLoading === `deliver-${rem.id}`}
                                title="Marcar como entregada"
                              >
                                <i className="bi bi-check-circle" />
                              </button>
                            )}
                            {(rem.status === 'printed' || rem.status === 'delivered') && (
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleDownloadPdf(rem.id)}
                                disabled={actionLoading === `pdf-${rem.id}`}
                                title="Descargar PDF"
                              >
                                <i className="bi bi-file-pdf" />
                              </button>
                            )}
                            {rem.status !== 'delivered' && rem.status !== 'cancelled' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancel(rem.id)}
                                disabled={actionLoading === `cancel-${rem.id}`}
                                title="Cancelar"
                              >
                                <i className="bi bi-x" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
