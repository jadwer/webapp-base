import { describe, it, expect } from 'vitest'
import { formatQuoteItemQuantity } from '../../utils/quantity'

describe('formatQuoteItemQuantity', () => {
  it('usa la unidad real del producto', () => {
    expect(formatQuoteItemQuantity({ quantity: 20, product: { id: '1', name: 'A', sku: 'A', price: null, unitName: 'Litro' } }))
      .toBe('20 Litro')
  })

  it('sin unidad conocida muestra solo la cantidad, nunca "pz"', () => {
    expect(formatQuoteItemQuantity({ quantity: 3, product: undefined })).toBe('3')
    expect(formatQuoteItemQuantity({ quantity: 3, product: { id: '1', name: 'A', sku: 'A', price: 1, unitName: null } })).toBe('3')
  })
})
