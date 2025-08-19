/**
 * LOCATIONS SERVICE TESTS
 * Comprehensive unit tests for locationsService following AAA pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { locationsService } from '../../services'
import { createMockAxiosSuccess, createMockAxiosError, createMockJsonApiListResponse, createMockJsonApiSingleResponse, createMockLocation } from '../utils/test-utils'

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

describe('locationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all locations successfully', async () => {
      // Arrange
      const mockLocations = [
        createMockLocation({ id: '1', name: 'Location A', code: 'LOC-A' }),
        createMockLocation({ id: '2', name: 'Location B', code: 'LOC-B' })
      ]
      const mockResponse = createMockJsonApiListResponse(mockLocations)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await locationsService.getAll()

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Location A')
    })

    it('should pass filters as query parameters', async () => {
      // Arrange
      const mockLocations = [createMockLocation()]
      const mockResponse = createMockJsonApiListResponse(mockLocations)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const filters = { warehouseId: '1', isActive: true }

      // Act
      await locationsService.getAll({ filters })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', { 
        params: { 
          'filter[warehouse_id]': '1',
          'filter[is_active]': 1
        } 
      })
    })

    it('should handle sorting parameters', async () => {
      // Arrange
      const mockLocations = [createMockLocation()]
      const mockResponse = createMockJsonApiListResponse(mockLocations)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const sort = { field: 'name' as const, direction: 'asc' as const }

      // Act
      await locationsService.getAll({ sort })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', { 
        params: { sort: 'name' } 
      })
    })

    it('should handle pagination parameters', async () => {
      // Arrange
      const mockLocations = [createMockLocation()]
      const mockResponse = createMockJsonApiListResponse(mockLocations)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const pagination = { page: 2, size: 10 }

      // Act
      await locationsService.getAll({ pagination })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', { 
        params: { 
          'page[number]': 2,
          'page[size]': 10
        } 
      })
    })

    it('should handle include parameters', async () => {
      // Arrange
      const mockLocations = [createMockLocation()]
      const mockResponse = createMockJsonApiListResponse(mockLocations)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['warehouse', 'stock']

      // Act
      await locationsService.getAll({ include })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', { 
        params: { include: 'warehouse,stock' } 
      })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const mockError = createMockAxiosError(500, 'Internal Server Error')
      mockedAxiosClient.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(locationsService.getAll()).rejects.toEqual(mockError)
    })
  })

  describe('getById', () => {
    it('should fetch location by id successfully', async () => {
      // Arrange
      const mockLocation = createMockLocation({ id: '1', name: 'Main Location' })
      const mockResponse = createMockJsonApiSingleResponse(mockLocation)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await locationsService.getById('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data.name).toBe('Main Location')
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockLocation = createMockLocation()
      const mockResponse = createMockJsonApiSingleResponse(mockLocation)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['warehouse', 'stock']

      // Act
      await locationsService.getById('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1', { 
        params: { include: 'warehouse,stock' } 
      })
    })

    it('should throw error on not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Location not found')
      mockedAxiosClient.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(locationsService.getById('999')).rejects.toEqual(mockError)
    })
  })

  describe('create', () => {
    it('should create location successfully', async () => {
      // Arrange
      const locationData = { 
        name: 'New Location',
        code: 'NEW001',
        warehouseId: '1',
        aisle: 'A',
        rack: '1',
        shelf: '2'
      }
      const mockLocation = createMockLocation(locationData)
      const mockResponse = createMockJsonApiSingleResponse(mockLocation)
      mockedAxiosClient.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const result = await locationsService.create(locationData)

      // Assert
      expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        data: {
          type: 'warehouse-locations',
          attributes: {
            name: 'New Location',
            code: 'NEW001',
            aisle: 'A',
            rack: '1',
            shelf: '2',
            warehouseId: '1'
          }
        }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data.name).toBe('New Location')
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = { name: '', code: '', warehouseId: '' }
      const mockError = createMockAxiosError(422, 'Validation failed')
      mockedAxiosClient.post.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(locationsService.create(invalidData)).rejects.toEqual(mockError)
    })
  })

  describe('update', () => {
    it('should update location successfully', async () => {
      // Arrange
      const updateData = { name: 'Updated Location', aisle: 'B' }
      const mockLocation = createMockLocation({ ...updateData, id: '1' })
      const mockResponse = createMockJsonApiSingleResponse(mockLocation)
      mockedAxiosClient.patch.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await locationsService.update('1', updateData)

      // Assert
      expect(mockedAxiosClient.patch).toHaveBeenCalledWith('/api/v1/warehouse-locations/1', {
        data: {
          type: 'warehouse-locations',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.data.name).toBe('Updated Location')
    })

    it('should throw error on location not found', async () => {
      // Arrange
      const updateData = { name: 'Updated' }
      const mockError = createMockAxiosError(404, 'Location not found')
      mockedAxiosClient.patch.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(locationsService.update('999', updateData)).rejects.toEqual(mockError)
    })
  })

  describe('delete', () => {
    it('should delete location successfully', async () => {
      // Arrange
      mockedAxiosClient.delete.mockResolvedValueOnce(createMockAxiosSuccess({}, 204))

      // Act
      await locationsService.delete('1')

      // Assert
      expect(mockedAxiosClient.delete).toHaveBeenCalledWith('/api/v1/warehouse-locations/1')
    })

    it('should throw error on foreign key constraint', async () => {
      // Arrange
      const mockError = createMockAxiosError(409, 'Cannot delete location with associated stock')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(locationsService.delete('1')).rejects.toEqual(mockError)
    })

    it('should throw error on location not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Location not found')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(locationsService.delete('999')).rejects.toEqual(mockError)
    })
  })

  describe('getStock', () => {
    it('should fetch location stock successfully', async () => {
      // Arrange
      const mockStock = [
        { id: '1', type: 'stocks', attributes: { quantity: 100, productId: '1' } },
        { id: '2', type: 'stocks', attributes: { quantity: 50, productId: '2' } }
      ]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await locationsService.getStock('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1/stock', { params: {} })
      expect(result.data).toHaveLength(2)
    })

    it('should include relationships for stock', async () => {
      // Arrange
      const mockStock = [{ id: '1', type: 'stocks', attributes: { quantity: 100 } }]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'warehouse']

      // Act
      await locationsService.getStock('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1/stock', { 
        params: { include: 'product,warehouse' } 
      })
    })
  })
})