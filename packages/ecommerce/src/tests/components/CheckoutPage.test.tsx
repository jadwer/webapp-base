/**
 * CheckoutPage Tests
 *
 * Verifies the correct Stripe order of operations:
 * 1. The order is created (POST checkout) BEFORE any payment intent exists.
 * 2. The PaymentIntent is created AFTER the order, linked via metadata.order_id.
 * 3. If checkout fails (e.g. 422), the error surfaces before the card is touched.
 * 4. The cart is only cleared after a successful payment.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Shared call log to assert order of operations across services
const { callLog, pushMock, toastMock } = vi.hoisted(() => ({
  callLog: [] as string[],
  pushMock: vi.fn(),
  toastMock: { error: vi.fn(), success: vi.fn() },
}))

const { checkoutMock } = vi.hoisted(() => ({
  checkoutMock: vi.fn(),
}))

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@lwm/ui', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button type={type || 'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({ label, value, onChange, type }: any) => (
    <input aria-label={label} type={type || 'text'} value={value} onChange={onChange} />
  ),
  useNavigationProgress: () => ({ push: pushMock }),
  toast: toastMock,
}))

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: any) => <img {...props} />,
}))

vi.mock('../../hooks', () => ({
  useShoppingCart: () => ({
    cart: {
      id: '9',
      subtotalAmount: 100,
      taxAmount: 16,
      totalAmount: 116,
      finalTotal: 116,
    },
    isLoading: false,
  }),
  useShoppingCartItems: () => ({
    cartItems: [
      { id: '1', productName: 'Producto X', quantity: 1, totalPrice: 116 },
    ],
    isLoading: false,
  }),
  useShoppingCartMutations: () => ({
    checkout: checkoutMock,
    isCheckingOut: false,
  }),
}))

vi.mock('../../services/paymentService', () => ({
  paymentService: {
    processor: {
      initiatePayment: vi.fn(),
      verifyPayment: vi.fn(),
    },
  },
}))

vi.mock('../../services', () => ({
  shoppingCartService: {
    localSync: {
      clearLocalCart: vi.fn(),
      clearCartIdForCheckout: vi.fn(),
    },
  },
}))

vi.mock('../../components/StripePaymentForm', () => ({
  StripePaymentForm: ({ onPaymentSuccess, onPaymentError }: any) => (
    <div>
      <button onClick={() => onPaymentSuccess('pi_test_123')}>mock-pay-success</button>
      <button onClick={() => onPaymentError('Tarjeta rechazada')}>mock-pay-error</button>
    </div>
  ),
  StripePaymentFormSkeleton: () => <div data-testid="stripe-skeleton" />,
}))
/* eslint-enable @typescript-eslint/no-explicit-any */

import { CheckoutPage } from '../../components/CheckoutPage'
import { paymentService } from '../../services/paymentService'
import { shoppingCartService } from '../../services'

const initiatePaymentMock = vi.mocked(paymentService.processor.initiatePayment)
const verifyPaymentMock = vi.mocked(paymentService.processor.verifyPayment)
const clearLocalCartMock = vi.mocked(shoppingCartService.localSync.clearLocalCart)
const clearCartIdMock = vi.mocked(shoppingCartService.localSync.clearCartIdForCheckout)

function fillInfoForm() {
  fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'Juan Perez' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@example.com' } })
  fireEvent.change(screen.getByLabelText('Direccion Linea 1'), { target: { value: 'Calle 1 #23' } })
  fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: 'CDMX' } })
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'CDMX' } })
  fireEvent.change(screen.getByLabelText('Codigo Postal'), { target: { value: '01000' } })
}

async function continueToPayment() {
  fireEvent.click(screen.getByRole('button', { name: /Continuar al Pago/i }))
  await waitFor(() => expect(checkoutMock).toHaveBeenCalled())
}

describe('CheckoutPage - order of operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    callLog.length = 0

    checkoutMock.mockImplementation(async () => {
      callLog.push('checkout')
      return { data: { type: 'sales-orders', id: '55', attributes: {} }, message: 'ok' }
    })
    initiatePaymentMock.mockImplementation(async () => {
      callLog.push('initiatePayment')
      return { success: true, clientSecret: 'cs_test_abc', requiresAction: false }
    })
    verifyPaymentMock.mockResolvedValue({ success: true, requiresAction: false })
  })

  it('creates the order BEFORE creating the payment intent', async () => {
    render(<CheckoutPage cartId="9" />)

    fillInfoForm()
    await continueToPayment()

    // Checkout runs without a paymentIntentId (order pending payment)
    expect(checkoutMock).toHaveBeenCalledTimes(1)
    const orderData = checkoutMock.mock.calls[0][1] as Record<string, unknown>
    expect(orderData.paymentIntentId).toBeUndefined()
    expect(orderData.customerName).toBe('Juan Perez')

    // PaymentIntent is created after, linked to the order via metadata
    await waitFor(() => expect(initiatePaymentMock).toHaveBeenCalledTimes(1))
    expect(initiatePaymentMock).toHaveBeenCalledWith(
      9,
      116,
      'MXN',
      { order_id: '55', cart_id: '9' }
    )

    expect(callLog).toEqual(['checkout', 'initiatePayment'])
  })

  it('shows the backend error and never creates a payment intent when checkout fails (422)', async () => {
    checkoutMock.mockImplementation(async () => {
      callLog.push('checkout')
      const error = new Error('Request failed with status code 422') as Error & {
        response: { status: number; data: { error: string } }
      }
      error.response = {
        status: 422,
        data: { error: 'No contact found for this user. Please provide contact_id.' },
      }
      throw error
    })

    render(<CheckoutPage cartId="9" />)

    fillInfoForm()
    fireEvent.click(screen.getByRole('button', { name: /Continuar al Pago/i }))

    await waitFor(() =>
      expect(toastMock.error).toHaveBeenCalledWith(
        'No contact found for this user. Please provide contact_id.'
      )
    )

    // Still on the info step, card form never rendered, no client_secret consumed
    expect(initiatePaymentMock).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument()
    expect(clearLocalCartMock).not.toHaveBeenCalled()
    expect(clearCartIdMock).not.toHaveBeenCalled()
  })

  it('clears the cart and redirects only after successful payment, without a second checkout', async () => {
    render(<CheckoutPage cartId="9" />)

    fillInfoForm()
    await continueToPayment()

    const payButton = await screen.findByRole('button', { name: 'mock-pay-success' })
    fireEvent.click(payButton)

    await waitFor(() => expect(verifyPaymentMock).toHaveBeenCalledWith('pi_test_123'))
    await waitFor(() => expect(clearLocalCartMock).toHaveBeenCalledTimes(1))
    expect(clearCartIdMock).toHaveBeenCalledTimes(1)

    // The order was created once (before payment); success does not re-checkout
    expect(checkoutMock).toHaveBeenCalledTimes(1)

    // Redirects to the order created BEFORE the payment
    await waitFor(
      () => expect(pushMock).toHaveBeenCalledWith('/order-confirmation/55'),
      { timeout: 3500 }
    )
  })

  it('keeps the cart and stays on payment step when payment verification fails', async () => {
    verifyPaymentMock.mockResolvedValue({
      success: false,
      requiresAction: false,
      error: 'Estado del pago: requires_payment_method',
    })

    render(<CheckoutPage cartId="9" />)

    fillInfoForm()
    await continueToPayment()

    const payButton = await screen.findByRole('button', { name: 'mock-pay-success' })
    fireEvent.click(payButton)

    await waitFor(() => expect(toastMock.error).toHaveBeenCalled())

    // Cart is NOT cleared on failed payment; the pending order can be retried
    expect(clearLocalCartMock).not.toHaveBeenCalled()
    expect(clearCartIdMock).not.toHaveBeenCalled()

    // Back on the payment step (mock payment form visible again)
    expect(await screen.findByRole('button', { name: 'mock-pay-success' })).toBeInTheDocument()
  })
})
