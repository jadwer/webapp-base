/**
 * LATEST PRODUCTS HOOK
 * Hook para obtener los últimos productos agregados usando la API pública
 * Integrado con el módulo public-catalog para mejor rendimiento
 */

import { useFeaturedProducts } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'

export interface LatestProductsOptions {
  limit?: number
  categoryIds?: string[]
}

export function useLatestProducts(options: LatestProductsOptions = {}) {
  const { limit = 6 } = options

  // Usar el hook optimizado del módulo public-catalog
  const {
    products,
    isLoading,
    error,
    mutate
  } = useFeaturedProducts(limit, 'unit,category,brand')

  // Transform to legacy format for compatibility
  const transformedProducts = products.map((product: EnhancedPublicProduct) => ({
    id: product.id,
    name: product.attributes.name,
    description: product.attributes.description,
    price: product.attributes.price,
    sku: product.attributes.sku,
    barcode: product.attributes.barcode,
    imageUrl: product.attributes.imageUrl,
    isActive: product.attributes.isActive,
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
    total: products.length, // Since this is latest products, we don't have total count
    isLoading,
    error,
    refresh: mutate
  }
}

// Enhanced version using public catalog directly
export function useLatestProductsEnhanced(options: LatestProductsOptions = {}) {
  const { limit = 6 } = options

  const result = useFeaturedProducts(limit, 'unit,category,brand')

  return {
    ...result,
    total: result.products.length
  }
}