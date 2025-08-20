'use client'

import { use, useState } from 'react'
import { usePurchaseOrder, usePurchaseOrderItems } from '@/modules/purchase'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import AddItemModal from '@/modules/purchase/components/AddItemModal'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PurchaseOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const navigation = useNavigationProgress()
  const [showAddModal, setShowAddModal] = useState(false)

  const { purchaseOrder, isLoading: orderLoading, error: orderError } = usePurchaseOrder(resolvedParams.id)
  const { purchaseOrderItems, isLoading: itemsLoading, error: itemsError, mutate: mutateItems } = usePurchaseOrderItems(resolvedParams.id)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success'
      case 'pending': return 'bg-warning'
      case 'received': return 'bg-info'
      case 'cancelled': return 'bg-danger'
      case 'draft': return 'bg-secondary'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobada'
      case 'pending': return 'Pendiente'
      case 'received': return 'Recibida'
      case 'cancelled': return 'Cancelada'
      case 'draft': return 'Borrador'
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

  if (!purchaseOrder) {
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
                <i className="bi bi-cart-plus me-3"></i>
                Orden de Compra {purchaseOrder.orderNumber}
              </h1>
              <p className="text-muted">
                Detalles completos de la orden de compra
              </p>
            </div>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigation.push('/dashboard/purchase')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Purchase
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigation.push(`/dashboard/purchase/${resolvedParams.id}/edit`)}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigation.push(`/dashboard/purchase/${resolvedParams.id}/items`)}
              >
                <i className="bi bi-box-seam me-2"></i>
                Ver Items ({purchaseOrderItems?.length || 0})
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
                        <td>{purchaseOrder.orderNumber}</td>
                      </tr>
                      <tr>
                        <td><strong>Estado:</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(purchaseOrder.status)}`}>
                            {getStatusText(purchaseOrder.status)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Fecha de Orden:</strong></td>
                        <td>
                          {purchaseOrder.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString('es-ES', {
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
                            {formatCurrency(purchaseOrder.totalAmount)}
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
                        <td><strong>Proveedor:</strong></td>
                        <td>
                          {purchaseOrder.contact ? (
                            <div>
                              <strong>{purchaseOrder.contact.name}</strong>
                              <br />
                              <small className="text-muted">{purchaseOrder.contact.email}</small>
                            </div>
                          ) : (
                            `Proveedor ID: ${purchaseOrder.contactId}`
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Creada:</strong></td>
                        <td>
                          {purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Actualizada:</strong></td>
                        <td>
                          {purchaseOrder.updatedAt ? new Date(purchaseOrder.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>ID:</strong></td>
                        <td>
                          <span className="badge bg-light text-dark">#{purchaseOrder.id}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {purchaseOrder.notes && (
                <div className="mt-3">
                  <h6>Notas:</h6>
                  <p className="text-muted">{purchaseOrder.notes}</p>
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
              ) : purchaseOrderItems && purchaseOrderItems.length > 0 ? (
                <div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Total de Items:</span>
                    <strong>{purchaseOrderItems.length}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Cantidad Total:</span>
                    <strong>
                      {formatQuantity(purchaseOrderItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0))}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Valor Items:</span>
                    <strong className="text-success">
                      {formatCurrency(purchaseOrderItems.reduce((acc: number, item: any) => acc + (item.totalPrice || 0), 0))}
                    </strong>
                  </div>
                  <hr />
                  <div className="d-grid">
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigation.push(`/dashboard/purchase/${resolvedParams.id}/items`)}
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
                  Enviar a Proveedor
                </button>
                <button className="btn btn-outline-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Marcar como Recibida
                </button>
                <button className="btn btn-outline-warning">
                  <i className="bi bi-clock me-2"></i>
                  Aprobar Orden
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
        purchaseOrderId={resolvedParams.id}
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