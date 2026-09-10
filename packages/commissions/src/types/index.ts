/**
 * Commissions Module - TypeScript Types
 *
 * Backend contracts (Modules/Commissions in api-base):
 * - JSON:API: GET /api/v1/commissions (index/show, read-only)
 * - Custom:   GET  /api/v1/commissions/by-period
 *             GET  /api/v1/commissions/by-employee
 *             POST /api/v1/commissions/{id}/mark-paid
 *             POST /api/v1/commissions/pay-batch
 *
 * Lifecycle: pending -> earned (AR invoice fully paid) -> paid (payout)
 *            pending/earned -> cancelled (order cancelled)
 * commission_pct is frozen at row creation; later pct changes never
 * recalculate existing rows.
 */

export type CommissionStatus = 'pending' | 'earned' | 'paid' | 'cancelled'

export interface CommissionStatusConfigEntry {
  label: string
  badgeClass: string
  icon: string
}

export const COMMISSION_STATUS_CONFIG: Record<CommissionStatus, CommissionStatusConfigEntry> = {
  pending: { label: 'Pendiente', badgeClass: 'bg-secondary', icon: 'bi-hourglass-split' },
  earned: { label: 'Ganada', badgeClass: 'bg-info text-dark', icon: 'bi-check-circle' },
  paid: { label: 'Pagada', badgeClass: 'bg-success', icon: 'bi-cash-stack' },
  cancelled: { label: 'Cancelada', badgeClass: 'bg-danger', icon: 'bi-x-circle' },
}

/**
 * Flat commission row as returned by both the JSON:API resource
 * (already transformed camelCase) and the custom by-period endpoint.
 */
export interface Commission {
  id: string
  salesOrderId: number
  arInvoiceId: number | null
  userId: number | null
  userName?: string | null
  contactId: number | null
  baseAmount: number
  commissionPct: number
  commissionAmount: number
  status: CommissionStatus
  earnedAt: string | null
  paidAt: string | null
  paymentReference: string | null
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// FILTERS
// ============================================================================

export interface CommissionListFilters {
  status?: CommissionStatus
  userId?: number
  contactId?: number
  salesOrderId?: number
  pageNumber?: number
  pageSize?: number
}

export interface CommissionByPeriodFilters {
  startDate?: string
  endDate?: string
  userId?: number
  status?: CommissionStatus
}

export interface CommissionByEmployeeFilters {
  startDate?: string
  endDate?: string
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface CommissionListResult {
  commissions: Commission[]
  meta: { page: { currentPage: number; perPage: number; total: number; lastPage: number } } | null
}

export interface CommissionByPeriodResult {
  commissions: Commission[]
  count: number
  totalCommissionAmount: number
}

export interface CommissionEmployeeAggregate {
  userId: number
  userName: string | null
  userEmail: string | null
  commissionsCount: number
  totalBaseAmount: number
  totalCommissionAmount: number
  earnedAmount: number
  paidAmount: number
}

export interface CommissionByEmployeeResult {
  employees: CommissionEmployeeAggregate[]
}

export interface MarkPaidPayload {
  paymentReference: string
}

export interface PayBatchPayload {
  ids: string[]
  paymentReference: string
}

export interface PayBatchResult {
  commissions: Commission[]
  message: string
}

// ============================================================================
// APP SETTINGS (grupo "commissions")
// ============================================================================

export interface CommissionsSettings {
  enabled: boolean
  defaultPct: number
  basis: string
  payoutPeriod: string
}
