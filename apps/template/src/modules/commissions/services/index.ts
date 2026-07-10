/**
 * Commissions Module - Services
 *
 * Talks to Modules/Commissions in api-base:
 * - JSON:API `commissions` resource (index/show, read-only)
 * - Custom endpoints for reports and payout (flat JSON, snake_case in/out)
 */

import { axiosClient as axios } from '@lwm/auth'
import type {
  Commission,
  CommissionListFilters,
  CommissionListResult,
  CommissionByPeriodFilters,
  CommissionByPeriodResult,
  CommissionByEmployeeFilters,
  CommissionByEmployeeResult,
  CommissionEmployeeAggregate,
  PayBatchPayload,
  PayBatchResult,
} from '../types'

const BASE_URL = '/api/v1/commissions'

// ============================================================================
// JSON:API TRANSFORMERS (index/show resource)
// ============================================================================

interface JsonApiResourceObject {
  id: string
  type: string
  attributes: Record<string, unknown>
}

function transformJsonApiCommission(resource: JsonApiResourceObject): Commission {
  const a = resource.attributes

  return {
    id: resource.id,
    salesOrderId: a.salesOrderId as number,
    arInvoiceId: (a.arInvoiceId as number) ?? null,
    userId: (a.userId as number) ?? null,
    contactId: (a.contactId as number) ?? null,
    baseAmount: Number(a.baseAmount ?? 0),
    commissionPct: Number(a.commissionPct ?? 0),
    commissionAmount: Number(a.commissionAmount ?? 0),
    status: a.status as Commission['status'],
    earnedAt: (a.earnedAt as string) ?? null,
    paidAt: (a.paidAt as string) ?? null,
    paymentReference: (a.paymentReference as string) ?? null,
    createdAt: a.createdAt as string | undefined,
    updatedAt: a.updatedAt as string | undefined,
  }
}

/**
 * Flat (non JSON:API) commission transform, used by the custom endpoints
 * (by-period, mark-paid, pay-batch), which respond with snake_case keys.
 */
function transformFlatCommission(row: Record<string, unknown>): Commission {
  return {
    id: String(row.id),
    salesOrderId: row.sales_order_id as number,
    arInvoiceId: (row.ar_invoice_id as number) ?? null,
    userId: (row.user_id as number) ?? null,
    userName: (row.user_name as string) ?? null,
    contactId: (row.contact_id as number) ?? null,
    baseAmount: Number(row.base_amount ?? 0),
    commissionPct: Number(row.commission_pct ?? 0),
    commissionAmount: Number(row.commission_amount ?? 0),
    status: row.status as Commission['status'],
    earnedAt: (row.earned_at as string) ?? null,
    paidAt: (row.paid_at as string) ?? null,
    paymentReference: (row.payment_reference as string) ?? null,
  }
}

// ============================================================================
// SERVICE
// ============================================================================

export const commissionsService = {
  /**
   * GET /api/v1/commissions (JSON:API index, read-only)
   */
  async getAll(filters: CommissionListFilters = {}): Promise<CommissionListResult> {
    const params: Record<string, string> = {}

    if (filters.status) params['filter[status]'] = filters.status
    if (filters.userId) params['filter[userId]'] = String(filters.userId)
    if (filters.contactId) params['filter[contactId]'] = String(filters.contactId)
    if (filters.salesOrderId) params['filter[salesOrderId]'] = String(filters.salesOrderId)
    if (filters.pageNumber) params['page[number]'] = String(filters.pageNumber)
    params['page[size]'] = String(filters.pageSize ?? 25)
    params.sort = '-createdAt'

    const response = await axios.get(BASE_URL, { params })
    const data = (response.data.data as JsonApiResourceObject[]) ?? []
    const meta = response.data.meta?.page as
      | { currentPage: number; perPage: number; total: number; lastPage: number }
      | undefined

    return {
      commissions: data.map(transformJsonApiCommission),
      meta: meta ? { page: meta } : null,
    }
  },

  /**
   * GET /api/v1/commissions/{id} (JSON:API show, read-only)
   */
  async getById(id: string): Promise<Commission> {
    const response = await axios.get(`${BASE_URL}/${id}`)
    return transformJsonApiCommission(response.data.data as JsonApiResourceObject)
  },

  /**
   * GET /api/v1/commissions/by-period?start&end&user_id&status
   */
  async getByPeriod(filters: CommissionByPeriodFilters = {}): Promise<CommissionByPeriodResult> {
    const params: Record<string, string> = {}
    if (filters.startDate) params.start = filters.startDate
    if (filters.endDate) params.end = filters.endDate
    if (filters.userId) params.user_id = String(filters.userId)
    if (filters.status) params.status = filters.status

    const response = await axios.get(`${BASE_URL}/by-period`, { params })
    const rows = (response.data.data as Record<string, unknown>[]) ?? []
    const meta = response.data.meta as { count?: number; total_commission_amount?: number } | undefined

    return {
      commissions: rows.map(transformFlatCommission),
      count: meta?.count ?? rows.length,
      totalCommissionAmount: Number(meta?.total_commission_amount ?? 0),
    }
  },

  /**
   * GET /api/v1/commissions/by-employee?start&end
   */
  async getByEmployee(filters: CommissionByEmployeeFilters = {}): Promise<CommissionByEmployeeResult> {
    const params: Record<string, string> = {}
    if (filters.startDate) params.start = filters.startDate
    if (filters.endDate) params.end = filters.endDate

    const response = await axios.get(`${BASE_URL}/by-employee`, { params })
    const rows = (response.data.data as Record<string, unknown>[]) ?? []

    const employees: CommissionEmployeeAggregate[] = rows.map((row) => ({
      userId: row.user_id as number,
      userName: (row.user_name as string) ?? null,
      userEmail: (row.user_email as string) ?? null,
      commissionsCount: Number(row.commissions_count ?? 0),
      totalBaseAmount: Number(row.total_base_amount ?? 0),
      totalCommissionAmount: Number(row.total_commission_amount ?? 0),
      earnedAmount: Number(row.earned_amount ?? 0),
      paidAmount: Number(row.paid_amount ?? 0),
    }))

    return { employees }
  },

  /**
   * POST /api/v1/commissions/{id}/mark-paid {payment_reference}
   */
  async markPaid(id: string, paymentReference: string): Promise<Commission> {
    const response = await axios.post(`${BASE_URL}/${id}/mark-paid`, {
      payment_reference: paymentReference,
    })
    return transformFlatCommission(response.data.data as Record<string, unknown>)
  },

  /**
   * POST /api/v1/commissions/pay-batch {ids[], payment_reference}
   *
   * Transactional on the backend: if any commission in the batch is not
   * "earned", nothing is updated and a 422 is returned.
   */
  async payBatch(payload: PayBatchPayload): Promise<PayBatchResult> {
    const response = await axios.post(`${BASE_URL}/pay-batch`, {
      ids: payload.ids.map((id) => Number(id)),
      payment_reference: payload.paymentReference,
    })
    const rows = (response.data.data as Record<string, unknown>[]) ?? []

    return {
      commissions: rows.map(transformFlatCommission),
      message: response.data.message as string,
    }
  },
}
