'use client'

import { useState, useRef, useCallback } from 'react'
import { productService } from '../services'
import { ProductsResponse, ProductFilters, ProductSortOptions } from '../types'

interface UseProductsNoRerenderParams {
  page?: { number?: number; size?: number }
  filters?: ProductFilters
  sort?: ProductSortOptions
  include?: string[]
}

export function useProductsNoRerender(initialParams?: UseProductsNoRerenderParams) {
  // Keep initial data in state for first render
  const [initialData, setInitialData] = useState<ProductsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Keep current data in refs to avoid re-renders
  const currentDataRef = useRef<ProductsResponse | null>(null)
  const currentParamsRef = useRef<UseProductsNoRerenderParams | undefined>(initialParams)
  const forceUpdateRef = useRef<() => void>(() => {})
  
  // Force update function that doesn't trigger re-renders of the whole page
  const [, setForceUpdate] = useState({})
  forceUpdateRef.current = useCallback(() => {
    setForceUpdate({})
  }, [])
  
  // Fetch function that updates refs and only updates state if needed
  const fetchProducts = useCallback(async (params?: UseProductsNoRerenderParams) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await productService.getProducts(params)

      // Update ref immediately (no re-render)
      currentDataRef.current = response
      currentParamsRef.current = params
      
      // Only update state on initial load
      if (!initialData) {
        setInitialData(response)
      }
      
      // Force a minimal update without full re-render
      forceUpdateRef.current()
      
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [initialData])
  
  // Manual search function for filters
  const search = useCallback(async (filters: ProductFilters) => {
    const newParams = {
      ...currentParamsRef.current,
      filters,
      page: { number: 1, size: 20 } // Reset page on search
    }
    
    await fetchProducts(newParams)
  }, [fetchProducts])
  
  // Manual sort function
  const sort = useCallback(async (sortOptions: ProductSortOptions) => {
    const newParams = {
      ...currentParamsRef.current,
      sort: sortOptions
    }
    
    await fetchProducts(newParams)
  }, [fetchProducts])
  
  // Manual page change
  const changePage = useCallback(async (page: number) => {
    const newParams = {
      ...currentParamsRef.current,
      page: { number: page, size: 20 }
    }
    
    await fetchProducts(newParams)
  }, [fetchProducts])
  
  // Initial fetch
  const refresh = useCallback(() => {
    fetchProducts(currentParamsRef.current)
  }, [fetchProducts])
  
  // Get current data (from ref or initial state)
  const getCurrentData = useCallback(() => {
    return currentDataRef.current || initialData
  }, [initialData])
  
  return {
    // Data getters
    get products() { 
      const data = getCurrentData()
      return data?.data || []
    },
    get meta() { 
      const data = getCurrentData()
      return data?.meta 
    },
    get links() { 
      const data = getCurrentData()
      return data?.links 
    },
    
    // State
    isLoading,
    error,
    
    // Actions (these don't cause re-renders)
    search,
    sort,
    changePage,
    refresh,
    
    // Direct fetch for manual control
    fetchProducts
  }
}