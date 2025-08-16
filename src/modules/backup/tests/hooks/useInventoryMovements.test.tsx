/**
 * USE INVENTORY MOVEMENTS HOOK TESTS - COMPLETE VERSION
 * Tests completos para el hook principal useInventoryMovements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInventoryMovements } from '../../hooks'
import { createMockAxiosSuccess, createMockJsonApiListResponse, createMockMovement } from '../utils/test-utils'

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

describe('useInventoryMovements Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should make API call with default sort (most recent first)', async () => {
    // Arrange
    const mockMovements = [createMockMovement({ id: '1', movementType: 'entry' })]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    // Act
    renderHook(() => useInventoryMovements())

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { sort: '-movementDate' }
      })
    })
  })

  it('should pass comprehensive movement filters to API', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = {
      search: 'purchase order',
      movementType: 'entry' as const,
      status: 'completed' as const,
      warehouseId: '1',
      productId: '2',
      referenceType: 'purchase',
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
      minQuantity: 10,
      maxQuantity: 1000
    }

    // Act
    renderHook(() => useInventoryMovements({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'filter[search]': 'purchase order',
          'filter[movementType]': 'entry',
          'filter[status]': 'completed',
          'filter[warehouseId]': '1',
          'filter[productId]': '2',
          'filter[referenceType]': 'purchase',
          'filter[dateFrom]': '2025-01-01',
          'filter[dateTo]': '2025-01-31',
          'filter[minQuantity]': 10,
          'filter[maxQuantity]': 1000,
          sort: '-movementDate'
        }
      })
    })
  })

  it('should override default sort when custom sort provided', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const sort = { field: 'quantity' as const, direction: 'asc' as const }

    // Act
    renderHook(() => useInventoryMovements({ sort }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { sort: 'quantity' }
      })
    })
  })

  it('should pass pagination parameters to API', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const pagination = { page: 3, size: 50 }

    // Act
    renderHook(() => useInventoryMovements({ pagination }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'page[number]': 3,
          'page[size]': 50,
          sort: '-movementDate'
        }
      })
    })
  })

  it('should pass comprehensive include relationships to API', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const include = ['product', 'warehouse', 'location', 'user', 'destinationWarehouse', 'destinationLocation']

    // Act
    renderHook(() => useInventoryMovements({ include }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          include: 'product,warehouse,location,user,destinationWarehouse,destinationLocation',
          sort: '-movementDate'
        }
      })
    })
  })

  it('should handle different movement types correctly', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const testCases = [
      { movementType: 'entry' as const },
      { movementType: 'exit' as const },
      { movementType: 'transfer' as const },
      { movementType: 'adjustment' as const }
    ]

    for (const testCase of testCases) {
      // Reset mocks for each test case
      mockedAxiosClient.get.mockClear()
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      renderHook(() => useInventoryMovements({ filters: testCase }))

      // Assert
      await waitFor(() => {
        expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
          params: {
            'filter[movementType]': testCase.movementType,
            sort: '-movementDate'
          }
        })
      })
    }
  })

  it('should handle date range filtering correctly', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = {
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31'
    }

    // Act
    renderHook(() => useInventoryMovements({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'filter[dateFrom]': '2025-01-01',
          'filter[dateTo]': '2025-01-31',
          sort: '-movementDate'
        }
      })
    })
  })

  it('should handle quantity range filtering correctly', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = {
      minQuantity: 50,
      maxQuantity: 500
    }

    // Act
    renderHook(() => useInventoryMovements({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'filter[minQuantity]': 50,
          'filter[maxQuantity]': 500,
          sort: '-movementDate'
        }
      })
    })
  })

  it('should handle reference type filtering correctly', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const referenceTypes = ['purchase', 'sale', 'transfer', 'adjustment', 'production']

    for (const referenceType of referenceTypes) {
      // Reset mocks for each test case
      mockedAxiosClient.get.mockClear()
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      renderHook(() => useInventoryMovements({ filters: { referenceType } }))

      // Assert
      await waitFor(() => {
        expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
          params: {
            'filter[referenceType]': referenceType,
            sort: '-movementDate'
          }
        })
      })
    }
  })

  it('should handle complex parameter combinations', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const params = {
      filters: {
        search: 'inventory adjustment',
        movementType: 'adjustment' as const,
        status: 'completed' as const,
        warehouseId: '1',
        dateFrom: '2025-01-01',
        minQuantity: 1
      },
      sort: { field: 'movementDate' as const, direction: 'desc' as const },
      pagination: { page: 1, size: 25 },
      include: ['product', 'warehouse', 'user']
    }

    // Act
    renderHook(() => useInventoryMovements(params))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'filter[search]': 'inventory adjustment',
          'filter[movementType]': 'adjustment',
          'filter[status]': 'completed',
          'filter[warehouseId]': '1',
          'filter[dateFrom]': '2025-01-01',
          'filter[minQuantity]': 1,
          sort: '-movementDate',
          'page[number]': 1,
          'page[size]': 25,
          include: 'product,warehouse,user'
        }
      })
    })
  })

  it('should not crash on API errors', async () => {
    // Arrange
    mockedAxiosClient.get.mockRejectedValueOnce(new Error('Server Error'))

    // Act & Assert - Should not throw
    expect(() => {
      renderHook(() => useInventoryMovements())
    }).not.toThrow()
  })

  it('should handle validation errors gracefully', async () => {
    // Arrange
    const validationError = new Error('Invalid date range')
    validationError.name = 'ValidationError'
    mockedAxiosClient.get.mockRejectedValueOnce(validationError)

    // Act & Assert - Should not crash
    expect(() => {
      renderHook(() => useInventoryMovements({
        filters: { dateFrom: '2025-12-31', dateTo: '2025-01-01' }
      }))
    }).not.toThrow()
  })

  it('should generate consistent API calls for SWR caching', async () => {
    // Arrange
    const mockMovements = [createMockMovement()]
    const mockResponse = createMockJsonApiListResponse(mockMovements)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const params = {
      filters: { warehouseId: '1', movementType: 'entry' as const },
      sort: { field: 'movementDate' as const, direction: 'desc' as const }
    }

    // Act
    renderHook(() => useInventoryMovements(params))

    // Assert - Verify consistent parameter structure for caching
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'filter[warehouseId]': '1',
          'filter[movementType]': 'entry',
          sort: '-movementDate'
        }
      })
    })
  })
})