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
      errorRetryInterval: 1000
    }
  )

  // El backend emite meta.page (PagePagination), igual que las demas listas
  const pageMeta = data?.meta?.page
  const transformedMeta = pageMeta ? {
    total: pageMeta.total,
    perPage: pageMeta.perPage,
    currentPage: pageMeta.currentPage,
    lastPage: pageMeta.lastPage
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

export function useProductBatchesByStatus(status: ProductBatchStatus) {
  return useProductBatches({
    filters: { status },
    sort: { field: 'expirationDate', direction: 'asc' }
  })
}
