/**
 * CartPage Component
 *
 * Public shopping cart page for viewing and managing cart items.
 * Includes option to request a quote (cotizacion) directly from cart.
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'
import { useCart } from '../hooks'
import { quoteService } from '@/modules/quotes/services/quoteService'
import { ConfirmModal, ConfirmModalHandle } from '@/ui/components/feedback'

interface CartPageProps {
  sessionId: string
  userId?: number
  contactId?: number
}

export const CartPage = React.memo<CartPageProps>(({ sessionId, userId, contactId }) => {
  const navigation = useNavigationProgress()
  const toast = useToast()
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [isRequestingQuote, setIsRequestingQuote] = useState(false)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Get cart data and actions
  const {
    cart,
    cartItems,
    updateItemQuantity,
    removeItem,
    clearAllItems,
    isLoading,
    isUpdating,
    isRemoving,
  } = useCart({ sessionId })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  // Handle quantity change
  const handleQuantityChange = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItemId(itemId)
    try {
      await updateItemQuantity(itemId, newQuantity)
      toast.success('Cantidad actualizada')
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Error al actualizar la cantidad')
    } finally {
      setUpdatingItemId(null)
    }
  }, [updateItemQuantity, toast])

  // Handle remove item
  const handleRemoveItem = useCallback(async (itemId: string, productName: string) => {
    if (!confirm(`¿Eliminar "${productName}" del carrito?`)) return

    try {
      await removeItem(itemId)
      toast.success('Producto eliminado del carrito')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Error al eliminar el producto')
    }
  }, [removeItem, toast])

  // Handle clear cart
  const handleClearCart = useCallback(async () => {
    if (!confirm('¿Vaciar todo el carrito? Esta acción no se puede deshacer.')) return

    try {
      await clearAllItems()
      toast.success('Carrito vaciado')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Error al vaciar el carrito')
    }
  }, [clearAllItems, toast])

  // Handle checkout
  const handleCheckout = useCallback(() => {
    navigation.push('/checkout')
  }, [navigation])

  // Handle request quote
  const handleRequestQuote = useCallback(async () => {
    if (!cart?.id) {
      toast.error('No hay carrito activo')
      return
    }

    // If no contactId, redirect to quote creation page in dashboard
    if (!contactId) {
      navigation.push(`/dashboard/quotes/create?cartId=${cart.id}`)
      return
    }

    const confirmed = await confirmModalRef.current?.confirm(
      'Solicitar Cotizacion',
      'Se creara una cotizacion con los productos de tu carrito. Recibiras la cotizacion por correo electronico.',
      { confirmText: 'Solicitar', cancelText: 'Cancelar' }
    )

    if (!confirmed) return

    setIsRequestingQuote(true)
    try {
      const response = await quoteService.createFromCart({
        shopping_cart_id: parseInt(cart.id),
        contact_id: contactId,
      })

      toast.success(response.message || 'Cotizacion creada exitosamente')
      navigation.push(`/dashboard/quotes/${response.data.id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear cotizacion'
      toast.error(errorMessage)
    } finally {
      setIsRequestingQuote(false)
    }
  }, [cart?.id, contactId, navigation, toast])

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando carrito...</span>
          </div>
          <p className="text-muted mt-3">Cargando tu carrito...</p>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (!cart || cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-cart-x display-1 text-muted" />
            <h2 className="mt-4">Tu carrito está vacío</h2>
            <p className="text-muted mb-4">
              Agrega productos a tu carrito para comenzar tu compra
            </p>
            <Button
              variant="primary"
              onClick={() => navigation.push('/products')}
            >
              <i className="bi bi-shop me-2" />
              Ir a la tienda
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold">
            <i className="bi bi-cart3 me-3" />
            Carrito de Compras
          </h1>
          <p className="text-muted">
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>
        <div className="col-auto">
          <Button
            variant="danger"
            buttonStyle="outline"
            onClick={handleClearCart}
            disabled={isRemoving}
          >
            <i className="bi bi-trash me-2" />
            Vaciar carrito
          </Button>
        </div>
      </div>

      <div className="row g-4">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 ${index !== 0 ? 'border-top' : ''}`}
                >
                  <div className="row align-items-center">
                    {/* Product Image & Info */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        {item.productImage && (
                          <Image
                            src={item.productImage}
                            alt={item.productName || 'Product'}
                            width={80}
                            height={80}
                            className="rounded me-3"
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                        <div className="flex-fill">
                          <h5 className="mb-1">{item.productName}</h5>
                          {item.productSku && (
                            <small className="text-muted">SKU: {item.productSku}</small>
                          )}
                          <div className="mt-2">
                            <span className="fw-bold text-success">
                              {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="text-muted ms-2">c/u</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-md-3 text-center">
                      <div className="d-flex align-items-center justify-content-center">
                        <Button
                          variant="secondary"
                          buttonStyle="outline"
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItemId === item.id}
                        >
                          <i className="bi bi-dash" />
                        </Button>
                        <span className="mx-3 fw-bold">
                          {updatingItemId === item.id ? (
                            <div className="spinner-border spinner-border-sm" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="secondary"
                          buttonStyle="outline"
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updatingItemId === item.id}
                        >
                          <i className="bi bi-plus" />
                        </Button>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="col-md-3 text-end">
                      <div className="fw-bold fs-5 text-success mb-2">
                        {formatCurrency(item.totalPrice)}
                      </div>
                      <Button
                        variant="danger"
                        buttonStyle="outline"
                        size="small"
                        onClick={() => handleRemoveItem(item.id, item.productName || 'Producto')}
                        disabled={isRemoving}
                      >
                        <i className="bi bi-trash me-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-3">
            <Button
              variant="secondary"
              buttonStyle="outline"
              onClick={() => navigation.push('/products')}
            >
              <i className="bi bi-arrow-left me-2" />
              Continuar comprando
            </Button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen del Pedido</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-medium">{formatCurrency(cart.subtotalAmount)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">IVA (16%):</span>
                <span className="fw-medium">{formatCurrency(cart.taxAmount)}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Descuento:</span>
                  <span className="fw-medium text-danger">-{formatCurrency(cart.discountAmount)}</span>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total:</span>
                <span className="fw-bold fs-4 text-success">
                  {formatCurrency(cart.totalAmount)}
                </span>
              </div>

              <Button
                variant="primary"
                className="w-100 mb-3"
                size="large"
                onClick={handleCheckout}
                disabled={isUpdating || isRemoving || isRequestingQuote}
              >
                <i className="bi bi-credit-card me-2" />
                Proceder al pago
              </Button>

              <Button
                variant="secondary"
                buttonStyle="outline"
                className="w-100 mb-3"
                onClick={handleRequestQuote}
                disabled={isUpdating || isRemoving || isRequestingQuote}
              >
                {isRequestingQuote ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creando cotizacion...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-text me-2" />
                    Solicitar Cotizacion
                  </>
                )}
              </Button>

              <div className="alert alert-info small mb-0">
                <i className="bi bi-shield-check me-2" />
                Compra segura y protegida
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
})

CartPage.displayName = 'CartPage'
