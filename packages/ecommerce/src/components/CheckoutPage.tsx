/**
 * CheckoutPage Component
 *
 * Public checkout page for completing purchases with Stripe payment integration.
 * Flow: Customer Info -> Payment -> Confirmation
 */

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button, Input } from '@lwm/ui'
import { useNavigationProgress } from '@lwm/ui'
import { toast } from '@lwm/ui'
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
  const { cart, isLoading: isLoadingCart, mutate: mutateCart } = useShoppingCart(effectiveCartId)
  const { cartItems, isLoading: isLoadingItems, mutate: mutateItems } = useShoppingCartItems(
    cart?.id ? parseInt(cart.id) : undefined
  )
  const cartMutations = useShoppingCartMutations()

  const isLoading = isLoadingCart || isLoadingItems
  const isCheckingOut = cartMutations.isCheckingOut

  // Recovery for the "empty server cart but local cart has items" case.
  // The guest localStorage cart ('app_cart') is the source of truth; the server
  // cart is derived. If a previous sync failed halfway, the server cart may be
  // empty while local items still exist. Instead of a dead-end, re-sync.
  const [isResyncing, setIsResyncing] = useState(false)

  const readLocalCartItems = useCallback((): Array<Record<string, unknown>> => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('app_cart')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [])

  const handleResyncCart = useCallback(async () => {
    const localItems = readLocalCartItems()
    if (localItems.length === 0) {
      navigation.push('/cart')
      return
    }

    setIsResyncing(true)
    try {
      const synced = await shoppingCartService.localSync.syncLocalCartToAPI(
        localItems as never
      )
      shoppingCartService.localSync.saveCartIdForCheckout(synced.id)
      await Promise.all([mutateCart(), mutateItems()])
      toast.success('Carrito sincronizado')
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No se pudo sincronizar tu carrito. Intenta de nuevo.'
      toast.error(message)
    } finally {
      setIsResyncing(false)
    }
  }, [readLocalCartItems, navigation, mutateCart, mutateItems])

  // Checkout function: creates the order (pending payment) BEFORE charging.
  // Local cart/localStorage is NOT cleared here; only after successful payment.
  const checkoutCart = useCallback(
    async (orderData: Record<string, unknown>) => {
      if (cart) {
        return await cartMutations.checkout(cart.id, orderData)
      }
      throw new Error('No cart available')
    },
    [cart, cartMutations]
  )

  // Checkout step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isInitializingPayment, setIsInitializingPayment] = useState(false)
  // Order created at checkout (before payment), used to link the PaymentIntent
  const [orderId, setOrderId] = useState<string | null>(null)

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
  }, [customerName, customerEmail, shippingAddressLine1, shippingCity, shippingState, shippingPostalCode])

  // Extract backend error message from an axios-style error (e.g. 422 "No contact found...")
  const getApiErrorMessage = (error: unknown): string | null => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { error?: string; message?: string } } }).response
      return response?.data?.error || response?.data?.message || null
    }
    return null
  }

  // DESIGN_ECOMMERCE_PAGO_STOCK (H-A): el backend responde 422 con
  // insufficient_items + quote_cta cuando el disponible (fisico menos
  // comprometido en ordenes pagadas) no alcanza. En vez de un toast generico,
  // se ofrece el camino de cotizacion (/cart?action=quote reabre el modal).
  interface StockShortageItem {
    product_id: number
    product_name?: string | null
    requested: number
    available: number
  }
  const [stockShortage, setStockShortage] = useState<StockShortageItem[] | null>(null)

  const getStockShortage = (error: unknown): StockShortageItem[] | null => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const data = (error as {
        response?: { data?: { insufficient_items?: StockShortageItem[]; quote_cta?: boolean } }
      }).response?.data
      if (data?.quote_cta && Array.isArray(data.insufficient_items) && data.insufficient_items.length > 0) {
        return data.insufficient_items
      }
    }
    return null
  }

  // Initialize payment intent when moving to payment step.
  // The order already exists at this point; link the PaymentIntent to it via metadata.
  const initializePayment = useCallback(async () => {
    if (!cart || !orderId) return

    setIsInitializingPayment(true)
    try {
      // Use cart ID for the checkout session
      const checkoutSessionId = parseInt(effectiveCartId) || Date.now()

      const result = await paymentService.processor.initiatePayment(
        checkoutSessionId,
        cart.finalTotal || cart.totalAmount,
        'MXN',
        { order_id: orderId, cart_id: effectiveCartId }
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
  }, [cart, effectiveCartId, orderId])

  // Handle continue to payment: create the order FIRST (pending payment),
  // then move to the payment step. If the order cannot be created (e.g. 422),
  // the error is shown before the card is ever touched.
  const handleContinueToPayment = useCallback(async () => {
    if (!validateInfoForm()) return

    // Order already created (user navigated back and forth): go straight to payment
    if (orderId) {
      setCurrentStep('payment')
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

      setStockShortage(null)
      const order = await checkoutCart(orderData)
      const orderResponse = order.data as { id: string }
      setOrderId(orderResponse.id)
      setCurrentStep('payment')
    } catch (error) {
      console.error('Error creating order:', error)
      const shortage = getStockShortage(error)
      if (shortage) {
        setStockShortage(shortage)
        toast.error('No hay existencia suficiente para completar la compra.')
        return
      }
      toast.error(getApiErrorMessage(error) || 'No se pudo crear la orden. Verifica tus datos e intenta de nuevo.')
    }
  }, [
    validateInfoForm, orderId,
    customerName, customerEmail, customerPhone,
    shippingAddressLine1, shippingAddressLine2, shippingCity,
    shippingState, shippingPostalCode, shippingCountry,
    sameBillingAddress, billingAddressLine1, billingAddressLine2,
    billingCity, billingState, billingPostalCode, billingCountry,
    checkoutCart
  ])

  // Initialize payment when step changes to payment
  useEffect(() => {
    if (currentStep === 'payment' && !clientSecret) {
      initializePayment()
    }
  }, [currentStep, clientSecret, initializePayment])

  // Handle payment success: the order already exists, so only verify the
  // payment and then clear the local cart. No further checkout call needed.
  const handlePaymentSuccess = useCallback(async (intentId: string) => {
    setCurrentStep('processing')

    try {
      // Verify payment status
      const verification = await paymentService.processor.verifyPayment(intentId)

      if (verification.success) {
        // Clear local cart (localStorage) only after successful payment
        shoppingCartService.localSync.clearCartIdForCheckout()
        shoppingCartService.localSync.clearLocalCart()
        setCurrentStep('success')
        toast.success('Pago completado exitosamente!')

        // Redirect to confirmation after short delay
        redirectTimerRef.current = setTimeout(() => {
          navigation.push(`/order-confirmation/${orderId}`)
        }, 2000)
      } else {
        // Order stays pending; the customer can retry the payment
        toast.error(verification.error || 'El pago no se pudo completar. Tu orden quedo pendiente de pago, puedes intentar de nuevo.')
        setCurrentStep('payment')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('No se pudo verificar el pago. Tu orden quedo pendiente de pago, puedes intentar de nuevo.')
      setCurrentStep('payment')
    }
  }, [orderId, navigation])

  // Handle payment error
  const handlePaymentError = useCallback((error: string) => {
    toast.error(error)
  }, [])

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

  // Empty cart handling. The server cart may be empty because a previous sync
  // failed halfway; if the local cart still has items, offer to re-sync instead
  // of the dead-end "empty cart" message.
  if (!cart || cartItems.length === 0) {
    const hasLocalItems = readLocalCartItems().length > 0

    if (hasLocalItems) {
      return (
        <div className="container py-5">
          <div className="alert alert-warning">
            <h4 className="alert-heading">Hubo un problema sincronizando tu carrito</h4>
            <p>
              Tus productos siguen guardados, pero no se pudieron preparar para el pago.
              Puedes reintentar la sincronizacion.
            </p>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleResyncCart}
                disabled={isResyncing}
              >
                {isResyncing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat me-2" />
                    Reintentar
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                buttonStyle="outline"
                onClick={() => navigation.push('/cart')}
                disabled={isResyncing}
              >
                Volver al carrito
              </Button>
            </div>
          </div>
        </div>
      )
    }

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
              {stockShortage && (
                <div className="alert alert-warning border-0 shadow-sm mb-4" role="alert">
                  <h6 className="alert-heading">
                    <i className="bi bi-box-seam me-2" />
                    Se ha terminado este producto
                  </h6>
                  <ul className="mb-2">
                    {stockShortage.map((item) => (
                      <li key={item.product_id}>
                        {item.product_name || `Producto ${item.product_id}`}: solicitaste{' '}
                        {item.requested}, disponibles {item.available}
                      </li>
                    ))}
                  </ul>
                  <p className="mb-2">
                    ¿Quieres realizar una cotizacion ahora para saber el tiempo de entrega?
                  </p>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigation.push('/cart?action=quote')}
                  >
                    <i className="bi bi-file-earmark-text me-2" />
                    Solicitar cotizacion
                  </Button>
                </div>
              )}

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
