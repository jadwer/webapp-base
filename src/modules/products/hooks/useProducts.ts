'use client'

import useSWR from 'swr'
import { productService } from '../services'
import { ProductsResponse, ProductFilters, ProductSortOptions } from '../types'

interface UseProductsParams {
  page?: { number?: number; size?: number }
  filters?: ProductFilters
  sort?: ProductSortOptions
  include?: string[]
}

export function useProducts(params?: UseProductsParams) {
  const key = params ? ['products', params] : 'products'
  
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    key,
    () => productService.getProducts(params),
    {
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  )

  return {
    products: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    refresh: mutate
  }
}