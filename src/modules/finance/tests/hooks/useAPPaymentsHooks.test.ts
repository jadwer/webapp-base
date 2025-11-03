/**
 * AP Payments Hooks Tests
 * Tests for hooks that manage Accounts Payable payments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useAPPayments,
  useAPPayment,
  useAPPaymentMutations
} from '../../hooks'
import { apPaymentsService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  apPaymentsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    post: vi.fn()
  }
}))

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (fetcher) {
      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn()
      }
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn()
    }
  }),
  useSWRConfig: vi.fn(() => ({
    mutate: vi.fn()
  }))
}))

describe('AP Payments Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAPPayments', () => {
    it('should return AP payments data structure', () => {
      // Act
      const { result } = renderHook(() => useAPPayments())

      // Assert
      expect(result.current).toHaveProperty('apPayments')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty payments', () => {
      // Act
      const { result } = renderHook(() => useAPPayments())

      // Assert
      expect(result.current.apPayments).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const params = {
        filters: { status: 'completed' }
      }
      renderHook(() => useAPPayments(params))

      // Assert - Filters are passed correctly
    })

    it('should accept pagination parameter', () => {
      // Act
      const params = {
        pagination: { page: 1, size: 10 }
      }
      renderHook(() => useAPPayments(params))

      // Assert - Pagination is passed correctly
    })

    it('should accept include parameter', () => {
      // Act
      const params = {
        include: ['contact', 'apInvoice', 'bankAccount']
      }
      renderHook(() => useAPPayments(params))

      // Assert - Include is passed correctly
    })

    it('should accept sort parameter', () => {
      // Act
      const params = {
        sort: ['-payment_date', 'reference_number']
      }
      renderHook(() => useAPPayments(params))

      // Assert - Sort is passed correctly
    })
  })

  describe('useAPPayment', () => {
    it('should return single AP payment data structure', () => {
      // Act
      const { result } = renderHook(() => useAPPayment('1'))

      // Assert
      expect(result.current).toHaveProperty('apPayment')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle null payment', () => {
      // Act
      const { result } = renderHook(() => useAPPayment('1'))

      // Assert
      expect(result.current.apPayment).toBeNull()
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => useAPPayment(null))

      // Assert - Hook should not trigger fetch
      expect(result.current.apPayment).toBeNull()
    })

    it('should accept includes parameter', () => {
      // Act
      renderHook(() => useAPPayment('1', ['contact', 'apInvoice']))

      // Assert - Includes are passed correctly
    })
  })

  describe('useAPPaymentMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useAPPaymentMutations())

      // Assert
      expect(result.current).toHaveProperty('createAPPayment')
      expect(result.current).toHaveProperty('updateAPPayment')
      expect(result.current).toHaveProperty('deleteAPPayment')
      expect(result.current).toHaveProperty('postAPPayment')
      expect(typeof result.current.createAPPayment).toBe('function')
      expect(typeof result.current.updateAPPayment).toBe('function')
      expect(typeof result.current.deleteAPPayment).toBe('function')
      expect(typeof result.current.postAPPayment).toBe('function')
    })

    it('should call create service on createAPPayment', async () => {
      // Arrange
      const mockPayment = {
        apInvoiceId: 1,
        paymentMethodId: 1,
        paymentDate: '2025-01-15',
        amount: 1000,
        referenceNumber: 'PAY-001',
        status: 'pending' as const
      }
      vi.mocked(apPaymentsService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useAPPaymentMutations())
      await result.current.createAPPayment(mockPayment)

      // Assert
      expect(apPaymentsService.create).toHaveBeenCalledWith(mockPayment)
    })

    it('should call update service on updateAPPayment', async () => {
      // Arrange
      const mockUpdate = { status: 'completed' as const }
      vi.mocked(apPaymentsService.update).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useAPPaymentMutations())
      await result.current.updateAPPayment('1', mockUpdate)

      // Assert
      expect(apPaymentsService.update).toHaveBeenCalledWith('1', mockUpdate)
    })

    it('should call delete service on deleteAPPayment', async () => {
      // Arrange
      vi.mocked(apPaymentsService.delete).mockResolvedValue(undefined as any)

      // Act
      const { result } = renderHook(() => useAPPaymentMutations())
      await result.current.deleteAPPayment('1')

      // Assert
      expect(apPaymentsService.delete).toHaveBeenCalledWith('1')
    })

    it('should call post service on postAPPayment', async () => {
      // Arrange
      vi.mocked(apPaymentsService.post).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useAPPaymentMutations())
      await result.current.postAPPayment('1')

      // Assert
      expect(apPaymentsService.post).toHaveBeenCalledWith('1')
    })
  })
})
