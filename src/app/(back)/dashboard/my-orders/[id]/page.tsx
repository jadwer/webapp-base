/**
 * My Order Detail Page (Customer Portal)
 *
 * Shows detail of a specific order for the customer.
 * Route: /dashboard/my-orders/[id]
 */

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { salesService } from '@/modules/sales/services'

interface SalesOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  createdAt: string
  expectedDeliveryDate?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
  notes?: string
  trackingNumber?: string
  items?: SalesOrderItem[]
}

interface SalesOrderItem {
  id: string
  productId: string
  productName?: string
  sku?: string
  quantity: number
  unitPrice: number
  total: number
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendiente', color: 'warning', icon: 'bi-clock' },
  confirmed: { label: 'Confirmado', color: 'info', icon: 'bi-check-circle' },
  processing: { label: 'En Proceso', color: 'primary', icon: 'bi-gear' },
  shipped: { label: 'Enviado', color: 'success', icon: 'bi-truck' },
  delivered: { label: 'Entregado', color: 'success', icon: 'bi-check2-all' },
  cancelled: { label: 'Cancelado', color: 'danger', icon: 'bi-x-circle' }
}

interface MyOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MyOrderDetailPage({ params }: MyOrderDetailPageProps) {
  const { id } = use(params)
  const { isLoading: authLoading } = useAuth()
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchOrder = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await salesService.orders.getById(id)

        // Transform JSON:API response
        const orderData = result.data
        const attrs = orderData.attributes

        // Extract items from included if present
        const includedItems = result.included?.filter(
          (inc: { type: string }) => inc.type === 'sales-order-items'
        ) || []

        setOrder({
          id: orderData.id,
          orderNumber: attrs.orderNumber,
          status: attrs.status,
          totalAmount: attrs.totalAmount,
          subtotalAmount: attrs.subtotal || attrs.subtotalAmount || ((attrs.finalTotal ?? attrs.totalAmount ?? 0) as number) - ((attrs.taxAmount ?? 0) as number) + ((attrs.discountTotal ?? 0) as number),
          taxAmount: attrs.taxAmount,
          discountAmount: attrs.discountTotal || 0,
          createdAt: attrs.createdAt,
          expectedDeliveryDate: attrs.expectedDeliveryDate,
          shippingAddress: attrs.shippingAddress,
          shippingCity: attrs.shippingCity,
          shippingState: attrs.shippingState,
          shippingPostalCode: attrs.shippingPostalCode,
          notes: attrs.notes,
          trackingNumber: attrs.trackingNumber,
          items: includedItems.map((item: { id: string; attributes: Record<string, unknown> }) => ({
            id: item.id,
            productId: item.attributes.productId as string,
            productName: item.attributes.productName as string,
            sku: item.attributes.sku as string,
            quantity: item.attributes.quantity as number,
            unitPrice: item.attributes.unitPrice as number,
            total: item.attributes.total as number
          }))
        })
      } catch {
        setError('Error al cargar el pedido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id, authLoading])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
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
    const config = statusLabels[status] || { label: status, color: 'secondary', icon: 'bi-question' }
    return (
      <span className={`badge bg-${config.color}`}>
        <i className={`${config.icon} me-1`}></i>
        {config.label}
      </span>
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status"></span>
          <p className="mt-3 text-muted">Cargando pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Pedido no encontrado'}
        </div>
        <Link href="/dashboard/my-orders" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a mis pedidos
        </Link>
      </div>
    )
  }

  // Determine order progress
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentStatusIndex = statusOrder.indexOf(order.status)

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <Link href="/dashboard/my-orders" className="text-muted text-decoration-none mb-2 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i>
            Mis Pedidos
          </Link>
          <h1 className="h3 mb-1">
            Pedido {order.orderNumber || `#${order.id}`}
          </h1>
          <div className="d-flex align-items-center gap-3">
            {getStatusBadge(order.status)}
            <span className="text-muted">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Progress (if not cancelled) */}
      {order.status !== 'cancelled' && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="mb-3">Estado del pedido</h6>
            <div className="d-flex justify-content-between position-relative">
              {/* Progress line */}
              <div
                className="position-absolute bg-light"
                style={{
                  height: '4px',
                  top: '20px',
                  left: '10%',
                  right: '10%',
                  zIndex: 0
                }}
              ></div>
              <div
                className="position-absolute bg-primary"
                style={{
                  height: '4px',
                  top: '20px',
                  left: '10%',
                  width: `${Math.max(0, currentStatusIndex) * 20}%`,
                  zIndex: 1
                }}
              ></div>

              {statusOrder.map((status, index) => {
                const config = statusLabels[status]
                const isCompleted = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex

                return (
                  <div key={status} className="text-center" style={{ zIndex: 2, width: '20%' }}>
                    <div
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                        isCompleted ? 'bg-primary text-white' : 'bg-light text-muted'
                      }`}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: isCurrent ? '3px solid var(--bs-primary)' : 'none'
                      }}
                    >
                      <i className={config.icon}></i>
                    </div>
                    <small className={`d-block mt-2 ${isCompleted ? 'text-primary fw-bold' : 'text-muted'}`}>
                      {config.label}
                    </small>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Order Items */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-box-seam me-2"></i>
                Productos
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-end">Precio</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <strong>{item.productName || `Producto ${item.productId}`}</strong>
                            {item.sku && (
                              <small className="d-block text-muted">SKU: {item.sku}</small>
                            )}
                          </div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatPrice(item.unitPrice)}</td>
                        <td className="text-end">
                          <strong>{formatPrice(item.total)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {(order.shippingAddress || order.trackingNumber) && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-truck me-2"></i>
                  Informacion de Envio
                </h5>
              </div>
              <div className="card-body">
                {order.trackingNumber && (
                  <div className="alert alert-info mb-3">
                    <strong>Numero de rastreo:</strong> {order.trackingNumber}
                  </div>
                )}

                {order.shippingAddress && (
                  <div>
                    <h6 className="text-muted small mb-2">Direccion de entrega:</h6>
                    <p className="mb-0">
                      {order.shippingAddress}
                      {order.shippingCity && <>, {order.shippingCity}</>}
                      {order.shippingState && <>, {order.shippingState}</>}
                      {order.shippingPostalCode && <> C.P. {order.shippingPostalCode}</>}
                    </p>
                  </div>
                )}

                {order.expectedDeliveryDate && (
                  <div className="mt-3">
                    <h6 className="text-muted small mb-2">Fecha estimada de entrega:</h6>
                    <p className="mb-0 fw-bold">{formatDate(order.expectedDeliveryDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="col-lg-4">
          {/* Totals */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Resumen
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotalAmount || 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>IVA (16%):</span>
                <span>{formatPrice(order.taxAmount || 0)}</span>
              </div>
              {(order.discountAmount || 0) > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Descuento:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="fs-4 text-primary">
                  {formatPrice(order.totalAmount || 0)}
                </strong>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-chat-text me-2"></i>
                  Notas
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="card bg-light border-0">
            <div className="card-body">
              <h6>
                <i className="bi bi-question-circle me-2"></i>
                Necesitas ayuda?
              </h6>
              <p className="small text-muted mb-2">
                Si tienes preguntas sobre tu pedido, contactanos:
              </p>
              <a href="mailto:ventas@laborwasserdemexico.com" className="btn btn-sm btn-outline-primary w-100 mb-2">
                <i className="bi bi-envelope me-2"></i>
                Contactar Ventas
              </a>
              <a href="https://wa.me/5215610400441" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success w-100">
                <i className="bi bi-whatsapp me-2"></i>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
