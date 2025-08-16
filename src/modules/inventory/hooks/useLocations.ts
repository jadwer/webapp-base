'use client'

/**
 * WAREHOUSE LOCATIONS HOOKS
 * SWR hooks + mutations para warehouse-locations
 * Patrón basado en el éxito del módulo Products
 */

import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { locationsService } from '../services'
import { processJsonApiResponse } from '../utils/jsonApi'
import type {
  WarehouseLocation,
  WarehouseLocationParsed,
  CreateLocationData,
  UpdateLocationData,
  LocationFilters,
  LocationSortOptions,
  PaginationParams
} from '../types'

/**
 * Hook principal para obtener locations con filtros
 */
export const useLocations = (params: {
  filters?: LocationFilters
  sort?: LocationSortOptions
  pagination?: PaginationParams
  include?: string[]
} = {}) => {
  const key = ['warehouse-locations', params]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await locationsService.getAll(params)
      return processJsonApiResponse<WarehouseLocationParsed[]>(response)
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )
  
  return {
    locations: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener location específica por ID
 */
export const useLocation = (id: string | null, include?: string[]) => {
  const key = id ? ['warehouse-locations', id, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await locationsService.getById(id!, include)
      return processJsonApiResponse<WarehouseLocationParsed>(response)
    },
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    location: data?.data,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para mutations de locations
 */
export const useLocationsMutations = () => {
  const { mutate } = useSWRConfig()
  
  const createLocation = useCallback(async (data: CreateLocationData) => {
    try {
      const result = await locationsService.create(data)
      
      // Invalidar cache de locations y warehouse relacionado
      mutate(key => Array.isArray(key) && key[0] === 'warehouse-locations')
      mutate(['warehouses', data.warehouseId, 'locations'])
      
      return result
    } catch (error) {
      console.error('Error creating location:', error)
      throw error
    }
  }, [mutate])
  
  const updateLocation = useCallback(async (id: string, data: UpdateLocationData) => {
    try {
      const result = await locationsService.update(id, data)
      
      // Invalidar cache específico de location y lista general
      mutate(['warehouse-locations', id])
      mutate(key => Array.isArray(key) && key[0] === 'warehouse-locations')
      
      return result
    } catch (error) {
      console.error('Error updating location:', error)
      throw error
    }
  }, [mutate])
  
  const deleteLocation = useCallback(async (id: string) => {
    try {
      await locationsService.delete(id)
      
      // Invalidar cache
      mutate(['warehouse-locations', id])
      mutate(key => Array.isArray(key) && key[0] === 'warehouse-locations')
      
    } catch (error) {
      console.error('Error deleting location:', error)
      throw error
    }
  }, [mutate])
  
  return {
    createLocation,
    updateLocation,
    deleteLocation
  }
}

/**
 * Hook para obtener stock de una location
 */
export const useLocationStock = (locationId: string | null, include?: string[]) => {
  const key = locationId ? ['warehouse-locations', locationId, 'stock', include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => locationsService.getStock(locationId!, include),
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