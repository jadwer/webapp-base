/**
 * INVENTORY MOVEMENTS SERVICE
 * API layer para inventory-movements con JSON:API v1.1 compliance
 * Basado en pruebas exitosas de Fase 1
 */

import axiosClient from '@/lib/axiosClient'
import type {
  InventoryMovement,
  CreateMovementData,
  UpdateMovementData,
  MovementFilters,
  MovementSortOptions,
  PaginationParams,
  JsonApiResponse
} from '../types'

export const inventoryMovementsService = {
  /**
   * Obtener todos los movimientos con filtros y paginación
   */
  getAll: async (params: {
    filters?: MovementFilters
    sort?: MovementSortOptions
    pagination?: PaginationParams
    include?: string[]
  } = {}): Promise<JsonApiResponse<InventoryMovement[]>> => {
    const { filters = {}, sort, pagination, include } = params
    
    const queryParams: Record<string, any> = {}
    
    // Filtros
    if (filters.search) {
      queryParams['filter[search]'] = filters.search
    }
    if (filters.movementType) {
      queryParams['filter[movementType]'] = filters.movementType
    }
    if (filters.referenceType) {
      queryParams['filter[referenceType]'] = filters.referenceType
    }
    if (filters.status) {
      queryParams['filter[status]'] = filters.status
    }
    if (filters.productId) {
      queryParams['filter[productId]'] = filters.productId
    }
    if (filters.warehouseId) {
      queryParams['filter[warehouseId]'] = filters.warehouseId
    }
    if (filters.locationId) {
      queryParams['filter[locationId]'] = filters.locationId
    }
    if (filters.userId) {
      queryParams['filter[userId]'] = filters.userId
    }
    if (filters.dateFrom) {
      queryParams['filter[dateFrom]'] = filters.dateFrom
    }
    if (filters.dateTo) {
      queryParams['filter[dateTo]'] = filters.dateTo
    }
    if (filters.minQuantity !== undefined) {
      queryParams['filter[minQuantity]'] = filters.minQuantity
    }
    if (filters.maxQuantity !== undefined) {
      queryParams['filter[maxQuantity]'] = filters.maxQuantity
    }
    
    // Sorting (default: más recientes primero)
    if (sort) {
      const sortDirection = sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${sortDirection}${sort.field}`
    } else {
      queryParams.sort = '-movementDate'
    }
    
    // Paginación
    if (pagination?.page) {
      queryParams['page[number]'] = pagination.page
    }
    if (pagination?.size) {
      queryParams['page[size]'] = pagination.size
    }
    
    // Includes (muy importante para movements)
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/inventory-movements', { params: queryParams })
    return response.data
  },

  /**
   * Obtener movimiento específico por ID
   */
  getById: async (
    id: string,
    include?: string[]
  ): Promise<JsonApiResponse<InventoryMovement>> => {
    const queryParams: Record<string, any> = {}
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/inventory-movements/${id}`, { params: queryParams })
    return response.data
  },

  /**
   * Crear nuevo movimiento de inventario
   * Nota: Requiere relationships con product, warehouse, etc.
   * Nota: La creación puede fallar si la API no permite POST (Fase 1 no confirmada)
   */
  create: async (data: CreateMovementData): Promise<JsonApiResponse<InventoryMovement>> => {
    const { productId, warehouseId, locationId, destinationWarehouseId, destinationLocationId, userId, ...attributes } = data
    
    const relationships: any = {
      product: {
        data: { type: 'products', id: productId }
      },
      warehouse: {
        data: { type: 'warehouses', id: warehouseId }
      }
    }
    
    if (locationId) {
      relationships.location = {
        data: { type: 'warehouse-locations', id: locationId }
      }
    }
    
    if (destinationWarehouseId) {
      relationships.destinationWarehouse = {
        data: { type: 'warehouses', id: destinationWarehouseId }
      }
    }
    
    if (destinationLocationId) {
      relationships.destinationLocation = {
        data: { type: 'warehouse-locations', id: destinationLocationId }
      }
    }
    
    if (userId) {
      relationships.user = {
        data: { type: 'users', id: userId }
      }
    }
    
    const payload = {
      data: {
        type: 'inventory-movements',
        attributes,
        relationships
      }
    }
    
    const response = await axiosClient.post('/api/v1/inventory-movements', payload)
    return response.data
  },

  /**
   * Actualizar movimiento existente
   * Nota: Puede no estar permitido según la lógica de negocio
   */
  update: async (
    id: string,
    data: UpdateMovementData
  ): Promise<JsonApiResponse<InventoryMovement>> => {
    const payload = {
      data: {
        type: 'inventory-movements',
        id,
        attributes: data
      }
    }
    
    const response = await axiosClient.patch(`/api/v1/inventory-movements/${id}`, payload)
    return response.data
  },

  /**
   * Eliminar movimiento
   * Nota: Probablemente no permitido por auditoría
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/inventory-movements/${id}`)
  },

  /**
   * Obtener movimientos por producto
   */
  getByProduct: async (
    productId: string,
    include?: string[]
  ): Promise<JsonApiResponse<InventoryMovement[]>> => {
    const queryParams: Record<string, any> = {
      'filter[productId]': productId,
      sort: '-movementDate'
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/inventory-movements', { params: queryParams })
    return response.data
  },

  /**
   * Obtener movimientos por warehouse
   */
  getByWarehouse: async (
    warehouseId: string,
    include?: string[]
  ): Promise<JsonApiResponse<InventoryMovement[]>> => {
    const queryParams: Record<string, any> = {
      'filter[warehouseId]': warehouseId,
      sort: '-movementDate'
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/inventory-movements', { params: queryParams })
    return response.data
  },

  /**
   * Obtener movimientos de entrada
   */
  getEntries: async (include?: string[]): Promise<JsonApiResponse<InventoryMovement[]>> => {
    const queryParams: Record<string, any> = {
      'filter[movementType]': 'entry',
      sort: '-movementDate'
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/inventory-movements', { params: queryParams })
    return response.data
  },

  /**
   * Obtener movimientos de salida
   */
  getExits: async (include?: string[]): Promise<JsonApiResponse<InventoryMovement[]>> => {
    const queryParams: Record<string, any> = {
      'filter[movementType]': 'exit',
      sort: '-movementDate'
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/inventory-movements', { params: queryParams })
    return response.data
  }
}