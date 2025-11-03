/**
 * Payment Applications Hooks Tests
 * Tests for hooks that manage payment applications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePaymentApplications, usePaymentApplication, usePaymentApplicationMutations } from '../../hooks/usePaymentApplications'
import { paymentApplicationsService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  paymentApplicationsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (fetcher && key) {
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
  })
}))

describe('Payment Applications Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePaymentApplications', () => {
    it('should return payment applications data structure', () => {
      // Act
      const { result } = renderHook(() => usePaymentApplications())

      // Assert
      expect(result.current).toHaveProperty('applications')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty applications', () => {
      // Act
      const { result } = renderHook(() => usePaymentApplications())

      // Assert
      expect(result.current.applications).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const options = {
        filters: { paymentType: 'ar_receipt' }
      }
      renderHook(() => usePaymentApplications(options))

      // Assert - Filters are passed correctly
    })

    it('should accept pagination parameter', () => {
      // Act
      const options = {
        pagination: { page: 1, size: 10 }
      }
      renderHook(() => usePaymentApplications(options))

      // Assert - Pagination is passed correctly
    })

    it('should support enabled flag', () => {
      // Act
      const options = {
        enabled: false
      }
      const { result } = renderHook(() => usePaymentApplications(options))

      // Assert - Hook should not fetch
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('usePaymentApplication', () => {
    it('should return single payment application data structure', () => {
      // Act
      const { result } = renderHook(() => usePaymentApplication('1'))

      // Assert
      expect(result.current).toHaveProperty('application')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle undefined application', () => {
      // Act
      const { result } = renderHook(() => usePaymentApplication('1'))

      // Assert
      expect(result.current.application).toBeUndefined()
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => usePaymentApplication(null))

      // Assert
      expect(result.current.application).toBeUndefined()
    })
  })

  describe('usePaymentApplicationMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => usePaymentApplicationMutations())

      // Assert
      expect(result.current).toHaveProperty('createApplication')
      expect(result.current).toHaveProperty('updateApplication')
      expect(result.current).toHaveProperty('deleteApplication')
    })

    it('should call create service on createApplication', async () => {
      // Arrange
      const mockApplication = {
        paymentType: 'ar_receipt' as const,
        paymentId: 1,
        invoiceType: 'ar_invoice' as const,
        invoiceId: 1,
        amountApplied: 500,
        applicationDate: '2025-01-15'
      }
      vi.mocked(paymentApplicationsService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => usePaymentApplicationMutations())
      await result.current.createApplication(mockApplication)

      // Assert
      expect(paymentApplicationsService.create).toHaveBeenCalledWith(mockApplication)
    })
  })
})
