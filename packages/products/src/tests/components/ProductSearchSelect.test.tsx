import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

vi.mock('../../services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
  },
}))

import { productService } from '../../services/productService'
import { ProductSearchSelect } from '../../components/ProductSearchSelect'

const getProducts = vi.mocked(productService.getProducts)
const getProduct = vi.mocked(productService.getProduct)

const products = [
  { id: '1', name: 'Acido citrico', sku: 'AC-1', isActive: true, iva: true },
  { id: '2', name: 'Acido nitrico', sku: 'AN-2', isActive: true, iva: true },
]

async function flush() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('ProductSearchSelect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    getProducts.mockReset()
    getProduct.mockReset()
    getProducts.mockResolvedValue({ data: products } as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('busca con debounce, filtro de activos, tamano 20 y orden por nombre', async () => {
    render(<ProductSearchSelect value="" onChange={vi.fn()} />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'aci' } })
    expect(getProducts).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await flush()

    expect(getProducts).toHaveBeenCalledTimes(1)
    expect(getProducts).toHaveBeenCalledWith({
      filters: { name: 'aci', isActive: true },
      page: { size: 20 },
      sort: { field: 'name', direction: 'asc' },
    })
    expect(screen.getByText('Acido citrico')).toBeInTheDocument()
    expect(screen.getByText('AN-2')).toBeInTheDocument()
  })

  it('no busca con menos de 2 caracteres', async () => {
    render(<ProductSearchSelect value="" onChange={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } })
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(getProducts).not.toHaveBeenCalled()
  })

  it('omite el filtro de activos con onlyActive=false', async () => {
    render(<ProductSearchSelect value="" onChange={vi.fn()} onlyActive={false} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'aci' } })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await flush()
    expect(getProducts.mock.calls[0][0]?.filters).toEqual({ name: 'aci' })
  })

  it('selecciona un producto y emite id y producto', async () => {
    const onChange = vi.fn()
    render(<ProductSearchSelect value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'aci' } })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await flush()

    fireEvent.click(screen.getByText('Acido nitrico'))
    expect(onChange).toHaveBeenCalledWith('2', { id: '2', name: 'Acido nitrico', sku: 'AN-2' })
  })

  it('excluye los ids indicados', async () => {
    render(<ProductSearchSelect value="" onChange={vi.fn()} excludeIds={['1']} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'aci' } })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await flush()
    expect(screen.queryByText('Acido citrico')).not.toBeInTheDocument()
    expect(screen.getByText('Acido nitrico')).toBeInTheDocument()
  })

  it('muestra "Sin resultados" cuando la busqueda viene vacia', async () => {
    getProducts.mockResolvedValue({ data: [] } as never)
    render(<ProductSearchSelect value="" onChange={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzz' } })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await flush()
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('usa initialProduct sin consultar la API', () => {
    render(
      <ProductSearchSelect
        value="5"
        onChange={vi.fn()}
        initialProduct={{ id: '5', name: 'Etanol', sku: 'ET-5' }}
      />
    )
    expect(screen.getByText('Etanol')).toBeInTheDocument()
    expect(getProduct).not.toHaveBeenCalled()
  })

  it('carga la etiqueta cuando llega un valor sin producto', async () => {
    getProduct.mockResolvedValue({ data: { id: '7', name: 'Glicerina', sku: 'GL-7', isActive: true, iva: true } } as never)
    render(<ProductSearchSelect value="7" onChange={vi.fn()} />)
    expect(screen.getByText('Cargando producto...')).toBeInTheDocument()
    await flush()
    expect(getProduct).toHaveBeenCalledWith('7')
    expect(screen.getByText('Glicerina')).toBeInTheDocument()
  })

  it('limpia la seleccion', () => {
    const onChange = vi.fn()
    render(
      <ProductSearchSelect value="5" onChange={onChange} initialProduct={{ id: '5', name: 'Etanol' }} />
    )
    fireEvent.click(screen.getByTitle('Cambiar producto'))
    expect(onChange).toHaveBeenCalledWith('')
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('muestra el error de validacion', () => {
    render(<ProductSearchSelect value="" onChange={vi.fn()} errorText="El producto es obligatorio" />)
    expect(screen.getByText('El producto es obligatorio')).toBeInTheDocument()
  })
})
