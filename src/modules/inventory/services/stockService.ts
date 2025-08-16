/**
 * STOCK SERVICE
 * API layer para stocks con JSON:API v1.1 compliance
 * Basado en pruebas exitosas de Fase 1
 */

import axiosClient from '@/lib/axiosClient'
import type {
  Stock,
  CreateStockData,
  UpdateStockData,
  StockFilters,
  StockSortOptions,
  PaginationParams,
  JsonApiResponse
} from '../types'

export const stockService = {
  /**
   * Obtener todo el stock con filtros y paginación
   */
  getAll: async (params: {
    filters?: StockFilters
    sort?: StockSortOptions
    pagination?: PaginationParams
    include?: string[]
  } = {}): Promise<JsonApiResponse<Stock[]>> => {
    const { filters = {}, sort, pagination, include } = params
    
    const queryParams: Record<string, any> = {}
    
    // Filtros con nombres exactos de columnas de base de datos
    // Nueva búsqueda general que busca en: producto (nombre, SKU, descripción), almacén (nombre, código), ubicación (nombre, código)
    if (filters.search) {
      queryParams['filter[search]'] = filters.search
    }
    if (filters.productId) {
      queryParams['filter[product_id]'] = filters.productId
    }
    if (filters.warehouseId) {
      queryParams['filter[warehouse_id]'] = filters.warehouseId
    }
    if (filters.warehouseLocationId) {
      queryParams['filter[warehouse_location_id]'] = filters.warehouseLocationId
    }
    if (filters.status) {
      queryParams['filter[status]'] = filters.status
    }
    if (filters.lowStock !== undefined) {
      queryParams['filter[low_stock]'] = filters.lowStock ? 1 : 0
    }
    if (filters.outOfStock !== undefined) {
      queryParams['filter[out_of_stock]'] = filters.outOfStock ? 1 : 0
    }
    if (filters.minQuantity !== undefined) {
      queryParams['filter[min_quantity]'] = filters.minQuantity
    }
    if (filters.maxQuantity !== undefined) {
      queryParams['filter[max_quantity]'] = filters.maxQuantity
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
    
    // Includes (muy importante para stock)
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/stocks', { params: queryParams })
    return response.data
  },

  /**
   * Obtener stock específico por ID
   */
  getById: async (
    id: string,
    include?: string[]
  ): Promise<JsonApiResponse<Stock>> => {
    const queryParams: Record<string, any> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/stocks/${id}`, { params: queryParams })
    return response.data
  },

  /**
   * Crear nuevo stock entry
   * Formato corregido según API spec: IDs van en attributes
   */
  create: async (data: CreateStockData): Promise<JsonApiResponse<Stock>> => {
    const payload = {
      data: {
        type: 'stocks',
        attributes: data
      }
    }
    
    const response = await axiosClient.post('/api/v1/stocks', payload)
    return response.data
  },

  /**
   * Actualizar stock existente
   */
  update: async (
    id: string,
    data: UpdateStockData
  ): Promise<JsonApiResponse<Stock>> => {
    const payload = {
      data: {
        type: 'stocks',
        id,
        attributes: data
      }
    }
    
    const response = await axiosClient.patch(`/api/v1/stocks/${id}`, payload)
    return response.data
  },

  /**
   * Eliminar stock entry
   * Nota: Puede fallar por foreign key constraints (esperado)
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/stocks/${id}`)
  },

  /**
   * Obtener resumen de stock por warehouse
   */
  getWarehouseSummary: async (warehouseId: string): Promise<any> => {
    const response = await axiosClient.get(`/api/v1/warehouses/${warehouseId}/stock`)
    return response.data
  },

  /**
   * Obtener resumen de stock por location
   */
  getLocationSummary: async (locationId: string): Promise<any> => {
    const response = await axiosClient.get(`/api/v1/warehouse-locations/${locationId}/stock`)
    return response.data
  },

  /**
   * Buscar stock por producto
   */
  getByProduct: async (
    productId: string,
    include?: string[]
  ): Promise<JsonApiResponse<Stock[]>> => {
    const queryParams: Record<string, any> = {
      'filter[product_id]': productId
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/stocks', { params: queryParams })
    return response.data
  }
}