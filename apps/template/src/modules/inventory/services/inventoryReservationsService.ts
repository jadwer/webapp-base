/**
 * Inventory Reservations Service
 *
 * API layer for inventory reservations
 */

import axiosClient from '@/lib/axiosClient'

const RESERVATIONS_ENDPOINT = '/api/v1/inventory-reservations'

export interface InventoryReservation {
  id: string
  productId: number
  warehouseId: number
  quantity: number
  sourceType: string     // 'sales_order'
  sourceId: number
  expiresAt: string | null
  status: 'active' | 'fulfilled' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateReservationRequest {
  productId: number
  warehouseId: number
  quantity: number
  sourceType: string
  sourceId: number
  expiresAt?: string
}

interface JsonApiReservation {
  id: string
  type: string
  attributes: Omit<InventoryReservation, 'id'>
}

export const inventoryReservationsService = {
  /**
   * Get all reservations with optional filters
   */
  async getAll(params?: {
    productId?: number
    warehouseId?: number
    status?: 'active' | 'fulfilled' | 'cancelled'
  }): Promise<InventoryReservation[]> {
    const queryParams = new URLSearchParams()

    if (params?.productId) {
      queryParams.append('filter[product_id]', params.productId.toString())
    }
    if (params?.warehouseId) {
      queryParams.append('filter[warehouse_id]', params.warehouseId.toString())
    }
    if (params?.status) {
      queryParams.append('filter[status]', params.status)
    }

    const url = queryParams.toString()
      ? `${RESERVATIONS_ENDPOINT}?${queryParams.toString()}`
      : RESERVATIONS_ENDPOINT

    const response = await axiosClient.get(url)

    return (response.data.data || []).map((item: JsonApiReservation) => ({
      id: item.id,
      ...item.attributes
    }))
  },

  /**
   * Get single reservation by ID
   */
  async getById(id: string): Promise<InventoryReservation> {
    const response = await axiosClient.get(`${RESERVATIONS_ENDPOINT}/${id}`)

    const item = response.data.data as JsonApiReservation
    return {
      id: item.id,
      ...item.attributes
    }
  },

  /**
   * Create new reservation
   */
  async create(data: CreateReservationRequest): Promise<InventoryReservation> {
    const payload = {
      data: {
        type: 'inventory-reservations',
        attributes: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantity: data.quantity,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          expiresAt: data.expiresAt || null,
          status: 'active'
        }
      }
    }

    const response = await axiosClient.post(RESERVATIONS_ENDPOINT, payload)

    const item = response.data.data as JsonApiReservation
    return {
      id: item.id,
      ...item.attributes
    }
  },

  /**
   * Cancel reservation
   */
  async cancel(id: string): Promise<InventoryReservation> {
    const payload = {
      data: {
        type: 'inventory-reservations',
        id,
        attributes: {
          status: 'cancelled'
        }
      }
    }

    const response = await axiosClient.patch(`${RESERVATIONS_ENDPOINT}/${id}`, payload)

    const item = response.data.data as JsonApiReservation
    return {
      id: item.id,
      ...item.attributes
    }
  },

  /**
   * Fulfill reservation (when order is shipped)
   */
  async fulfill(id: string): Promise<InventoryReservation> {
    const payload = {
      data: {
        type: 'inventory-reservations',
        id,
        attributes: {
          status: 'fulfilled'
        }
      }
    }

    const response = await axiosClient.patch(`${RESERVATIONS_ENDPOINT}/${id}`, payload)

    const item = response.data.data as JsonApiReservation
    return {
      id: item.id,
      ...item.attributes
    }
  }
}
