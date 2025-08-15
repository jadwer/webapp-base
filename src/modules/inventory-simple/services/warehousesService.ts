/**
 * WAREHOUSES SERVICE
 * API layer para warehouses con JSON:API v1.1 compliance
 * Basado en pruebas exitosas de Fase 1
 */

import axiosClient from '@/lib/axiosClient'
import type {
  Warehouse,
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseFilters,
  WarehouseSortOptions,
  PaginationParams,
  ApiResponse
} from '../types'

export const warehousesService = {
  /**
   * Obtener todos los warehouses con filtros y paginación
   */
  getAll: async (params: {
    filters?: WarehouseFilters
    sort?: WarehouseSortOptions
    pagination?: PaginationParams
    include?: string[]
  } = {}): Promise<ApiResponse<Warehouse>> => {
    const { filters = {}, sort, pagination, include } = params
    
    const queryParams: Record<string, any> = {}
    
    // Filtros - Try different search parameter formats
    if (filters.search) {
      // Try multiple search formats to see which one works
      queryParams.search = filters.search // Simple search
      // queryParams['filter[search]'] = filters.search // JSON:API style
      // queryParams.q = filters.search // Query style
    }
    if (filters.warehouseType) {
      queryParams['filter[warehouseType]'] = filters.warehouseType
    }
    if (filters.isActive !== undefined) {
      queryParams['filter[isActive]'] = filters.isActive
    }
    if (filters.city) {
      queryParams['filter[city]'] = filters.city
    }
    if (filters.state) {
      queryParams['filter[state]'] = filters.state
    }
    
    // Sorting
    if (sort) {
      const sortDirection = sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${sortDirection}${sort.field}`
    }
    
    // Paginación - Testing if warehouses endpoint supports it
    if (pagination?.page) {
      queryParams['page[number]'] = pagination.page
    }
    if (pagination?.size) {
      queryParams['page[size]'] = pagination.size
    }
    
    console.log('🔧 [warehousesService] Query params:', queryParams)
    
    // Includes
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/warehouses', { params: queryParams })
    return response.data
  },

  /**
   * Obtener warehouse específico por ID
   */
  getById: async (
    id: string,
    include?: string[]
  ): Promise<ApiResponse<Warehouse>> => {
    const queryParams: Record<string, any> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/warehouses/${id}`, { params: queryParams })
    return response.data
  },

  /**
   * Crear nuevo warehouse
   */
  create: async (data: CreateWarehouseData): Promise<ApiResponse<Warehouse>> => {
    const payload = {
      data: {
        type: 'warehouses',
        attributes: data
      }
    }
    
    const response = await axiosClient.post('/api/v1/warehouses', payload)
    return response.data
  },

  /**
   * Actualizar warehouse existente
   */
  update: async (
    id: string,
    data: UpdateWarehouseData
  ): Promise<ApiResponse<Warehouse>> => {
    const payload = {
      data: {
        type: 'warehouses',
        id,
        attributes: data
      }
    }
    
    const response = await axiosClient.patch(`/api/v1/warehouses/${id}`, payload)
    return response.data
  },

  /**
   * Eliminar warehouse
   * Nota: Puede fallar por foreign key constraints (esperado)
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/warehouses/${id}`)
  },

  /**
   * Obtener locations de un warehouse específico
   */
  getLocations: async (
    warehouseId: string,
    include?: string[]
  ): Promise<ApiResponse<any>> => {
    const queryParams: Record<string, any> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/warehouses/${warehouseId}/locations`, { params: queryParams })
    return response.data
  },

  /**
   * Obtener stock de un warehouse específico
   */
  getStock: async (
    warehouseId: string,
    include?: string[]
  ): Promise<ApiResponse<any>> => {
    const queryParams: Record<string, any> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/warehouses/${warehouseId}/stock`, { params: queryParams })
    return response.data
  }
}