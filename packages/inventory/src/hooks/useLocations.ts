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
  /** false = no consulta (p.ej. formulario sin almacen elegido) */
  enabled?: boolean
} = {}) => {
  const { enabled = true, ...query } = params
  const key = enabled ? ['warehouse-locations', query] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await locationsService.getAll(query)
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
 * Ubicaciones activas de un almacen para selects de formularios.
 * Sin almacen no consulta; filtra por warehouseId porque keepPreviousData
 * devuelve las del almacen anterior mientras carga.
 */
export const useWarehouseLocationOptions = (warehouseId?: string | number | null) => {
  const id = warehouseId ? String(warehouseId) : ''
  const { locations, isLoading, error } = useLocations({
    filters: { warehouseId: id, isActive: true },
    pagination: { size: 200 },
    enabled: Boolean(id),
  })

  return {
    locations: id
      ? locations.filter((location) => location.warehouseId == null || String(location.warehouseId) === id)
      : [],
    isLoading: Boolean(id) && isLoading,
    error,
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

      throw error
    }
  }, [mutate])
  
  const deleteLocation = useCallback(async (id: string) => {
    try {
      await locationsService.delete(id)
      
      // No se revalida la llave de detalle del id borrado: el detalle montado pediria un 404
      mutate(key => Array.isArray(key) && key[0] === 'warehouse-locations' && key[1] !== id)
      
    } catch (error) {

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