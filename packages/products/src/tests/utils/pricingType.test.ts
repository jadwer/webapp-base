import { describe, it, expect } from 'vitest'
import {
  PRICING_TYPES,
  PRICING_TYPE_LABELS,
  QUOTE_ONLY_LABEL,
  isQuoteOnly,
  normalizePricingType,
  requiresQuote,
} from '../../utils/pricingType'

// Lista literal del backend (Product::PRICING_TYPES y la regla Rule::in de
// ProductRequest). Si este test falla, revisar ambos archivos de api-base.
const BACKEND_PRICING_TYPES = ['fixed', 'quote_only']

describe('PRICING_TYPES', () => {
  it('es exactamente la lista que valida el backend, en el mismo orden', () => {
    expect([...PRICING_TYPES]).toEqual(BACKEND_PRICING_TYPES)
  })

  it('cada tipo tiene etiqueta en espanol y la de quote_only es la estandar', () => {
    expect(Object.keys(PRICING_TYPE_LABELS).sort()).toEqual([...BACKEND_PRICING_TYPES].sort())
    expect(PRICING_TYPE_LABELS.quote_only).toBe('Precio sujeto a cotización')
    expect(QUOTE_ONLY_LABEL).toBe('Precio sujeto a cotización')
  })

  it('valores desconocidos o ausentes se tratan como precio fijo', () => {
    expect(normalizePricingType(undefined)).toBe('fixed')
    expect(normalizePricingType('on_request')).toBe('fixed')
    expect(normalizePricingType('quote_only')).toBe('quote_only')
    expect(isQuoteOnly({ pricingType: 'quote_only' })).toBe(true)
    expect(isQuoteOnly({ pricingType: null })).toBe(false)
    expect(isQuoteOnly(null)).toBe(false)
  })
})

describe('requiresQuote (P2b D8: producto sin precio de venta)', () => {
  it('sujeto a cotizacion, sin precio o con precio <= 0 se cotiza', () => {
    expect(requiresQuote({ pricingType: 'quote_only', price: 100 })).toBe(true)
    expect(requiresQuote({ pricingType: 'fixed', price: null })).toBe(true)
    expect(requiresQuote({ pricingType: 'fixed', price: 0 })).toBe(true)
    expect(requiresQuote({ pricingType: 'fixed', price: -5 })).toBe(true)
    expect(requiresQuote({ pricingType: 'fixed', price: '0.00' })).toBe(true)
    expect(requiresQuote({ price: '' })).toBe(true)
  })

  it('con precio positivo se vende', () => {
    expect(requiresQuote({ pricingType: 'fixed', price: 10 })).toBe(false)
    expect(requiresQuote({ price: '12.50' })).toBe(false)
  })

  it('price ausente (referencia parcial) no cuenta como sin precio', () => {
    expect(requiresQuote({ pricingType: 'fixed' })).toBe(false)
    expect(requiresQuote({ pricingType: 'fixed', price: undefined })).toBe(false)
    expect(requiresQuote(null)).toBe(false)
  })
})
