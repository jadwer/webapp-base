'use client'

import useSWR from 'swr'
import { brandService } from '../services'
import { BrandsResponse, BrandSortOptions } from '../types'

interface UseBrandsParams {
  page?: { number?: number; size?: number }
  filter?: { name?: string; slug?: string }
  sort?: BrandSortOptions
}

export function useBrands(params?: UseBrandsParams) {
  const key = params ? ['brands', params] : 'brands'
  
  const { data, error, isLoading, mutate } = useSWR<BrandsResponse>(
    key,
    () => brandService.getBrands(params),
    {
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  )

  return {
    brands: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    refresh: mutate
  }
}