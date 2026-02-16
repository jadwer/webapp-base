/**
 * My Orders Page (Customer Portal)
 *
 * Shows orders filtered by the current user's contact/customer.
 * Route: /dashboard/my-orders
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { salesService } from '@/modules/sales/services'

interface SalesOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  expectedDeliveryDate?: string
  itemCount?: number
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'warning' },
  confirmed: { label: 'Confirmado', color: 'info' },
  processing: { label: 'En Proceso', color: 'primary' },
  shipped: { label: 'Enviado', color: 'success' },
  delivered: { label: 'Entregado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'danger' }
}

export default function MyOrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user?.email) return

    const fetchMyOrders = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch orders filtered by user email (through contact) - uses backend scope filter
        const result = await salesService.orders.getAll({
          'filter[contact_email]': user.email,
          sort: '-createdAt',
          'page[size]': 50
        })

        // Transform JSON:API response to simple array
        // Count items from included relationships
        const included = result.included || []
        const ordersData = result.data?.map((item: { id: string; attributes: Record<string, unknown>; relationships?: Record<string, { data?: Array<{ type: string; id: string }> | null }> }) => {
          // Count items from the relationships data
          const itemsRel = item.relationships?.items?.data
          const itemCount = Array.isArray(itemsRel) ? itemsRel.length : (
            // Fallback: count from included array by matching order ID
            included.filter((inc: { type: string; attributes?: Record<string, unknown> }) =>
              inc.type === 'sales-order-items' &&
              inc.attributes?.salesOrderId === parseInt(item.id)
            ).length
          )
          return {
            id: item.id,
            orderNumber: item.attributes.orderNumber as string,
            status: item.attributes.status as string,
            totalAmount: item.attributes.totalAmount as number,
            createdAt: item.attributes.createdAt as string,
            expectedDeliveryDate: item.attributes.expectedDeliveryDate as string | undefined,
            itemCount
          }
        }) || []

        setOrders(ordersData)
      } catch {
        setError('Error al cargar tus pedidos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyOrders()
  }, [user?.email, authLoading])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || { label: status, color: 'secondary' }
    return (
      <span className={`badge bg-${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (authLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status"></span>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Mis Pedidos</h1>
          <p className="text-muted mb-0">
            Historial de ordenes y seguimiento de envios
          </p>
        </div>
        <Link href="/productos" className="btn btn-primary">
          <i className="bi bi-cart-plus me-2"></i>
          Nueva Compra
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <span className="spinner-border text-primary" role="status"></span>
            <p className="mt-3 text-muted">Cargando pedidos...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-bag text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">No tienes pedidos</h5>
            <p className="text-muted">
              Aun no has realizado ninguna compra. Explora nuestro catalogo para encontrar lo que necesitas.
            </p>
            <Link href="/productos" className="btn btn-primary mt-2">
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Ver Catalogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>No. Orden</th>
                    <th>Fecha</th>
                    <th>Entrega Est.</th>
                    <th>Items</th>
                    <th className="text-end">Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderNumber || `ORD-${order.id}`}</strong>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        {order.expectedDeliveryDate
                          ? formatDate(order.expectedDeliveryDate)
                          : '-'}
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {order.itemCount || 0} productos
                        </span>
                      </td>
                      <td className="text-end">
                        <strong>{formatPrice(order.totalAmount || 0)}</strong>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <Link
                          href={`/dashboard/my-orders/${order.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="card mt-4 bg-light border-0">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-info-circle me-2"></i>
            Estados del pedido
          </h6>
          <div className="row mt-3">
            <div className="col-md-2 col-4 mb-2">
              {getStatusBadge('pending')}
              <small className="d-block text-muted mt-1">Por confirmar</small>
            </div>
            <div className="col-md-2 col-4 mb-2">
              {getStatusBadge('confirmed')}
              <small className="d-block text-muted mt-1">Confirmado</small>
            </div>
            <div className="col-md-2 col-4 mb-2">
              {getStatusBadge('processing')}
              <small className="d-block text-muted mt-1">Preparando</small>
            </div>
            <div className="col-md-2 col-4 mb-2">
              {getStatusBadge('shipped')}
              <small className="d-block text-muted mt-1">En camino</small>
            </div>
            <div className="col-md-2 col-4 mb-2">
              {getStatusBadge('delivered')}
              <small className="d-block text-muted mt-1">Entregado</small>
            </div>
            <div className="col-md-2 col-4 mb-2">
              {getStatusBadge('cancelled')}
              <small className="d-block text-muted mt-1">Cancelado</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
