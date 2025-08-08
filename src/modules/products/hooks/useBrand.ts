'use client'

import useSWR from 'swr'
import { brandService } from '../services'
import { BrandResponse } from '../types'

export function useBrand(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<BrandResponse>(
    id ? ['brand', id] : null,
    id ? () => brandService.getBrand(id) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    brand: data?.data,
    isLoading,
    error,
    refresh: mutate
  }
}