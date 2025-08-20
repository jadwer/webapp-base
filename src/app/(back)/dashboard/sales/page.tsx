'use client'

import { useState } from 'react'
import { useSalesOrders } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency } from '@/lib/formatters'

export default function SalesPage() {
  const navigation = useNavigationProgress()
  const [searchTerm, setSearchTerm] = useState('')
  

  const { salesOrders, isLoading, error } = useSalesOrders({
    filters: searchTerm ? { search: searchTerm } : undefined
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success'
      case 'shipped': return 'bg-info'
      case 'processing': return 'bg-warning'
      case 'confirmed': return 'bg-primary'
      case 'cancelled': return 'bg-danger'
      case 'draft': return 'bg-secondary'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregada'
      case 'shipped': return 'Enviada'
      case 'processing': return 'Procesando'
      case 'confirmed': return 'Confirmada'
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
                <i className="bi bi-cart-check me-3"></i>
                Gestión de Ventas
              </h1>
              <p className="text-muted">
                Administra las órdenes de venta y el proceso comercial
              </p>
            </div>
            <div>
              <button 
                className="btn btn-primary"
                onClick={() => navigation.push('/dashboard/sales/create')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Orden de Venta
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
              placeholder="Buscar por número de orden, cliente..."
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
                Órdenes de Venta
                {salesOrders?.length > 0 && (
                  <span className="badge bg-primary ms-2">{salesOrders.length}</span>
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
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Descuento</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesOrders && salesOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                            <h6>No hay órdenes de venta</h6>
                            <p className="mb-0">
                              Crea tu primera orden de venta haciendo clic en "Nueva Orden"
                            </p>
                          </td>
                        </tr>
                      ) : (
                        salesOrders?.map((order: any) => (
                          <tr key={order.id}>
                            <td>
                              <strong className="text-primary">{order.orderNumber}</strong>
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
                              {order.discountTotal > 0 && (
                                <span className="text-warning">
                                  -{formatCurrency(order.discountTotal)}
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => navigation.push(`/dashboard/sales/${order.id}`)}
                                >
                                  <i className="bi bi-eye"></i> Ver
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => navigation.push(`/dashboard/sales/${order.id}/edit`)}
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
      {salesOrders && salesOrders.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Total Órdenes</h6>
                    <h4 className="mb-0">{salesOrders.length}</h4>
                  </div>
                  <i className="bi bi-cart-check display-6"></i>
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
                      {formatCurrency(salesOrders.reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0))}
                    </h4>
                  </div>
                  <i className="bi bi-currency-dollar display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Entregadas</h6>
                    <h4 className="mb-0">
                      {salesOrders.filter((o: any) => o.status === 'delivered').length}
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
                    <h6 className="text-white-50">En Proceso</h6>
                    <h4 className="mb-0">
                      {salesOrders.filter((o: any) => ['processing', 'confirmed', 'shipped'].includes(o.status)).length}
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