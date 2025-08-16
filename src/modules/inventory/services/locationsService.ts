/**
 * WAREHOUSE LOCATIONS SERVICE
 * API layer para warehouse-locations con JSON:API v1.1 compliance
 * Basado en pruebas exitosas de Fase 1
 */

import axiosClient from '@/lib/axiosClient'
import type {
  WarehouseLocation,
  CreateLocationData,
  UpdateLocationData,
  LocationFilters,
  LocationSortOptions,
  PaginationParams,
  JsonApiResponse
} from '../types'

export const locationsService = {
  /**
   * Obtener todas las locations con filtros y paginación
   */
  getAll: async (params: {
    filters?: LocationFilters
    sort?: LocationSortOptions
    pagination?: PaginationParams
    include?: string[]
  } = {}): Promise<JsonApiResponse<WarehouseLocation[]>> => {
    const { filters = {}, sort, pagination, include } = params
    
    const queryParams: Record<string, string | number> = {}
    
    // Filtros con nombres exactos de columnas de base de datos
    if (filters.search) {
      queryParams['filter[search_name]'] = filters.search // LIKE search en nombre
    }
    if (filters.code) {
      queryParams['filter[search_code]'] = filters.code // LIKE search en código
    }
    // Filtros exactos (si se necesitan)
    if (filters.exactName) {
      queryParams['filter[name]'] = filters.exactName // Búsqueda exacta por nombre
    }
    if (filters.exactCode) {
      queryParams['filter[code]'] = filters.exactCode // Búsqueda exacta por código
    }
    if (filters.warehouseId) {
      queryParams['filter[warehouse_id]'] = filters.warehouseId
    }
    if (filters.locationType) {
      queryParams['filter[location_type]'] = filters.locationType
    }
    if (filters.isActive !== undefined) {
      queryParams['filter[is_active]'] = filters.isActive ? 1 : 0
    }
    if (filters.isPickable !== undefined) {
      queryParams['filter[is_pickable]'] = filters.isPickable ? 1 : 0
    }
    if (filters.isReceivable !== undefined) {
      queryParams['filter[is_receivable]'] = filters.isReceivable ? 1 : 0
    }
    
    // Sorting
    if (sort) {
      const sortDirection = sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${sortDirection}${sort.field}`
    }
    
    // Paginación
    if (pagination?.page) {
      queryParams['page[number]'] = pagination.page
    }
    if (pagination?.size) {
      queryParams['page[size]'] = pagination.size
    }
    
    // Includes
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/warehouse-locations', { params: queryParams })
    return response.data
  },

  /**
   * Obtener location específica por ID
   */
  getById: async (
    id: string,
    include?: string[]
  ): Promise<JsonApiResponse<WarehouseLocation>> => {
    const queryParams: Record<string, string | number> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/warehouse-locations/${id}`, { params: queryParams })
    return response.data
  },

  /**
   * Crear nueva location
   * Formato corregido según API spec: warehouseId va en attributes
   */
  create: async (data: CreateLocationData): Promise<JsonApiResponse<WarehouseLocation>> => {
    const payload = {
      data: {
        type: 'warehouse-locations',
        attributes: data
      }
    }
    
    const response = await axiosClient.post('/api/v1/warehouse-locations', payload)
    return response.data
  },

  /**
   * Actualizar location existente
   */
  update: async (
    id: string,
    data: UpdateLocationData
  ): Promise<JsonApiResponse<WarehouseLocation>> => {
    const payload = {
      data: {
        type: 'warehouse-locations',
        id,
        attributes: data
      }
    }
    
    const response = await axiosClient.patch(`/api/v1/warehouse-locations/${id}`, payload)
    return response.data
  },

  /**
   * Eliminar location
   * Nota: Puede fallar por foreign key constraints (esperado)
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/warehouse-locations/${id}`)
  },

  /**
   * Obtener stock de una location específica
   */
  getStock: async (
    locationId: string,
    include?: string[]
  ): Promise<JsonApiResponse<unknown[]>> => {
    const queryParams: Record<string, string | number> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/warehouse-locations/${locationId}/stock`, { params: queryParams })
    return response.data
  }
}