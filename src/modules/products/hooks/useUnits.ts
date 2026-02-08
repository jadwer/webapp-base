'use client'

import useSWR from 'swr'
import { unitService } from '../services'
import { UnitsResponse, UnitSortOptions } from '../types'

interface UseUnitsParams {
  page?: { number?: number; size?: number }
  filter?: { name?: string; code?: string; unitType?: string }
  sort?: UnitSortOptions
}

export function useUnits(params?: UseUnitsParams) {
  const key = params ? ['units', params] : 'units'
  
  const { data, error, isLoading, mutate } = useSWR<UnitsResponse>(
    key,
    () => unitService.getUnits(params),
    {
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  )

  return {
    units: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    refresh: mutate
  }
}