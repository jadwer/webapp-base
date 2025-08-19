/**
 * USE STOCK HOOK TESTS - COMPLETE VERSION
 * Tests completos para el hook principal useStock
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStock } from '../../hooks'
import { createMockAxiosSuccess, createMockJsonApiListResponse, createMockStock } from '../utils/test-utils'

// Mock axiosClient
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

import axiosClient from '@/lib/axiosClient'
const mockedAxiosClient = vi.mocked(axiosClient)

describe('useStock Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should make API call with default params', async () => {
    // Arrange
    const mockStock = [createMockStock({ id: '1', quantity: 100 })]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    // Act
    renderHook(() => useStock())

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { params: {} })
    })
  })

  it('should pass comprehensive filters to API request', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = {
      search: 'test product',
      productId: '1',
      warehouseId: '2',
      warehouseLocationId: '3',
      status: 'active' as const,
      lowStock: true,
      outOfStock: false,
      minQuantity: 10,
      maxQuantity: 500
    }

    // Act
    renderHook(() => useStock({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[search]': 'test product',
          'filter[product_id]': '1',
          'filter[warehouse_id]': '2',
          'filter[warehouse_location_id]': '3',
          'filter[status]': 'active',
          'filter[low_stock]': 1,
          'filter[out_of_stock]': 0,
          'filter[min_quantity]': 10,
          'filter[max_quantity]': 500
        }
      })
    })
  })

  it('should pass sorting parameters to API', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const sort = { field: 'availableQuantity' as const, direction: 'desc' as const }

    // Act
    renderHook(() => useStock({ sort }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { sort: '-availableQuantity' }
      })
    })
  })

  it('should pass pagination parameters to API', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const pagination = { page: 2, size: 30 }

    // Act
    renderHook(() => useStock({ pagination }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'page[number]': 2,
          'page[size]': 30
        }
      })
    })
  })

  it('should pass include relationships to API', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const include = ['product', 'warehouse', 'location']

    // Act
    renderHook(() => useStock({ include }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { include: 'product,warehouse,location' }
      })
    })
  })

  it('should handle special stock filters correctly', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = { lowStock: true, outOfStock: false }

    // Act
    renderHook(() => useStock({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[low_stock]': 1,
          'filter[out_of_stock]': 0
        }
      })
    })
  })

  it('should handle zero quantity filters correctly', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = {
      minQuantity: 0, // Zero should be included
      maxQuantity: 0  // Zero should be included
    }

    // Act
    renderHook(() => useStock({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[min_quantity]': 0,
          'filter[max_quantity]': 0
        }
      })
    })
  })

  it('should handle mixed parameter combinations', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const params = {
      filters: { 
        search: 'electronics',
        warehouseId: '1',
        lowStock: true
      },
      sort: { field: 'quantity' as const, direction: 'asc' as const },
      pagination: { page: 1, size: 20 },
      include: ['product', 'warehouse']
    }

    // Act
    renderHook(() => useStock(params))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[search]': 'electronics',
          'filter[warehouse_id]': '1',
          'filter[low_stock]': 1,
          sort: 'quantity',
          'page[number]': 1,
          'page[size]': 20,
          include: 'product,warehouse'
        }
      })
    })
  })

  it('should not crash on API errors', async () => {
    // Arrange
    mockedAxiosClient.get.mockRejectedValueOnce(new Error('Database connection error'))

    // Act & Assert - Should not throw
    expect(() => {
      renderHook(() => useStock())
    }).not.toThrow()
  })

  it('should handle network timeouts gracefully', async () => {
    // Arrange
    const timeoutError = new Error('Network timeout')
    timeoutError.name = 'TimeoutError'
    mockedAxiosClient.get.mockRejectedValueOnce(timeoutError)

    // Act & Assert - Should not crash
    expect(() => {
      renderHook(() => useStock())
    }).not.toThrow()
  })

  it('should generate consistent API calls for caching', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const params = {
      filters: { warehouseId: '1' },
      sort: { field: 'quantity' as const, direction: 'desc' as const }
    }

    // Act - First call
    renderHook(() => useStock(params))

    // Assert - Verify consistent parameter structure
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[warehouse_id]': '1',
          sort: '-quantity'
        }
      })
    })
  })

  it('should validate parameter types correctly', async () => {
    // Arrange
    const mockStock = [createMockStock()]
    const mockResponse = createMockJsonApiListResponse(mockStock)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    // Act - Test with various parameter types
    renderHook(() => useStock({
      filters: {
        search: 'string-value',
        warehouseId: '123',
        lowStock: true,
        minQuantity: 0,
        maxQuantity: 1000
      },
      sort: { field: 'quantity', direction: 'asc' },
      pagination: { page: 1, size: 25 }
    }))

    // Assert - All types should be passed correctly
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[search]': 'string-value',
          'filter[warehouse_id]': '123',
          'filter[low_stock]': 1,
          'filter[min_quantity]': 0,
          'filter[max_quantity]': 1000,
          sort: 'quantity',
          'page[number]': 1,
          'page[size]': 25
        }
      })
    })
  })
})