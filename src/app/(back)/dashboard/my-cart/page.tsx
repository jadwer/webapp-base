'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { useCart } from '@/modules/ecommerce/hooks/useShoppingCart'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function MyCartPage() {
  const { isLoading: authLoading } = useAuth()
  const navigation = useNavigationProgress()
  const {
    cart,
    cartItems,
    isLoading,
    updateItemQuantity,
    removeItem,
    clearAllItems,
    isUpdating,
    isRemoving,
  } = useCart()

  const [confirmClear, setConfirmClear] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateItemQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId)
  }

  const handleClearCart = async () => {
    await clearAllItems()
    setConfirmClear(false)
  }

  if (authLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="bi bi-cart3 me-2"></i>Mi Carrito
          </h4>
          <p className="text-muted mb-0">
            {cart && cart.itemsCount > 0
              ? `${cart.itemsCount} producto(s) en tu carrito`
              : 'Tu carrito esta vacio'}
          </p>
        </div>
        {cart && cart.itemsCount > 0 && (
          <div className="d-flex gap-2">
            {!confirmClear ? (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setConfirmClear(true)}
              >
                <i className="bi bi-trash me-1"></i>Vaciar
              </button>
            ) : (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleClearCart}
                  disabled={isRemoving}
                >
                  Confirmar
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando tu carrito...</p>
        </div>
      ) : !cart || cartItems.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-cart text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">Tu carrito esta vacio</h5>
            <p className="text-muted">
              Explora nuestro catalogo y agrega productos a tu carrito.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigation.push('/productos')}
            >
              <i className="bi bi-grid-3x3-gap me-2"></i>Ver Catalogo
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead>
                      <tr>
                        <th className="border-0 ps-3">Producto</th>
                        <th className="border-0 text-center" style={{ width: '150px' }}>Cantidad</th>
                        <th className="border-0 text-end">Precio</th>
                        <th className="border-0 text-end">Subtotal</th>
                        <th className="border-0 text-center" style={{ width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{ width: '60px', height: '60px' }}
                              >
                                {item.productImage ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.productImage}
                                    alt={item.productName || 'Producto'}
                                    style={{ maxHeight: '50px', maxWidth: '50px', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <i className="bi bi-box-seam text-muted"></i>
                                )}
                              </div>
                              <div>
                                <p className="mb-0 fw-medium">{item.productName || `Producto #${item.productId}`}</p>
                                {item.productSku && (
                                  <small className="text-muted">SKU: {item.productSku}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="input-group input-group-sm justify-content-center" style={{ width: '120px', margin: '0 auto' }}>
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <input
                                type="number"
                                className="form-control text-center"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value)
                                  if (val >= 1) handleQuantityChange(item.id, val)
                                }}
                                min="1"
                                style={{ width: '50px' }}
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isUpdating}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="text-end">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="text-end fw-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h6 className="mb-0">Resumen del Pedido</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(cart.subtotalAmount || cart.totalAmount)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Descuento</span>
                    <span>-{formatCurrency(cart.discountAmount)}</span>
                  </div>
                )}
                {cart.taxAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">IVA</span>
                    <span>{formatCurrency(cart.taxAmount)}</span>
                  </div>
                )}
                {cart.shippingAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Envio</span>
                    <span>{formatCurrency(cart.shippingAmount)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total</strong>
                  <strong className="text-primary fs-5">{formatCurrency(cart.finalTotal || cart.totalAmount)}</strong>
                </div>

                {cart.couponCode && (
                  <div className="alert alert-success py-2 mb-3">
                    <small>
                      <i className="bi bi-tag me-1"></i>Cupon: <strong>{cart.couponCode}</strong>
                    </small>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
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
            </div>

            {/* Quick Links */}
            <div className="card border-0 shadow-sm mt-3">
              <div className="card-body">
                <h6 className="mb-3">Necesitas ayuda?</h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <Link href="/dashboard/my-quotes" className="text-decoration-none">
                      <i className="bi bi-file-earmark-text me-2"></i>Mis Cotizaciones
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/dashboard/my-orders" className="text-decoration-none">
                      <i className="bi bi-bag-check me-2"></i>Mis Pedidos
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/profile" className="text-decoration-none">
                      <i className="bi bi-person-circle me-2"></i>Mi Perfil
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
