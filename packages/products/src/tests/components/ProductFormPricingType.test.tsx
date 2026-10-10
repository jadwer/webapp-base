/**
 * Tipo de precio en el formulario de producto (P2 granel): precio obligatorio
 * solo con precio fijo; "Precio sujeto a cotización" manda price null, sin
 * oferta, y marca el costo como recomendado (decision D2).
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { Product } from '../../types/product'

vi.mock('../../hooks', () => ({
  useUnits: () => ({ units: [{ id: '1', name: 'Litro', code: 'LTR' }], isLoading: false }),
  useCategories: () => ({ categories: [{ id: '2', name: 'Solventes' }], isLoading: false }),
  useBrands: () => ({ brands: [{ id: '3', name: 'Marca' }], isLoading: false }),
  useCurrencies: () => ({ currencies: [], defaultCurrencyId: null, isLoading: false }),
}))
vi.mock('../../components/ImageGalleryManager', () => ({ ImageGalleryManager: () => null }))
vi.mock('../../components/SatKeyCombobox', () => ({ SatKeyCombobox: () => null }))
vi.mock('../../components/FileUploader', () => ({ FileUploader: () => null }))

import { ProductForm } from '../../components/ProductForm'

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: '10',
    name: 'Alcohol isopropilico',
    description: 'Granel',
    fullDescription: 'Contenedor de 20,000 L',
    price: 150,
    pricingType: 'fixed',
    cost: 80,
    iva: true,
    isActive: true,
    isPublic: true,
    isOnSale: true,
    unitId: '1',
    categoryId: '2',
    brandId: '3',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

function submit() {
  fireEvent.submit(screen.getByLabelText('Nombre del producto').closest('form') as HTMLFormElement)
}

describe('ProductForm tipo de precio', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  beforeEach(() => onSubmit.mockClear())

  it('ofrece exactamente los tipos del backend con la etiqueta estandar', () => {
    render(<ProductForm product={product()} onSubmit={onSubmit} />)
    const select = screen.getByLabelText('Tipo de precio') as HTMLSelectElement
    expect(Array.from(select.options).map(o => [o.value, o.text])).toEqual([
      ['fixed', 'Precio fijo'],
      ['quote_only', 'Precio sujeto a cotización'],
    ])
  })

  it('con precio fijo el precio es obligatorio', async () => {
    render(<ProductForm product={product({ price: undefined })} onSubmit={onSubmit} />)
    submit()
    expect(await screen.findByText(/El precio de venta es obligatorio con precio fijo/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sujeto a cotización oculta precio y oferta, recomienda costo y manda price null', async () => {
    render(<ProductForm product={product()} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Tipo de precio'), { target: { value: 'quote_only' } })

    expect(screen.queryByLabelText(/Precio de venta/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('En oferta')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Costo \(recomendado\)/)).toBeInTheDocument()
    expect(screen.getByText(/valuar inventario y calcular el costo de las presentaciones/)).toBeInTheDocument()

    submit()
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      pricingType: 'quote_only',
      price: null,
      isOnSale: false,
      cost: 80,
    })
  })

  it('un producto quote_only existente abre con el tipo marcado y sin precio', async () => {
    render(<ProductForm product={product({ pricingType: 'quote_only', price: null, isOnSale: false })} onSubmit={onSubmit} />)
    expect((screen.getByLabelText('Tipo de precio') as HTMLSelectElement).value).toBe('quote_only')

    submit()
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ pricingType: 'quote_only', price: null })
  })

  it('con precio fijo manda el numero capturado', async () => {
    render(<ProductForm product={product({ isOnSale: false })} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText(/Precio de venta/), { target: { value: '199.5' } })
    submit()
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ pricingType: 'fixed', price: 199.5 })
  })
})
