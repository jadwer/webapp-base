/**
 * useDiscountRules Hook
 *
 * SWR hook for fetching discount rules list with filtering, sorting and pagination.
 */

'use client'

import useSWR from 'swr'
import { discountRulesService } from '../services/discountRulesService'
import type { DiscountRuleFilters, DiscountRuleSortOptions, UseDiscountRulesResult } from '../types'

interface UseDiscountRulesParams {
  filters?: DiscountRuleFilters
  sort?: DiscountRuleSortOptions
  page?: number
  pageSize?: number
  enabled?: boolean
}

export function useDiscountRules(params: UseDiscountRulesParams = {}): UseDiscountRulesResult {
  const { filters, sort, page = 1, pageSize = 20, enabled = true } = params

  // Create stable cache key
  const cacheKey = enabled ? ['discount-rules', JSON.stringify({ filters, sort, page, pageSize })] : null

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => discountRulesService.getAll(filters, sort, page, pageSize),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds deduping
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: () => {
        // Errors are returned via the error property
      }
    }
  )

  return {
    discountRules: data?.data || [],
    meta: data?.meta
      ? {
          total: data.meta.total || 0,
          perPage: data.meta.perPage || pageSize,
          currentPage: data.meta.currentPage || page,
          lastPage: data.meta.lastPage || 1
        }
      : undefined,
    isLoading,
    error: error || null,
    mutate
  }
}
