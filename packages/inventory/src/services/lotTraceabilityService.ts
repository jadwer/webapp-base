/**
 * Lot Traceability Service
 *
 * API layer for batch/lot tracking and expiration monitoring.
 * Endpoints fuera de JSON:API: las filas llegan en snake_case tal como las
 * arma LotTraceabilityService del backend.
 */

import axiosClient from '../lib/axiosClient'

const LOT_TRACEABILITY_ENDPOINT = '/api/v1/lot-traceability'

interface LotAlertBase {
  batch_id: number
  batch_number: string
  lot_number: string | null
  product: { id: number; name: string | null; sku: string | null }
  warehouse: { id: number; name: string | null }
  /** YYYY-MM-DD */
  expiration_date: string
  current_quantity: number | string
}

export interface ExpiringSoonBatch extends LotAlertBase {
  days_until_expiry: number
  available_quantity: number | string
  urgency: 'critical' | 'high' | 'medium'
}

export interface ExpiredBatch extends LotAlertBase {
  days_expired: number
  total_value: number | string
  recommended_action: 'dispose' | 'quarantine'
}

export interface LotAlertSummary<T> {
  items: T[]
  count: number
}

const toSummary = <T>(body: { data?: T[]; meta?: { count?: number } } | undefined): LotAlertSummary<T> => {
  const data = body?.data
  const items = Array.isArray(data) ? data : []
  const count = body?.meta?.count
  return { items, count: typeof count === 'number' ? count : items.length }
}

export const lotTraceabilityService = {
  /**
   * Get expired batches
   */
  async getExpired(): Promise<ExpiredBatch[]> {
    return (await lotTraceabilityService.getExpiredSummary()).items
  },

  /**
   * Get batches expiring soon
   * @param days Number of days to look ahead (default 30)
   */
  async getExpiringSoon(days: number = 30): Promise<ExpiringSoonBatch[]> {
    return (await lotTraceabilityService.getExpiringSoonSummary(days)).items
  },

  /** Lotes activos con existencia que vencen en los proximos `days` dias, con meta.count */
  async getExpiringSoonSummary(days: number = 30): Promise<LotAlertSummary<ExpiringSoonBatch>> {
    const response = await axiosClient.get(`${LOT_TRACEABILITY_ENDPOINT}/expiring-soon`, {
      params: { days }
    })
    return toSummary<ExpiringSoonBatch>(response.data)
  },

  /** Lotes activos con existencia ya vencidos, con meta.count */
  async getExpiredSummary(): Promise<LotAlertSummary<ExpiredBatch>> {
    const response = await axiosClient.get(`${LOT_TRACEABILITY_ENDPOINT}/expired`)
    return toSummary<ExpiredBatch>(response.data)
  }
}
