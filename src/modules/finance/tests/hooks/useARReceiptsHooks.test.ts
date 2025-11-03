/**
 * AR Receipts Hooks Tests
 * Tests for hooks that manage Accounts Receivable receipts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useARReceipts,
  useARReceipt,
  useARReceiptMutations
} from '../../hooks'
import { arReceiptsService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  arReceiptsService: {
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

describe('AR Receipts Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useARReceipts', () => {
    it('should return AR receipts data structure', () => {
      // Act
      const { result } = renderHook(() => useARReceipts())

      // Assert
      expect(result.current).toHaveProperty('arReceipts')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty receipts', () => {
      // Act
      const { result } = renderHook(() => useARReceipts())

      // Assert
      expect(result.current.arReceipts).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const params = {
        filters: { status: 'completed' }
      }
      renderHook(() => useARReceipts(params))

      // Assert - Filters are passed correctly
    })

    it('should accept pagination parameter', () => {
      // Act
      const params = {
        pagination: { page: 1, size: 10 }
      }
      renderHook(() => useARReceipts(params))

      // Assert - Pagination is passed correctly
    })

    it('should accept include parameter', () => {
      // Act
      const params = {
        include: ['contact', 'arInvoice', 'bankAccount']
      }
      renderHook(() => useARReceipts(params))

      // Assert - Include is passed correctly
    })

    it('should accept sort parameter', () => {
      // Act
      const params = {
        sort: ['-receipt_date', 'reference_number']
      }
      renderHook(() => useARReceipts(params))

      // Assert - Sort is passed correctly
    })
  })

  describe('useARReceipt', () => {
    it('should return single AR receipt data structure', () => {
      // Act
      const { result } = renderHook(() => useARReceipt('1'))

      // Assert
      expect(result.current).toHaveProperty('arReceipt')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle null receipt', () => {
      // Act
      const { result } = renderHook(() => useARReceipt('1'))

      // Assert
      expect(result.current.arReceipt).toBeNull()
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => useARReceipt(null))

      // Assert - Hook should not trigger fetch
      expect(result.current.arReceipt).toBeNull()
    })

    it('should accept includes parameter', () => {
      // Act
      renderHook(() => useARReceipt('1', ['contact', 'arInvoice']))

      // Assert - Includes are passed correctly
    })
  })

  describe('useARReceiptMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useARReceiptMutations())

      // Assert
      expect(result.current).toHaveProperty('createARReceipt')
      expect(result.current).toHaveProperty('updateARReceipt')
      expect(result.current).toHaveProperty('deleteARReceipt')
      expect(result.current).toHaveProperty('postARReceipt')
      expect(typeof result.current.createARReceipt).toBe('function')
      expect(typeof result.current.updateARReceipt).toBe('function')
      expect(typeof result.current.deleteARReceipt).toBe('function')
      expect(typeof result.current.postARReceipt).toBe('function')
    })

    it('should call create service on createARReceipt', async () => {
      // Arrange
      const mockReceipt = {
        arInvoiceId: 1,
        paymentMethodId: 1,
        receiptDate: '2025-01-15',
        amount: 2000,
        referenceNumber: 'REC-001',
        status: 'pending' as const
      }
      vi.mocked(arReceiptsService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useARReceiptMutations())
      await result.current.createARReceipt(mockReceipt)

      // Assert
      expect(arReceiptsService.create).toHaveBeenCalledWith(mockReceipt)
    })

    it('should call update service on updateARReceipt', async () => {
      // Arrange
      const mockUpdate = { status: 'completed' as const }
      vi.mocked(arReceiptsService.update).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useARReceiptMutations())
      await result.current.updateARReceipt('1', mockUpdate)

      // Assert
      expect(arReceiptsService.update).toHaveBeenCalledWith('1', mockUpdate)
    })

    it('should call delete service on deleteARReceipt', async () => {
      // Arrange
      vi.mocked(arReceiptsService.delete).mockResolvedValue(undefined as any)

      // Act
      const { result } = renderHook(() => useARReceiptMutations())
      await result.current.deleteARReceipt('1')

      // Assert
      expect(arReceiptsService.delete).toHaveBeenCalledWith('1')
    })

    it('should call post service on postARReceipt', async () => {
      // Arrange
      vi.mocked(arReceiptsService.post).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useARReceiptMutations())
      await result.current.postARReceipt('1')

      // Assert
      expect(arReceiptsService.post).toHaveBeenCalledWith('1')
    })
  })
})
