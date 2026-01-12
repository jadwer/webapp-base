/**
 * CheckoutPage Component
 *
 * Public checkout page for completing purchases.
 */

'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button, Input } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'
import { useCart } from '../hooks'

interface CheckoutPageProps {
  sessionId: string
}

export const CheckoutPage = React.memo<CheckoutPageProps>(({ sessionId }) => {
  const navigation = useNavigationProgress()
  const toast = useToast()

  // Get cart data
  const {
    cart,
    cartItems,
    checkoutCart,
    isLoading,
    isCheckingOut,
  } = useCart({ sessionId })

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Shipping address
  const [shippingAddressLine1, setShippingAddressLine1] = useState('')
  const [shippingAddressLine2, setShippingAddressLine2] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [shippingCountry, setShippingCountry] = useState('México')

  // Billing same as shipping
  const [sameBillingAddress, setSameBillingAddress] = useState(true)

  // Billing address (if different)
  const [billingAddressLine1, setBillingAddressLine1] = useState('')
  const [billingAddressLine2, setBillingAddressLine2] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingPostalCode, setBillingPostalCode] = useState('')
  const [billingCountry, setBillingCountry] = useState('México')

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  // Handle checkout
  const handleCheckout = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form inline
    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre')
      return
    }
    if (!customerEmail.trim()) {
      toast.error('Por favor ingresa tu email')
      return
    }
    if (!shippingAddressLine1.trim()) {
      toast.error('Por favor ingresa tu dirección de envío')
      return
    }
    if (!shippingCity.trim()) {
      toast.error('Por favor ingresa tu ciudad')
      return
    }
    if (!shippingState.trim()) {
      toast.error('Por favor ingresa tu estado')
      return
    }
    if (!shippingPostalCode.trim()) {
      toast.error('Por favor ingresa tu código postal')
      return
    }

    try {
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingCountry,
        ...(sameBillingAddress ? {} : {
          billingAddressLine1,
          billingAddressLine2,
          billingCity,
          billingState,
          billingPostalCode,
          billingCountry,
        }),
      }

      const order = await checkoutCart(orderData)
      toast.success('¡Orden creada exitosamente!')

      // Redirect to order confirmation
      const orderData_response = order.data as { id: string }
      navigation.push(`/order-confirmation/${orderData_response.id}`)
    } catch (error) {
      console.error('Error during checkout:', error)
      toast.error('Error al procesar tu orden. Intenta nuevamente.')
    }
  }, [
    customerName,
    customerEmail,
    customerPhone,
    shippingAddressLine1,
    shippingAddressLine2,
    shippingCity,
    shippingState,
    shippingPostalCode,
    shippingCountry,
    sameBillingAddress,
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingState,
    billingPostalCode,
    billingCountry,
    checkoutCart,
    toast,
    navigation
  ])

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Empty cart redirect
  if (!cart || cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4 className="alert-heading">Carrito Vacío</h4>
          <p>No tienes productos en tu carrito para proceder al checkout.</p>
          <Button variant="primary" onClick={() => navigation.push('/products')}>
            Ir a la tienda
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bold mb-4">
        <i className="bi bi-credit-card me-3" />
        Checkout
      </h1>

      <form onSubmit={handleCheckout}>
        <div className="row g-4">
          {/* Checkout Form */}
          <div className="col-lg-7">
            {/* Customer Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Información de Contacto</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Input
                      type="text"
                      label="Nombre Completo"
                      placeholder="Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      leftIcon="bi-person"
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      type="email"
                      label="Email"
                      placeholder="tu@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      leftIcon="bi-envelope"
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      type="tel"
                      label="Teléfono"
                      placeholder="55 1234 5678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      leftIcon="bi-telephone"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Dirección de Envío</h5>
                <div className="row g-3">
                  <div className="col-12">
                    <Input
                      type="text"
                      label="Dirección Línea 1"
                      placeholder="Calle y número"
                      value={shippingAddressLine1}
                      onChange={(e) => setShippingAddressLine1(e.target.value)}
                      required
                      leftIcon="bi-house"
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      type="text"
                      label="Dirección Línea 2 (opcional)"
                      placeholder="Colonia, referencias"
                      value={shippingAddressLine2}
                      onChange={(e) => setShippingAddressLine2(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      type="text"
                      label="Ciudad"
                      placeholder="Ciudad de México"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                      leftIcon="bi-building"
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      type="text"
                      label="Estado"
                      placeholder="CDMX"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      type="text"
                      label="Código Postal"
                      placeholder="01000"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      type="text"
                      label="País"
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address Option */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="sameBillingAddress"
                    checked={sameBillingAddress}
                    onChange={(e) => setSameBillingAddress(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="sameBillingAddress">
                    La dirección de facturación es la misma que la de envío
                  </label>
                </div>

                {!sameBillingAddress && (
                  <>
                    <h5 className="card-title mb-4">Dirección de Facturación</h5>
                    <div className="row g-3">
                      <div className="col-12">
                        <Input
                          type="text"
                          label="Dirección Línea 1"
                          value={billingAddressLine1}
                          onChange={(e) => setBillingAddressLine1(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <Input
                          type="text"
                          label="Dirección Línea 2 (opcional)"
                          value={billingAddressLine2}
                          onChange={(e) => setBillingAddressLine2(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          type="text"
                          label="Ciudad"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          type="text"
                          label="Estado"
                          value={billingState}
                          onChange={(e) => setBillingState(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          type="text"
                          label="Código Postal"
                          value={billingPostalCode}
                          onChange={(e) => setBillingPostalCode(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          type="text"
                          label="País"
                          value={billingCountry}
                          onChange={(e) => setBillingCountry(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h5 className="card-title mb-4">Resumen del Pedido</h5>

                {/* Items */}
                <div className="mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName || 'Product'}
                          width={50}
                          height={50}
                          className="rounded me-3"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                      <div className="flex-fill">
                        <div className="fw-medium">{item.productName}</div>
                        <small className="text-muted">Cantidad: {item.quantity}</small>
                      </div>
                      <div className="fw-bold">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  size="large"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2" />
                      Confirmar Pedido
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  buttonStyle="outline"
                  className="w-100"
                  onClick={() => navigation.push('/cart')}
                  disabled={isCheckingOut}
                >
                  <i className="bi bi-arrow-left me-2" />
                  Volver al carrito
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
})

CheckoutPage.displayName = 'CheckoutPage'
