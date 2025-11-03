/**
 * Sales Auxiliary Hooks Tests
 * Tests for hooks that fetch contacts, products, and combined data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSalesContacts, useSalesProducts, useSalesOrderWithItems } from '../../hooks'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    // Return different mock data based on the key
    if (!key) {
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn()
      }
    }

    if (typeof key === 'string' && key.includes('/contacts')) {
      return {
        data: {
          data: [
            { id: '1', attributes: { name: 'Contact A', is_customer: true } },
            { id: '2', attributes: { name: 'Contact B', is_customer: true } }
          ]
        },
        error: undefined,
        isLoading: false,
        mutate: vi.fn()
      }
    }

    if (typeof key === 'string' && key.includes('/products')) {
      return {
        data: {
          data: [
            { id: '1', attributes: { name: 'Product A', price: 100 } },
            { id: '2', attributes: { name: 'Product B', price: 200 } }
          ]
        },
        error: undefined,
        isLoading: false,
        mutate: vi.fn()
      }
    }

    if (typeof key === 'string' && key.includes('/sales-orders/')) {
      return {
        data: { id: '1', orderNumber: 'SO-001', totalAmount: 1000 },
        error: undefined,
        isLoading: false,
        mutate: vi.fn()
      }
    }

    if (typeof key === 'string' && key.includes('/sales-order-items')) {
      return {
        data: { data: [{ id: '1', quantity: 5, unitPrice: 100 }] },
        error: undefined,
        isLoading: false,
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

// Mock services
vi.mock('../../services', () => ({
  salesContactsService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', attributes: { name: 'Contact A' } }
      ]
    })
  },
  salesProductsService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', attributes: { name: 'Product A' } }
      ]
    })
  },
  salesService: {
    orders: {
      getById: vi.fn()
    },
    items: {
      getAll: vi.fn()
    }
  }
}))

describe('Sales Auxiliary Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSalesContacts', () => {
    it('should return contacts data structure', () => {
      // Act
      const { result } = renderHook(() => useSalesContacts())

      // Assert
      expect(result.current).toHaveProperty('contacts')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current.contacts).toBeInstanceOf(Array)
    })

    it('should return empty array when no contacts', () => {
      // Act
      const { result } = renderHook(() => useSalesContacts({ 'filter[status]': 'inactive' }))

      // Assert
      expect(result.current.contacts).toEqual([])
    })

    it('should accept filter parameters', () => {
      // Act
      const { result } = renderHook(() =>
        useSalesContacts({ 'filter[isCustomer]': '1' })
      )

      // Assert
      expect(result.current).toHaveProperty('contacts')
    })
  })

  describe('useSalesProducts', () => {
    it('should return products data structure', () => {
      // Act
      const { result } = renderHook(() => useSalesProducts())

      // Assert
      expect(result.current).toHaveProperty('products')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current.products).toBeInstanceOf(Array)
    })

    it('should return empty array when no products', () => {
      // Act
      const { result } = renderHook(() => useSalesProducts({ 'filter[status]': 'inactive' }))

      // Assert
      expect(result.current.products).toEqual([])
    })

    it('should accept filter parameters', () => {
      // Act
      const { result } = renderHook(() =>
        useSalesProducts({ 'filter[search]': 'laptop' })
      )

      // Assert
      expect(result.current).toHaveProperty('products')
    })
  })

  describe('useSalesOrderWithItems', () => {
    it('should return combined order and items data', () => {
      // Act
      const { result } = renderHook(() => useSalesOrderWithItems('1'))

      // Assert
      expect(result.current).toHaveProperty('salesOrder')
      expect(result.current).toHaveProperty('salesOrderItems')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutateOrder')
      expect(result.current).toHaveProperty('mutateItems')
      expect(result.current).toHaveProperty('mutateAll')
    })

    it('should handle loading states', () => {
      // Act
      const { result } = renderHook(() => useSalesOrderWithItems('1'))

      // Assert
      expect(typeof result.current.isLoading).toBe('boolean')
    })

    it('should provide mutateAll function', () => {
      // Act
      const { result } = renderHook(() => useSalesOrderWithItems('1'))

      // Assert
      expect(typeof result.current.mutateAll).toBe('function')
    })
  })
})
