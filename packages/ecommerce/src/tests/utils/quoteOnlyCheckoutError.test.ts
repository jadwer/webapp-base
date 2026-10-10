import { describe, it, expect } from 'vitest'
import { getQuoteOnlyCheckoutItems, quoteOnlyCheckoutMessage } from '../../utils/quoteOnlyCheckoutError'

describe('quoteOnlyCheckoutError (P2 granel)', () => {
  it('lee la lista del 422 del backend', () => {
    const error = {
      response: {
        status: 422,
        data: {
          error: 'Tu carrito tiene productos con precio sujeto a cotizacion',
          quote_only_items: [{ product_id: 9, product_name: 'Alcohol granel', product_sku: 'GR-9' }],
          quote_cta: true,
        },
      },
    }
    const items = getQuoteOnlyCheckoutItems(error)
    expect(items).toHaveLength(1)
    expect(quoteOnlyCheckoutMessage(items!)).toContain('Alcohol granel')
  })

  it('otros errores (stock, red) no cuentan', () => {
    expect(getQuoteOnlyCheckoutItems({ response: { data: { insufficient_items: [{}] } } })).toBeNull()
    expect(getQuoteOnlyCheckoutItems(new Error('Network'))).toBeNull()
    expect(getQuoteOnlyCheckoutItems(null)).toBeNull()
  })
})
