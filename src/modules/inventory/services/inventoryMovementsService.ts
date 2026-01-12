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
    
    const queryParams: Record<string, string | number> = {}
    
    // Filtros con nombres exactos de columnas de base de datos
    if (filters.search) {
      queryParams['filter[search]'] = filters.search
    }
    if (filters.movementType) {
      queryParams['filter[movement_type]'] = filters.movementType
    }
    if (filters.referenceType) {
      queryParams['filter[reference_type]'] = filters.referenceType
    }
    if (filters.referenceId) {
      queryParams['filter[reference_id]'] = filters.referenceId
    }
    if (filters.status) {
      queryParams['filter[status]'] = filters.status
    }
    if (filters.productId) {
      queryParams['filter[product_id]'] = filters.productId
    }
    if (filters.warehouseId) {
      queryParams['filter[warehouse_id]'] = filters.warehouseId
    }
    if (filters.destinationWarehouseId) {
      queryParams['filter[destination_warehouse_id]'] = filters.destinationWarehouseId
    }
    if (filters.userId) {
      queryParams['filter[user_id]'] = filters.userId
    }
    if (filters.movementDate) {
      queryParams['filter[movement_date]'] = filters.movementDate
    }
    if (filters.dateFrom) {
      queryParams['filter[dateFrom]'] = filters.dateFrom
    }
    if (filters.dateTo) {
      queryParams['filter[dateTo]'] = filters.dateTo
    }
    
    // Sorting (default: más recientes primero)
    if (sort) {
      const sortDirection = sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${sortDirection}${sort.field}`
    } else {
      queryParams.sort = '-movementDate'
    }
    
    // Pagination
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
    const queryParams: Record<string, string | number> = {}
    
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
    // Backend expects all IDs in attributes, not relationships
    const payload = {
      data: {
        type: 'inventory-movements',
        attributes: {
          productId: Number(data.productId),
          warehouseId: Number(data.warehouseId),
          locationId: data.locationId ? Number(data.locationId) : undefined,
          movementType: data.movementType,
          referenceType: data.referenceType,
          referenceId: data.referenceId ? Number(data.referenceId) : undefined,
          movementDate: data.movementDate,
          description: data.description,
          quantity: Number(data.quantity),
          unitCost: data.unitCost ? Number(data.unitCost) : undefined,
          status: data.status,
          userId: Number(data.userId || 1), // TODO: Get from auth context
          destinationWarehouseId: data.destinationWarehouseId ? Number(data.destinationWarehouseId) : undefined,
          destinationLocationId: data.destinationLocationId ? Number(data.destinationLocationId) : undefined,
          batchInfo: data.batchInfo || undefined,
          metadata: data.metadata || undefined
        }
      }
    }
    
    // Remove undefined values to keep payload clean
    Object.keys(payload.data.attributes).forEach(key => {
      if ((payload.data.attributes as Record<string, unknown>)[key] === undefined) {
        delete (payload.data.attributes as Record<string, unknown>)[key]
      }
    })
    
    console.log('📤 [inventoryMovementsService] Creating movement with payload:', JSON.stringify(payload, null, 2))
    
    const response = await axiosClient.post('/api/v1/inventory-movements', payload)
    return response.data
  },

  /**
   * Actualizar movimiento existente
   * Usa el mismo formato que CREATE - todos los campos en attributes
   */
  update: async (
    id: string,
    data: UpdateMovementData
  ): Promise<JsonApiResponse<InventoryMovement>> => {
    // Convert string IDs to numbers like in CREATE
    const attributes: Record<string, unknown> = { ...data }
    
    if (attributes.productId) attributes.productId = Number(attributes.productId)
    if (attributes.warehouseId) attributes.warehouseId = Number(attributes.warehouseId)
    if (attributes.locationId) attributes.locationId = Number(attributes.locationId)
    if (attributes.destinationWarehouseId) attributes.destinationWarehouseId = Number(attributes.destinationWarehouseId)
    if (attributes.destinationLocationId) attributes.destinationLocationId = Number(attributes.destinationLocationId)
    if (attributes.userId) attributes.userId = Number(attributes.userId)
    if (attributes.referenceId) attributes.referenceId = Number(attributes.referenceId)
    if (attributes.quantity) attributes.quantity = Number(attributes.quantity)
    if (attributes.unitCost) attributes.unitCost = Number(attributes.unitCost)
    
    // Remove undefined values to keep payload clean
    Object.keys(attributes).forEach(key => {
      if (attributes[key] === undefined) {
        delete attributes[key]
      }
    })
    
    const payload = {
      data: {
        type: 'inventory-movements',
        id,
        attributes
      }
    }
    
    console.log('📤 [inventoryMovementsService] Updating movement with payload:', JSON.stringify(payload, null, 2))
    
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
    const queryParams: Record<string, string | number> = {
      'filter[product_id]': productId,
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
    const queryParams: Record<string, string | number> = {
      'filter[warehouse_id]': warehouseId,
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
    const queryParams: Record<string, string | number> = {
      'filter[movement_type]': 'entry',
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
    const queryParams: Record<string, string | number> = {
      'filter[movement_type]': 'exit',
      sort: '-movementDate'
    }
    
    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }
    
    const response = await axiosClient.get('/api/v1/inventory-movements', { params: queryParams })
    return response.data
  }
}