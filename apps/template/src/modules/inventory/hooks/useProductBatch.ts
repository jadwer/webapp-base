/**
 * useProductBatch Hook
 * 
 * SWR hook for fetching a single product batch with caching and error handling.
 */

import useSWR from 'swr'
import { productBatchService } from '../services/productBatchService'
import type { UseProductBatchResult } from '../types'

interface UseProductBatchParams {
  id?: string
  enabled?: boolean
}

export function useProductBatch(params: UseProductBatchParams): UseProductBatchResult {
  const { id, enabled = true } = params

  // Only create cache key if we have an ID and hook is enabled
  const cacheKey = enabled && id ? ['product-batch', id] : null

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => productBatchService.getById(id!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds deduping for single items
      errorRetryCount: 3,
      errorRetryInterval: 1000
    }
  )

  return {
    productBatch: data,
    isLoading,
    error: error || null
  }
}