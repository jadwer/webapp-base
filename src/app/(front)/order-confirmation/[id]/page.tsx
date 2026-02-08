/**
 * Order Confirmation Page
 *
 * Shown after successful checkout + Stripe payment.
 * Route: /order-confirmation/[id]
 */

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
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

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/order-confirmation/${id}`)
    }
  }, [isAuthenticated, authLoading, router, id])

  // Fetch order
  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    const fetchOrder = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await salesService.orders.getById(id)
        const orderData = result.data
        const attrs = orderData.attributes

        const includedItems = result.included?.filter(
          (inc: { type: string }) => inc.type === 'sales-order-items'
        ) || []

        setOrder({
          id: orderData.id,
          orderNumber: attrs.order_number,
          status: attrs.status,
          totalAmount: attrs.total_amount,
          subtotalAmount: attrs.subtotal_amount,
          taxAmount: attrs.tax_amount,
          discountAmount: attrs.discount_amount || 0,
          createdAt: attrs.created_at,
          shippingAddress: attrs.shipping_address,
          shippingCity: attrs.shipping_city,
          shippingState: attrs.shipping_state,
          shippingPostalCode: attrs.shipping_postal_code,
          items: includedItems.map((item: { id: string; attributes: Record<string, unknown> }) => ({
            id: item.id,
            productId: item.attributes.product_id as string,
            productName: item.attributes.product_name as string,
            sku: item.attributes.sku as string,
            quantity: item.attributes.quantity as number,
            unitPrice: item.attributes.unit_price as number,
            total: item.attributes.total as number
          }))
        })
      } catch {
        setError('No se pudo cargar la informacion del pedido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id, authLoading, isAuthenticated])

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

  if (authLoading || isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando confirmacion de pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Pedido no encontrado'}
        </div>
        <Link href="/productos" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Success Banner */}
      <div className="text-center mb-5">
        <div
          className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3"
          style={{ width: '80px', height: '80px' }}
        >
          <i className="bi bi-check-lg" style={{ fontSize: '2.5rem' }}></i>
        </div>
        <h1 className="h2 mb-2">Pago completado exitosamente</h1>
        <p className="text-muted fs-5">
          Gracias por tu compra. Tu pedido <strong>{order.orderNumber || `#${order.id}`}</strong> ha sido registrado.
        </p>
        <p className="text-muted">
          {formatDate(order.createdAt)}
        </p>
      </div>

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
          {order.shippingAddress && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-truck me-2"></i>
                  Direccion de Envio
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-0">
                  {order.shippingAddress}
                  {order.shippingCity && <>, {order.shippingCity}</>}
                  {order.shippingState && <>, {order.shippingState}</>}
                  {order.shippingPostalCode && <> C.P. {order.shippingPostalCode}</>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
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

          {/* Next Steps */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-signpost-2 me-2"></i>
                Proximos pasos
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                Recibiras un correo de confirmacion con los detalles de tu pedido.
                Puedes dar seguimiento desde tu portal de cliente.
              </p>
              <Link href="/dashboard/my-orders" className="btn btn-primary w-100 mb-2">
                <i className="bi bi-box-seam me-2"></i>
                Ver mis pedidos
              </Link>
              <Link href="/productos" className="btn btn-outline-secondary w-100">
                <i className="bi bi-shop me-2"></i>
                Seguir comprando
              </Link>
            </div>
          </div>

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
