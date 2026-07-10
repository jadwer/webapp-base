/**
 * QuoteItemsTable Component Tests
 *
 * Cubre los fixes de edicion inline:
 * - Inputs con borrador string (se pueden vaciar, 0 es valido para precio)
 * - Descuento por porcentaje o por monto (se envia solo uno)
 * - IVA (taxRate) editable por item
 * - Errores inline en vez de guardado silencioso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuoteItemsTable } from '../../quotes/components/QuoteItemsTable'
import { useQuoteItemMutations } from '../../quotes/hooks'
import { createMockQuoteItem } from '../../quotes/tests/utils/test-utils'

vi.mock('../../quotes/hooks', () => ({
  useQuoteItemMutations: vi.fn(),
}))

vi.mock('@lwm/products', () => ({
  productService: {
    getProducts: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

vi.mock('@lwm/ui', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('QuoteItemsTable inline edit', () => {
  const mockUpdate = vi.fn()
  const mockCreate = vi.fn()
  const mockDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockResolvedValue(createMockQuoteItem())
    vi.mocked(useQuoteItemMutations).mockReturnValue({
      create: { mutateAsync: mockCreate, isPending: false },
      update: { mutateAsync: mockUpdate, isPending: false },
      delete: { mutateAsync: mockDelete, isPending: false },
    } as unknown as ReturnType<typeof useQuoteItemMutations>)
  })

  const renderEditing = (itemOverrides = {}) => {
    const item = createMockQuoteItem(itemOverrides)
    render(
      <QuoteItemsTable items={[item]} quoteId="1" editable onItemsChanged={vi.fn()} />
    )
    fireEvent.click(screen.getByTitle('Editar'))
    return item
  }

  it('permite vaciar el precio y guardar 0', async () => {
    renderEditing({ quotedPrice: 500 })

    const priceInput = screen.getByLabelText('Precio cotizado')
    fireEvent.change(priceInput, { target: { value: '' } })
    expect((priceInput as HTMLInputElement).value).toBe('')

    fireEvent.change(priceInput, { target: { value: '0' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    expect(mockUpdate.mock.calls[0][0].data.quotedPrice).toBe(0)
  })

  it('precio vacio muestra error inline y no guarda', async () => {
    renderEditing()

    fireEvent.change(screen.getByLabelText('Precio cotizado'), { target: { value: '' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    expect(await screen.findByText('Precio invalido (0 es valido)')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('cantidad menor a 0.01 muestra error y no guarda', async () => {
    renderEditing()

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '0' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    expect(await screen.findByText('Cantidad minima 0.01')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('modo porcentaje envia solo discountPercentage', async () => {
    renderEditing()

    fireEvent.change(screen.getByLabelText('Descuento'), { target: { value: '10' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    const data = mockUpdate.mock.calls[0][0].data
    expect(data.discountPercentage).toBe(10)
    expect(data).not.toHaveProperty('discountAmount')
  })

  it('modo monto envia solo discountAmount', async () => {
    renderEditing({ discountAmount: 0 })

    fireEvent.change(screen.getByLabelText('Modo de descuento'), {
      target: { value: 'amount' },
    })
    fireEvent.change(screen.getByLabelText('Descuento'), { target: { value: '50' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    const data = mockUpdate.mock.calls[0][0].data
    expect(data.discountAmount).toBe(50)
    expect(data).not.toHaveProperty('discountPercentage')
  })

  it('descuento porcentaje mayor a 100 muestra error', async () => {
    renderEditing()

    fireEvent.change(screen.getByLabelText('Descuento'), { target: { value: '150' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    expect(await screen.findByText('Maximo 100%')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('el IVA es editable y se envia en el update', async () => {
    renderEditing({ taxRate: 16 })

    fireEvent.change(screen.getByLabelText('IVA %'), { target: { value: '8' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    expect(mockUpdate.mock.calls[0][0].data.taxRate).toBe(8)
  })

  it('IVA fuera de rango muestra error y no guarda', async () => {
    renderEditing()

    fireEvent.change(screen.getByLabelText('IVA %'), { target: { value: '120' } })
    fireEvent.click(screen.getByTitle('Guardar'))

    expect(await screen.findByText('IVA entre 0 y 100')).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
