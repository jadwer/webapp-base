/**
 * useProductBatches Hook
 * 
 * SWR hook for fetching multiple product batches with caching,
 * filtering, sorting, and pagination support.
 */

import useSWR from 'swr'
import { productBatchService } from '../services/productBatchService'
import type {
  ProductBatchFilters,
  ProductBatchSortOptions,
  UseProductBatchesResult,
  ProductBatchStatus
} from '../types'

interface UseProductBatchesParams {
  filters?: ProductBatchFilters
  sort?: ProductBatchSortOptions
  page?: number
  pageSize?: number
  enabled?: boolean
}

export function useProductBatches(params: UseProductBatchesParams = {}): UseProductBatchesResult {
  const {
    filters,
    sort = { field: 'createdAt', direction: 'desc' },
    page = 1,
    pageSize = 20,
    enabled = true
  } = params

  // Create cache key based on all parameters
  const cacheKey = enabled ? [
    'product-batches',
    filters,
    sort,
    page,
    pageSize
  ] : null

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => productBatchService.getAll(filters, sort, page, pageSize),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      dedupingInterval: 5000, // 5 seconds deduping
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onSuccess: (data) => {
        console.log('✅ ProductBatches loaded:', data?.data?.length || 0, 'items')
      },
      onError: (error) => {
        console.error('❌ ProductBatches error:', error)
      }
    }
  )

  // Transform meta to match expected interface
  const transformedMeta = data?.meta?.pagination ? {
    total: data.meta.pagination.total,
    perPage: data.meta.pagination.size,
    currentPage: data.meta.pagination.page,
    lastPage: data.meta.pagination.pages
  } : undefined

  return {
    productBatches: data?.data || [],
    meta: transformedMeta,
    isLoading,
    error: error || null
  }
}

// Helper hook for getting product batches by specific filters
export function useProductBatchesByProduct(productId: string) {
  return useProductBatches({
    filters: { productId },
    sort: { field: 'expirationDate', direction: 'asc' }
  })
}

export function useProductBatchesByWarehouse(warehouseId: string) {
  return useProductBatches({
    filters: { warehouseId },
    sort: { field: 'batchNumber', direction: 'asc' }
  })
}

export function useProductBatchesByStatus(status: ProductBatchStatus[]) {
  return useProductBatches({
    filters: { status },
    sort: { field: 'expirationDate', direction: 'asc' }
  })
}

// Hook for product batches expiring soon
export function useExpiringProductBatches(days: number = 30) {
  const expiresAfter = new Date().toISOString().split('T')[0] // Today
  const expiresBefore = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return useProductBatches({
    filters: {
      status: ['active'],
      expiresAfter,
      expiresBefore
    },
    sort: { field: 'expirationDate', direction: 'asc' }
  })
}

// Hook for low stock product batches
export function useLowStockProductBatches(threshold: number = 10) {
  return useProductBatches({
    filters: {
      status: ['active'],
      maxQuantity: threshold
    },
    sort: { field: 'currentQuantity', direction: 'asc' }
  })
}