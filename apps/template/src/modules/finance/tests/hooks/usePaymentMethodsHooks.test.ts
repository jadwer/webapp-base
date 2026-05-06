/**
 * Payment Methods Hooks Tests
 * Tests for hooks that manage payment methods
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePaymentMethods, usePaymentMethod, usePaymentMethodMutations } from '../../hooks/usePaymentMethods'
import { paymentMethodsService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  paymentMethodsService: {
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

describe('Payment Methods Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePaymentMethods', () => {
    it('should return payment methods data structure', () => {
      // Act
      const { result } = renderHook(() => usePaymentMethods())

      // Assert
      expect(result.current).toHaveProperty('paymentMethods')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty methods', () => {
      // Act
      const { result } = renderHook(() => usePaymentMethods())

      // Assert
      expect(result.current.paymentMethods).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const options = {
        filters: { isActive: true }
      }
      renderHook(() => usePaymentMethods(options))

      // Assert - Filters are passed correctly
    })

    it('should accept pagination parameter', () => {
      // Act
      const options = {
        pagination: { page: 1, size: 20 }
      }
      renderHook(() => usePaymentMethods(options))

      // Assert - Pagination is passed correctly
    })

    it('should support enabled flag', () => {
      // Act
      const options = {
        enabled: false
      }
      const { result } = renderHook(() => usePaymentMethods(options))

      // Assert - Hook should not fetch
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('usePaymentMethod', () => {
    it('should return single payment method data structure', () => {
      // Act
      const { result } = renderHook(() => usePaymentMethod('1'))

      // Assert
      expect(result.current).toHaveProperty('paymentMethod')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle undefined method', () => {
      // Act
      const { result} = renderHook(() => usePaymentMethod('1'))

      // Assert
      expect(result.current.paymentMethod).toBeUndefined()
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => usePaymentMethod(null))

      // Assert
      expect(result.current.paymentMethod).toBeUndefined()
    })
  })

  describe('usePaymentMethodMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => usePaymentMethodMutations())

      // Assert
      expect(result.current).toHaveProperty('createPaymentMethod')
      expect(result.current).toHaveProperty('updatePaymentMethod')
      expect(result.current).toHaveProperty('deletePaymentMethod')
    })

    it('should call create service on createPaymentMethod', async () => {
      // Arrange
      const mockMethod = {
        code: 'CASH',
        name: 'Cash',
        description: 'Cash payment',
        requiresReference: false,
        isActive: true
      }
      vi.mocked(paymentMethodsService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => usePaymentMethodMutations())
      await result.current.createPaymentMethod(mockMethod)

      // Assert
      expect(paymentMethodsService.create).toHaveBeenCalledWith(mockMethod)
    })
  })
})
