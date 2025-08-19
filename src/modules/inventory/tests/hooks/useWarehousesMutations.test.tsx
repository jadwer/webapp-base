/**
 * USE WAREHOUSES MUTATIONS HOOK TESTS - COMPLETE VERSION
 * Tests completos para el hook de mutaciones useWarehousesMutations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWarehousesMutations } from '../../hooks'
import { createMockAxiosSuccess, createMockAxiosError, createMockJsonApiSingleResponse, createMockWarehouse } from '../utils/test-utils'

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

describe('useWarehousesMutations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createWarehouse', () => {
    it('should create warehouse with complete data successfully', async () => {
      // Arrange
      const newWarehouseData = {
        name: 'Main Distribution Center',
        description: 'Primary warehouse for electronic components',
        address: '123 Industrial Park Ave, Tech City',
        phone: '+1-555-0123',
        email: 'warehouse@company.com',
        status: 'active' as const,
        capacity: 10000
      }
      const createdWarehouse = createMockWarehouse({ ...newWarehouseData, id: '1' })
      const mockResponse = createMockJsonApiSingleResponse(createdWarehouse)
      mockedAxiosClient.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      let createResult: any

      await act(async () => {
        createResult = await result.current.createWarehouse(newWarehouseData)
      })

      // Assert
      expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/v1/warehouses', {
        data: {
          type: 'warehouses',
          attributes: newWarehouseData
        }
      })
      expect(createResult.data).toEqual(createdWarehouse)
    })

    it('should create warehouse with minimal data successfully', async () => {
      // Arrange
      const minimalData = {
        name: 'Basic Warehouse',
        status: 'active' as const
      }
      const createdWarehouse = createMockWarehouse({ ...minimalData, id: '2' })
      const mockResponse = createMockJsonApiSingleResponse(createdWarehouse)
      mockedAxiosClient.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      let createResult: any

      await act(async () => {
        createResult = await result.current.createWarehouse(minimalData)
      })

      // Assert
      expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/v1/warehouses', {
        data: {
          type: 'warehouses',
          attributes: minimalData
        }
      })
      expect(createResult.data.name).toBe('Basic Warehouse')
    })

    it('should handle validation errors on create', async () => {
      // Arrange
      const invalidData = { name: '', status: 'active' as const }
      const mockError = createMockAxiosError(422, 'Validation failed', [
        { field: 'name', message: 'Name is required' }
      ])
      mockedAxiosClient.post.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.createWarehouse(invalidData)).rejects.toEqual(mockError)
      })
    })

    it('should handle server errors on create', async () => {
      // Arrange
      const warehouseData = { name: 'Test Warehouse', status: 'active' as const }
      const mockError = createMockAxiosError(500, 'Internal Server Error')
      mockedAxiosClient.post.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.createWarehouse(warehouseData)).rejects.toEqual(mockError)
      })
    })
  })

  describe('updateWarehouse', () => {
    it('should update warehouse with partial data successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Warehouse Name',
        description: 'Updated description',
        status: 'inactive' as const
      }
      const updatedWarehouse = createMockWarehouse({ ...updateData, id: '1' })
      const mockResponse = createMockJsonApiSingleResponse(updatedWarehouse)
      mockedAxiosClient.patch.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      let updateResult: any

      await act(async () => {
        updateResult = await result.current.updateWarehouse('1', updateData)
      })

      // Assert
      expect(mockedAxiosClient.patch).toHaveBeenCalledWith('/api/v1/warehouses/1', {
        data: {
          type: 'warehouses',
          id: '1',
          attributes: updateData
        }
      })
      expect(updateResult.data).toEqual(updatedWarehouse)
    })

    it('should update warehouse with single field successfully', async () => {
      // Arrange
      const updateData = { status: 'maintenance' as const }
      const updatedWarehouse = createMockWarehouse({ ...updateData, id: '1' })
      const mockResponse = createMockJsonApiSingleResponse(updatedWarehouse)
      mockedAxiosClient.patch.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      await act(async () => {
        await result.current.updateWarehouse('1', updateData)
      })

      // Assert
      expect(mockedAxiosClient.patch).toHaveBeenCalledWith('/api/v1/warehouses/1', {
        data: {
          type: 'warehouses',
          id: '1',
          attributes: updateData
        }
      })
    })

    it('should handle warehouse not found on update', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' }
      const mockError = createMockAxiosError(404, 'Warehouse not found')
      mockedAxiosClient.patch.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.updateWarehouse('999', updateData)).rejects.toEqual(mockError)
      })
    })

    it('should handle validation errors on update', async () => {
      // Arrange
      const invalidData = { name: '' }
      const mockError = createMockAxiosError(422, 'Validation failed', [
        { field: 'name', message: 'Name cannot be empty' }
      ])
      mockedAxiosClient.patch.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.updateWarehouse('1', invalidData)).rejects.toEqual(mockError)
      })
    })
  })

  describe('deleteWarehouse', () => {
    it('should delete warehouse successfully', async () => {
      // Arrange
      mockedAxiosClient.delete.mockResolvedValueOnce(createMockAxiosSuccess({}, 204))

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      await act(async () => {
        await result.current.deleteWarehouse('1')
      })

      // Assert
      expect(mockedAxiosClient.delete).toHaveBeenCalledWith('/api/v1/warehouses/1')
    })

    it('should handle FK constraint error on delete', async () => {
      // Arrange
      const mockError = createMockAxiosError(409, 'Cannot delete warehouse with associated locations', [
        { code: 'FOREIGN_KEY_CONSTRAINT', message: 'Warehouse has associated locations' }
      ])
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.deleteWarehouse('1')).rejects.toEqual(mockError)
      })
    })

    it('should handle warehouse not found on delete', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Warehouse not found')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.deleteWarehouse('999')).rejects.toEqual(mockError)
      })
    })

    it('should handle business rule violations on delete', async () => {
      // Arrange
      const mockError = createMockAxiosError(400, 'Cannot delete active warehouse with pending operations')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.deleteWarehouse('1')).rejects.toEqual(mockError)
      })
    })
  })

  describe('loading states', () => {
    it('should manage loading state during create operation', async () => {
      // Arrange
      const warehouseData = { name: 'Loading Test Warehouse', status: 'active' as const }
      const createdWarehouse = createMockWarehouse(warehouseData)
      const mockResponse = createMockJsonApiSingleResponse(createdWarehouse)
      
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockedAxiosClient.post.mockReturnValueOnce(delayedPromise)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      let createPromise: Promise<any>
      act(() => {
        createPromise = result.current.createWarehouse(warehouseData)
      })

      // Wait for loading state to be set to true
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve the delayed promise
      act(() => {
        resolvePromise!(createMockAxiosSuccess(mockResponse, 201))
      })

      await act(async () => {
        await createPromise!
      })

      // Wait for loading state to be set to false after completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should manage loading state during update operation', async () => {
      // Arrange
      const updateData = { name: 'Loading Test Update' }
      const updatedWarehouse = createMockWarehouse(updateData)
      const mockResponse = createMockJsonApiSingleResponse(updatedWarehouse)
      
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockedAxiosClient.patch.mockReturnValueOnce(delayedPromise)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      let updatePromise: Promise<any>
      act(() => {
        updatePromise = result.current.updateWarehouse('1', updateData)
      })

      // Wait for loading state to be set to true
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve the promise
      act(() => {
        resolvePromise!(createMockAxiosSuccess(mockResponse))
      })

      await act(async () => {
        await updatePromise!
      })

      // Wait for loading state to be set to false after completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should manage loading state during delete operation', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockedAxiosClient.delete.mockReturnValueOnce(delayedPromise)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      let deletePromise: Promise<any>
      act(() => {
        deletePromise = result.current.deleteWarehouse('1')
      })

      // Wait for loading state to be set to true
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve the promise
      act(() => {
        resolvePromise!(createMockAxiosSuccess({}, 204))
      })

      await act(async () => {
        await deletePromise!
      })

      // Wait for loading state to be set to false after completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network unreachable')
      networkError.name = 'NetworkError'
      mockedAxiosClient.post.mockRejectedValueOnce(networkError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.createWarehouse({ name: 'Test', status: 'active' })).rejects.toEqual(networkError)
      })
    })

    it('should handle timeout errors gracefully', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      mockedAxiosClient.patch.mockRejectedValueOnce(timeoutError)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await act(async () => {
        await expect(result.current.updateWarehouse('1', { name: 'Test' })).rejects.toEqual(timeoutError)
      })
    })
  })
})