/**
 * Commissions Module - Test Utilities
 */

import type { Commission } from '../../types'

export const createMockCommission = (overrides?: Partial<Commission>): Commission => ({
  id: '1',
  salesOrderId: 100,
  arInvoiceId: 200,
  userId: 5,
  userName: 'Juan Perez',
  contactId: 10,
  baseAmount: 1000,
  commissionPct: 10,
  commissionAmount: 100,
  status: 'earned',
  earnedAt: '2026-07-01T00:00:00Z',
  paidAt: null,
  paymentReference: null,
  ...overrides,
})

export const createMockAxiosError = (status: number, message: string, data?: Record<string, unknown>) => {
  const error = new Error(message) as Error & { response?: { status: number; data: unknown } }
  error.response = {
    status,
    data: data ?? { message },
  }
  return error
}
