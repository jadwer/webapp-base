/**
 * STOCK SERVICE
 * API layer para stocks con JSON:API v1.1 compliance
 * Basado en pruebas exitosas de Fase 1
 */

import axiosClient from '../lib/axiosClient'
import type {
  Stock,
  CreateStockData,
  UpdateStockData,
  StockFilters,
  StockSortOptions,
  PaginationParams,
  JsonApiResponse
} from '../types'

const READ_ONLY_STOCK_FIELDS = ['availableQuantity', 'totalValue'] as const

/** Atributos que acepta StockSchema: ids numericos y locationId (no warehouseLocationId) */
const buildStockAttributes = (data: CreateStockData | UpdateStockData): Record<string, unknown> => {
  const { warehouseLocationId, ...rest } = data as CreateStockData
  const attributes: Record<string, unknown> = { ...rest }
  READ_ONLY_STOCK_FIELDS.forEach((field) => delete attributes[field])
  if (attributes.productId != null && attributes.productId !== '') attributes.productId = Number(attributes.productId)
  if (attributes.warehouseId != null && attributes.warehouseId !== '') attributes.warehouseId = Number(attributes.warehouseId)
  if (warehouseLocationId !== undefined) {
    attributes.locationId = warehouseLocationId ? Number(warehouseLocationId) : null
  }
  Object.keys(attributes).forEach((key) => {
    if (attributes[key] === undefined) delete attributes[key]
  })
  return attributes
}

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
    
    const queryParams: Record<string, string | number> = {}
    
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
    if (filters.branchId) {
      queryParams['filter[branch]'] = filters.branchId
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
    
    // Pagination
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
    const queryParams: Record<string, string | number> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/stocks/${id}`, { params: queryParams })
    return response.data
  },

  /**
   * Crear registro de stock.
   * StockSchema expone productId/warehouseId/locationId como atributos y
   * StockRequest exige ademas las relaciones product y warehouse.
   * availableQuantity y totalValue son de solo lectura (los calcula el backend).
   */
  create: async (data: CreateStockData): Promise<JsonApiResponse<Stock>> => {
    const payload = {
      data: {
        type: 'stocks',
        attributes: buildStockAttributes(data),
        relationships: {
          product: { data: { type: 'products', id: String(data.productId) } },
          warehouse: { data: { type: 'warehouses', id: String(data.warehouseId) } },
          ...(data.warehouseLocationId
            ? { location: { data: { type: 'warehouse-locations', id: String(data.warehouseLocationId) } } }
            : {}),
        },
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
        attributes: buildStockAttributes(data)
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
  getWarehouseSummary: async (warehouseId: string): Promise<unknown> => {
    const response = await axiosClient.get(`/api/v1/warehouses/${warehouseId}/stock`)
    return response.data
  },

  /**
   * Obtener resumen de stock por location
   */
  getLocationSummary: async (locationId: string): Promise<unknown> => {
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
    const queryParams: Record<string, string | number> = {
      'filter[product_id]': productId
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/stocks', { params: queryParams })
    return response.data
  }
}