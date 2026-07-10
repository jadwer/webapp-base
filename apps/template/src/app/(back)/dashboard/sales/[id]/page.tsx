'use client'

import { use, useState, useEffect, useCallback, useRef } from 'react'
import { useSalesOrder, useSalesOrderItems } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import { salesService, orderTrackingService, ORDER_TYPE_LABELS, exportSalesOrderItemsCsv } from '@/modules/sales'
import { remissionService, REMISSION_STATUS_LABELS } from '@/modules/sales'
import type { Remission } from '@/modules/sales'
import { OperationsMenu } from '@/modules/sales'
import type { OperationsMenuItem } from '@/modules/sales'
import { toast } from '@/lib/toast'
import axiosClient from '@/lib/axiosClient'
import { AddItemModal } from '@/modules/sales'
import { StockAvailabilityPanel } from '@/modules/sales'
import { useSalesOrderBillingMutations } from '@/modules/billing'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'

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
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { prefacturaFromOrder, facturar } = useSalesOrderBillingMutations()

  const { salesOrder, isLoading: orderLoading, error: orderError, mutate: mutateOrder } = useSalesOrder(resolvedParams.id)
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
    const confirmed = await confirmModalRef.current?.confirm('Generar remision con todos los items de esta orden?', {
      title: 'Confirmar',
      confirmVariant: 'warning'
    })
    if (!confirmed) return
    setActionLoading('remission')
    try {
      await remissionService.createFromOrderFull(resolvedParams.id)
      toast.success('Remision generada correctamente')
      await loadRemissions()
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { error?: string; insufficient_items?: Array<{ product_name: string; sku: string; required: number; available: number; deficit: number }>; suggestion?: string } } }
      if (error.response?.status === 422 && error.response?.data?.insufficient_items) {
        const items = error.response.data.insufficient_items
        const itemsList = items.map(i => `- ${i.product_name} (${i.sku}): necesita ${i.required}, disponible ${i.available}, faltan ${i.deficit}`).join('\n')
        toast.error(`Stock insuficiente:\n${itemsList}\n\n${error.response.data.suggestion || 'Genere una Orden de Compra primero.'}`)
      } else {
        toast.error('Error al generar la remision')
      }
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
    const confirmed = await confirmModalRef.current?.confirm('Marcar remision como entregada?', {
      title: 'Confirmar',
      confirmVariant: 'warning'
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

  const handleDownloadRemissionPdf = async (remId: string) => {
    try {
      await remissionService.downloadPdf(remId)
    } catch {
      toast.error('Error al descargar PDF')
    }
  }

  const handleCancelRemission = async (remId: string) => {
    const confirmed = await confirmModalRef.current?.confirm('Cancelar esta remision? Esta accion no se puede deshacer.', {
      title: 'Confirmar',
      confirmVariant: 'danger'
    })
    if (!confirmed) return
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
    const confirmed = await confirmModalRef.current?.confirm('Cancelar esta orden de venta? Esta accion no se puede deshacer.', {
      title: 'Confirmar',
      confirmVariant: 'danger'
    })
    if (!confirmed) return
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

  const handlePrefactura = async () => {
    setActionLoading('prefactura')
    try {
      const blob = await prefacturaFromOrder(resolvedParams.id)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      toast.error('Error al generar la prefactura')
    } finally {
      setActionLoading(null)
    }
  }

  const handleFacturar = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Se generara el CFDI (factura fiscal) a partir de esta orden de venta. Esta accion no se puede deshacer.',
      {
        title: 'Facturar orden de venta',
        confirmText: 'Facturar',
        cancelText: 'Cancelar',
        confirmVariant: 'primary'
      }
    )
    if (!confirmed) return

    setActionLoading('facturar')
    try {
      const result = await facturar(resolvedParams.id)
      const invoiceData = (result as { data?: { id?: string; attributes?: Record<string, unknown> } })?.data
      const folio = invoiceData?.attributes
        ? `${invoiceData.attributes.series ?? ''}-${invoiceData.attributes.folio ?? ''}`
        : ''
      const invoiceId = invoiceData?.id

      toast.success(
        folio && folio !== '-' ? `Factura ${folio} generada correctamente` : 'Factura generada correctamente'
      )

      if (invoiceId) {
        navigation.push(`/dashboard/billing/invoices/${invoiceId}`)
      } else {
        mutateOrder()
      }
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string; error?: string } } }
      if (error.response?.status === 422) {
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            'La orden no se encuentra en un estado valido para facturar'
        )
      } else if (error.response?.status === 500) {
        toast.error(
          error.response.data?.message ||
            'Error interno al generar la factura. Verifique la configuracion fiscal (CSD, PAC).'
        )
      } else {
        toast.error('Error al facturar la orden de venta')
      }
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

  // Fase A: "Marcar como surtido" = transicion a delivered (workflow existente)
  const handleMarkDelivered = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Marcar la orden como surtida (entregada)? Esto habilita la facturacion.',
      {
        title: 'Marcar como surtido',
        confirmText: 'Marcar surtido',
        cancelText: 'Cancelar',
        confirmVariant: 'primary'
      }
    )
    if (!confirmed) return
    setActionLoading('deliver-order')
    try {
      await orderTrackingService.updateStatus(resolvedParams.id, { status: 'delivered' })
      toast.success('Orden marcada como surtida')
      mutateOrder()
    } catch (err) {
      const error = err as { response?: { data?: { message?: string; error?: string } } }
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Error al marcar la orden como surtida'
      )
    } finally {
      setActionLoading(null)
    }
  }

  // Exportar partidas CSV (client-side, desde los items ya cargados)
  const handleExportCsv = () => {
    if (!salesOrder) return
    if (!salesOrderItems || salesOrderItems.length === 0) {
      toast.error('La orden no tiene partidas para exportar')
      return
    }
    exportSalesOrderItemsCsv(salesOrder.orderNumber, salesOrderItems)
    toast.success('Partidas exportadas')
  }

  // Descarga del PDF de la OC del cliente (pedidos)
  const handleDownloadCustomerPo = async () => {
    if (!salesOrder) return
    setActionLoading('download-po')
    try {
      await salesService.orders.downloadCustomerPo(resolvedParams.id, salesOrder.orderNumber)
    } catch {
      toast.error('Error al descargar el PDF de la OC del cliente')
    } finally {
      setActionLoading(null)
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
  const canInvoice = salesOrder.status === 'delivered' || salesOrder.status === 'completed'
  const canMarkDelivered = !['delivered', 'completed', 'cancelled'].includes(salesOrder.status)

  // Menu Operaciones (Fase A): agrupa facturacion, surtido, cancelacion y exports
  const operationsItems: OperationsMenuItem[] = [
    {
      key: 'facturar',
      label: 'Facturar',
      icon: 'bi-receipt',
      onClick: handleFacturar,
      disabled: actionLoading === 'facturar' || !canInvoice,
      title: canInvoice
        ? 'Generar CFDI a partir de esta orden'
        : 'La orden debe estar entregada o completada para facturar'
    },
    {
      key: 'prefactura',
      label: 'Prefactura',
      icon: 'bi-file-earmark-medical',
      onClick: handlePrefactura,
      disabled: actionLoading === 'prefactura',
      title: 'Vista previa de la prefactura (no crea la factura)'
    },
    {
      key: 'mark-delivered',
      label: 'Marcar como surtido',
      icon: 'bi-box-seam',
      onClick: handleMarkDelivered,
      disabled: actionLoading === 'deliver-order' || !canMarkDelivered,
      title: canMarkDelivered
        ? 'Transicion de la orden a entregada'
        : 'La orden ya esta surtida, completada o cancelada'
    },
    { type: 'divider', key: 'div-docs' },
    {
      key: 'export-csv',
      label: 'Exportar partidas CSV',
      icon: 'bi-filetype-csv',
      onClick: handleExportCsv
    },
    {
      key: 'pdf',
      label: 'PDF de la orden',
      icon: 'bi-file-earmark-pdf',
      onClick: handlePrintOrder
    },
    { type: 'divider', key: 'div-danger' },
    {
      key: 'cancel',
      label: 'Cancelar orden',
      icon: 'bi-x-circle',
      variant: 'danger',
      onClick: handleCancelOrder,
      disabled: !isActive || actionLoading === 'cancel-order',
      title: isActive ? undefined : 'La orden ya esta cancelada o completada'
    }
  ]

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
            <div className="d-flex gap-2 flex-wrap">
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
                className="btn btn-outline-primary"
                onClick={() => navigation.push(`/dashboard/sales/${resolvedParams.id}/items`)}
              >
                <i className="bi bi-box-seam me-2"></i>
                Ver Items ({salesOrderItems?.length || 0})
              </button>
              <OperationsMenu
                items={operationsItems}
                loading={['facturar', 'prefactura', 'deliver-order', 'cancel-order'].includes(actionLoading || '')}
              />
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
                      <tr>
                        <td><strong>Tipo:</strong></td>
                        <td>
                          <span className={`badge ${salesOrder.orderType === 'direct_sale' ? 'bg-success' : 'bg-info'}`}>
                            {ORDER_TYPE_LABELS[salesOrder.orderType || 'order']}
                          </span>
                        </td>
                      </tr>
                      {salesOrder.customerPoNumber && (
                        <tr>
                          <td><strong>OC Cliente:</strong></td>
                          <td>
                            {salesOrder.customerPoNumber}
                            {salesOrder.customerPoPath && (
                              <button
                                className="btn btn-sm btn-link p-0 ms-2"
                                onClick={handleDownloadCustomerPo}
                                disabled={actionLoading === 'download-po'}
                                title="Descargar PDF de la OC del cliente"
                              >
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                PDF
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
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
                      <tr>
                        <td><strong>Metodo de pago:</strong></td>
                        <td>
                          {salesOrder.paymentMethod || <span className="text-muted">No especificado</span>}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Dias de credito:</strong></td>
                        <td>
                          {salesOrder.creditDays != null
                            ? `${salesOrder.creditDays} dias`
                            : <span className="text-muted">No especificado</span>}
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

          {/* Stock Availability */}
          <StockAvailabilityPanel salesOrderId={resolvedParams.id} />

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
                Genera documentos a partir de esta orden de venta. Facturar, prefactura,
                surtido, cancelacion y exports viven en el menu Operaciones.
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
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
