/**
 * P2b (D8): un pedido nunca lleva lineas en $0. ItemsManager (alta de pedido)
 * y AddItemModal (agregar a un pedido existente) no dejan agregar una linea
 * sin precio y lo explican; el 422 del backend se muestra con su detalle.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ItemsManager from '../../components/ItemsManager'
import AddItemModal from '../../components/AddItemModal'
import { useSalesProducts, useSalesOrderItemMutations } from '../../hooks'

vi.mock('../../hooks', () => ({
  useSalesProducts: vi.fn(),
  useSalesOrderItemMutations: vi.fn(),
}))

vi.mock('@lwm/ui', () => ({
  formatCurrency: (n: number) => `$${Number(n).toFixed(2)}`,
}))

const products = [
  { id: '1', attributes: { name: 'Jabon', sku: 'J-1', price: 50, pricingType: 'fixed' } },
  { id: '2', attributes: { name: 'Alcohol granel', sku: 'GR-2', price: null, pricingType: 'fixed' } },
]

describe('ItemsManager: precio obligatorio mayor a 0', () => {
  beforeEach(() => {
    vi.mocked(useSalesProducts).mockReturnValue({ products, isLoading: false } as unknown as ReturnType<typeof useSalesProducts>)
  })

  it('producto sin precio de venta: explica y no deja agregar hasta capturar precio', () => {
    const onItemsChange = vi.fn()
    render(<ItemsManager items={[]} onItemsChange={onItemsChange} onTotalChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Agregar Item/i }))
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })

    expect(screen.getByRole('option', { name: /Alcohol granel.*Sujeto a cotización/ })).toBeInTheDocument()
    expect(screen.getByTestId('items-manager-price-required')).toHaveTextContent('precio sujeto a cotización')
    const add = screen.getByRole('button', { name: 'Agregar producto' })
    expect(add).toBeDisabled()

    const priceInput = screen.getAllByRole('spinbutton')[1]
    fireEvent.change(priceInput, { target: { value: '35' } })
    expect(screen.queryByTestId('items-manager-price-required')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))
    expect(onItemsChange).toHaveBeenCalledWith([expect.objectContaining({ productId: '2', unitPrice: 35 })])
  })

  it('producto con precio: toma el precio de lista y deja agregar', () => {
    const onItemsChange = vi.fn()
    render(<ItemsManager items={[]} onItemsChange={onItemsChange} onTotalChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Agregar Item/i }))
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    expect(screen.queryByTestId('items-manager-price-required')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))
    expect(onItemsChange).toHaveBeenCalledWith([expect.objectContaining({ productId: '1', unitPrice: 50 })])
  })
})

describe('AddItemModal: precio > 0 y 422 con detalle', () => {
  const create = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSalesProducts).mockReturnValue({ products, isLoading: false } as unknown as ReturnType<typeof useSalesProducts>)
    vi.mocked(useSalesOrderItemMutations).mockReturnValue({ createSalesOrderItem: create } as unknown as ReturnType<typeof useSalesOrderItemMutations>)
  })

  it('sin precio explica por que no se puede agregar', () => {
    render(<AddItemModal salesOrderId="5" isOpen onClose={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(screen.getByTestId('add-item-price-required')).toHaveTextContent('mayor a 0')
    expect(screen.getByRole('button', { name: /Agregar Item/i })).toBeDisabled()
  })

  it('muestra el detail del 422 tal cual, sin puntero', async () => {
    create.mockRejectedValue({
      response: {
        status: 422,
        data: { errors: [{ status: '422', detail: 'El precio unitario debe ser mayor a 0.', source: { pointer: '/data/attributes/unitPrice' } }] },
      },
    })
    render(<AddItemModal salesOrderId="5" isOpen onClose={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    fireEvent.submit(screen.getByRole('button', { name: /Agregar Item/i }).closest('form')!)
    await waitFor(() => expect(create).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('El precio unitario debe ser mayor a 0.')).toBeInTheDocument())
    expect(screen.queryByText(/unitPrice/)).not.toBeInTheDocument()
  })
})
