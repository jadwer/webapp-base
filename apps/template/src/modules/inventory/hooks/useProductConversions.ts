'use client'

/**
 * PRODUCT CONVERSIONS HOOKS
 * SWR hooks + mutations para product-conversions
 */

import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { productConversionsService } from '../services/productConversionsService'
import { processJsonApiResponse } from '../utils/jsonApi'
import type {
  ProductConversion,
  CreateProductConversionData,
  UpdateProductConversionData,
  ProductConversionFilters,
  ProductConversionSortOptions,
} from '../types/productConversion'
import type { PaginationParams } from '../types'

export const useProductConversions = (params: {
  filters?: ProductConversionFilters
  sort?: ProductConversionSortOptions
  pagination?: PaginationParams
  include?: string[]
} = {}) => {
  const key = ['product-conversions', params]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await productConversionsService.getAll(params)
      return processJsonApiResponse<ProductConversion[]>(response)
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )

  return {
    conversions: data?.data || [],
    meta: data?.meta,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

export const useProductConversion = (id: string | null, include?: string[]) => {
  const key = id ? ['product-conversions', id, include] : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await productConversionsService.getById(id!, include)
      return processJsonApiResponse<ProductConversion>(response)
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    conversion: data?.data,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

export const useProductConversionsMutations = () => {
  const { mutate } = useSWRConfig()

  const createConversion = useCallback(async (data: CreateProductConversionData) => {
    const result = await productConversionsService.create(data)
    mutate(key => Array.isArray(key) && key[0] === 'product-conversions')
    return result
  }, [mutate])

  const updateConversion = useCallback(async (id: string, data: UpdateProductConversionData) => {
    const result = await productConversionsService.update(id, data)
    mutate(['product-conversions', id])
    mutate(key => Array.isArray(key) && key[0] === 'product-conversions')
    return result
  }, [mutate])

  const deleteConversion = useCallback(async (id: string) => {
    await productConversionsService.delete(id)
    mutate(['product-conversions', id])
    mutate(key => Array.isArray(key) && key[0] === 'product-conversions')
  }, [mutate])

  return {
    createConversion,
    updateConversion,
    deleteConversion
  }
}

export const useConversionsBySourceProduct = (sourceProductId: string | null, include?: string[]) => {
  const key = sourceProductId ? ['product-conversions', 'source', sourceProductId, include] : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await productConversionsService.getBySourceProduct(sourceProductId!, include)
      return processJsonApiResponse<ProductConversion[]>(response)
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    conversions: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}
