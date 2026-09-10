/**
 * REGISTER PAYMENT MODAL TESTS
 * Integration tests for RegisterPaymentModal: default amount/date, forma de
 * pago select population, 422 error surfacing, and success payload shape.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegisterPaymentModal } from '../../components/RegisterPaymentModal'
import { createMockARInvoice } from '../utils/test-utils'

const registerPaymentMock = vi.fn()

vi.mock('../../hooks', () => ({
  useFormaPagoOptions: () => ({
    formaPagoOptions: [
      { clave: '01', descripcion: 'Efectivo' },
      { clave: '03', descripcion: 'Transferencia electrónica de fondos' },
    ],
    isLoading: false,
    error: null,
  }),
  useRegisterARPayment: () => ({
    registerPayment: registerPaymentMock,
  }),
}))

describe('RegisterPaymentModal', () => {
  const mockInvoice = createMockARInvoice({
    id: '42',
    invoiceNumber: 'INV-042',
    totalAmount: 2320,
    paidAmount: 500,
    currency: 'MXN',
  })

  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when there is no invoice', () => {
    const { container } = render(
      <RegisterPaymentModal isOpen={true} arInvoice={null} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('defaults amount to the outstanding balance and date to today', () => {
    render(
      <RegisterPaymentModal isOpen={true} arInvoice={mockInvoice} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )

    const amountInput = screen.getByLabelText(/monto/i) as HTMLInputElement
    const dateInput = screen.getByLabelText(/fecha de pago/i) as HTMLInputElement

    expect(Number(amountInput.value)).toBe(1820) // 2320 - 500
    expect(dateInput.value).toBe(new Date().toISOString().split('T')[0])
  })

  it('populates the forma de pago select from useFormaPagoOptions', () => {
    render(
      <RegisterPaymentModal isOpen={true} arInvoice={mockInvoice} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )

    expect(screen.getByText('01 - Efectivo')).toBeInTheDocument()
    expect(screen.getByText('03 - Transferencia electrónica de fondos')).toBeInTheDocument()
  })

  it('blocks submission when amount exceeds the outstanding balance', async () => {
    render(
      <RegisterPaymentModal isOpen={true} arInvoice={mockInvoice} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )

    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '999999' } })
    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: '03' } })
    const form = document.getElementById('register-payment-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/no puede ser mayor al saldo pendiente/i)).toBeInTheDocument()
    })
    expect(registerPaymentMock).not.toHaveBeenCalled()
  })

  it('submits the expected payload and reports the updated invoice on success', async () => {
    registerPaymentMock.mockResolvedValue({
      message: 'Payment registered successfully',
      invoice: { id: '42', totalAmount: 2320, paidAmount: 1820, balance: 500, status: 'partial' },
    })

    render(
      <RegisterPaymentModal isOpen={true} arInvoice={mockInvoice} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )

    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '1320' } })
    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: '03' } })
    fireEvent.change(screen.getByLabelText(/referencia/i), { target: { value: 'REF-999' } })

    const form = document.getElementById('register-payment-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(registerPaymentMock).toHaveBeenCalledWith('42', {
        paymentDate: new Date().toISOString().split('T')[0],
        amount: 1320,
        formaPago: '03',
        reference: 'REF-999',
        comments: '',
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        id: '42',
        totalAmount: 2320,
        paidAmount: 1820,
        balance: 500,
        status: 'partial',
      })
    })
  })

  it('surfaces the backend 422 message (overpayment / invalid forma de pago / cancelled invoice)', async () => {
    registerPaymentMock.mockRejectedValue({
      response: {
        status: 422,
        data: { message: 'La factura está cancelada y no admite pagos.' },
      },
    })

    render(
      <RegisterPaymentModal isOpen={true} arInvoice={mockInvoice} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    )

    fireEvent.change(screen.getByLabelText(/forma de pago/i), { target: { value: '01' } })
    const form = document.getElementById('register-payment-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('La factura está cancelada y no admite pagos.')).toBeInTheDocument()
    })
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})
