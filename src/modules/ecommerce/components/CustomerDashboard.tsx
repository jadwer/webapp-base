'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useRecentlyViewed } from '../hooks/useProductViews'
import { salesService } from '@/modules/sales/services'
import { quoteService } from '@/modules/quotes/services/quoteService'
import { couponsService } from '../services/couponsService'
import { shoppingCartService } from '../services/cartService'

// Types

interface OrderSummary {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  itemCount: number | undefined
}

interface QuoteSummary {
  id: string
  quoteNumber: string
  status: string
  totalAmount: number
  createdAt: string
}

interface CouponInfo {
  id: string
  code: string
  name: string
  description?: string
  couponType: string
  value: number
  expiresAt: string | null
  isActive: boolean
}

interface CartInfo {
  id: string
  totalAmount: number
  itemCount: number
}

// Status labels

const orderStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'warning' },
  confirmed: { label: 'Confirmado', color: 'info' },
  processing: { label: 'En Proceso', color: 'primary' },
  shipped: { label: 'Enviado', color: 'info' },
  delivered: { label: 'Entregado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'danger' },
}

export default function CustomerDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const navigation = useNavigationProgress()
  const { recentProducts, isLoading: recentLoading } = useRecentlyViewed(8)

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [coupons, setCoupons] = useState<CouponInfo[]>([])
  const [cart, setCart] = useState<CartInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const displayName = user?.name || user?.email?.split('@')[0] || 'Cliente'

  const fetchDashboardData = useCallback(async () => {
    if (!user?.email) return

    setIsLoading(true)
    try {
      // Fetch in parallel
      const [ordersResult, quotesResult, couponsResult, cartResult] = await Promise.allSettled([
        salesService.orders.getAll({
          'filter[contact_email]': user.email,
          sort: '-created_at',
          'page[size]': 5,
        }),
        quoteService.getAll(
          { contactEmail: user.email },
          { field: 'createdAt', direction: 'desc' },
          1, 5, ['contact']
        ),
        couponsService.getAll({ isActive: true }),
        shoppingCartService.cart.getCurrent(),
      ])

      // Process orders
      if (ordersResult.status === 'fulfilled') {
        const ordersData = (ordersResult.value?.data || []).map(
          (item: { id: string; attributes: Record<string, unknown> }) => ({
            id: item.id,
            orderNumber: item.attributes.order_number as string,
            status: item.attributes.status as string,
            totalAmount: item.attributes.total_amount as number,
            createdAt: item.attributes.created_at as string,
            itemCount: item.attributes.item_count as number | undefined,
          })
        )
        setOrders(ordersData)
      }

      // Process quotes
      if (quotesResult.status === 'fulfilled') {
        const quotesData = (quotesResult.value?.data || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => ({
            id: item.id,
            quoteNumber: item.quoteNumber || item.attributes?.quote_number || '',
            status: item.status || item.attributes?.status || '',
            totalAmount: item.totalAmount || item.attributes?.total_amount || 0,
            createdAt: item.createdAt || item.attributes?.created_at || '',
          })
        )
        setQuotes(quotesData)
      }

      // Process coupons - filter valid ones
      if (couponsResult.status === 'fulfilled') {
        const now = new Date()
        const validCoupons = (couponsResult.value || []).filter((c) => {
          if (!c.isActive) return false
          if (c.expiresAt && new Date(c.expiresAt) < now) return false
          return true
        }).map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description || '',
          couponType: item.couponType,
          value: item.value,
          expiresAt: item.expiresAt || null,
          isActive: true,
        })).slice(0, 4)
        setCoupons(validCoupons)
      }

      // Process cart
      if (cartResult.status === 'fulfilled' && cartResult.value) {
        const c = cartResult.value
        setCart({
          id: c.id,
          totalAmount: c.totalAmount || 0,
          itemCount: c.itemsCount || 0,
        })
      }
    } catch {
      // Dashboard should still render even if some data fails
    } finally {
      setIsLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    if (authLoading) return
    fetchDashboardData()
  }, [authLoading, fetchDashboardData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const couponTypeLabel = (type: string, value: number) => {
    switch (type) {
      case 'percentage': return `${value}% descuento`
      case 'fixed_amount': return `${formatCurrency(value)} descuento`
      case 'free_shipping': return 'Envio gratis'
      default: return `${value} descuento`
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Section 1: Quick Stats */}
      <div className="mb-4">
        <h4 className="mb-1">Bienvenido, {displayName}</h4>
        <p className="text-muted mb-4">Resumen de tu actividad</p>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-bag-check text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                <h3 className="mb-0">{isLoading ? '-' : orders.length}</h3>
                <small className="text-muted">Pedidos</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-file-earmark-text text-info mb-2" style={{ fontSize: '1.5rem' }}></i>
                <h3 className="mb-0">{isLoading ? '-' : quotes.length}</h3>
                <small className="text-muted">Cotizaciones</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-cart3 text-success mb-2" style={{ fontSize: '1.5rem' }}></i>
                <h3 className="mb-0">{isLoading ? '-' : cart?.itemCount || 0}</h3>
                <small className="text-muted">En Carrito</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-eye text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                <h3 className="mb-0">{recentLoading ? '-' : recentProducts.length}</h3>
                <small className="text-muted">Vistos Reciente</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Section 2: Cart Widget */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-cart3 me-2"></i>Mi Carrito
              </h6>
              {cart && cart.itemCount > 0 && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigation.push('/dashboard/my-cart')}
                >
                  Ver Carrito
                </button>
              )}
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
              ) : cart && cart.itemCount > 0 ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">{cart.itemCount} producto(s)</span>
                    <strong>{formatCurrency(cart.totalAmount)}</strong>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigation.push('/checkout')}
                    >
                      <i className="bi bi-credit-card me-2"></i>Proceder al Pago
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigation.push('/productos')}
                    >
                      Seguir Comprando
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-cart text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2 mb-3">Tu carrito esta vacio</p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigation.push('/productos')}
                  >
                    Ver Catalogo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Recent Orders */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-bag-check me-2"></i>Ultimos Pedidos
              </h6>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigation.push('/dashboard/my-orders')}
              >
                Ver Todos
              </button>
            </div>
            <div className="card-body p-0">
              {isLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="border-0 ps-3">Pedido</th>
                        <th className="border-0">Fecha</th>
                        <th className="border-0">Total</th>
                        <th className="border-0">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const status = orderStatusLabels[order.status] || { label: order.status, color: 'secondary' }
                        return (
                          <tr
                            key={order.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigation.push(`/dashboard/my-orders/${order.id}`)}
                          >
                            <td className="ps-3">
                              <strong>{order.orderNumber}</strong>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>{formatCurrency(order.totalAmount)}</td>
                            <td>
                              <span className={`badge bg-${status.color}`}>{status.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">No tienes pedidos aun</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Recently Viewed Products */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-eye me-2"></i>Vistos Recientemente
              </h6>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigation.push('/productos')}
              >
                Ver Catalogo
              </button>
            </div>
            <div className="card-body">
              {recentLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
              ) : recentProducts.length > 0 ? (
                <div className="row g-3">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="col-6 col-md-3">
                      <div className="card h-100 border">
                        <div
                          className="card-img-top bg-light d-flex align-items-center justify-content-center"
                          style={{ height: '120px', overflow: 'hidden' }}
                        >
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <i className="bi bi-box-seam text-muted" style={{ fontSize: '2rem' }}></i>
                          )}
                        </div>
                        <div className="card-body p-2">
                          <p className="card-title mb-1" style={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                            {product.name}
                          </p>
                          <p className="text-primary fw-bold mb-1" style={{ fontSize: '0.85rem' }}>
                            {formatCurrency(product.price)}
                          </p>
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() => navigation.push(`/productos/${product.id}`)}
                          >
                            Ver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-eye-slash text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2 mb-0">
                    Aun no has visto ningun producto. <Link href="/productos">Explora el catalogo</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Active Offers */}
        {coupons.length > 0 && (
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">
                  <i className="bi bi-percent me-2"></i>Ofertas Activas
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="col-12">
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                        <div>
                          <span
                            className="badge bg-success me-2"
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                          >
                            {coupon.code}
                          </span>
                          <small className="text-muted">{couponTypeLabel(coupon.couponType, coupon.value)}</small>
                          {coupon.expiresAt && (
                            <small className="text-muted d-block ms-1">
                              Expira: {formatDate(coupon.expiresAt)}
                            </small>
                          )}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          title="Copiar codigo"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Quick Actions */}
        <div className={`col-12 ${coupons.length > 0 ? 'col-lg-6' : ''}`}>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-lightning me-2"></i>Acciones Rapidas
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {[
                  { href: '/productos', icon: 'bi-grid-3x3-gap', label: 'Ver Catalogo', color: 'primary' },
                  { href: '/dashboard/my-quotes', icon: 'bi-file-earmark-text', label: 'Mis Cotizaciones', color: 'info' },
                  { href: '/dashboard/my-orders', icon: 'bi-bag-check', label: 'Mis Pedidos', color: 'success' },
                  { href: '/dashboard/profile', icon: 'bi-person-circle', label: 'Mi Perfil', color: 'secondary' },
                ].map(({ href, icon, label, color }) => (
                  <div key={href} className="col-6">
                    <button
                      className={`btn btn-outline-${color} w-100 py-3 d-flex flex-column align-items-center`}
                      onClick={() => navigation.push(href)}
                    >
                      <i className={`bi ${icon} mb-1`} style={{ fontSize: '1.2rem' }}></i>
                      <small>{label}</small>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
