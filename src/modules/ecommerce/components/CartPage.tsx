/**
 * CartPage Component
 *
 * Public shopping cart page for viewing and managing cart items.
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'
import { useCart } from '../hooks'

interface CartPageProps {
  sessionId: string
}

export const CartPage = React.memo<CartPageProps>(({ sessionId }) => {
  const navigation = useNavigationProgress()
  const toast = useToast()
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

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
                          <img
                            src={item.productImage}
                            alt={item.productName || 'Product'}
                            className="rounded me-3"
                            style={{ width: 80, height: 80, objectFit: 'cover' }}
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
                          size="sm"
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
                          size="sm"
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
                        size="sm"
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
                <span className="text-muted">Impuestos:</span>
                <span className="fw-medium">{formatCurrency(cart.taxAmount)}</span>
              </div>

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
                size="lg"
                onClick={handleCheckout}
                disabled={isUpdating || isRemoving}
              >
                <i className="bi bi-credit-card me-2" />
                Proceder al pago
              </Button>

              <div className="alert alert-info small mb-0">
                <i className="bi bi-shield-check me-2" />
                Compra segura y protegida
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

CartPage.displayName = 'CartPage'
