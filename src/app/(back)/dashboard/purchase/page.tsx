'use client'

import { useState } from 'react'
import { usePurchaseOrders } from '@/modules/purchase'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency } from '@/lib/formatters'

export default function PurchasePage() {
  const navigation = useNavigationProgress()
  const [searchTerm, setSearchTerm] = useState('')

  const { purchaseOrders, isLoading, error } = usePurchaseOrders({
    filters: searchTerm ? { search: searchTerm } : undefined
  })

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
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-cart-plus me-3"></i>
                Gestión de Compras
              </h1>
              <p className="text-muted">
                Administra las órdenes de compra y relaciones con proveedores
              </p>
            </div>
            <div>
              <button 
                className="btn btn-primary"
                onClick={() => navigation.push('/dashboard/purchase/create')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Orden de Compra
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
              placeholder="Buscar por número de orden, proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-funnel"></i> Filtros
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-download"></i> Exportar
            </button>
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
                Órdenes de Compra
                {purchaseOrders?.length > 0 && (
                  <span className="badge bg-primary ms-2">{purchaseOrders.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {isLoading && (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando órdenes...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error al cargar las órdenes: {error.message}
                  <br />
                  <small className="text-muted">
                    Verificando conexión con API y token de autenticación...
                  </small>
                </div>
              )}

              {!isLoading && !error && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Número de Orden</th>
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
                            <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                            <h6>No hay órdenes de compra</h6>
                            <p className="mb-0">
                              Crea tu primera orden de compra haciendo clic en "Nueva Orden"
                            </p>
                          </td>
                        </tr>
                      ) : (
                        purchaseOrders?.map((order: any) => (
                          <tr key={order.id}>
                            <td>
                              <strong className="text-primary">PO-{order.id}</strong>
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

      {/* Métricas rápidas */}
      {purchaseOrders && purchaseOrders.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Total Órdenes</h6>
                    <h4 className="mb-0">{purchaseOrders.length}</h4>
                  </div>
                  <i className="bi bi-cart-plus display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-success">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Valor Total</h6>
                    <h4 className="mb-0">
                      {formatCurrency(purchaseOrders.reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0))}
                    </h4>
                  </div>
                  <i className="bi bi-currency-dollar display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Aprobadas</h6>
                    <h4 className="mb-0">
                      {purchaseOrders.filter((o: any) => o.status === 'approved').length}
                    </h4>
                  </div>
                  <i className="bi bi-check-circle display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-warning">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Pendientes</h6>
                    <h4 className="mb-0">
                      {purchaseOrders.filter((o: any) => ['pending', 'draft'].includes(o.status)).length}
                    </h4>
                  </div>
                  <i className="bi bi-clock display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}