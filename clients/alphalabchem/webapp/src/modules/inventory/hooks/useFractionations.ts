'use client'

/**
 * FRACTIONATION HOOKS
 * SWR hooks for fractionation history + mutations for calculate/execute
 */

import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { fractionationService } from '../services/fractionationService'
import { processJsonApiResponse } from '../utils/jsonApi'
import type {
  Fractionation,
  FractionationFilters,
  FractionationSortOptions,
  FractionationCalculateRequest,
  FractionationExecuteRequest,
} from '../types/fractionation'
import type { PaginationParams } from '../types'

export const useFractionations = (params: {
  filters?: FractionationFilters
  sort?: FractionationSortOptions
  pagination?: PaginationParams
  include?: string[]
} = {}) => {
  const key = ['fractionations', params]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await fractionationService.getAll(params)
      return processJsonApiResponse<Fractionation[]>(response)
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )

  return {
    fractionations: data?.data || [],
    meta: data?.meta,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

export const useFractionation = (id: string | null, include?: string[]) => {
  const key = id ? ['fractionations', id, include] : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await fractionationService.getById(id!, include)
      return processJsonApiResponse<Fractionation>(response)
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    fractionation: data?.data,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

export const useFractionationMutations = () => {
  const { mutate } = useSWRConfig()

  const calculate = useCallback(async (data: FractionationCalculateRequest) => {
    const result = await fractionationService.calculate(data)
    return result
  }, [])

  const execute = useCallback(async (data: FractionationExecuteRequest) => {
    const result = await fractionationService.execute(data)
    // Invalidate fractionation list + stock caches
    mutate(key => Array.isArray(key) && key[0] === 'fractionations')
    mutate(key => Array.isArray(key) && key[0] === 'stocks')
    mutate(key => Array.isArray(key) && key[0] === 'inventory-movements')
    return result
  }, [mutate])

  return {
    calculate,
    execute
  }
}
