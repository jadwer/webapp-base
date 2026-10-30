import { describe, it, expect } from 'vitest'
import {
  isQuoteItemPricePending,
  pendingPriceItems,
  getPricePendingErrors,
  ACCEPT_PRICE_PENDING_MESSAGE,
} from '../../quotes/utils/pricePending'
import { createMockQuoteItem } from '../../quotes/tests/utils/test-utils'

describe('isQuoteItemPricePending (P2b D8)', () => {
  it('manda pricePending del backend cuando llega', () => {
    expect(isQuoteItemPricePending(createMockQuoteItem({ pricePending: true, quotedPrice: 50 }))).toBe(true)
    expect(isQuoteItemPricePending(createMockQuoteItem({ pricePending: false, quotedPrice: 0 }))).toBe(false)
  })

  it('sin pricePending deriva del precio efectivo <= 0, sin importar el tipo del producto', () => {
    expect(isQuoteItemPricePending(createMockQuoteItem({ pricePending: undefined, quotedPrice: 0, unitPrice: 120 }))).toBe(true)
    expect(isQuoteItemPricePending(createMockQuoteItem({ pricePending: undefined, quotedPrice: -1 }))).toBe(true)
    expect(isQuoteItemPricePending(createMockQuoteItem({ pricePending: undefined, quotedPrice: 80 }))).toBe(false)
  })

  it('pendingPriceItems filtra con la misma regla', () => {
    const items = [
      createMockQuoteItem({ id: '1', quotedPrice: 10 }),
      createMockQuoteItem({ id: '2', quotedPrice: 0 }),
    ]
    expect(pendingPriceItems(items).map((i) => i.id)).toEqual(['2'])
  })
})

describe('getPricePendingErrors con el 422 de aceptar (D9)', () => {
  it('lee la lista por producto del rechazo', () => {
    const error = {
      response: {
        status: 422,
        data: {
          message: 'Esta cotización tiene productos con precio por confirmar: Alcohol granel.',
          errors: [{
            status: '422',
            code: 'price_pending',
            title: 'Precio por confirmar',
            detail: 'El precio de Alcohol granel está por confirmar.',
            meta: { quote_item_id: 4, product_id: 9, product_name: 'Alcohol granel', product_sku: 'GR-9' },
          }],
        },
      },
    }
    expect(getPricePendingErrors(error)).toEqual([
      { quoteItemId: 4, productName: 'Alcohol granel', productSku: 'GR-9', detail: 'El precio de Alcohol granel está por confirmar.' },
    ])
  })

  it('el mensaje del portal esta en español', () => {
    expect(ACCEPT_PRICE_PENDING_MESSAGE).toMatch(/precio por confirmar/)
  })
})
