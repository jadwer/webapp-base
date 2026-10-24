import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { EnhancedPublicProduct } from '@lwm/ecommerce'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

import { PortalProductCard } from '../components/PortalProductCard'

function product(overrides: Partial<EnhancedPublicProduct['attributes']> = {}, quoteOnly = false): EnhancedPublicProduct {
  return {
    id: '7',
    type: 'public-products',
    attributes: {
      name: 'Compresor silencioso 50 L',
      sku: 'DEMO-003',
      slug: 'compresor-silencioso-50-l',
      description: null,
      fullDescription: null,
      price: 15900,
      pricingType: quoteOnly ? 'quote_only' : 'fixed',
      cost: null,
      compareAtPrice: null,
      isOnSale: false,
      saleStartsAt: null,
      saleEndsAt: null,
      saleBadge: null,
      iva: true,
      imgPath: null,
      datasheetPath: null,
      imageUrl: null,
      datasheetUrl: null,
      createdAt: '2026-10-23T00:00:00Z',
      updatedAt: '2026-10-23T00:00:00Z',
      ...overrides,
    },
    relationships: {},
    displayName: 'Compresor silencioso 50 L',
    displayBrand: 'EcoMax',
    displayCategory: 'Equipos',
    isQuoteOnly: quoteOnly,
  } as unknown as EnhancedPublicProduct
}

describe('PortalProductCard', () => {
  it('muestra precio + IVA y precio anterior tachado en oferta', () => {
    render(
      <PortalProductCard
        product={product({ isOnSale: true, compareAtPrice: 19080 })}
        badge="offer"
        onAddToCart={vi.fn()}
        onRequestQuote={vi.fn()}
      />
    )
    expect(screen.getByText('$15,900')).toBeInTheDocument()
    expect(screen.getByText('$19,080').tagName).toBe('DEL')
    expect(screen.getByText('+ IVA')).toBeInTheDocument()
    expect(screen.getByText('Oferta')).toBeInTheDocument()
  })

  it('agrega al carrito y cotiza con el producto', () => {
    const onAdd = vi.fn()
    const onQuote = vi.fn()
    const p = product()
    render(<PortalProductCard product={p} onAddToCart={onAdd} onRequestQuote={onQuote} />)
    fireEvent.click(screen.getByRole('button', { name: /Agregar/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cotizar' }))
    expect(onAdd).toHaveBeenCalledWith(p)
    expect(onQuote).toHaveBeenCalledWith(p)
  })

  it('granel: sin precio ni carrito, solo cotizacion', () => {
    render(
      <PortalProductCard
        product={product({ price: null }, true)}
        onAddToCart={vi.fn()}
        onRequestQuote={vi.fn()}
      />
    )
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pedir cotización' })).toBeInTheDocument()
    expect(screen.getByText('Granel')).toBeInTheDocument()
  })
})
