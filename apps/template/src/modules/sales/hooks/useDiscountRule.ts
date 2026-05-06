/**
 * useDiscountRule Hook
 *
 * SWR hook for fetching a single discount rule with caching and error handling.
 */

'use client'

import useSWR from 'swr'
import { discountRulesService } from '../services/discountRulesService'
import type { UseDiscountRuleResult } from '../types'

interface UseDiscountRuleParams {
  id?: string
  enabled?: boolean
}

export function useDiscountRule(params: UseDiscountRuleParams): UseDiscountRuleResult {
  const { id, enabled = true } = params

  // Only create cache key if we have an ID and hook is enabled
  const cacheKey = enabled && id ? ['discount-rule', id] : null

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => discountRulesService.getById(id!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds deduping for single items
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: () => {
        // Errors are returned via the error property
      }
    }
  )

  return {
    discountRule: data,
    isLoading,
    error: error || null,
    mutate
  }
}
