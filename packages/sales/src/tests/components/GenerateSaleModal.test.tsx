/**
 * GenerateSaleModal Component Tests (Fase A - venta directa)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GenerateSaleModal } from '../../quotes/components/GenerateSaleModal'
import { useQuoteMutations, useQuoteItems } from '../../quotes/hooks'
import {
  createMockQuote,
  createMockQuoteItem,
  createMockProductRef,
} from '../../quotes/tests/utils/test-utils'

vi.mock('../../quotes/hooks', () => ({
  useQuoteMutations: vi.fn(),
  useQuoteItems: vi.fn(),
}))

vi.mock('@lwm/ui', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

import { toast } from '@lwm/ui'

// Item con stock suficiente (100 disponibles, 2 requeridos)
const sufficientItem = createMockQuoteItem({
  id: '1',
  productId: 1,
  quantity: 2,
  productName: 'Producto A',
  product: createMockProductRef({ id: '1' }),
})

// Item sin stock suficiente (1 disponible, 5 requeridos)
const insufficientItem = createMockQuoteItem({
  id: '2',
  productId: 2,
  quantity: 5,
  productName: 'Producto B',
  product: createMockProductRef({
    id: '2',
    stock: [
      {
        id: '2',
        warehouseId: 1,
        quantity: 1,
        reservedQuantity: 0,
        availableQuantity: 1,
        status: 'available',
      },
    ],
  }),
})

describe('GenerateSaleModal', () => {
  const mockConvert = vi.fn()

  const setup = (overrides?: {
    items?: ReturnType<typeof createMockQuoteItem>[]
    quote?: ReturnType<typeof createMockQuote>
    onConverted?: ReturnType<typeof vi.fn>
  }) => {
    vi.mocked(useQuoteItems).mockReturnValue({
      data: overrides?.items ?? [sufficientItem],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuoteItems>)

    const quote =
      overrides?.quote ??
      createMockQuote({ id: '7', status: 'accepted', paymentMethod: 'PPD', creditDays: 45 })
    const onConverted = overrides?.onConverted ?? vi.fn()
    render(
      <GenerateSaleModal quote={quote} isOpen={true} onClose={vi.fn()} onConverted={onConverted} />
    )
    return { quote, onConverted }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQuoteMutations).mockReturnValue({
      convert: { mutateAsync: mockConvert, isPending: false },
    } as unknown as ReturnType<typeof useQuoteMutations>)
  })

  it('renders nothing when closed', () => {
    vi.mocked(useQuoteItems).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useQuoteItems>)
    const { container } = render(
      <GenerateSaleModal
        quote={createMockQuote()}
        isOpen={false}
        onClose={vi.fn()}
        onConverted={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('sends order_type direct_sale with payment fields prefilled from the quote', async () => {
    mockConvert.mockResolvedValue({
      data: {
        quote: createMockQuote({ status: 'converted' }),
        salesOrder: { type: 'sales-orders', id: '99', attributes: { orderNumber: 'OV-000099' } },
      },
      message: 'ok',
    })
    const { onConverted } = setup()

    fireEvent.click(screen.getByRole('button', { name: /generar venta/i }))

    await waitFor(() =>
      expect(mockConvert).toHaveBeenCalledWith({
        id: '7',
        data: {
          order_type: 'direct_sale',
          payment_method: 'PPD',
          credit_days: 45,
        },
      })
    )
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('OV-000099'))
    expect(onConverted).toHaveBeenCalledWith('99')
  })

  it('defaults to PUE / 30 dias when the quote has no payment terms', async () => {
    mockConvert.mockResolvedValue({
      data: {
        quote: createMockQuote({ status: 'converted' }),
        salesOrder: { type: 'sales-orders', id: '99', attributes: {} },
      },
      message: 'ok',
    })
    setup({ quote: createMockQuote({ id: '7', status: 'accepted', paymentMethod: null, creditDays: null }) })

    fireEvent.click(screen.getByRole('button', { name: /generar venta/i }))

    await waitFor(() =>
      expect(mockConvert).toHaveBeenCalledWith({
        id: '7',
        data: {
          order_type: 'direct_sale',
          payment_method: 'PUE',
          credit_days: 30,
        },
      })
    )
  })

  it('shows the stock semaphore and disables the CTA when an item lacks stock', () => {
    setup({ items: [sufficientItem, insufficientItem] })

    expect(screen.getByRole('button', { name: /generar venta/i })).toBeDisabled()
    expect(screen.getByText(/usa\s+"generar pedido"/i)).toBeInTheDocument()
    expect(mockConvert).not.toHaveBeenCalled()
  })

  it('renders the 422 stock shortage detail per item', async () => {
    mockConvert.mockRejectedValue({
      response: {
        status: 422,
        data: {
          errors: [
            { product_id: 2, product_name: 'Producto B', requested: 5, available: 1 },
          ],
        },
      },
    })
    const { onConverted } = setup()

    fireEvent.click(screen.getByRole('button', { name: /generar venta/i }))

    await waitFor(() =>
      expect(screen.getByText(/stock insuficiente, la venta directa no procede/i)).toBeInTheDocument()
    )
    expect(screen.getByText(/producto b: se requieren 5, disponibles 1/i)).toBeInTheDocument()
    expect(onConverted).not.toHaveBeenCalled()
  })

  it('shows a plain 422 message when the backend rejects without shortages', async () => {
    mockConvert.mockRejectedValue({
      response: { status: 422, data: { message: 'La cotizacion no esta aceptada' } },
    })
    setup()

    fireEvent.click(screen.getByRole('button', { name: /generar venta/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('La cotizacion no esta aceptada')
    )
  })
})
