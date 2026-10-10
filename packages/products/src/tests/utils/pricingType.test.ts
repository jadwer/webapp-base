import { describe, it, expect } from 'vitest'
import {
  PRICING_TYPES,
  PRICING_TYPE_LABELS,
  QUOTE_ONLY_LABEL,
  isQuoteOnly,
  normalizePricingType,
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
