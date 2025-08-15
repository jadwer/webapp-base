'use client'

/**
 * WAREHOUSES HOOKS
 * SWR hooks + mutations para warehouses
 * Patrón basado en el éxito del módulo Products
 */

import { useCallback, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { warehousesService } from '../services'
import { processJsonApiResponse } from '../utils/jsonApi'
import type {
  Warehouse,
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseFilters,
  WarehouseSortOptions,
  PaginationParams
} from '../types'

/**
 * Hook principal para obtener warehouses con filtros
 */
export const useWarehouses = (params: {
  filters?: WarehouseFilters
  sort?: WarehouseSortOptions
  pagination?: PaginationParams
  include?: string[]
} = {}) => {
  const key = ['warehouses', params]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await warehousesService.getAll(params)
      return processJsonApiResponse<Warehouse[]>(response)
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )

  // Debug: Log raw data from API
  console.log('🔄 [useWarehouses] Debug info:', {
    rawData: data,
    dataKeys: data ? Object.keys(data) : null,
    dataData: data?.data,
    dataDataLength: data?.data?.length,
    isLoading,
    error: error?.message
  })
  
  return {
    warehouses: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener warehouse específico por ID
 */
export const useWarehouse = (id: string | null, include?: string[]) => {
  const key = id ? ['warehouses', id, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await warehousesService.getById(id!, include)
      return processJsonApiResponse<Warehouse>(response)
    },
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    warehouse: data?.data,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para mutations de warehouses
 */
export const useWarehousesMutations = () => {
  const { mutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)
  
  const createWarehouse = useCallback(async (data: CreateWarehouseData) => {
    try {
      setIsLoading(true)
      const result = await warehousesService.create(data)
      
      // Invalidar cache de warehouses
      mutate(key => Array.isArray(key) && key[0] === 'warehouses')
      
      return result
    } catch (error) {
      console.error('Error creating warehouse:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [mutate])
  
  const updateWarehouse = useCallback(async (id: string, data: UpdateWarehouseData) => {
    try {
      setIsLoading(true)
      const result = await warehousesService.update(id, data)
      
      // Invalidar cache específico del warehouse y lista general
      mutate(['warehouses', id])
      mutate(key => Array.isArray(key) && key[0] === 'warehouses')
      
      return result
    } catch (error) {
      console.error('Error updating warehouse:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [mutate])
  
  const deleteWarehouse = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      await warehousesService.delete(id)
      
      // Invalidar cache
      mutate(['warehouses', id])
      mutate(key => Array.isArray(key) && key[0] === 'warehouses')
      
    } catch (error) {
      console.error('Error deleting warehouse:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [mutate])
  
  return {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    isLoading
  }
}

/**
 * Hook para obtener locations de un warehouse
 */
export const useWarehouseLocations = (warehouseId: string | null, include?: string[]) => {
  const key = warehouseId ? ['warehouses', warehouseId, 'locations', include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => warehousesService.getLocations(warehouseId!, include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    locations: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener stock de un warehouse
 */
export const useWarehouseStock = (warehouseId: string | null, include?: string[]) => {
  const key = warehouseId ? ['warehouses', warehouseId, 'stock', include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => warehousesService.getStock(warehouseId!, include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    stock: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}