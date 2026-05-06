/**
 * CATALOG MODULE - TYPES
 * Types for offers/promotions derived from products
 */

import type { Product } from '@/modules/products/types'

/**
 * Offer - A product with price > cost (representing a discount/promotion)
 */
export interface Offer {
  id: string
  productId: string
  name: string
  description: string | null
  sku: string | null
  price: number
  cost: number
  discount: number // Calculated: price - cost
  discountPercent: number // Calculated: (discount / price) * 100
  isActive: boolean
  imgPath: string | null
  unit?: {
    id: string
    name: string
    abbreviation: string | null
  }
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Offer form data for creating/updating offers
 */
export interface OfferFormData {
  productId: string
  price: number
  cost: number
}

/**
 * Offer metrics for dashboard
 */
export interface OffersMetrics {
  activeOffers: number
  totalDiscount: number
  averageDiscount: number
  productsOnOffer: number
  topCategory: string | null
  topBrand: string | null
}

/**
 * Filters for offers listing
 */
export interface OffersFilters {
  search?: string
  categoryId?: string
  brandId?: string
  minDiscount?: number
  maxDiscount?: number
}

/**
 * Product available for offer (product without active offer or with low discount)
 */
export interface ProductForOffer {
  id: string
  name: string
  sku: string | null
  price: number | null
  cost: number | null
  currentDiscount: number
  hasOffer: boolean
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
}

/**
 * Transform a product to an offer
 */
export function productToOffer(product: Product): Offer | null {
  const price = product.price ?? 0
  const cost = product.cost ?? 0

  // Only products with price > cost > 0 are offers
  if (price <= cost || cost <= 0) {
    return null
  }

  const discount = price - cost
  const discountPercent = (discount / price) * 100

  return {
    id: product.id,
    productId: product.id,
    name: product.name,
    description: product.description ?? null,
    sku: product.sku ?? null,
    price,
    cost,
    discount,
    discountPercent,
    isActive: product.isActive,
    imgPath: product.imgPath ?? null,
    unit: product.unit ? {
      id: product.unit.id,
      name: product.unit.name,
      abbreviation: product.unit.code ?? null
    } : undefined,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name
    } : undefined,
    brand: product.brand ? {
      id: product.brand.id,
      name: product.brand.name
    } : undefined,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }
}

/**
 * Transform a product to ProductForOffer
 */
export function productToProductForOffer(product: Product): ProductForOffer {
  const price = product.price ?? 0
  const cost = product.cost ?? 0
  const hasOffer = price > cost && cost > 0
  const currentDiscount = hasOffer ? ((price - cost) / price) * 100 : 0

  return {
    id: product.id,
    name: product.name,
    sku: product.sku ?? null,
    price: product.price ?? null,
    cost: product.cost ?? null,
    currentDiscount,
    hasOffer,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name
    } : undefined,
    brand: product.brand ? {
      id: product.brand.id,
      name: product.brand.name
    } : undefined
  }
}
