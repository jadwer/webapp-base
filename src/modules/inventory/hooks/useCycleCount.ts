/**
 * useCycleCount Hook
 *
 * SWR hook for fetching a single cycle count with caching and error handling.
 */

import useSWR from 'swr'
import { cycleCountsService } from '../services/cycleCountsService'
import type { UseCycleCountResult } from '../types'

interface UseCycleCountParams {
  id?: string
  enabled?: boolean
}

export function useCycleCount(params: UseCycleCountParams): UseCycleCountResult {
  const { id, enabled = true } = params

  // Only create cache key if we have an ID and hook is enabled
  const cacheKey = enabled && id ? ['cycle-count', id] : null

  const { data, error, isLoading } = useSWR(cacheKey, () => cycleCountsService.getById(id!), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds deduping for single items
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    onSuccess: data => {
      console.log('CycleCount loaded:', data?.countNumber)
    },
    onError: error => {
      console.error('CycleCount error:', error)
    }
  })

  return {
    cycleCount: data,
    isLoading,
    error: error || null
  }
}
