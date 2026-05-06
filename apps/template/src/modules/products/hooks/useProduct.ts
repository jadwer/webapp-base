'use client'

import useSWR from 'swr'
import { productService } from '../services'
import { ProductResponse } from '../types'

export function useProduct(id?: string, include?: string[]) {
  const { data, error, isLoading, mutate } = useSWR<ProductResponse>(
    id ? ['product', id, include] : null,
    id ? () => productService.getProduct(id, include) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    product: data?.data,
    isLoading,
    error,
    refresh: mutate
  }
}