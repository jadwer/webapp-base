/**
 * Commissions Module - Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axiosClient as axios } from '@lwm/auth'
import { commissionsService } from '../../services'
import { createMockAxiosError } from '../utils/test-utils'

vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return {
    ...actual,
    axiosClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('commissionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAll', () => {
    it('fetches commissions via JSON:API index with filters', async () => {
      const jsonApiResponse = {
        data: [
          {
            id: '1',
            type: 'commissions',
            attributes: {
              salesOrderId: 100,
              arInvoiceId: 200,
              userId: 5,
              contactId: 10,
              baseAmount: 1000,
              commissionPct: 10,
              commissionAmount: 100,
              status: 'earned',
              earnedAt: '2026-07-01T00:00:00Z',
              paidAt: null,
              paymentReference: null,
            },
          },
        ],
        meta: { page: { currentPage: 1, perPage: 25, total: 1, lastPage: 1 } },
      }
      vi.mocked(axios.get).mockResolvedValueOnce({ data: jsonApiResponse })

      const result = await commissionsService.getAll({ status: 'earned' })

      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/commissions',
        expect.objectContaining({ params: expect.objectContaining({ 'filter[status]': 'earned' }) })
      )
      expect(result.commissions).toHaveLength(1)
      expect(result.commissions[0].commissionAmount).toBe(100)
      expect(result.meta?.page.total).toBe(1)
    })

    it('propagates errors from the API', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(createMockAxiosError(500, 'Server Error'))

      await expect(commissionsService.getAll()).rejects.toThrow()
    })
  })

  describe('getByPeriod', () => {
    it('maps start/end/user_id/status query params and flat response', async () => {
      const response = {
        data: [
          {
            id: 1,
            sales_order_id: 100,
            ar_invoice_id: 200,
            user_id: 5,
            user_name: 'Juan Perez',
            contact_id: 10,
            base_amount: 1000,
            commission_pct: 10,
            commission_amount: 100,
            status: 'earned',
            earned_at: '2026-07-01T00:00:00Z',
            paid_at: null,
            payment_reference: null,
          },
        ],
        meta: { count: 1, total_commission_amount: 100 },
      }
      vi.mocked(axios.get).mockResolvedValueOnce({ data: response })

      const result = await commissionsService.getByPeriod({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        userId: 5,
        status: 'earned',
      })

      expect(axios.get).toHaveBeenCalledWith('/api/v1/commissions/by-period', {
        params: { start: '2026-07-01', end: '2026-07-31', user_id: '5', status: 'earned' },
      })
      expect(result.commissions).toHaveLength(1)
      expect(result.commissions[0].userName).toBe('Juan Perez')
      expect(result.count).toBe(1)
      expect(result.totalCommissionAmount).toBe(100)
    })
  })

  describe('getByEmployee', () => {
    it('maps the aggregate rows per salesperson', async () => {
      const response = {
        data: [
          {
            user_id: 5,
            user_name: 'Juan Perez',
            user_email: 'juan@example.com',
            commissions_count: 3,
            total_base_amount: 3000,
            total_commission_amount: 300,
            earned_amount: 100,
            paid_amount: 200,
          },
        ],
      }
      vi.mocked(axios.get).mockResolvedValueOnce({ data: response })

      const result = await commissionsService.getByEmployee({ startDate: '2026-07-01', endDate: '2026-07-31' })

      expect(axios.get).toHaveBeenCalledWith('/api/v1/commissions/by-employee', {
        params: { start: '2026-07-01', end: '2026-07-31' },
      })
      expect(result.employees).toHaveLength(1)
      expect(result.employees[0].userName).toBe('Juan Perez')
      expect(result.employees[0].totalCommissionAmount).toBe(300)
    })
  })

  describe('markPaid', () => {
    it('posts payment_reference and returns the flat commission', async () => {
      const response = {
        data: {
          id: 1,
          sales_order_id: 100,
          ar_invoice_id: 200,
          user_id: 5,
          contact_id: 10,
          base_amount: 1000,
          commission_pct: 10,
          commission_amount: 100,
          status: 'paid',
          earned_at: '2026-07-01T00:00:00Z',
          paid_at: '2026-07-05T00:00:00Z',
          payment_reference: 'SPEI-001',
        },
        message: 'Commission marked as paid',
      }
      vi.mocked(axios.post).mockResolvedValueOnce({ data: response })

      const result = await commissionsService.markPaid('1', 'SPEI-001')

      expect(axios.post).toHaveBeenCalledWith('/api/v1/commissions/1/mark-paid', {
        payment_reference: 'SPEI-001',
      })
      expect(result.status).toBe('paid')
      expect(result.paymentReference).toBe('SPEI-001')
    })
  })

  describe('payBatch', () => {
    it('posts numeric ids and payment_reference, returns paid commissions', async () => {
      const response = {
        data: [
          {
            id: 1,
            sales_order_id: 100,
            ar_invoice_id: 200,
            user_id: 5,
            contact_id: 10,
            base_amount: 1000,
            commission_pct: 10,
            commission_amount: 100,
            status: 'paid',
            earned_at: '2026-07-01T00:00:00Z',
            paid_at: '2026-07-05T00:00:00Z',
            payment_reference: 'SPEI-002',
          },
        ],
        message: 'Commissions marked as paid',
      }
      vi.mocked(axios.post).mockResolvedValueOnce({ data: response })

      const result = await commissionsService.payBatch({ ids: ['1'], paymentReference: 'SPEI-002' })

      expect(axios.post).toHaveBeenCalledWith('/api/v1/commissions/pay-batch', {
        ids: [1],
        payment_reference: 'SPEI-002',
      })
      expect(result.commissions).toHaveLength(1)
      expect(result.message).toBe('Commissions marked as paid')
    })

    it('propagates a 422 when the batch is not fully earned', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(
        createMockAxiosError(422, 'Batch aborted', { error: 'Batch aborted, commissions not in earned status: #2 (paid)' })
      )

      await expect(commissionsService.payBatch({ ids: ['1', '2'], paymentReference: 'X' })).rejects.toThrow()
    })
  })
})
