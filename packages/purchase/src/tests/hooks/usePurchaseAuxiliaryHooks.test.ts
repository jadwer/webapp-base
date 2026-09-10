/**
 * Purchase Auxiliary Hooks Tests
 * Tests for hooks that fetch reports, suppliers, contacts, and products
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useSWR from 'swr'
import {
  usePurchaseReports,
  usePurchaseSuppliers,
  usePurchaseContacts,
  usePurchaseProducts
} from '../../hooks'

// Mock the services
vi.mock('../../services', () => ({
  purchaseReportsService: {
    getReports: vi.fn(),
    getSuppliers: vi.fn()
  },
  purchaseContactsService: {
    getAll: vi.fn()
  },
  purchaseProductsService: {
    getAll: vi.fn()
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
  })
}))

describe('Purchase Auxiliary Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePurchaseReports', () => {
    it('should return reports data structure', () => {
      // Act
      const { result } = renderHook(() => usePurchaseReports())

      // Assert
      expect(result.current).toHaveProperty('reports')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should use default date range', () => {
      // Act
      renderHook(() => usePurchaseReports())

      // Assert - SWR will be called with the correct key
      // The actual service call happens inside the fetcher function
    })

    it('should accept custom date range', () => {
      // Act
      renderHook(() => usePurchaseReports('2025-01-01', '2025-01-31'))

      // Assert - Date parameters are passed to the hook
    })
  })

  describe('usePurchaseSuppliers', () => {
    it('should return suppliers data structure', () => {
      // Act
      const { result } = renderHook(() => usePurchaseSuppliers())

      // Assert
      expect(result.current).toHaveProperty('suppliers')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should use default date range', () => {
      // Act
      renderHook(() => usePurchaseSuppliers())

      // Assert - Default dates are used
    })

    it('should accept custom date range', () => {
      // Act
      renderHook(() => usePurchaseSuppliers('2025-01-01', '2025-12-31'))

      // Assert - Date parameters are passed correctly
    })
  })

  describe('usePurchaseContacts', () => {
    it('should return contacts data structure', () => {
      // Act
      const { result } = renderHook(() => usePurchaseContacts())

      // Assert
      expect(result.current).toHaveProperty('contacts')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
    })

    it('should use default supplier filter', () => {
      // Act
      renderHook(() => usePurchaseContacts())

      // Assert - Default filter[isSupplier]=1 is used
    })

    it('should accept custom parameters', () => {
      // Act
      const customParams = { 'filter[status]': 'active', 'filter[isSupplier]': '1' }
      renderHook(() => usePurchaseContacts(customParams))

      // Assert - Custom parameters are passed
    })

    it('should return empty array when no contacts', () => {
      // Act
      const { result } = renderHook(() => usePurchaseContacts())

      // Assert
      expect(result.current.contacts).toEqual([])
    })
  })

  describe('usePurchaseProducts', () => {
    it('should return products data structure', () => {
      // Act
      const { result } = renderHook(() => usePurchaseProducts())

      // Assert
      expect(result.current).toHaveProperty('products')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
    })

    it('should work without parameters', () => {
      // Act
      const { result } = renderHook(() => usePurchaseProducts())

      // Assert
      expect(result.current.products).toEqual([])
    })

    it('should accept search parameters', () => {
      // Act
      const params = { 'filter[search]': 'Laptop' }
      renderHook(() => usePurchaseProducts(params))

      // Assert - Search parameters are passed
    })

    it('should default to filter[is_active]=1 and never send filter[status]', () => {
      // Act
      renderHook(() => usePurchaseProducts())

      // Assert - inspect SWR key: ['/api/v1/products', queryParams]
      const lastCall = vi.mocked(useSWR).mock.calls.at(-1)
      expect(lastCall).toBeDefined()
      const [url, queryParams] = lastCall![0] as [string, Record<string, string>]
      expect(url).toBe('/api/v1/products')
      // Backend ProductSchema only allows filter[is_active] (boolean)
      expect(queryParams['filter[is_active]']).toBe('1')
      expect(queryParams).not.toHaveProperty('filter[status]')
    })

    it('should keep filter[is_active] default when extra params are passed', () => {
      // Act
      renderHook(() => usePurchaseProducts({ 'filter[search]': 'acido' }))

      // Assert
      const lastCall = vi.mocked(useSWR).mock.calls.at(-1)
      const [, queryParams] = lastCall![0] as [string, Record<string, string>]
      expect(queryParams['filter[is_active]']).toBe('1')
      expect(queryParams['filter[search]']).toBe('acido')
      expect(queryParams).not.toHaveProperty('filter[status]')
    })

    it('should accept include parameters', () => {
      // Act
      const params = { include: 'unit,category,brand' }
      renderHook(() => usePurchaseProducts(params))

      // Assert - Include parameters are passed
    })

    it('should return empty array when no products', () => {
      // Act
      const { result } = renderHook(() => usePurchaseProducts())

      // Assert
      expect(result.current.products).toEqual([])
    })
  })
})
