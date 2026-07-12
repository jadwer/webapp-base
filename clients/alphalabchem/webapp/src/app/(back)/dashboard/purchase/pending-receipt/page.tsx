'use client'

import { useState } from 'react'
import { usePurchaseOrders } from '@/modules/purchase'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency } from '@/lib/formatters'

interface PurchaseOrder {
  id: string | number
  contactId?: string | number
  contact?: {
    name?: string
    email?: string
  }
  orderDate?: string
  status: string
  totalAmount: number
  orderNumber?: string
}

// Nota cliente #11: vista de "Compras por surtir".
// Lista ordenes de compra pendientes de recibir (status pending+approved)
// usando el filtro backend filter[pending_receipt]=1.
export default function PurchasePendingReceiptPage() {
  const navigation = useNavigationProgress()
  const [searchTerm, setSearchTerm] = useState('')

  const { purchaseOrders, isLoading, error } = usePurchaseOrders({
    search: searchTerm || undefined,
    pendingReceipt: true,
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success'
      case 'pending': return 'bg-warning'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobada'
      case 'pending': return 'Pendiente'
      default: return status
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-box-arrow-in-down me-3"></i>
                Compras por surtir
              </h1>
              <p className="text-muted">
                Ordenes de compra pendientes de recibir
              </p>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigation.push('/dashboard/purchase')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Todas las compras
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigation.push('/dashboard/sales/pending-fulfillment')}
              >
                <i className="bi bi-truck me-2"></i>
                Pedidos por surtir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por numero de orden, proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Compras por surtir
                {purchaseOrders?.length > 0 && (
                  <span className="badge bg-primary ms-2">{purchaseOrders.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {isLoading && (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando ordenes...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error al cargar las ordenes: {error.message}
                </div>
              )}

              {!isLoading && !error && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Numero de Orden</th>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders && purchaseOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            <i className="bi bi-check2-circle display-4 text-muted mb-3 d-block"></i>
                            <h6>No hay compras por surtir</h6>
                            <p className="mb-0">
                              Todas las ordenes de compra estan recibidas o canceladas
                            </p>
                          </td>
                        </tr>
                      ) : (
                        purchaseOrders?.map((order: PurchaseOrder) => (
                          <tr key={order.id}>
                            <td>
                              <strong className="text-primary">{order.orderNumber || `PO-${order.id}`}</strong>
                              <br />
                              <small className="text-muted">ID: {order.id}</small>
                            </td>
                            <td>
                              {order.contact ? (
                                <div>
                                  <strong>{order.contact.name}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {order.contact.email || `ID: ${order.contactId}`}
                                  </small>
                                </div>
                              ) : (
                                <span className="badge bg-light text-dark">
                                  #{order.contactId}
                                </span>
                              )}
                            </td>
                            <td>
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }) : 'Sin fecha'}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td>
                              <strong className="text-success">
                                {formatCurrency(order.totalAmount)}
                              </strong>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => navigation.push(`/dashboard/purchase/${order.id}`)}
                                >
                                  <i className="bi bi-eye"></i> Ver
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => navigation.push(`/dashboard/purchase/${order.id}/edit`)}
                                >
                                  <i className="bi bi-pencil"></i> Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
