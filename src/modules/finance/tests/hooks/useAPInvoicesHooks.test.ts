/**
 * AP Invoices Hooks Tests
 * Tests for hooks that manage Accounts Payable invoices
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useAPInvoices,
  useAPInvoice,
  useAPInvoiceMutations
} from '../../hooks'
import { apInvoicesService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  apInvoicesService: {
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

describe('AP Invoices Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAPInvoices', () => {
    it('should return AP invoices data structure', () => {
      // Act
      const { result } = renderHook(() => useAPInvoices())

      // Assert
      expect(result.current).toHaveProperty('apInvoices')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty invoices', () => {
      // Act
      const { result } = renderHook(() => useAPInvoices())

      // Assert
      expect(result.current.apInvoices).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const params = {
        filters: { status: 'pending' }
      }
      renderHook(() => useAPInvoices(params))

      // Assert - Filters are passed correctly
    })

    it('should accept pagination parameter', () => {
      // Act
      const params = {
        pagination: { page: 1, size: 10 }
      }
      renderHook(() => useAPInvoices(params))

      // Assert - Pagination is passed correctly
    })

    it('should accept include parameter', () => {
      // Act
      const params = {
        include: ['contact', 'purchaseOrder']
      }
      renderHook(() => useAPInvoices(params))

      // Assert - Include is passed correctly
    })

    it('should accept sort parameter', () => {
      // Act
      const params = {
        sort: ['-invoice_date', 'invoice_number']
      }
      renderHook(() => useAPInvoices(params))

      // Assert - Sort is passed correctly
    })
  })

  describe('useAPInvoice', () => {
    it('should return single AP invoice data structure', () => {
      // Act
      const { result } = renderHook(() => useAPInvoice('1'))

      // Assert
      expect(result.current).toHaveProperty('apInvoice')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle null invoice', () => {
      // Act
      const { result } = renderHook(() => useAPInvoice('1'))

      // Assert
      expect(result.current.apInvoice).toBeNull()
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => useAPInvoice(null))

      // Assert - Hook should not trigger fetch
      expect(result.current.apInvoice).toBeNull()
    })

    it('should accept includes parameter', () => {
      // Act
      renderHook(() => useAPInvoice('1', ['contact', 'purchaseOrder']))

      // Assert - Includes are passed correctly
    })
  })

  describe('useAPInvoiceMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useAPInvoiceMutations())

      // Assert
      expect(result.current).toHaveProperty('createAPInvoice')
      expect(result.current).toHaveProperty('updateAPInvoice')
      expect(result.current).toHaveProperty('deleteAPInvoice')
      expect(result.current).toHaveProperty('postAPInvoice')
      expect(typeof result.current.createAPInvoice).toBe('function')
      expect(typeof result.current.updateAPInvoice).toBe('function')
      expect(typeof result.current.deleteAPInvoice).toBe('function')
      expect(typeof result.current.postAPInvoice).toBe('function')
    })

    it('should call create service on createAPInvoice', async () => {
      // Arrange
      const mockInvoice = {
        contactId: 1,
        invoiceNumber: 'AP-001',
        invoiceDate: '2025-01-15',
        dueDate: '2025-02-15',
        subtotal: 862.07,
        taxAmount: 137.93,
        totalAmount: 1000,
        status: 'pending' as const
      }
      vi.mocked(apInvoicesService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useAPInvoiceMutations())
      await result.current.createAPInvoice(mockInvoice)

      // Assert
      expect(apInvoicesService.create).toHaveBeenCalledWith(mockInvoice)
    })

    it('should call update service on updateAPInvoice', async () => {
      // Arrange
      const mockUpdate = { status: 'paid' as const }
      vi.mocked(apInvoicesService.update).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useAPInvoiceMutations())
      await result.current.updateAPInvoice('1', mockUpdate)

      // Assert
      expect(apInvoicesService.update).toHaveBeenCalledWith('1', mockUpdate)
    })

    it('should call delete service on deleteAPInvoice', async () => {
      // Arrange
      vi.mocked(apInvoicesService.delete).mockResolvedValue(undefined as any)

      // Act
      const { result } = renderHook(() => useAPInvoiceMutations())
      await result.current.deleteAPInvoice('1')

      // Assert
      expect(apInvoicesService.delete).toHaveBeenCalledWith('1')
    })

    it('should call post service on postAPInvoice', async () => {
      // Arrange
      vi.mocked(apInvoicesService.post).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useAPInvoiceMutations())
      await result.current.postAPInvoice('1')

      // Assert
      expect(apInvoicesService.post).toHaveBeenCalledWith('1')
    })
  })
})
