/**
 * CheckoutPage Component
 *
 * Public checkout page for completing purchases with Stripe payment integration.
 * Flow: Customer Info -> Payment -> Confirmation
 */

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button, Input } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'
import { useShoppingCart, useShoppingCartItems, useShoppingCartMutations } from '../hooks'
import { paymentService } from '../services/paymentService'
import { shoppingCartService } from '../services'
import { StripePaymentForm, StripePaymentFormSkeleton } from './StripePaymentForm'

type CheckoutStep = 'info' | 'payment' | 'processing' | 'success'

interface CheckoutPageProps {
  cartId: string
}

export const CheckoutPage = React.memo<CheckoutPageProps>(({ cartId }) => {
  const navigation = useNavigationProgress()
  const toast = useToast()
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  const effectiveCartId = cartId || ''

  // Get cart data by ID
  const { cart, isLoading: isLoadingCart } = useShoppingCart(effectiveCartId)
  const { cartItems, isLoading: isLoadingItems } = useShoppingCartItems(
    cart?.id ? parseInt(cart.id) : undefined
  )
  const cartMutations = useShoppingCartMutations()

  const isLoading = isLoadingCart || isLoadingItems
  const isCheckingOut = cartMutations.isCheckingOut

  // Checkout function
  const checkoutCart = useCallback(
    async (orderData: Record<string, unknown>) => {
      if (cart) {
        const result = await cartMutations.checkout(cart.id, orderData)
        // Clear cart ID from localStorage after successful checkout
        shoppingCartService.localSync.clearCartIdForCheckout()
        return result
      }
      throw new Error('No cart available')
    },
    [cart, cartMutations]
  )

  // Checkout step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isInitializingPayment, setIsInitializingPayment] = useState(false)

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
  const [shippingCountry, setShippingCountry] = useState('Mexico')

  // Billing same as shipping
  const [sameBillingAddress, setSameBillingAddress] = useState(true)

  // Billing address (if different)
  const [billingAddressLine1, setBillingAddressLine1] = useState('')
  const [billingAddressLine2, setBillingAddressLine2] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingPostalCode, setBillingPostalCode] = useState('')
  const [billingCountry, setBillingCountry] = useState('Mexico')

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  // Validate customer info form
  const validateInfoForm = useCallback(() => {
    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre')
      return false
    }
    if (!customerEmail.trim()) {
      toast.error('Por favor ingresa tu email')
      return false
    }
    if (!shippingAddressLine1.trim()) {
      toast.error('Por favor ingresa tu direccion de envio')
      return false
    }
    if (!shippingCity.trim()) {
      toast.error('Por favor ingresa tu ciudad')
      return false
    }
    if (!shippingState.trim()) {
      toast.error('Por favor ingresa tu estado')
      return false
    }
    if (!shippingPostalCode.trim()) {
      toast.error('Por favor ingresa tu codigo postal')
      return false
    }
    return true
  }, [customerName, customerEmail, shippingAddressLine1, shippingCity, shippingState, shippingPostalCode, toast])

  // Initialize payment intent when moving to payment step
  const initializePayment = useCallback(async () => {
    if (!cart) return

    setIsInitializingPayment(true)
    try {
      // Use cart ID for the checkout session
      const checkoutSessionId = parseInt(effectiveCartId) || Date.now()

      const result = await paymentService.processor.initiatePayment(
        checkoutSessionId,
        cart.finalTotal || cart.totalAmount,
        'MXN'
      )

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret)
      } else {
        toast.error(result.error || 'Error al iniciar el pago')
        setCurrentStep('info')
      }
    } catch (error) {
      console.error('Error initializing payment:', error)
      toast.error('Error al preparar el pago')
      setCurrentStep('info')
    } finally {
      setIsInitializingPayment(false)
    }
  }, [cart, effectiveCartId, toast])

  // Handle continue to payment
  const handleContinueToPayment = useCallback(async () => {
    if (!validateInfoForm()) return
    setCurrentStep('payment')
  }, [validateInfoForm])

  // Initialize payment when step changes to payment
  useEffect(() => {
    if (currentStep === 'payment' && !clientSecret) {
      initializePayment()
    }
  }, [currentStep, clientSecret, initializePayment])

  // Handle payment success
  const handlePaymentSuccess = useCallback(async (intentId: string) => {
    setCurrentStep('processing')

    try {
      // Verify payment status
      const verification = await paymentService.processor.verifyPayment(intentId)

      if (verification.success) {
        // Complete checkout and create order
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
          paymentIntentId: intentId,
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
        setCurrentStep('success')
        toast.success('Pago completado exitosamente!')

        // Redirect to confirmation after short delay
        redirectTimerRef.current = setTimeout(() => {
          const orderResponse = order.data as { id: string }
          navigation.push(`/order-confirmation/${orderResponse.id}`)
        }, 2000)
      } else {
        toast.error(verification.error || 'Error al verificar el pago')
        setCurrentStep('payment')
      }
    } catch (error) {
      console.error('Error completing checkout:', error)
      toast.error('Error al completar la orden')
      setCurrentStep('payment')
    }
  }, [
    customerName, customerEmail, customerPhone,
    shippingAddressLine1, shippingAddressLine2, shippingCity,
    shippingState, shippingPostalCode, shippingCountry,
    sameBillingAddress, billingAddressLine1, billingAddressLine2,
    billingCity, billingState, billingPostalCode, billingCountry,
    checkoutCart, toast, navigation
  ])

  // Handle payment error
  const handlePaymentError = useCallback((error: string) => {
    toast.error(error)
  }, [toast])

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
          <h4 className="alert-heading">Carrito Vacio</h4>
          <p>No tienes productos en tu carrito para proceder al checkout.</p>
          <Button variant="primary" onClick={() => navigation.push('/products')}>
            Ir a la tienda
          </Button>
        </div>
      </div>
    )
  }

  // Success state
  if (currentStep === 'success') {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }} />
          </div>
          <h2 className="mb-3">Pago Completado!</h2>
          <p className="text-muted mb-4">
            Tu orden ha sido procesada exitosamente. Redirigiendo a la confirmacion...
          </p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Redirigiendo...</span>
          </div>
        </div>
      </div>
    )
  }

  // Processing state
  if (currentStep === 'processing') {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-4" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Procesando...</span>
          </div>
          <h3>Procesando tu orden...</h3>
          <p className="text-muted">Por favor espera mientras confirmamos tu pago.</p>
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

      {/* Step Indicator */}
      <div className="d-flex justify-content-center mb-5">
        <div className="d-flex align-items-center">
          <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep === 'info' ? 'bg-primary text-white' : 'bg-success text-white'}`} style={{ width: '40px', height: '40px' }}>
            {currentStep === 'info' ? '1' : <i className="bi bi-check" />}
          </div>
          <span className={`ms-2 me-4 ${currentStep === 'info' ? 'fw-bold' : ''}`}>Informacion</span>

          <div className="border-top" style={{ width: '50px' }} />

          <div className={`rounded-circle d-flex align-items-center justify-content-center ms-4 ${currentStep === 'payment' ? 'bg-primary text-white' : currentStep === 'info' ? 'bg-light text-muted' : 'bg-success text-white'}`} style={{ width: '40px', height: '40px' }}>
            {currentStep === 'payment' || currentStep === 'info' ? '2' : <i className="bi bi-check" />}
          </div>
          <span className={`ms-2 ${currentStep === 'payment' ? 'fw-bold' : ''}`}>Pago</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-7">
          {currentStep === 'info' && (
            <>
              {/* Customer Information */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-4">Informacion de Contacto</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Input
                        type="text"
                        label="Nombre Completo"
                        placeholder="Juan Perez"
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
                        label="Telefono"
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
                  <h5 className="card-title mb-4">Direccion de Envio</h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <Input
                        type="text"
                        label="Direccion Linea 1"
                        placeholder="Calle y numero"
                        value={shippingAddressLine1}
                        onChange={(e) => setShippingAddressLine1(e.target.value)}
                        required
                        leftIcon="bi-house"
                      />
                    </div>
                    <div className="col-12">
                      <Input
                        type="text"
                        label="Direccion Linea 2 (opcional)"
                        placeholder="Colonia, referencias"
                        value={shippingAddressLine2}
                        onChange={(e) => setShippingAddressLine2(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        type="text"
                        label="Ciudad"
                        placeholder="Ciudad de Mexico"
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
                        label="Codigo Postal"
                        placeholder="01000"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        type="text"
                        label="Pais"
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address Option */}
              <div className="card border-0 shadow-sm mb-4">
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
                      La direccion de facturacion es la misma que la de envio
                    </label>
                  </div>

                  {!sameBillingAddress && (
                    <>
                      <h5 className="card-title mb-4">Direccion de Facturacion</h5>
                      <div className="row g-3">
                        <div className="col-12">
                          <Input
                            type="text"
                            label="Direccion Linea 1"
                            value={billingAddressLine1}
                            onChange={(e) => setBillingAddressLine1(e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <Input
                            type="text"
                            label="Direccion Linea 2 (opcional)"
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
                            label="Codigo Postal"
                            value={billingPostalCode}
                            onChange={(e) => setBillingPostalCode(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            type="text"
                            label="Pais"
                            value={billingCountry}
                            onChange={(e) => setBillingCountry(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <Button
                type="button"
                variant="primary"
                className="w-100"
                size="large"
                onClick={handleContinueToPayment}
              >
                Continuar al Pago
                <i className="bi bi-arrow-right ms-2" />
              </Button>
            </>
          )}

          {currentStep === 'payment' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="bi bi-credit-card me-2" />
                  Informacion de Pago
                </h5>

                {isInitializingPayment || !clientSecret ? (
                  <StripePaymentFormSkeleton />
                ) : (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    amount={cart.totalAmount}
                    currency="MXN"
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    disabled={isCheckingOut}
                  />
                )}

                <hr className="my-4" />

                <Button
                  type="button"
                  variant="secondary"
                  buttonStyle="outline"
                  className="w-100"
                  onClick={() => setCurrentStep('info')}
                  disabled={isCheckingOut}
                >
                  <i className="bi bi-arrow-left me-2" />
                  Volver a Informacion
                </Button>
              </div>
            </div>
          )}
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

              {/* Back to Cart */}
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

              {/* Security Badge */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="bi bi-shield-lock me-1" />
                  Compra 100% segura
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

CheckoutPage.displayName = 'CheckoutPage'
