/**
 * Ficha publica con precio sujeto a cotizacion (P2 granel): sin precio, sin
 * hint de IVA ni "Agregar al Carrito"; "Solicitar Cotización" agrega al carrito
 * local y abre el flujo de cotizacion.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { EnhancedPublicProduct } from '../../types/publicProduct'
import { enhancePublicProduct } from '../../services/publicProductsTransform'

const push = vi.fn()
const addToCart = vi.fn()
const state = vi.hoisted(() => ({ product: null as unknown }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))
vi.mock('@lwm/app-config', () => ({ usePublicSettings: () => ({ pricesIncludeTax: false }) }))
vi.mock('@lwm/ecommerce', () => ({ useTrackProductView: () => undefined }))
vi.mock('../../hooks/usePublicProducts', () => ({
  usePublicProduct: () => ({ product: state.product, isLoading: false, error: null }),
  useProductSuggestions: () => ({ suggestions: [], isLoading: false }),
}))
vi.mock('../../hooks/useLocalCart', () => ({
  useLocalCart: () => ({ addToCart, isInCart: () => false, getQuantity: () => 0 }),
}))

import ProductDetailPage from '../../components/ProductDetailPage'

function product(pricingType: 'fixed' | 'quote_only', price: number | null): EnhancedPublicProduct {
  return enhancePublicProduct({
    id: '9',
    type: 'public-products',
    attributes: {
      name: 'Alcohol isopropilico', sku: 'GR-9', description: 'Granel', fullDescription: null,
      price, pricingType, cost: null, compareAtPrice: null, isOnSale: false, saleStartsAt: null,
      saleEndsAt: null, saleBadge: null, iva: true, imgPath: null, datasheetPath: null,
      imageUrl: null, datasheetUrl: null, createdAt: '', updatedAt: '',
    },
    relationships: { unit: { data: null }, category: { data: null }, brand: { data: null } },
  })
}

describe('ProductDetailPage precio sujeto a cotización', () => {
  beforeEach(() => {
    push.mockClear()
    addToCart.mockClear()
  })

  it('oculta precio, IVA y Agregar al Carrito; Solicitar Cotización sigue', async () => {
    vi.useFakeTimers()
    state.product = product('quote_only', null)
    render(<ProductDetailPage productId="9" />)

    expect(screen.getByTestId('quote-only-badge')).toHaveTextContent('Precio sujeto a cotización')
    expect(screen.queryByText('Agregar al Carrito')).not.toBeInTheDocument()
    expect(screen.queryByText(/IVA/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Solicitar Cotización'))
    expect(addToCart).toHaveBeenCalledWith(state.product, 1)
    await act(async () => {
      vi.advanceTimersByTime(60)
    })
    expect(push).toHaveBeenCalledWith('/cart?action=quote')
    vi.useRealTimers()
  })

  it('con precio fijo muestra Agregar al Carrito', () => {
    state.product = product('fixed', 250)
    render(<ProductDetailPage productId="9" />)
    expect(screen.getByText('Agregar al Carrito')).toBeInTheDocument()
    expect(screen.queryByTestId('quote-only-badge')).not.toBeInTheDocument()
  })
})

describe('ProductDetailPage texto alternativo de la galeria', () => {
  const image = (id: string, altText: string | null, sortOrder: number) => ({
    id,
    type: 'product-images' as const,
    attributes: { filePath: `p/${id}.jpg`, imageUrl: `https://cdn.test/${id}.jpg`, altText, sortOrder, isPrimary: sortOrder === 0 },
  })

  it('la imagen principal y las miniaturas usan altText; sin altText, el nombre del producto', () => {
    const p = product('fixed', 250)
    p.attributes.imageUrl = 'https://cdn.test/a.jpg'
    p.galleryImages = [image('a', 'Garrafa de 20 L vista frontal', 0), image('b', null, 1)]
    state.product = p
    render(<ProductDetailPage productId="9" />)

    expect(screen.getAllByAltText('Garrafa de 20 L vista frontal')).toHaveLength(2)
    expect(screen.getByAltText('Alcohol isopropilico, imagen 2')).toBeInTheDocument()
    expect(screen.queryByAltText(/^Imagen \d/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByAltText('Alcohol isopropilico, imagen 2').closest('button') as HTMLButtonElement)
    expect(screen.getAllByAltText('Alcohol isopropilico')).toHaveLength(1)
  })
})
