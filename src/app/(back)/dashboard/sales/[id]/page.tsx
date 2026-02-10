'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useSalesOrder, useSalesOrderItems } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import { salesService } from '@/modules/sales/services'
import { remissionService, REMISSION_STATUS_LABELS } from '@/modules/sales/services/remissionService'
import type { Remission } from '@/modules/sales/services/remissionService'
import { toast } from '@/lib/toast'
import axiosClient from '@/lib/axiosClient'
import AddItemModal from '@/modules/sales/components/AddItemModal'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SalesOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const navigation = useNavigationProgress()
  const [showAddModal, setShowAddModal] = useState(false)
  const [remissions, setRemissions] = useState<Remission[]>([])
  const [remissionsLoading, setRemissionsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { salesOrder, isLoading: orderLoading, error: orderError } = useSalesOrder(resolvedParams.id)
  const { salesOrderItems, isLoading: itemsLoading, error: itemsError, mutate: mutateItems } = useSalesOrderItems(resolvedParams.id)

  const loadRemissions = useCallback(async () => {
    try {
      setRemissionsLoading(true)
      const result = await remissionService.getForOrder(resolvedParams.id)
      setRemissions(result.remissions)
    } catch {
      // Silently fail - remissions are supplementary
    } finally {
      setRemissionsLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    loadRemissions()
  }, [loadRemissions])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success'
      case 'approved': return 'bg-primary'
      case 'pending': return 'bg-warning'
      case 'cancelled': return 'bg-danger'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'approved': return 'Aprobada'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const handleGenerateRemission = async () => {
    if (!confirm('Generar remision con todos los items de esta orden?')) return
    setActionLoading('remission')
    try {
      await remissionService.createFromOrderFull(resolvedParams.id)
      toast.success('Remision generada correctamente')
      await loadRemissions()
    } catch {
      toast.error('Error al generar la remision')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePrintRemission = async (remId: string) => {
    setActionLoading(`print-${remId}`)
    try {
      await remissionService.print(remId)
      toast.success('Remision marcada como impresa')
      await loadRemissions()
    } catch {
      toast.error('Error al imprimir remision')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeliverRemission = async (remId: string) => {
    if (!confirm('Marcar remision como entregada?')) return
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

  const handleDownloadRemissionPdf = async (remId: string) => {
    try {
      await remissionService.downloadPdf(remId)
    } catch {
      toast.error('Error al descargar PDF')
    }
  }

  const handleCancelRemission = async (remId: string) => {
    if (!confirm('Cancelar esta remision? Esta accion no se puede deshacer.')) return
    setActionLoading(`cancel-${remId}`)
    try {
      await remissionService.cancel(remId)
      toast.success('Remision cancelada')
      await loadRemissions()
    } catch {
      toast.error('Error al cancelar remision')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Cancelar esta orden de venta? Esta accion no se puede deshacer.')) return
    setActionLoading('cancel-order')
    try {
      await salesService.orders.cancel(resolvedParams.id)
      toast.success('Orden cancelada exitosamente')
      window.location.reload()
    } catch {
      toast.error('Error al cancelar la orden')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePrintOrder = async () => {
    try {
      const response = await axiosClient.get(`/api/v1/sales-orders/${resolvedParams.id}/pdf/stream`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      toast.error('Error al generar PDF de la orden')
    }
  }

  if (orderLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando orden...</span>
          </div>
        </div>
      </div>
    )
  }

  if (orderError) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar la orden: {orderError.message}
        </div>
      </div>
    )
  }

  if (!salesOrder) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Orden no encontrada
        </div>
      </div>
    )
  }

  const isActive = salesOrder.status !== 'cancelled' && salesOrder.status !== 'completed'

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-receipt me-3"></i>
                Orden de Venta #{salesOrder.orderNumber}
              </h1>
              <p className="text-muted">
                Detalles completos de la orden de venta
              </p>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigation.push('/dashboard/sales')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Sales
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigation.push(`/dashboard/sales/${resolvedParams.id}/edit`)}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigation.push(`/dashboard/sales/${resolvedParams.id}/items`)}
              >
                <i className="bi bi-box-seam me-2"></i>
                Ver Items ({salesOrderItems?.length || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Informacion principal */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informacion de la Orden
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Numero de Orden:</strong></td>
                        <td>{salesOrder.orderNumber}</td>
                      </tr>
                      <tr>
                        <td><strong>Estado:</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(salesOrder.status)}`}>
                            {getStatusText(salesOrder.status)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Fecha de Orden:</strong></td>
                        <td>
                          {salesOrder.orderDate ? new Date(salesOrder.orderDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : 'Sin fecha'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Total:</strong></td>
                        <td>
                          <strong className="text-success">
                            {formatCurrency(salesOrder.totalAmount)}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Cliente:</strong></td>
                        <td>
                          {salesOrder.contact ? (
                            <div>
                              <strong>{salesOrder.contact.name}</strong>
                              <br />
                              <small className="text-muted">{salesOrder.contact.email}</small>
                            </div>
                          ) : (
                            `Cliente ID: ${salesOrder.contactId}`
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Descuento:</strong></td>
                        <td>
                          {(salesOrder.discountTotal ?? 0) > 0 ? (
                            <span className="text-warning">
                              -{formatCurrency(salesOrder.discountTotal ?? 0)}
                            </span>
                          ) : (
                            <span className="text-muted">Sin descuento</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Creada:</strong></td>
                        <td>
                          {salesOrder.createdAt ? new Date(salesOrder.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Actualizada:</strong></td>
                        <td>
                          {salesOrder.updatedAt ? new Date(salesOrder.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {salesOrder.notes && (
                <div className="mt-3">
                  <h6>Notas:</h6>
                  <p className="text-muted">{salesOrder.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Remissions section */}
          <div className="card mt-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-truck me-2"></i>
                Remisiones ({remissions.length})
              </h5>
              {isActive && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={handleGenerateRemission}
                  disabled={actionLoading === 'remission'}
                >
                  {actionLoading === 'remission' ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : (
                    <i className="bi bi-plus me-1" />
                  )}
                  Generar Remision
                </button>
              )}
            </div>
            <div className="card-body p-0">
              {remissionsLoading ? (
                <div className="text-center py-3">
                  <span className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : remissions.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-truck" style={{ fontSize: '2rem' }} />
                  <p className="mt-2 mb-0">No hay remisiones para esta orden.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Numero</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Items</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remissions.map((rem) => {
                        const statusConfig = REMISSION_STATUS_LABELS[rem.status] || REMISSION_STATUS_LABELS.draft
                        return (
                          <tr key={rem.id}>
                            <td className="fw-medium">{rem.remissionNumber || `REM-${rem.id}`}</td>
                            <td>
                              <span className={`badge ${statusConfig.badgeClass}`}>{statusConfig.label}</span>
                            </td>
                            <td>
                              {rem.remissionDate
                                ? new Date(rem.remissionDate).toLocaleDateString('es-ES')
                                : rem.createdAt
                                  ? new Date(rem.createdAt).toLocaleDateString('es-ES')
                                  : 'N/A'}
                            </td>
                            <td>{rem.totalItems ?? '-'}</td>
                            <td>
                              <div className="d-flex gap-1">
                                {rem.status === 'draft' && (
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handlePrintRemission(rem.id)}
                                    disabled={actionLoading === `print-${rem.id}`}
                                    title="Imprimir (genera PDF)"
                                  >
                                    <i className="bi bi-printer" />
                                  </button>
                                )}
                                {rem.status === 'printed' && (
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleDeliverRemission(rem.id)}
                                    disabled={actionLoading === `deliver-${rem.id}`}
                                    title="Marcar como entregada"
                                  >
                                    <i className="bi bi-check-circle" />
                                  </button>
                                )}
                                {(rem.status === 'printed' || rem.status === 'delivered') && (
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleDownloadRemissionPdf(rem.id)}
                                    title="Descargar PDF"
                                  >
                                    <i className="bi bi-file-pdf" />
                                  </button>
                                )}
                                {rem.status !== 'delivered' && rem.status !== 'cancelled' && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleCancelRemission(rem.id)}
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
        </div>

        {/* Resumen de items + Acciones */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-box-seam me-2"></i>
                Resumen de Items
              </h5>
            </div>
            <div className="card-body">
              {itemsLoading ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Cargando items...</span>
                  </div>
                </div>
              ) : itemsError ? (
                <div className="alert alert-warning">
                  Error al cargar items
                </div>
              ) : salesOrderItems && salesOrderItems.length > 0 ? (
                <div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Total de Items:</span>
                    <strong>{salesOrderItems.length}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Cantidad Total:</span>
                    <strong>
                      {formatQuantity(salesOrderItems.reduce((acc: number, item) => acc + (item.quantity || 0), 0))}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Valor Items:</span>
                    <strong className="text-success">
                      {formatCurrency(salesOrderItems.reduce((acc: number, item) => acc + (item.totalPrice || 0), 0))}
                    </strong>
                  </div>
                  <hr />
                  <div className="d-grid">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigation.push(`/dashboard/sales/${resolvedParams.id}/items`)}
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      Ver Todos los Items
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-inbox display-4 mb-3"></i>
                  <p>Sin items en esta orden</p>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="bi bi-plus me-1"></i>
                    Agregar Item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Generar Documentos */}
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Generar Documentos
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted" style={{ fontSize: '13px' }}>
                Genera documentos a partir de esta orden de venta.
              </p>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success"
                  onClick={handleGenerateRemission}
                  disabled={!isActive || actionLoading === 'remission'}
                >
                  {actionLoading === 'remission' ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : (
                    <i className="bi bi-truck me-2"></i>
                  )}
                  Generar Remision
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigation.push('/dashboard/billing/invoices/create')}
                  disabled={!isActive}
                >
                  <i className="bi bi-receipt me-2"></i>
                  Generar Factura
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={() => navigation.push('/dashboard/billing/invoices/create')}
                  disabled={!isActive}
                >
                  <i className="bi bi-file-earmark-medical me-2"></i>
                  Generar Prefactura
                </button>
              </div>
            </div>
          </div>

          {/* Acciones rapidas */}
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-lightning me-2"></i>
                Acciones
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={handlePrintOrder}
                >
                  <i className="bi bi-printer me-2"></i>
                  Imprimir Orden
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleCancelOrder}
                  disabled={!isActive || actionLoading === 'cancel-order'}
                >
                  {actionLoading === 'cancel-order' ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : (
                    <i className="bi bi-x-circle me-2"></i>
                  )}
                  Cancelar Orden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        salesOrderId={resolvedParams.id}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          mutateItems()
          setShowAddModal(false)
        }}
      />
    </div>
  )
}
