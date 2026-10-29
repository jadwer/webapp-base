/**
 * Tarjeta del catalogo publico con precio sujeto a cotizacion (P2 granel):
 * sin precio ni "Agregar", con "Solicitar cotizacion".
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { EnhancedPublicProduct } from '../../types/publicProduct'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: { src: string; alt: string; onError?: () => void }) => <img src={props.src} alt={props.alt} onError={props.onError} />,
}))
vi.mock('@lwm/app-config', () => ({ usePublicSettings: () => ({ pricesIncludeTax: false }) }))

import { PublicProductCard } from '../../components/PublicProductCard'
import { enhancePublicProduct } from '../../services/publicProductsTransform'

function product(pricingType: 'fixed' | 'quote_only', price: number | null, imageUrl: string | null = null): EnhancedPublicProduct {
  return enhancePublicProduct({
    id: '9',
    type: 'public-products',
    attributes: {
      name: 'Alcohol isopropilico', sku: 'GR-9', description: null, fullDescription: null,
      price, pricingType, cost: null, compareAtPrice: null, isOnSale: false, saleStartsAt: null,
      saleEndsAt: null, saleBadge: null, iva: true, imgPath: null, datasheetPath: null,
      imageUrl, datasheetUrl: null, createdAt: '', updatedAt: '',
    },
    relationships: { unit: { data: null }, category: { data: null }, brand: { data: null } },
  })
}

describe('PublicProductCard precio sujeto a cotización', () => {
  it('sin precio ni Agregar; ofrece Solicitar cotización', () => {
    const onAddToCart = vi.fn()
    const onRequestQuote = vi.fn()
    render(<PublicProductCard product={product('quote_only', null)} onAddToCart={onAddToCart} onRequestQuote={onRequestQuote} />)

    expect(screen.getByTestId('quote-only-badge')).toHaveTextContent('Precio sujeto a cotización')
    expect(screen.queryByText('Agregar')).not.toBeInTheDocument()
    expect(screen.queryByText('Precio no disponible')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Solicitar cotización'))
    expect(onRequestQuote).toHaveBeenCalled()
    expect(onAddToCart).not.toHaveBeenCalled()
  })

  it('con precio fijo mantiene precio y Agregar', () => {
    render(<PublicProductCard product={product('fixed', 120)} onAddToCart={vi.fn()} onRequestQuote={vi.fn()} />)
    expect(screen.queryByTestId('quote-only-badge')).not.toBeInTheDocument()
    expect(screen.getByText('Agregar')).toBeInTheDocument()
    expect(screen.getByText('Cotizar')).toBeInTheDocument()
  })
})

describe('PublicProductCard imagen que no carga', () => {
  it('cambia al placeholder en lugar de dejar la imagen rota', () => {
    render(<PublicProductCard product={product('fixed', 120, 'https://erpapi.test/storage/products/.webp')} onAddToCart={vi.fn()} onRequestQuote={vi.fn()} />)
    const img = screen.getByAltText('Alcohol isopropilico')
    fireEvent.error(img)
    expect(screen.queryByAltText('Alcohol isopropilico')).not.toBeInTheDocument()
    expect(document.querySelector('.bi-image')).toBeInTheDocument()
  })
})
