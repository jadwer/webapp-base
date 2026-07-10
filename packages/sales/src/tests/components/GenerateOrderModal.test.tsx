/**
 * GenerateOrderModal Component Tests (Fase A - pedido)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GenerateOrderModal } from '../../quotes/components/GenerateOrderModal'
import { useQuoteMutations, useQuoteItems } from '../../quotes/hooks'
import { salesService } from '../../services'
import {
  createMockQuote,
  createMockQuoteItem,
  createMockProductRef,
} from '../../quotes/tests/utils/test-utils'

vi.mock('../../quotes/hooks', () => ({
  useQuoteMutations: vi.fn(),
  useQuoteItems: vi.fn(),
}))

vi.mock('../../services', () => ({
  salesService: {
    orders: {
      uploadCustomerPo: vi.fn(),
    },
  },
}))

vi.mock('@lwm/ui', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

import { toast } from '@lwm/ui'

const itemWithStock = createMockQuoteItem({
  id: '1',
  quantity: 2,
  productName: 'Producto A',
  product: createMockProductRef({ id: '1' }),
})

const itemWithoutStock = createMockQuoteItem({
  id: '2',
  productId: 2,
  quantity: 5,
  productName: 'Producto B',
  product: createMockProductRef({ id: '2', stock: [] }),
})

describe('GenerateOrderModal', () => {
  const mockConvert = vi.fn()

  const successResponse = {
    data: {
      quote: createMockQuote({ status: 'converted' }),
      salesOrder: { type: 'sales-orders', id: '55', attributes: { orderNumber: 'OV-000055' } },
    },
    message: 'ok',
  }

  const setup = (overrides?: {
    items?: ReturnType<typeof createMockQuoteItem>[]
    quote?: ReturnType<typeof createMockQuote>
    onConverted?: ReturnType<typeof vi.fn>
  }) => {
    vi.mocked(useQuoteItems).mockReturnValue({
      data: overrides?.items ?? [itemWithStock],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuoteItems>)

    const quote =
      overrides?.quote ??
      createMockQuote({ id: '7', status: 'accepted', paymentMethod: 'PUE', creditDays: 15 })
    const onConverted = overrides?.onConverted ?? vi.fn()
    render(
      <GenerateOrderModal quote={quote} isOpen={true} onClose={vi.fn()} onConverted={onConverted} />
    )
    return { quote, onConverted }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQuoteMutations).mockReturnValue({
      convert: { mutateAsync: mockConvert, isPending: false },
    } as unknown as ReturnType<typeof useQuoteMutations>)
  })

  it('requires customer_po_number before converting', async () => {
    setup()

    fireEvent.click(screen.getByRole('button', { name: /generar pedido/i }))

    await waitFor(() =>
      expect(screen.getByText(/el numero de oc del cliente es requerido/i)).toBeInTheDocument()
    )
    expect(mockConvert).not.toHaveBeenCalled()
  })

  it('sends order_type order with po number and payment fields prefilled from the quote', async () => {
    mockConvert.mockResolvedValue(successResponse)
    const { onConverted } = setup()

    fireEvent.change(screen.getByLabelText(/no\. oc del cliente/i), {
      target: { value: 'OC-2026-0157' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generar pedido/i }))

    await waitFor(() =>
      expect(mockConvert).toHaveBeenCalledWith({
        id: '7',
        data: {
          order_type: 'order',
          customer_po_number: 'OC-2026-0157',
          payment_method: 'PUE',
          credit_days: 15,
        },
      })
    )
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('OV-000055'))
    expect(onConverted).toHaveBeenCalledWith('55')
    expect(salesService.orders.uploadCustomerPo).not.toHaveBeenCalled()
  })

  it('uploads the customer PO PDF after creating the order', async () => {
    mockConvert.mockResolvedValue(successResponse)
    vi.mocked(salesService.orders.uploadCustomerPo).mockResolvedValue({})
    setup()

    fireEvent.change(screen.getByLabelText(/no\. oc del cliente/i), {
      target: { value: 'OC-123' },
    })

    const file = new File(['%PDF-1.4'], 'oc.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText(/pdf de la oc/i), { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /generar pedido/i }))

    await waitFor(() =>
      expect(salesService.orders.uploadCustomerPo).toHaveBeenCalledWith('55', file)
    )
    // Se sube DESPUES de convertir
    expect(mockConvert).toHaveBeenCalled()
  })

  it('rejects non-PDF files client-side', async () => {
    setup()

    const file = new File(['not a pdf'], 'oc.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/pdf de la oc/i), { target: { files: [file] } })

    await waitFor(() =>
      expect(screen.getByText(/el archivo debe ser un pdf/i)).toBeInTheDocument()
    )
  })

  it('lists items requiring purchase without blocking the CTA', () => {
    setup({ items: [itemWithStock, itemWithoutStock] })

    expect(screen.getByText(/items que requeriran compra de material/i)).toBeInTheDocument()
    expect(screen.getByText(/producto b: se requieren 5,\s*disponibles 0/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generar pedido/i })).not.toBeDisabled()
  })

  it('surfaces items_requiring_purchase from the convert response', async () => {
    mockConvert.mockResolvedValue({
      ...successResponse,
      items_requiring_purchase: [
        { product_id: 2, product_name: 'Producto B', requested: 5, available: 0 },
      ],
    })
    setup()

    fireEvent.change(screen.getByLabelText(/no\. oc del cliente/i), {
      target: { value: 'OC-9' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generar pedido/i }))

    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Producto B'))
    )
  })

  it('shows the 422 message when the backend rejects the conversion', async () => {
    mockConvert.mockRejectedValue({
      response: { status: 422, data: { message: 'customer_po_number es requerido' } },
    })
    const { onConverted } = setup()

    fireEvent.change(screen.getByLabelText(/no\. oc del cliente/i), {
      target: { value: 'OC-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generar pedido/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('customer_po_number es requerido')
    )
    expect(onConverted).not.toHaveBeenCalled()
  })
})
