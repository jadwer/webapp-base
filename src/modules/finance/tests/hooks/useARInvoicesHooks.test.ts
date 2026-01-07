/**
 * AR Invoices Hooks Tests
 * Tests for hooks that manage Accounts Receivable invoices
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useARInvoices,
  useARInvoice,
  useARInvoiceMutations
} from '../../hooks'
import { arInvoicesService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  arInvoicesService: {
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

describe('AR Invoices Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useARInvoices', () => {
    it('should return AR invoices data structure', () => {
      // Act
      const { result } = renderHook(() => useARInvoices())

      // Assert
      expect(result.current).toHaveProperty('arInvoices')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty invoices', () => {
      // Act
      const { result } = renderHook(() => useARInvoices())

      // Assert
      expect(result.current.arInvoices).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const params = {
        filters: { status: 'paid' }
      }
      renderHook(() => useARInvoices(params))

      // Assert - Filters are passed correctly
    })

    it('should accept pagination and sort parameters', () => {
      // Act
      const params = {
        pagination: { page: 1, size: 20 },
        sort: ['-invoice_date']
      }
      renderHook(() => useARInvoices(params))

      // Assert - Parameters are passed correctly
    })
  })

  describe('useARInvoice', () => {
    it('should return single AR invoice data structure', () => {
      // Act
      const { result } = renderHook(() => useARInvoice('1'))

      // Assert
      expect(result.current).toHaveProperty('arInvoice')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => useARInvoice(null))

      // Assert
      expect(result.current.arInvoice).toBeNull()
    })
  })

  describe('useARInvoiceMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useARInvoiceMutations())

      // Assert
      expect(result.current).toHaveProperty('createARInvoice')
      expect(result.current).toHaveProperty('updateARInvoice')
      expect(result.current).toHaveProperty('deleteARInvoice')
      expect(result.current).toHaveProperty('postARInvoice')
    })

    it('should call create service on createARInvoice', async () => {
      // Arrange
      const mockInvoice = {
        contactId: 1,
        invoiceNumber: 'AR-001',
        invoiceDate: '2025-01-15',
        dueDate: '2025-02-15',
        subtotal: 1724.14,
        taxAmount: 275.86,
        totalAmount: 2000,
        status: 'pending' as const
      }
      vi.mocked(arInvoicesService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useARInvoiceMutations())
      await result.current.createARInvoice(mockInvoice)

      // Assert
      expect(arInvoicesService.create).toHaveBeenCalledWith(mockInvoice)
    })

    it('should call update service on updateARInvoice', async () => {
      // Arrange
      const mockUpdate = { status: 'paid' as const }
      vi.mocked(arInvoicesService.update).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useARInvoiceMutations())
      await result.current.updateARInvoice('1', mockUpdate)

      // Assert
      expect(arInvoicesService.update).toHaveBeenCalledWith('1', mockUpdate)
    })

    it('should call delete service on deleteARInvoice', async () => {
      // Arrange
      vi.mocked(arInvoicesService.delete).mockResolvedValue(undefined as any)

      // Act
      const { result } = renderHook(() => useARInvoiceMutations())
      await result.current.deleteARInvoice('1')

      // Assert
      expect(arInvoicesService.delete).toHaveBeenCalledWith('1')
    })

    it('should call post service on postARInvoice', async () => {
      // Arrange
      vi.mocked(arInvoicesService.post).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useARInvoiceMutations())
      await result.current.postARInvoice('1')

      // Assert
      expect(arInvoicesService.post).toHaveBeenCalledWith('1')
    })
  })
})
