/**
 * USE WAREHOUSES HOOK TESTS - SIMPLIFIED
 * Tests básicos para verificar que el hook hace las llamadas correctas a la API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWarehouses } from '../../hooks'
import { createMockAxiosSuccess, createMockJsonApiListResponse, createMockWarehouse } from '../utils/test-utils'

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

describe('useWarehouses - API Calls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should make API call with default params', async () => {
    // Arrange
    const mockWarehouses = [createMockWarehouse({ id: '1', name: 'Warehouse 1' })]
    const mockResponse = createMockJsonApiListResponse(mockWarehouses)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    // Act
    renderHook(() => useWarehouses())

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses', { params: {} })
    })
  })

  it('should pass search filter to API request', async () => {
    // Arrange
    const mockWarehouses = [createMockWarehouse()]
    const mockResponse = createMockJsonApiListResponse(mockWarehouses)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const filters = { search: 'test warehouse' }

    // Act
    renderHook(() => useWarehouses({ filters }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { 'search': 'test warehouse' }
      })
    })
  })

  it('should pass sorting parameters to API', async () => {
    // Arrange
    const mockWarehouses = [createMockWarehouse()]
    const mockResponse = createMockJsonApiListResponse(mockWarehouses)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const sort = { field: 'name' as const, direction: 'desc' as const }

    // Act
    renderHook(() => useWarehouses({ sort }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { sort: '-name' }
      })
    })
  })

  it('should pass pagination parameters to API', async () => {
    // Arrange
    const mockWarehouses = [createMockWarehouse()]
    const mockResponse = createMockJsonApiListResponse(mockWarehouses)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const pagination = { page: 2, size: 25 }

    // Act
    renderHook(() => useWarehouses({ pagination }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: {
          'page[number]': 2,
          'page[size]': 25
        }
      })
    })
  })

  it('should pass include relationships to API', async () => {
    // Arrange
    const mockWarehouses = [createMockWarehouse()]
    const mockResponse = createMockJsonApiListResponse(mockWarehouses)
    mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

    const include = ['locations', 'stock']

    // Act
    renderHook(() => useWarehouses({ include }))

    // Assert
    await waitFor(() => {
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { include: 'locations,stock' }
      })
    })
  })

  it('should not crash on API errors', async () => {
    // Arrange
    mockedAxiosClient.get.mockRejectedValueOnce(new Error('Network Error'))

    // Act & Assert - Should not throw
    expect(() => {
      renderHook(() => useWarehouses())
    }).not.toThrow()
  })
})