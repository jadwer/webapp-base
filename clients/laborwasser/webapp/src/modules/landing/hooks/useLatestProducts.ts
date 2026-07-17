/**
 * LATEST PRODUCTS HOOK
 * Hook para obtener los últimos productos agregados usando la API pública
 * Integrado con @lwm/ecommerce (public-catalog) para mejor rendimiento
 */

import { useMemo } from 'react'
import { usePublicProducts, type EnhancedPublicProduct } from '@lwm/ecommerce'

export interface LatestProductsOptions {
  limit?: number
  categoryIds?: string[]
}

export function useLatestProducts(options: LatestProductsOptions = {}) {
  const { limit = 6 } = options

  // "Ultimos productos" = los ultimos AGREGADOS. Antes delegaba en
  // useFeaturedProducts, que ordena por nombre ascendente: la seccion
  // "ultimas incorporaciones" mostraba siempre los 6 primeros alfabeticamente
  // del catalogo (los mismos para siempre, con 39k productos).
  const filters = useMemo(() => ({}), [])
  const sort = useMemo(() => ([{ field: 'createdAt' as const, direction: 'desc' as const }]), [])
  const pagination = useMemo(() => ({ size: limit }), [limit])

  const {
    products,
    isLoading,
    error,
    mutate
  } = usePublicProducts(filters, sort, pagination, 'unit,category,brand,currency', {
    refreshInterval: 600000,
    revalidateOnFocus: false
  })

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
    total: products.length, // Since this is latest products, we don't have total count
    isLoading,
    error,
    refresh: mutate
  }
}

// Enhanced version using @lwm/ecommerce directly
export function useLatestProductsEnhanced(options: LatestProductsOptions = {}) {
  const { limit = 6 } = options

  // Mismo criterio que useLatestProducts: los ultimos AGREGADOS, no los
  // primeros alfabeticamente.
  const filters = useMemo(() => ({}), [])
  const sort = useMemo(() => ([{ field: 'createdAt' as const, direction: 'desc' as const }]), [])
  const pagination = useMemo(() => ({ size: limit }), [limit])

  const result = usePublicProducts(filters, sort, pagination, 'unit,category,brand,currency', {
    refreshInterval: 600000,
    revalidateOnFocus: false
  })

  return {
    ...result,
    total: result.products.length
  }
}
