'use client'

import { useState } from 'react'
import { useSalesOrders, formatDateOnly } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency } from '@/lib/formatters'

// Nota cliente #11: vista de "Pedidos por surtir".
// Lista ordenes de venta abiertas (no entregadas ni cerradas) usando el
// filtro backend filter[pending_fulfillment]=1.
export default function SalesPendingFulfillmentPage() {
  const navigation = useNavigationProgress()
  const [searchTerm, setSearchTerm] = useState('')

  const { salesOrders, isLoading, error } = useSalesOrders({
    search: searchTerm || undefined,
    pendingFulfillment: true,
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'shipped': return 'bg-info'
      case 'processing': return 'bg-primary'
      case 'confirmed': return 'bg-primary'
      case 'pending': return 'bg-warning'
      case 'draft': return 'bg-secondary'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'shipped': return 'Enviada'
      case 'processing': return 'En proceso'
      case 'confirmed': return 'Confirmada'
      case 'pending': return 'Pendiente'
      case 'draft': return 'Borrador'
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
                <i className="bi bi-truck me-3"></i>
                Pedidos por surtir
              </h1>
              <p className="text-muted">
                Ordenes de venta abiertas pendientes de entregar
              </p>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigation.push('/dashboard/sales')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Todas las ventas
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigation.push('/dashboard/purchase/pending-receipt')}
              >
                <i className="bi bi-cart-plus me-2"></i>
                Compras por surtir
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
              placeholder="Buscar por numero de orden, cliente..."
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
                Pedidos por surtir
                {salesOrders?.length > 0 && (
                  <span className="badge bg-primary ms-2">{salesOrders.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {isLoading && (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando pedidos...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error al cargar los pedidos: {error.message}
                </div>
              )}

              {!isLoading && !error && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Numero de Orden</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesOrders && salesOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            <i className="bi bi-check2-circle display-4 text-muted mb-3 d-block"></i>
                            <h6>No hay pedidos por surtir</h6>
                            <p className="mb-0">
                              Todas las ordenes de venta estan entregadas o cerradas
                            </p>
                          </td>
                        </tr>
                      ) : (
                        salesOrders?.map((order) => {
                          const contact = order.contact
                          return (
                          <tr key={order.id as string}>
                            <td>
                              <strong className="text-primary">{order.orderNumber as string}</strong>
                              <br />
                              <small className="text-muted">ID: {order.id}</small>
                            </td>
                            <td>
                              {contact ? (
                                <div>
                                  <strong>{contact.name as string}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {(contact.email as string) || `ID: ${order.contactId}`}
                                  </small>
                                </div>
                              ) : (
                                <span className="badge bg-light text-dark">
                                  #{order.contactId}
                                </span>
                              )}
                            </td>
                            <td>
                              {/* order_date es date-only: formatear en UTC para
                                  no retroceder un dia en zonas al oeste de UTC */}
                              {order.orderDate ? formatDateOnly(order.orderDate as string, 'es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }) : 'Sin fecha'}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status as string)}`}>
                                {getStatusText(order.status as string)}
                              </span>
                            </td>
                            <td>
                              <strong className="text-success">
                                {formatCurrency(order.totalAmount as number)}
                              </strong>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => navigation.push(`/dashboard/sales/${order.id as string}`)}
                                >
                                  <i className="bi bi-eye"></i> Ver
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => navigation.push(`/dashboard/sales/${order.id as string}/edit`)}
                                >
                                  <i className="bi bi-pencil"></i> Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                          )
                        })
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
