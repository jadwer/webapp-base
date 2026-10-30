/**
 * D9: el portal del cliente no puede aceptar una cotizacion con precios por
 * confirmar. El boton se deshabilita con la explicacion y, si el backend
 * rechaza (422 price_pending), se muestra el mensaje y el detalle por
 * producto (regla 7: nunca toast generico).
 */
import React, { Suspense } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  getById: vi.fn(),
  getItems: vi.fn(),
  accept: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('@/modules/auth', () => ({ useAuth: () => ({ isLoading: false }) }))
vi.mock('@/modules/app-config', () => ({ usePublicSettings: () => ({ get: () => 'ventas@example.com' }) }))
vi.mock('@/lib/toast', () => ({ toast: mocks.toast }))
vi.mock('@/modules/quotes', async () => {
  const pricePending = await vi.importActual<typeof import('../../../../../packages/sales/src/quotes/utils/pricePending')>(
    '../../../../../packages/sales/src/quotes/utils/pricePending'
  )
  const quantity = await vi.importActual<typeof import('../../../../../packages/sales/src/quotes/utils/quantity')>(
    '../../../../../packages/sales/src/quotes/utils/quantity'
  )
  return {
    ...pricePending,
    ...quantity,
    QuoteStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
    formatDateOnly: (v: string) => v,
    quoteService: { getById: mocks.getById, accept: mocks.accept, downloadPdf: vi.fn() },
    quoteItemService: { getByQuoteId: mocks.getItems },
  }
})
vi.mock('@/modules/products', () => ({
  extractApiErrorMessage: (_err: unknown, fallback: string) => fallback,
}))

import MyQuoteDetailPage from '@/app/(back)/dashboard/my-quotes/[id]/page'

const quote = {
  id: '15',
  quoteNumber: 'COT-015',
  status: 'sent',
  validUntil: '2099-12-31',
  createdAt: '2026-10-01T10:00:00Z',
  subtotalAmount: 100,
  taxAmount: 16,
  totalAmount: 116,
}

const item = (overrides: Record<string, unknown>) => ({
  id: '1', quantity: 1, unitPrice: 100, quotedPrice: 100, total: 116,
  productName: 'Jabon', productSku: 'J-1', notes: null, ...overrides,
})

async function renderPage() {
  const params = Promise.resolve({ id: '15' })
  await act(async () => {
    render(
      <Suspense fallback={<div>cargando</div>}>
        <MyQuoteDetailPage params={params} />
      </Suspense>
    )
  })
  await screen.findByText(/Cotización COT-015/)
}

describe('Portal: aceptar cotización (D9)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getById.mockResolvedValue(quote)
  })

  it('muestra la unidad real del producto junto a la cantidad, nunca "pz" fijo', async () => {
    mocks.getById.mockResolvedValue(quote)
    mocks.getItems.mockResolvedValue([
      item({ id: '1', quantity: 20, product: { id: '9', name: 'Alcohol', sku: 'A-1', price: 10, unitName: 'Litro' } }),
      item({ id: '2', quantity: 3, productName: 'Guantes', product: undefined }),
    ])
    await renderPage()

    expect(screen.getByText('20 Litro')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows.some((r) => /\bpz\b/.test(r.textContent ?? ''))).toBe(false)
  })

  it('con precios por confirmar deshabilita Aceptar y explica por que', async () => {
    mocks.getItems.mockResolvedValue([
      item({}),
      item({ id: '2', productName: 'Alcohol granel', unitPrice: 0, quotedPrice: 0, total: 0, pricePending: true }),
    ])
    await renderPage()

    expect(screen.getByTestId('my-quote-accept')).toBeDisabled()
    expect(screen.getByTestId('my-quote-accept-blocked')).toHaveTextContent(
      'Podrás aceptarla cuando el vendedor capture el precio'
    )
    expect(mocks.accept).not.toHaveBeenCalled()
  })

  it('sin pricePending del backend deriva del precio en cero', async () => {
    mocks.getItems.mockResolvedValue([item({ id: '2', unitPrice: 0, quotedPrice: 0, total: 0 })])
    await renderPage()
    expect(screen.getByTestId('my-quote-accept')).toBeDisabled()
  })

  it('si el backend responde 422 price_pending muestra el mensaje y el detalle por producto', async () => {
    mocks.getItems.mockResolvedValue([item({ pricePending: false })])
    mocks.accept.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Esta cotización tiene productos con precio por confirmar: Alcohol granel. Podrás aceptarla cuando el vendedor capture el precio.',
          errors: [{
            status: '422', code: 'price_pending', title: 'Precio por confirmar',
            detail: 'El precio de Alcohol granel está por confirmar.',
            meta: { quote_item_id: 2, product_id: 9, product_name: 'Alcohol granel', product_sku: 'GR-9' },
          }],
        },
      },
    })
    await renderPage()

    const button = screen.getByTestId('my-quote-accept')
    expect(button).not.toBeDisabled()
    fireEvent.click(button)

    const alert = await screen.findByTestId('my-quote-accept-error')
    expect(alert).toHaveTextContent('Esta cotización tiene productos con precio por confirmar: Alcohol granel.')
    expect(alert).toHaveTextContent('Alcohol granel (GR-9): El precio de Alcohol granel está por confirmar.')
    await waitFor(() => expect(mocks.toast.error).toHaveBeenCalledWith(expect.stringContaining('precio por confirmar')))
  })
})
