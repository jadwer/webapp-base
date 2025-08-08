'use client'

import useSWR from 'swr'
import { categoryService } from '../services'
import { CategoriesResponse, CategorySortOptions } from '../types'

interface UseCategoriesParams {
  page?: { number?: number; size?: number }
  filter?: { name?: string; slug?: string }
  sort?: CategorySortOptions
}

export function useCategories(params?: UseCategoriesParams) {
  const key = params ? ['categories', params] : 'categories'
  
  const { data, error, isLoading, mutate } = useSWR<CategoriesResponse>(
    key,
    () => categoryService.getCategories(params),
    {
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  )

  return {
    categories: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    refresh: mutate
  }
}