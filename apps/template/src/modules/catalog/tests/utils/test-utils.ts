/**
 * CATALOG MODULE - TEST UTILITIES
 * Mock factories and test helpers for offers testing
 */

import type { Offer, OffersMetrics, ProductForOffer } from '../../types'

/**
 * Create a mock offer
 */
export function createMockOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: '1',
    productId: '1',
    name: 'Test Product with Offer',
    description: 'A test product with a discount',
    sku: 'TEST-001',
    price: 100,
    cost: 80,
    discount: 20,
    discountPercent: 20,
    isActive: true,
    imgPath: null,
    unit: {
      id: '1',
      name: 'Piece',
      abbreviation: 'pcs'
    },
    category: {
      id: '1',
      name: 'Electronics'
    },
    brand: {
      id: '1',
      name: 'Test Brand'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides
  }
}

/**
 * Create multiple mock offers
 */
export function createMockOffers(count: number): Offer[] {
  return Array.from({ length: count }, (_, i) => {
    const price = 100 + (i * 10)
    const cost = 80 + (i * 5)
    const discount = price - cost
    const discountPercent = (discount / price) * 100

    return createMockOffer({
      id: String(i + 1),
      productId: String(i + 1),
      name: `Test Product ${i + 1}`,
      sku: `TEST-${String(i + 1).padStart(3, '0')}`,
      price,
      cost,
      discount,
      discountPercent
    })
  })
}

/**
 * Create mock offers metrics
 */
export function createMockOffersMetrics(offers: Offer[] = []): OffersMetrics {
  const totalDiscount = offers.reduce((sum, o) => sum + o.discount, 0)

  return {
    activeOffers: offers.length,
    totalDiscount,
    averageDiscount: offers.length > 0 ? totalDiscount / offers.length : 0,
    productsOnOffer: offers.length,
    topCategory: offers.length > 0 ? offers[0].category?.name || null : null,
    topBrand: offers.length > 0 ? offers[0].brand?.name || null : null
  }
}

/**
 * Create a mock product for offer selection
 */
export function createMockProductForOffer(overrides: Partial<ProductForOffer> = {}): ProductForOffer {
  return {
    id: '1',
    name: 'Test Product',
    sku: 'TEST-001',
    price: 100,
    cost: null,
    currentDiscount: 0,
    hasOffer: false,
    category: {
      id: '1',
      name: 'Electronics'
    },
    brand: {
      id: '1',
      name: 'Test Brand'
    },
    ...overrides
  }
}

/**
 * Create multiple mock products for offer selection
 */
export function createMockProductsForOffer(count: number): ProductForOffer[] {
  return Array.from({ length: count }, (_, i) => {
    const hasOffer = i % 3 === 0 // Every 3rd product has an offer
    const price = 100 + (i * 10)
    const cost = hasOffer ? 80 + (i * 5) : null
    const currentDiscount = hasOffer && cost !== null ? ((price - cost) / price) * 100 : 0

    return createMockProductForOffer({
      id: String(i + 1),
      name: `Test Product ${i + 1}`,
      sku: `TEST-${String(i + 1).padStart(3, '0')}`,
      price,
      cost,
      currentDiscount,
      hasOffer
    })
  })
}

/**
 * Create mock API response for offers
 */
export function createMockOffersApiResponse(offers: Offer[]) {
  return {
    data: offers,
    meta: {
      total: offers.length
    }
  }
}

/**
 * Create mock API response for a single offer
 */
export function createMockOfferApiResponse(offer: Offer | null) {
  return {
    data: offer
  }
}

/**
 * Create mock products for offer API response
 */
export function createMockProductsForOfferApiResponse(products: ProductForOffer[]) {
  return {
    data: products
  }
}
