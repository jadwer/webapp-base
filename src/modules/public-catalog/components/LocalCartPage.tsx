/**
 * LOCAL CART PAGE
 * Shopping cart component using localStorage (no backend required)
 * For public/guest users before checkout
 */

'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/ui/components/base'
import { useLocalCart } from '../hooks/useLocalCart'
import type { LocalCartItem } from '../hooks/useLocalCart'

interface LocalCartPageProps {
  onCheckout?: () => void
  checkoutUrl?: string
  continueShoppingUrl?: string
}

export const LocalCartPage: React.FC<LocalCartPageProps> = ({
  onCheckout,
  checkoutUrl = '/checkout',
  continueShoppingUrl = '/productos'
}) => {
  const {
    items,
    totals,
    isInitialized,
    isEmpty,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart
  } = useLocalCart()

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  // Loading state
  if (!isInitialized) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando carrito...</span>
          </div>
        </div>
      </div>
    )
  }

  // Empty cart
  if (isEmpty) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="py-5">
              <i className="bi bi-cart-x display-1 text-muted mb-4 d-block" />
              <h2 className="h4 mb-3">Tu carrito esta vacio</h2>
              <p className="text-muted mb-4">
                Agrega productos a tu carrito para continuar con tu compra.
              </p>
              <Link href={continueShoppingUrl}>
                <Button variant="primary" size="large">
                  <i className="bi bi-arrow-left me-2" />
                  Ver Productos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render cart item
  const renderCartItem = (item: LocalCartItem) => (
    <div key={item.productId} className="card mb-3">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Product Image */}
          <div className="col-3 col-md-2">
            <div className="ratio ratio-1x1 bg-light rounded overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-fit-cover"
                  sizes="100px"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <i className="bi bi-image text-muted fs-4" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="col-9 col-md-4">
            <h6 className="mb-1">{item.name}</h6>
            {item.sku && (
              <small className="text-muted d-block">SKU: {item.sku}</small>
            )}
            {item.brandName && (
              <small className="text-muted d-block">
                <i className="bi bi-award me-1" />
                {item.brandName}
              </small>
            )}
            {item.categoryName && (
              <span className="badge bg-secondary bg-opacity-10 text-secondary mt-1">
                {item.categoryName}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="col-4 col-md-2 text-center mt-3 mt-md-0">
            <div className="fw-semibold">{formatPrice(item.price)}</div>
            {item.unitName && (
              <small className="text-muted">/ {item.unitName}</small>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="col-4 col-md-2 mt-3 mt-md-0">
            <div className="d-flex align-items-center justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => decrementQuantity(item.productId)}
                disabled={item.quantity <= 1}
              >
                <i className="bi bi-dash" />
              </button>
              <input
                type="number"
                className="form-control form-control-sm text-center mx-2"
                style={{ width: '60px' }}
                value={item.quantity}
                min={1}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10)
                  if (value > 0) {
                    updateQuantity(item.productId, value)
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => incrementQuantity(item.productId)}
              >
                <i className="bi bi-plus" />
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="col-3 col-md-1 text-end mt-3 mt-md-0">
            <div className="fw-bold text-primary">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>

          {/* Remove Button */}
          <div className="col-1 text-end mt-3 mt-md-0">
            <button
              type="button"
              className="btn btn-link text-danger p-0"
              onClick={() => removeFromCart(item.productId)}
              title="Eliminar producto"
            >
              <i className="bi bi-trash fs-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-cart3 me-2" />
          Carrito de Compras
        </h1>
        <span className="badge bg-primary rounded-pill fs-6">
          {totals.itemCount} {totals.itemCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8">
          {/* Table Header (desktop) */}
          <div className="d-none d-md-block mb-3">
            <div className="row text-muted small fw-semibold">
              <div className="col-2">Producto</div>
              <div className="col-4"></div>
              <div className="col-2 text-center">Precio</div>
              <div className="col-2 text-center">Cantidad</div>
              <div className="col-1 text-end">Total</div>
              <div className="col-1"></div>
            </div>
          </div>

          {/* Items */}
          {items.map(renderCartItem)}

          {/* Actions */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Link href={continueShoppingUrl} className="text-decoration-none">
              <i className="bi bi-arrow-left me-2" />
              Seguir Comprando
            </Link>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={clearCart}
            >
              <i className="bi bi-trash me-2" />
              Vaciar Carrito
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card bg-light border-0">
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen del Pedido</h5>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({totals.itemCount} productos)</span>
                <span className="fw-semibold">{formatPrice(totals.subtotal)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Envio</span>
                <span>Por calcular</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-5 text-primary">
                  {formatPrice(totals.subtotal)}
                </span>
              </div>

              {/* Quote Request Button */}
              <a
                href="https://wa.link/4e5cqt"
                target="_blank"
                rel="noopener noreferrer"
                className="d-block mb-3"
              >
                <Button variant="success" size="large" className="w-100">
                  <i className="bi bi-file-earmark-text me-2" />
                  Solicitar Cotizacion
                </Button>
              </a>

              {onCheckout ? (
                <Button
                  variant="primary"
                  size="large"
                  className="w-100"
                  onClick={onCheckout}
                >
                  <i className="bi bi-lock me-2" />
                  Proceder al Pago
                </Button>
              ) : (
                <Link href={checkoutUrl} className="d-block">
                  <Button variant="primary" size="large" className="w-100">
                    <i className="bi bi-lock me-2" />
                    Proceder al Pago
                  </Button>
                </Link>
              )}

              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1" />
                  Pago seguro garantizado
                </small>
              </div>

              {/* Info about quote */}
              <div className="alert alert-info mt-3 mb-0 small">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Solicitar cotizacion:</strong> Te contactaremos con precios especiales y tiempos de entrega.
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="card mt-3 border-0">
            <div className="card-body text-center">
              <div className="row g-3">
                <div className="col-4">
                  <i className="bi bi-truck text-primary fs-4 d-block mb-1" />
                  <small className="text-muted">Envio Seguro</small>
                </div>
                <div className="col-4">
                  <i className="bi bi-arrow-repeat text-primary fs-4 d-block mb-1" />
                  <small className="text-muted">Devoluciones</small>
                </div>
                <div className="col-4">
                  <i className="bi bi-headset text-primary fs-4 d-block mb-1" />
                  <small className="text-muted">Soporte</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocalCartPage
