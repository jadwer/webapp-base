'use client'

import useSWR from 'swr'
import { categoryService } from '../services'
import { CategoryResponse } from '../types'

export function useCategory(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
    id ? ['category', id] : null,
    id ? () => categoryService.getCategory(id) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    category: data?.data,
    isLoading,
    error,
    refresh: mutate
  }
}