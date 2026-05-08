/**
 * useCycleCounts Hook
 *
 * SWR hook for fetching cycle counts list with filtering, sorting and pagination.
 */

import useSWR from 'swr'
import { cycleCountsService } from '../services/cycleCountsService'
import type { CycleCountFilters, CycleCountSortOptions, UseCycleCountsResult } from '../types'

interface UseCycleCountsParams {
  filters?: CycleCountFilters
  sort?: CycleCountSortOptions
  page?: number
  pageSize?: number
  enabled?: boolean
}

export function useCycleCounts(params: UseCycleCountsParams = {}): UseCycleCountsResult {
  const { filters, sort, page = 1, pageSize = 20, enabled = true } = params

  // Create stable cache key
  const cacheKey = enabled ? ['cycle-counts', JSON.stringify({ filters, sort, page, pageSize })] : null

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => cycleCountsService.getAll(filters, sort, page, pageSize),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds deduping
      errorRetryCount: 3,
      errorRetryInterval: 1000
    }
  )

  return {
    cycleCounts: data?.data || [],
    meta: data?.meta
      ? {
          total: data.meta.pagination?.total || 0,
          perPage: data.meta.pagination?.size || pageSize,
          currentPage: data.meta.pagination?.page || page,
          lastPage: data.meta.pagination?.pages || 1
        }
      : undefined,
    isLoading,
    error: error || null
  }
}
