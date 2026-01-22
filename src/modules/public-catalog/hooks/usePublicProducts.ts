/**
 * PUBLIC PRODUCTS HOOKS
 * SWR-powered hooks for Public Products with intelligent caching and performance optimization
 */

import useSWR from 'swr/immutable'
import { useMemo } from 'react'
import { publicProductsService } from '../services/publicProductsService'
import type {
  PublicProductFilters,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  EnhancedPublicProduct,
  UsePublicProductsResult,
  UsePublicProductResult
} from '../types/publicProduct'

/**
 * Generate SWR cache key for products list
 */
function createProductsKey(
  filters?: PublicProductFilters,
  sort?: PublicProductSort[],
  pagination?: PublicProductPagination,
  include?: PublicProductInclude
): string {
  const keyParts = ['public-products']
  
  if (filters) {
    keyParts.push('filters', JSON.stringify(filters))
  }
  
  if (sort && sort.length > 0) {
    keyParts.push('sort', JSON.stringify(sort))
  }
  
  if (pagination) {
    keyParts.push('pagination', JSON.stringify(pagination))
  }
  
  if (include) {
    keyParts.push('include', include)
  }
  
  return keyParts.join(':')
}

/**
 * Generate SWR cache key for single product
 */
function createProductKey(id: string, include?: PublicProductInclude): string {
  const keyParts = ['public-product', id]
  
  if (include) {
    keyParts.push('include', include)
  }
  
  return keyParts.join(':')
}

/**
 * Hook to fetch multiple public products with filtering, sorting, and pagination
 */
export function usePublicProducts(
  filters?: PublicProductFilters,
  sort?: PublicProductSort[],
  pagination?: PublicProductPagination,
  include: PublicProductInclude = 'unit,category,brand',
  options?: {
    refreshInterval?: number
    revalidateOnFocus?: boolean
    revalidateOnReconnect?: boolean
  }
): UsePublicProductsResult {
  const cacheKey = createProductsKey(filters, sort, pagination, include)
  
  const {
    data,
    error,
    mutate,
    isLoading
  } = useSWR(
    cacheKey,
    () => publicProductsService.getPublicProducts(filters, sort, pagination, include),
    {
      refreshInterval: options?.refreshInterval ?? 300000, // 5 minutes default
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      // Keep previous data while revalidating for better UX
      keepPreviousData: true,
      // Dedupe requests within 5 seconds
      dedupingInterval: 5000
    }
  )

  const result = useMemo((): UsePublicProductsResult => {
    if (data) {
      return {
        products: data.products,
        meta: data.meta,
        links: data.links,
        isLoading: false,
        error: null,
        mutate
      }
    }

    return {
      products: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
        from: null,
        to: null,
        path: ''
      },
      links: {
        first: '',
        last: '',
        prev: null,
        next: null
      },
      isLoading,
      error: error || null,
      mutate
    }
  }, [data, isLoading, error, mutate])

  return result
}

/**
 * Hook to fetch a single public product by ID
 */
export function usePublicProduct(
  id: string | null | undefined,
  include: PublicProductInclude = 'unit,category,brand',
  options?: {
    refreshInterval?: number
    revalidateOnFocus?: boolean
  }
): UsePublicProductResult {
  const cacheKey = id ? createProductKey(id, include) : null
  
  const {
    data,
    error,
    mutate,
    isLoading
  } = useSWR(
    cacheKey,
    () => id ? publicProductsService.getPublicProduct(id, include) : null,
    {
      refreshInterval: options?.refreshInterval ?? 600000, // 10 minutes default
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: true,
      // Keep data fresh for single products
      keepPreviousData: true
    }
  )

  const result = useMemo((): UsePublicProductResult => ({
    product: data || null,
    isLoading: isLoading && !!id,
    error: error || null,
    mutate
  }), [data, isLoading, error, mutate, id])

  return result
}

/**
 * Hook to search products with debounced queries
 */
export function usePublicProductSearch(
  query: string,
  pagination?: PublicProductPagination,
  include: PublicProductInclude = 'unit,category,brand'
): UsePublicProductsResult {
  // Use the same filters-based approach for consistency
  const filters = useMemo((): PublicProductFilters => ({
    search: query.trim()
  }), [query])

  // Only search if query has minimum length
  const shouldSearch = query.trim().length >= 2

  return usePublicProducts(
    shouldSearch ? filters : undefined,
    undefined,
    pagination,
    include,
    {
      // More frequent updates for search
      refreshInterval: 60000, // 1 minute
      revalidateOnFocus: false
    }
  )
}

/**
 * Hook to get products by category
 */
export function usePublicProductsByCategory(
  categoryId: string | null,
  pagination?: PublicProductPagination,
  include: PublicProductInclude = 'unit,category,brand'
): UsePublicProductsResult {
  const filters = useMemo((): PublicProductFilters | undefined => 
    categoryId ? { categoryId } : undefined
  , [categoryId])

  return usePublicProducts(filters, undefined, pagination, include)
}

/**
 * Hook to get products by brand
 */
export function usePublicProductsByBrand(
  brandId: string | null,
  pagination?: PublicProductPagination,
  include: PublicProductInclude = 'unit,category,brand'
): UsePublicProductsResult {
  const filters = useMemo((): PublicProductFilters | undefined => 
    brandId ? { brandId } : undefined
  , [brandId])

  return usePublicProducts(filters, undefined, pagination, include)
}

/**
 * Hook to get featured/latest products
 */
export function useFeaturedProducts(
  limit: number = 12,
  include: PublicProductInclude = 'unit,category,brand'
): {
  products: EnhancedPublicProduct[]
  isLoading: boolean
  error: Error | null
  mutate: () => void
} {
  const filters = useMemo((): PublicProductFilters => ({}), [])
  const sort = useMemo((): PublicProductSort[] => ([
    { field: 'name', direction: 'asc' }
  ]), [])
  const pagination = useMemo((): PublicProductPagination => ({ size: limit }), [limit])

  const result = usePublicProducts(filters, sort, pagination, include, {
    // Cache featured products longer
    refreshInterval: 600000, // 10 minutes
    revalidateOnFocus: false
  })

  return {
    products: result.products,
    isLoading: result.isLoading,
    error: result.error,
    mutate: result.mutate
  }
}

/**
 * Hook to get products on offer (lowest prices)
 * @deprecated Use useSaleProducts instead for products with actual discounts
 */
export function useProductsOnOffer(
  pagination?: PublicProductPagination,
  include: PublicProductInclude = 'unit,category,brand'
): UsePublicProductsResult {
  const filters = useMemo((): PublicProductFilters => ({}), [])
  const sort = useMemo((): PublicProductSort[] => ([
    { field: 'price', direction: 'asc' }
  ]), [])

  return usePublicProducts(filters, sort, pagination, include)
}

/**
 * Hook to get products currently on sale (with discounts)
 * Filters by is_on_sale=true and returns products with compareAtPrice > price
 */
export function useSaleProducts(
  limit: number = 6,
  include: PublicProductInclude = 'unit,category,brand'
): {
  products: EnhancedPublicProduct[]
  isLoading: boolean
  error: Error | null
  mutate: () => void
} {
  const filters = useMemo((): PublicProductFilters => ({
    isOnSale: true
  }), [])
  const sort = useMemo((): PublicProductSort[] => ([
    { field: 'updatedAt', direction: 'desc' }
  ]), [])
  const pagination = useMemo((): PublicProductPagination => ({ size: limit }), [limit])

  const result = usePublicProducts(filters, sort, pagination, include, {
    refreshInterval: 600000, // 10 minutes
    revalidateOnFocus: false
  })

  return {
    products: result.products,
    isLoading: result.isLoading,
    error: result.error,
    mutate: result.mutate
  }
}

/**
 * Hook to get product suggestions based on another product
 */
export function useProductSuggestions(
  productId: string | null,
  limit: number = 6,
  include: PublicProductInclude = 'unit,category,brand'
): {
  suggestions: EnhancedPublicProduct[]
  isLoading: boolean
  error: Error | null
  mutate: () => void
} {
  const cacheKey = productId ? `product-suggestions:${productId}:${limit}:${include}` : null
  
  const {
    data,
    error,
    mutate,
    isLoading
  } = useSWR(
    cacheKey,
    () => productId ? publicProductsService.getProductSuggestions(productId, limit, include) : [],
    {
      refreshInterval: 1800000, // 30 minutes
      revalidateOnFocus: false,
      keepPreviousData: true
    }
  )

  return {
    suggestions: data || [],
    isLoading: isLoading && !!productId,
    error: error || null,
    mutate
  }
}

/**
 * Hook to get products in a specific price range
 */
export function useProductsByPriceRange(
  minPrice: number | null,
  maxPrice: number | null,
  pagination?: PublicProductPagination,
  include: PublicProductInclude = 'unit,category,brand'
): UsePublicProductsResult {
  const filters = useMemo((): PublicProductFilters | undefined => {
    if (minPrice === null && maxPrice === null) return undefined
    
    const result: PublicProductFilters = {}
    
    if (minPrice !== null) result.priceMin = minPrice
    if (maxPrice !== null) result.priceMax = maxPrice
    
    return result
  }, [minPrice, maxPrice])

  return usePublicProducts(filters, undefined, pagination, include)
}