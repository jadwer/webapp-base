/**
 * OFFERS HOOKS
 * Conecta con el módulo de productos para gestionar ofertas
 * Una oferta es un producto donde price != cost
 */

import useSWR from 'swr'
import { productService } from '@/modules/products'

export interface OfferProduct {
  id: string
  name: string
  description: string | null
  price: number
  cost: number | null
  sku: string | null
  discount: number // Calculado: price - cost
  discountPercent: number // Calculado: (discount / price) * 100
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
}

export interface OffersMetrics {
  activeOffers: number
  totalDiscount: number
  averageDiscount: number
  productsOnOffer: number
}

/**
 * Hook para obtener productos que están en oferta (price > cost)
 */
export function useOffers() {
  const { data: productsData, error, isLoading, mutate } = useSWR(
    'products-offers',
    () => productService.getProducts({
      include: ['unit', 'category', 'brand']
      // Note: API doesn't support hasPrice/hasCost filters, will filter client-side
    }),
    {
      refreshInterval: 30000, // 30 segundos
      revalidateOnFocus: false
    }
  )

  // Procesar productos para encontrar ofertas
  const offers: OfferProduct[] = []
  const metrics: OffersMetrics = {
    activeOffers: 0,
    totalDiscount: 0,
    averageDiscount: 0,
    productsOnOffer: 0
  }

  if (productsData?.data) {
    productsData.data.forEach((product) => {
      const price = parseFloat(String(product.price)) || 0
      const cost = parseFloat(String(product.cost)) || 0
      
      // Solo considerar como oferta si price > cost
      if (price > cost && cost > 0) {
        const discount = price - cost
        const discountPercent = (discount / price) * 100

        offers.push({
          id: product.id,
          name: product.name,
          description: product.description ?? null,
          price,
          cost,
          sku: product.sku ?? null,
          discount,
          discountPercent,
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
          } : undefined
        })

        metrics.totalDiscount += discount
        metrics.activeOffers++
        metrics.productsOnOffer++
      }
    })

    metrics.averageDiscount = metrics.activeOffers > 0 
      ? metrics.totalDiscount / metrics.activeOffers 
      : 0
  }

  return {
    offers,
    metrics,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener un producto específico para editar como oferta
 */
export function useProductForOffer(productId: string | null) {
  return useSWR(
    productId ? ['product-for-offer', productId] : null,
    () => productId ? productService.getProduct(productId, ['unit', 'category', 'brand']) : null,
    {
      revalidateOnFocus: false
    }
  )
}

/**
 * Hook para actualizar precios de un producto (crear/editar oferta)
 */
export function useUpdateProductOffer() {
  return {
    async updateProductPrices(productId: string, data: { price: number; cost?: number }) {
      try {
        const result = await productService.updateProduct(productId, {
          price: data.price,
          ...(data.cost !== undefined && { cost: data.cost })
        })
        return result
      } catch (error) {
        console.error('Error updating product offer:', error)
        throw error
      }
    }
  }
}