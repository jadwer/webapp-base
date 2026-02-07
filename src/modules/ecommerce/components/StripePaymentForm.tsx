/**
 * StripePaymentForm Component
 *
 * Integrates Stripe Elements for secure card payment collection.
 * Uses PaymentElement for PCI-compliant card input.
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Button } from '@/ui/components/base'

// Initialize Stripe outside of component to avoid recreating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  currency?: string
  onPaymentSuccess: (paymentIntentId: string) => void
  onPaymentError: (error: string) => void
  disabled?: boolean
}

/**
 * Inner payment form component that uses Stripe hooks
 */
function PaymentForm({
  amount,
  currency = 'MXN',
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: Omit<StripePaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(value)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirm`,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Show error to customer
        const message = error.message || 'Ocurrio un error al procesar el pago'
        setErrorMessage(message)
        onPaymentError(message)
      } else if (paymentIntent) {
        // Payment succeeded
        if (paymentIntent.status === 'succeeded') {
          onPaymentSuccess(paymentIntent.id)
        } else if (paymentIntent.status === 'requires_action') {
          // Handle 3D Secure or other actions
          const { error: actionError, paymentIntent: updatedIntent } =
            await stripe.handleNextAction({ clientSecret: paymentIntent.client_secret! })

          if (actionError) {
            const msg = actionError.message || 'Error en la verificacion adicional'
            setErrorMessage(msg)
            onPaymentError(msg)
          } else if (updatedIntent?.status === 'succeeded') {
            onPaymentSuccess(updatedIntent.id)
          } else {
            setErrorMessage('La verificacion adicional no se completo')
            onPaymentError('La verificacion adicional no se completo')
          }
        } else {
          setErrorMessage(`Estado del pago: ${paymentIntent.status}`)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setErrorMessage(message)
      onPaymentError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-100"
        size="large"
        disabled={!stripe || isProcessing || disabled}
      >
        {isProcessing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Procesando pago...
          </>
        ) : (
          <>
            <i className="bi bi-lock me-2" />
            Pagar {formatCurrency(amount)}
          </>
        )}
      </Button>

      <div className="text-center mt-3">
        <small className="text-muted">
          <i className="bi bi-shield-lock me-1" />
          Pago seguro procesado por Stripe
        </small>
      </div>
    </form>
  )
}

/**
 * Main Stripe Payment Form wrapper with Elements provider
 */
export function StripePaymentForm({
  clientSecret,
  amount,
  currency = 'MXN',
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: StripePaymentFormProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false)

  useEffect(() => {
    // Check if Stripe key is configured
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.warn('Stripe publishable key not configured')
      onPaymentError('Configuracion de pago no disponible')
    } else {
      setStripeLoaded(true)
    }
  }, [onPaymentError])

  if (!stripeLoaded || !clientSecret) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando formulario de pago...</span>
        </div>
        <p className="text-muted mt-2">Preparando formulario de pago...</p>
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0d6efd',
        colorBackground: '#ffffff',
        colorText: '#212529',
        colorDanger: '#dc3545',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #ced4da',
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '1px solid #86b7fe',
          boxShadow: '0 0 0 0.25rem rgba(13, 110, 253, 0.25)',
        },
        '.Label': {
          fontWeight: '500',
          marginBottom: '4px',
        },
      },
    },
    locale: 'es',
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        amount={amount}
        currency={currency}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        disabled={disabled}
      />
    </Elements>
  )
}

/**
 * Skeleton loader for payment form
 */
export function StripePaymentFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-light rounded mb-3" style={{ height: '40px' }} />
      <div className="bg-light rounded mb-3" style={{ height: '56px' }} />
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="bg-light rounded" style={{ height: '56px' }} />
        </div>
        <div className="col-6">
          <div className="bg-light rounded" style={{ height: '56px' }} />
        </div>
      </div>
      <div className="bg-primary rounded opacity-50" style={{ height: '48px' }} />
    </div>
  )
}
