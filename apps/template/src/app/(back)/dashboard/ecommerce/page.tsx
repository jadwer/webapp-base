/**
 * Ecommerce Dashboard Page
 *
 * Main dashboard for the ecommerce module.
 * Route: /dashboard/ecommerce
 */

'use client'

import Link from 'next/link'
import { useEcommerceOrders, type EcommerceOrder } from '@/modules/ecommerce'

export default function EcommerceDashboardPage() {
  const { ecommerceOrders, isLoading, error } = useEcommerceOrders()

  const orders = ecommerceOrders || []
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o: EcommerceOrder) => o.status === 'pending').length,
    processingOrders: orders.filter((o: EcommerceOrder) => o.status === 'processing').length,
    deliveredOrders: orders.filter((o: EcommerceOrder) => o.status === 'delivered').length,
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3">Dashboard E-commerce</h1>
        <p className="text-muted">
          Resumen general del modulo de comercio electronico
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          Error al cargar datos: {error.message}
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-bag-check fs-1 text-primary mb-2"></i>
              <h3 className="mb-1">{isLoading ? '...' : stats.totalOrders}</h3>
              <p className="text-muted mb-0">Total Ordenes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-clock-history fs-1 text-warning mb-2"></i>
              <h3 className="mb-1">{isLoading ? '...' : stats.pendingOrders}</h3>
              <p className="text-muted mb-0">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-arrow-repeat fs-1 text-info mb-2"></i>
              <h3 className="mb-1">{isLoading ? '...' : stats.processingOrders}</h3>
              <p className="text-muted mb-0">En Proceso</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-check-circle fs-1 text-success mb-2"></i>
              <h3 className="mb-1">{isLoading ? '...' : stats.deliveredOrders}</h3>
              <p className="text-muted mb-0">Entregadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">
                <i className="bi bi-bag me-2"></i>
                Ordenes Recientes
              </h5>
            </div>
            <div className="card-body">
              {isLoading ? (
                <p className="text-muted">Cargando...</p>
              ) : orders && orders.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {orders.slice(0, 5).map(order => (
                    <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <strong>#{order.orderNumber || order.id}</strong>
                        <small className="text-muted d-block">
                          {order.customerName || 'Cliente'}
                        </small>
                      </div>
                      <span className={`badge bg-${
                        order.status === 'delivered' ? 'success' :
                        order.status === 'processing' ? 'info' :
                        order.status === 'pending' ? 'warning' : 'secondary'
                      }`}>
                        {order.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">No hay ordenes recientes</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Acciones Rapidas
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link href="/dashboard/ecommerce/orders" className="btn btn-outline-primary">
                  <i className="bi bi-bag-check me-2"></i>
                  Ver Todas las Ordenes
                </Link>
                <Link href="/dashboard/ecommerce/orders/create" className="btn btn-outline-success">
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Orden Manual
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
