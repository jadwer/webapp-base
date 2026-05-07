/**
 * FEATURED PRODUCTS HOOK
 * Hook para obtener productos destacados/ofertas del mes usando la API pública
 * Integrado con el módulo public-catalog para mejor rendimiento
 */

import { useProductsOnOffer } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'

export interface FeaturedProductsOptions {
  limit?: number
  categoryIds?: string[]
  featured?: boolean
}

export function useFeaturedProducts(options: FeaturedProductsOptions = {}) {
  const { limit = 3 } = options

  // Usar el hook optimizado para productos en oferta del módulo public-catalog
  const {
    products,
    isLoading,
    error,
    mutate
  } = useProductsOnOffer(
    { size: limit },
    'unit,category,brand'
  )

  // Transform to legacy format for compatibility
  const transformedProducts = products.map((product: EnhancedPublicProduct) => ({
    id: product.id,
    name: product.attributes.name,
    description: product.attributes.description,
    price: product.attributes.price,
    sku: product.attributes.sku,
    imageUrl: product.attributes.imageUrl,
    createdAt: product.attributes.createdAt,
    updatedAt: product.attributes.updatedAt,
    
    // Resolved relationships
    unit: product.unit ? {
      id: product.unit.id,
      name: product.unit.attributes.name,
      abbreviation: product.unit.attributes.abbreviation,
      description: product.unit.attributes.description
    } : null,
    
    category: product.category ? {
      id: product.category.id,
      name: product.category.attributes.name,
      description: product.category.attributes.description,
      slug: product.category.attributes.slug,
      imageUrl: product.category.attributes.imageUrl
    } : null,
    
    brand: product.brand ? {
      id: product.brand.id,
      name: product.brand.attributes.name,
      description: product.brand.attributes.description,
      slug: product.brand.attributes.slug,
      logoUrl: product.brand.attributes.logoUrl,
      websiteUrl: product.brand.attributes.websiteUrl
    } : null,

    // Legacy computed fields for compatibility
    iva: true, // Assuming all products include IVA
    cost: product.attributes.price // Use price as cost for now
  }))

  return {
    products: transformedProducts,
    isLoading,
    error,
    refresh: mutate
  }
}

// Enhanced version using public catalog directly for "offers"
export function useFeaturedProductsEnhanced(options: FeaturedProductsOptions = {}) {
  const { limit = 3 } = options

  return useProductsOnOffer(
    { size: limit },
    'unit,category,brand'
  )
}