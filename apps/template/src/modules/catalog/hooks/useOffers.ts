/**
 * CATALOG MODULE - OFFERS HOOKS
 * SWR hooks for offers management
 */

import useSWR from 'swr'
import { offersService } from '../services'
import type { Offer, OffersMetrics, OffersFilters } from '../types'

// Re-export types for backward compatibility
export type { Offer as OfferProduct, OffersMetrics }

/**
 * Hook to fetch all offers with optional filters
 */
export function useOffers(filters?: OffersFilters) {
  const {
    data: response,
    error,
    isLoading,
    mutate
  } = useSWR(
    ['offers', filters],
    () => offersService.getAll(filters),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false
    }
  )

  const offers = response?.data || []

  // Calculate metrics from offers
  const metrics: OffersMetrics = {
    activeOffers: offers.length,
    totalDiscount: offers.reduce((sum, o) => sum + o.discount, 0),
    averageDiscount: offers.length > 0
      ? offers.reduce((sum, o) => sum + o.discount, 0) / offers.length
      : 0,
    productsOnOffer: offers.length,
    topCategory: null,
    topBrand: null
  }

  return {
    offers,
    metrics,
    total: response?.meta?.total || 0,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook to fetch a single offer by product ID
 */
export function useOffer(productId: string | null) {
  const {
    data: response,
    error,
    isLoading,
    mutate
  } = useSWR(
    productId ? ['offer', productId] : null,
    () => productId ? offersService.getById(productId) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    offer: response?.data || null,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook to fetch products available for offers
 */
export function useProductsForOffer(search?: string) {
  const {
    data: response,
    error,
    isLoading,
    mutate
  } = useSWR(
    ['products-for-offer', search],
    () => offersService.getProductsForOffer(search),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000
    }
  )

  return {
    products: response?.data || [],
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook to fetch a single product for offer editing
 */
export function useProductForOffer(productId: string | null) {
  const { offer, isLoading, error, mutate } = useOffer(productId)

  return {
    data: offer,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook for offer mutations (create, update, delete)
 */
export function useOffersMutations() {
  return {
    /**
     * Create a new offer
     */
    async createOffer(data: { productId: string; price: number; cost: number }) {
      try {
        const result = await offersService.create(data)
        return result
      } catch (error) {
        console.error('Error creating offer:', error)
        throw error
      }
    },

    /**
     * Update an existing offer
     */
    async updateOffer(productId: string, data: { price: number; cost: number }) {
      try {
        const result = await offersService.update(productId, data)
        return result
      } catch (error) {
        console.error('Error updating offer:', error)
        throw error
      }
    },

    /**
     * Remove an offer (sets cost = price)
     */
    async removeOffer(productId: string) {
      try {
        const result = await offersService.remove(productId)
        return result
      } catch (error) {
        console.error('Error removing offer:', error)
        throw error
      }
    }
  }
}

/**
 * Hook to update product prices (legacy - use useOffersMutations instead)
 * @deprecated Use useOffersMutations().updateOffer instead
 */
export function useUpdateProductOffer() {
  const { updateOffer } = useOffersMutations()

  return {
    async updateProductPrices(productId: string, data: { price: number; cost?: number }) {
      if (data.cost === undefined) {
        throw new Error('Cost is required to update an offer')
      }
      return updateOffer(productId, { price: data.price, cost: data.cost })
    }
  }
}
