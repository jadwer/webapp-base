'use client'

import { use, useState } from 'react'
import { useSalesOrder, useSalesOrderItems } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import AddItemModal from '@/modules/sales/components/AddItemModal'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SalesOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const navigation = useNavigationProgress()
  const [showAddModal, setShowAddModal] = useState(false)

  const { salesOrder, isLoading: orderLoading, error: orderError } = useSalesOrder(resolvedParams.id)
  const { salesOrderItems, isLoading: itemsLoading, error: itemsError, mutate: mutateItems } = useSalesOrderItems(resolvedParams.id)

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
        {/* Información principal */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de la Orden
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Número de Orden:</strong></td>
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
                          {salesOrder.discountTotal > 0 ? (
                            <span className="text-warning">
                              -{formatCurrency(salesOrder.discountTotal)}
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
        </div>

        {/* Resumen de items */}
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
                      {formatQuantity(salesOrderItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0))}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Valor Items:</span>
                    <strong className="text-success">
                      {formatCurrency(salesOrderItems.reduce((acc: number, item: any) => acc + (item.total || item.totalPrice || 0), 0))}
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

          {/* Acciones rápidas */}
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-lightning me-2"></i>
                Acciones
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-printer me-2"></i>
                  Imprimir Orden
                </button>
                <button className="btn btn-outline-info">
                  <i className="bi bi-envelope me-2"></i>
                  Enviar por Email
                </button>
                <button className="btn btn-outline-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Marcar como Entregada
                </button>
                <button className="btn btn-outline-danger">
                  <i className="bi bi-x-circle me-2"></i>
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
          mutateItems() // Refresh the items list
          setShowAddModal(false)
        }}
      />
    </div>
  )
}