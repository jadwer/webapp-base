'use client'

import useSWR from 'swr'
import { unitService } from '../services'
import { UnitResponse } from '../types'

export function useUnit(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<UnitResponse>(
    id ? ['unit', id] : null,
    id ? () => unitService.getUnit(id) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    unit: data?.data,
    isLoading,
    error,
    refresh: mutate
  }
}