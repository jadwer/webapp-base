'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { productService } from '../services'
import { ProductsResponse, ProductFilters, ProductSortOptions } from '../types'

interface UseProductsStableParams {
  page?: { number?: number; size?: number }
  filters?: ProductFilters
  sort?: ProductSortOptions
  include?: string[]
}

export function useProductsStable(params?: UseProductsStableParams) {
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Track the current request to prevent race conditions
  const currentRequestRef = useRef<AbortController | null>(null)
  const previousParamsRef = useRef<string>('')
  
  const fetchProducts = useCallback(async (abortController: AbortController, requestParams: UseProductsStableParams | undefined) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching products with params:', requestParams) // Debug log
      
      const response = await productService.getProducts(requestParams)
      
      // Only update if this request wasn't aborted
      if (!abortController.signal.aborted) {
        console.log('📊 Products fetched:', response.data?.length || 0) // Debug log
        console.log('📦 Full response:', response) // Debug full response
        setData(response)
        console.log('✅ Data set in state') // Confirm state update
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error('❌ Error fetching products:', err) // Debug log
        setError(err as Error)
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])
  
  useEffect(() => {
    // Create a stable string representation of params for comparison
    const paramsString = JSON.stringify({
      page: params?.page || { number: 1, size: 20 },
      filters: params?.filters || {},
      sort: params?.sort || { field: 'name', direction: 'asc' },
      include: params?.include?.sort() || []
    })
    
    console.log('🔄 Effect triggered, current params:', paramsString)
    console.log('🔄 Previous params:', previousParamsRef.current)
    
    // Only fetch if params actually changed OR it's the initial load
    if (paramsString === previousParamsRef.current && previousParamsRef.current !== '') {
      console.log('⏭️ Skipping fetch - params unchanged')
      return
    }
    
    console.log('🚀 Fetching products...', params)
    
    // DON'T cancel previous request - let it complete
    // This prevents the double-execution problem
    
    // Create new request WITHOUT abortion
    const abortController = new AbortController()
    previousParamsRef.current = paramsString
    
    fetchProducts(abortController, params)
    
    // Cleanup on unmount
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort()
      }
    }
  }, [fetchProducts, params]) // Simplified dependencies
  
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered') // Debug log
    
    // Cancel current request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort()
    }
    
    // Create new request
    const abortController = new AbortController()
    currentRequestRef.current = abortController
    
    fetchProducts(abortController, params)
  }, [fetchProducts, params])

  return {
    products: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    refresh
  }
}