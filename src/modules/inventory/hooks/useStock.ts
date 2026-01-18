'use client'

/**
 * STOCK HOOKS
 * SWR hooks + mutations para stocks
 * Patrón basado en el éxito del módulo Products
 */

import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { stockService } from '../services'
import { processJsonApiResponse } from '../utils/jsonApi'
import type {
  Stock,
  CreateStockData,
  UpdateStockData,
  StockFilters,
  StockSortOptions,
  PaginationParams
} from '../types'

/**
 * Hook principal para obtener stock con filtros
 */
export const useStock = (params: {
  filters?: StockFilters
  sort?: StockSortOptions
  pagination?: PaginationParams
  include?: string[]
} = {}) => {
  const key = ['stocks', params]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await stockService.getAll(params)
      return processJsonApiResponse<Stock[]>(response)
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )
  
  return {
    stock: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener stock específico por ID
 */
export const useStockItem = (id: string | null, include?: string[]) => {
  const key = id ? ['stocks', id, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await stockService.getById(id!, include)
      const processed = processJsonApiResponse<Stock>(response)

      return processed
    },
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    stockItem: data?.data,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para mutations de stock
 */
export const useStockMutations = () => {
  const { mutate } = useSWRConfig()
  
  const createStock = useCallback(async (data: CreateStockData) => {
    try {
      const result = await stockService.create(data)
      
      // Invalidar cache de stocks y entidades relacionadas
      mutate(key => Array.isArray(key) && key[0] === 'stocks')
      mutate(['warehouses', data.warehouseId, 'stock'])
      mutate(['warehouse-locations', data.warehouseLocationId, 'stock'])
      
      return result
    } catch (error) {
      console.error('Error creating stock:', error)
      throw error
    }
  }, [mutate])
  
  const updateStock = useCallback(async (id: string, data: UpdateStockData) => {
    try {
      const result = await stockService.update(id, data)
      
      // Invalidar cache específico de stock y listas generales
      mutate(['stocks', id])
      mutate(key => Array.isArray(key) && key[0] === 'stocks')
      
      return result
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  }, [mutate])
  
  const deleteStock = useCallback(async (id: string) => {
    try {
      await stockService.delete(id)
      
      // Invalidar cache
      mutate(['stocks', id])
      mutate(key => Array.isArray(key) && key[0] === 'stocks')
      
    } catch (error) {
      console.error('Error deleting stock:', error)
      throw error
    }
  }, [mutate])
  
  return {
    createStock,
    updateStock,
    deleteStock
  }
}

/**
 * Hook para obtener stock por producto
 */
export const useStockByProduct = (productId: string | null, include?: string[]) => {
  const key = productId ? ['stocks', 'product', productId, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => stockService.getByProduct(productId!, include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    stockByProduct: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para resumen de stock por warehouse
 */
export const useWarehouseStockSummary = (warehouseId: string | null) => {
  const key = warehouseId ? ['stocks', 'warehouse-summary', warehouseId] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => stockService.getWarehouseSummary(warehouseId!),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    summary: (data as { data?: unknown[] })?.data || [],
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para resumen de stock por location
 */
export const useLocationStockSummary = (locationId: string | null) => {
  const key = locationId ? ['stocks', 'location-summary', locationId] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => stockService.getLocationSummary(locationId!),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    summary: (data as { data?: unknown[] })?.data || [],
    isLoading,
    error,
    mutate
  }
}