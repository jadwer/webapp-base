/**
 * Lot Traceability Service
 *
 * API layer for batch/lot tracking and expiration monitoring
 */

import axiosClient from '@/lib/axiosClient'

const LOT_TRACEABILITY_ENDPOINT = '/api/v1/lot-traceability'

export interface ExpiredBatch {
  id: string
  productId: number
  productName: string
  warehouseId: number
  warehouseName: string
  batchNumber: string
  quantity: number
  expirationDate: string
  daysExpired: number
}

export interface ExpiringSoonBatch {
  id: string
  productId: number
  productName: string
  warehouseId: number
  warehouseName: string
  batchNumber: string
  quantity: number
  expirationDate: string
  daysUntilExpiration: number
}

export const lotTraceabilityService = {
  /**
   * Get expired batches
   */
  async getExpired(): Promise<ExpiredBatch[]> {
    const response = await axiosClient.get(`${LOT_TRACEABILITY_ENDPOINT}/expired`)
    return response.data.data || response.data || []
  },

  /**
   * Get batches expiring soon
   * @param days Number of days to look ahead (default 30)
   */
  async getExpiringSoon(days: number = 30): Promise<ExpiringSoonBatch[]> {
    const response = await axiosClient.get(`${LOT_TRACEABILITY_ENDPOINT}/expiring-soon`, {
      params: { days }
    })
    return response.data.data || response.data || []
  }
}
