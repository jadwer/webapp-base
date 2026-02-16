/**
 * LOCAL CART PAGE
 * Shopping cart component using localStorage (no backend required)
 * For public/guest users before checkout
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/ui/components/base'
import { useLocalCart } from '../hooks/useLocalCart'
import type { LocalCartItem } from '../hooks/useLocalCart'
import { useAuth } from '@/modules/auth'
import { toast } from '@/lib/toast'
import quoteServiceModule from '@/modules/quotes/services/quoteService'
import { shoppingCartService } from '@/modules/ecommerce/services'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isRequestingQuote, setIsRequestingQuote] = useState(false)
  const [isSyncingToCheckout, setIsSyncingToCheckout] = useState(false)
  const hasProcessedPendingQuote = useRef(false)
  const hasProcessedCheckout = useRef(false)

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

  // Auto-process pending quote request after login
  useEffect(() => {
    const action = searchParams.get('action')

    // Only process if:
    // 1. User just returned with action=quote
    // 2. User is authenticated
    // 3. Cart is initialized
    // 4. Haven't processed yet this session
    // 5. Not currently requesting
    if (
      action === 'quote' &&
      isAuthenticated &&
      !authLoading &&
      isInitialized &&
      items.length > 0 &&
      !hasProcessedPendingQuote.current &&
      !isRequestingQuote
    ) {
      hasProcessedPendingQuote.current = true
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleRequestQuote()
        // Clean up URL params
        router.replace('/cart')
      }, 500)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, authLoading, isInitialized, items.length, isRequestingQuote])

  // Handle quote request
  const handleRequestQuote = async () => {
    if (items.length === 0) {
      toast.error('El carrito esta vacio')
      return
    }

    setIsRequestingQuote(true)

    try {
      if (!isAuthenticated) {
        // Save cart items to sessionStorage for after login
        sessionStorage.setItem('pendingQuoteCart', JSON.stringify(items))
        // Redirect to login with return URL to cart
        toast.info('Inicia sesión para solicitar una cotización')
        router.push('/auth/login?redirect=' + encodeURIComponent('/cart?action=quote'))
        return
      }

      // User is authenticated - use the direct quote request endpoint
      const quoteItems = items
        .filter(item => !isNaN(Number(item.productId)) && Number(item.productId) > 0)
        .map(item => ({
          product_id: Number(item.productId),
          quantity: item.quantity
        }))

      if (quoteItems.length === 0) {
        toast.error('No hay productos validos en el carrito')
        setIsRequestingQuote(false)
        return
      }

      const response = await quoteServiceModule.quotes.requestQuote({
        items: quoteItems,
        notes: undefined
      })

      if (response.success) {
        // Clear the cart after successful quote request
        clearCart()

        // Show success message
        toast.success(response.message)

        // Optional: Show quote details in a more prominent way
        toast.info(`Cotización #${response.data.quote_number} - Total: ${formatPrice(response.data.total_amount)}`)
      } else {
        toast.error('Error al solicitar la cotización')
      }
    } catch (error) {
      console.error('Error requesting quote:', error)
      toast.error('Error al procesar la solicitud de cotización')
    } finally {
      setIsRequestingQuote(false)
    }
  }

  // Handle proceed to checkout - sync local cart to API first
  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      toast.error('El carrito esta vacio')
      return
    }

    setIsSyncingToCheckout(true)

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Save intent to checkout after login
        toast.info('Inicia sesion para proceder al pago')
        router.push('/auth/login?redirect=' + encodeURIComponent('/cart?action=checkout'))
        return
      }

      // Sync local cart to API
      toast.info('Preparando tu carrito...')

      const apiCart = await shoppingCartService.localSync.syncLocalCartToAPI(items)

      // Save cart ID for checkout page
      shoppingCartService.localSync.saveCartIdForCheckout(apiCart.id)

      toast.success('Carrito listo!')

      // Navigate to checkout FIRST, then clear local cart
      // This prevents the flash of empty cart if user navigates back
      if (onCheckout) {
        onCheckout()
      } else {
        router.push(checkoutUrl)
      }

      // Clear local cart after navigation is initiated
      clearCart()
    } catch {
      toast.error('Error al preparar el carrito. Por favor intenta de nuevo.')
      setIsSyncingToCheckout(false)
    }
  }

  // Auto-process checkout after login (when action=checkout)
  useEffect(() => {
    const action = searchParams.get('action')

    if (
      action === 'checkout' &&
      isAuthenticated &&
      !authLoading &&
      isInitialized &&
      items.length > 0 &&
      !hasProcessedCheckout.current &&
      !isSyncingToCheckout
    ) {
      hasProcessedCheckout.current = true
      // Clean up URL and process checkout
      router.replace('/cart')
      handleProceedToCheckout()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, authLoading, isInitialized, items.length])

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

  // Empty cart (but not while syncing to checkout - cart was cleared before navigation)
  if (isEmpty && !isSyncingToCheckout) {
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
          <div className="col-3 col-md-2 text-end mt-3 mt-md-0">
            <div className="fw-bold text-primary" style={{ whiteSpace: 'nowrap' }}>
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
              <div className="col-3"></div>
              <div className="col-2 text-center">Precio</div>
              <div className="col-2 text-center">Cantidad</div>
              <div className="col-2 text-end">Total</div>
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
              <Button
                variant="success"
                size="large"
                className="w-100 mb-3"
                onClick={handleRequestQuote}
                disabled={isRequestingQuote || authLoading}
              >
                {isRequestingQuote ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-text me-2" />
                    Solicitar Cotizacion
                  </>
                )}
              </Button>

              <Button
                variant="primary"
                size="large"
                className="w-100"
                onClick={handleProceedToCheckout}
                disabled={isSyncingToCheckout || authLoading}
              >
                {isSyncingToCheckout ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Preparando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock me-2" />
                    Proceder al Pago
                  </>
                )}
              </Button>

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
