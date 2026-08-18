/**
 * formatLandingPrice: el precio como lo pinta el Figma del rediseno.
 * "$15 USD + IVA", "$1,943 + IVA", "$532.70 USD + IVA", sin moneda si es MXN.
 */
import { describe, it, expect } from 'vitest'
import { formatLandingPrice } from '../../components/LandingProductCard'
import type { EnhancedPublicProduct } from '@lwm/ecommerce'

function product(over: { price: number | null; iva?: boolean; currency?: string }): EnhancedPublicProduct {
  return {
    id: '1',
    type: 'public-products',
    attributes: { price: over.price, iva: over.iva ?? true } as EnhancedPublicProduct['attributes'],
    displayCurrency: over.currency ?? 'MXN',
  } as EnhancedPublicProduct
}

describe('formatLandingPrice', () => {
  it('entero en MXN con IVA: sin decimales ni moneda', () => {
    expect(formatLandingPrice(product({ price: 1943 }))).toBe('$1,943 + IVA')
  })

  it('USD se muestra como moneda explicita', () => {
    expect(formatLandingPrice(product({ price: 15, currency: 'USD' }))).toBe('$15 USD + IVA')
  })

  it('conserva 2 decimales cuando el precio los trae', () => {
    expect(formatLandingPrice(product({ price: 532.7, currency: 'USD' }))).toBe('$532.70 USD + IVA')
  })

  it('sin IVA no agrega el sufijo', () => {
    expect(formatLandingPrice(product({ price: 435.5, iva: false }))).toBe('$435.50')
  })

  it('precio nulo devuelve null (la tarjeta no pinta precio)', () => {
    expect(formatLandingPrice(product({ price: null }))).toBeNull()
  })
})
