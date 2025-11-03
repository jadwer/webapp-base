/**
 * usePaymentMethods Hooks Tests
 * Tests for Payment Methods SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  usePaymentMethods,
  usePaymentMethod,
  useActivePaymentMethods,
  usePaymentMethodsRequiringReference,
  usePaymentMethodMutations,
} from '../../hooks/usePaymentMethods'
import { paymentMethodsService } from '../../services'
import { createMockPaymentMethod } from '../utils/test-utils'

// Mock the payment methods service
vi.mock('../../services', () => ({
  paymentMethodsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (key === null) {
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      }
    }

    if (fetcher) {
      const data = fetcher()
      return Promise.resolve(data).then(result => ({
        data: result,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      }))
    }

    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    }
  }),
}))

describe('usePaymentMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePaymentMethods', () => {
    it('should fetch and return payment methods', async () => {
      // Arrange
      const methods = [
        createMockPaymentMethod({ id: '1', name: 'Bank Transfer' }),
        createMockPaymentMethod({ id: '2', name: 'Cash', code: 'CASH' }),
      ]
      const apiResponse = { data: methods, meta: {}, links: {} }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentMethods())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.methods).toHaveLength(2)
      expect(paymentMethodsService.getAll).toHaveBeenCalled()
    })

    it('should fetch payment methods with filters', async () => {
      // Arrange
      const methods = [createMockPaymentMethod({ isActive: true })]
      const apiResponse = { data: methods, meta: {}, links: {} }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethods({ filters: { isActive: true } })
      )

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.methods).toHaveLength(1)
      expect(result.current.methods[0].isActive).toBe(true)
    })

    it('should fetch payment methods with pagination', async () => {
      // Arrange
      const methods = [createMockPaymentMethod()]
      const apiResponse = {
        data: methods,
        meta: { page: { currentPage: 1, perPage: 10 } },
        links: {},
      }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethods({ pagination: { page: 1, size: 10 } })
      )

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.meta?.page?.currentPage).toBe(1)
    })

    it('should respect enabled flag', async () => {
      // Arrange
      const methods = [createMockPaymentMethod()]
      const apiResponse = { data: methods, meta: {}, links: {} }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentMethods({ enabled: false })
      )

      // Assert
      expect(paymentMethodsService.getAll).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })

    it('should return empty array when no data', async () => {
      // Arrange
      const apiResponse = { data: [], meta: {}, links: {} }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentMethods())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.methods).toEqual([])
    })
  })

  describe('usePaymentMethod', () => {
    it('should fetch and return single payment method', async () => {
      // Arrange
      const method = createMockPaymentMethod()
      const apiResponse = { data: method }
      vi.mocked(paymentMethodsService.getById).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentMethod('1'))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.method).toEqual(method)
      expect(paymentMethodsService.getById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is null', async () => {
      // Act
      const { result } = renderHook(() => usePaymentMethod(null))

      // Assert
      expect(paymentMethodsService.getById).not.toHaveBeenCalled()
      expect(result.current.method).toBeUndefined()
    })
  })

  describe('useActivePaymentMethods', () => {
    it('should fetch only active payment methods', async () => {
      // Arrange
      const methods = [
        createMockPaymentMethod({ isActive: true, name: 'Active Method' }),
      ]
      const apiResponse = { data: methods, meta: {}, links: {} }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => useActivePaymentMethods())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.activeMethods).toHaveLength(1)
      expect(result.current.activeMethods[0].isActive).toBe(true)
    })

    it('should filter out inactive methods', async () => {
      // Arrange
      const methods = [
        createMockPaymentMethod({ isActive: true, name: 'Active' }),
        createMockPaymentMethod({ isActive: false, name: 'Inactive' }),
      ]
      const apiResponse = {
        data: methods.filter(m => m.isActive),
        meta: {},
        links: {},
      }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => useActivePaymentMethods())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.activeMethods).toHaveLength(1)
      expect(result.current.activeMethods[0].name).toBe('Active')
    })
  })

  describe('usePaymentMethodsRequiringReference', () => {
    it('should fetch payment methods requiring reference', async () => {
      // Arrange
      const methods = [
        createMockPaymentMethod({
          requiresReference: true,
          name: 'Bank Transfer',
        }),
      ]
      const apiResponse = { data: methods, meta: {}, links: {} }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentMethodsRequiringReference())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.methodsRequiringReference).toHaveLength(1)
      expect(result.current.methodsRequiringReference[0].requiresReference).toBe(true)
    })

    it('should filter methods by requiresReference flag', async () => {
      // Arrange
      const methods = [
        createMockPaymentMethod({
          requiresReference: true,
          name: 'Wire Transfer',
        }),
        createMockPaymentMethod({
          requiresReference: false,
          name: 'Cash',
        }),
      ]
      const apiResponse = {
        data: methods.filter(m => m.requiresReference),
        meta: {},
        links: {},
      }
      vi.mocked(paymentMethodsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentMethodsRequiringReference())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.methodsRequiringReference).toHaveLength(1)
      expect(result.current.methodsRequiringReference[0].name).toBe('Wire Transfer')
    })
  })

  describe('usePaymentMethodMutations', () => {
    it('should create payment method', async () => {
      // Arrange
      const formData = {
        name: 'Credit Card',
        code: 'CARD',
        description: 'Credit or debit card payment',
        requiresReference: true,
        isActive: true,
      }
      const createdMethod = createMockPaymentMethod(formData)
      vi.mocked(paymentMethodsService.create).mockResolvedValue({
        data: createdMethod,
      })

      // Act
      const { result } = renderHook(() => usePaymentMethodMutations())
      const created = await result.current.createMethod(formData)

      // Assert
      expect(paymentMethodsService.create).toHaveBeenCalledWith(formData)
      expect(created.data.name).toBe('Credit Card')
    })

    it('should update payment method', async () => {
      // Arrange
      const updateData = { name: 'Wire Transfer Updated' }
      const updatedMethod = createMockPaymentMethod({ name: 'Wire Transfer Updated' })
      vi.mocked(paymentMethodsService.update).mockResolvedValue({
        data: updatedMethod,
      })

      // Act
      const { result } = renderHook(() => usePaymentMethodMutations())
      const updated = await result.current.updateMethod('1', updateData)

      // Assert
      expect(paymentMethodsService.update).toHaveBeenCalledWith('1', updateData)
      expect(updated.data.name).toBe('Wire Transfer Updated')
    })

    it('should delete payment method', async () => {
      // Arrange
      vi.mocked(paymentMethodsService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => usePaymentMethodMutations())
      await result.current.deleteMethod('1')

      // Assert
      expect(paymentMethodsService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle errors on create', async () => {
      // Arrange
      const formData = {
        name: 'Invalid',
        code: '',
        requiresReference: false,
        isActive: true,
      }
      vi.mocked(paymentMethodsService.create).mockRejectedValue(
        new Error('Code is required')
      )

      // Act & Assert
      const { result } = renderHook(() => usePaymentMethodMutations())
      await expect(result.current.createMethod(formData)).rejects.toThrow(
        'Code is required'
      )
    })

    it('should handle duplicate code error', async () => {
      // Arrange
      const formData = {
        name: 'Duplicate',
        code: 'TRANSFER',
        requiresReference: false,
        isActive: true,
      }
      vi.mocked(paymentMethodsService.create).mockRejectedValue(
        new Error('Code already exists')
      )

      // Act & Assert
      const { result } = renderHook(() => usePaymentMethodMutations())
      await expect(result.current.createMethod(formData)).rejects.toThrow(
        'Code already exists'
      )
    })

    it('should handle deactivation', async () => {
      // Arrange
      const updateData = { isActive: false }
      const deactivatedMethod = createMockPaymentMethod({ isActive: false })
      vi.mocked(paymentMethodsService.update).mockResolvedValue({
        data: deactivatedMethod,
      })

      // Act
      const { result } = renderHook(() => usePaymentMethodMutations())
      const updated = await result.current.updateMethod('1', updateData)

      // Assert
      expect(updated.data.isActive).toBe(false)
    })
  })
})
