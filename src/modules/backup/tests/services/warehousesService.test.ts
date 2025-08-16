/**
 * WAREHOUSES SERVICE - UNIT TESTS
 * Tests para warehousesService con mocks completos
 * Patrón: AAA (Arrange, Act, Assert)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { warehousesService } from '../../services/warehousesService'
import axiosClient from '@/lib/axiosClient'
import { 
  createMockWarehouse, 
  createMockJsonApiResponse,
  createMockJsonApiListResponse,
  createMockAxiosSuccess,
  createMockAxiosError
} from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockedAxios = vi.mocked(axiosClient)

describe('warehousesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all warehouses successfully', async () => {
      // Arrange
      const mockWarehouses = [
        createMockWarehouse({ id: '1', name: 'Warehouse 1' }),
        createMockWarehouse({ id: '2', name: 'Warehouse 2' })
      ]
      const mockResponse = createMockJsonApiListResponse(mockWarehouses)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await warehousesService.getAll()

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Warehouse 1')
    })

    it('should pass filters as query parameters', async () => {
      // Arrange
      const filters = { 
        search: 'test',
        warehouseType: 'main',
        isActive: true,
        city: 'Madrid'
      }
      const mockResponse = createMockJsonApiListResponse([])
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getAll({ filters })

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: {
          'search': 'test',
          'filter[warehouseType]': 'main',
          'filter[isActive]': true,
          'filter[city]': 'Madrid'
        }
      })
    })

    it('should handle sorting parameters', async () => {
      // Arrange
      const sort = { field: 'name', direction: 'desc' as const }
      const mockResponse = createMockJsonApiListResponse([])
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getAll({ sort })

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: {
          sort: '-name'
        }
      })
    })

    it('should handle pagination parameters', async () => {
      // Arrange
      const pagination = { page: 2, size: 10 }
      const mockResponse = createMockJsonApiListResponse([])
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getAll({ pagination })

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: {
          'page[number]': 2,
          'page[size]': 10
        }
      })
    })

    it('should handle include parameters', async () => {
      // Arrange
      const include = ['locations', 'stock']
      const mockResponse = createMockJsonApiListResponse([])
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getAll({ include })

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: {
          include: 'locations,stock'
        }
      })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Internal Server Error')
      mockedAxios.get.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(warehousesService.getAll()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getById', () => {
    it('should fetch warehouse by id successfully', async () => {
      // Arrange
      const mockWarehouse = createMockWarehouse({ id: '1', name: 'Test Warehouse' })
      const mockResponse = createMockJsonApiResponse(mockWarehouse)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await warehousesService.getById('1')

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses/1', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data.id).toBe('1')
      expect(result.data.name).toBe('Test Warehouse')
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const include = ['locations', 'stock']
      const mockWarehouse = createMockWarehouse()
      const mockResponse = createMockJsonApiResponse(mockWarehouse)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getById('1', include)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses/1', {
        params: { include: 'locations,stock' }
      })
    })

    it('should throw error on not found', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Warehouse not found')
      mockedAxios.get.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(warehousesService.getById('999')).rejects.toThrow('Warehouse not found')
    })
  })

  describe('create', () => {
    it('should create warehouse successfully', async () => {
      // Arrange
      const createData = {
        name: 'New Warehouse',
        slug: 'new-warehouse',
        code: 'WH-002',
        warehouseType: 'secondary' as const,
        isActive: true
      }
      const mockWarehouse = createMockWarehouse(createData)
      const mockResponse = createMockJsonApiResponse(mockWarehouse)
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await warehousesService.create(createData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/warehouses', {
        data: {
          type: 'warehouses',
          attributes: createData
        }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data.name).toBe('New Warehouse')
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = {
        name: '',
        code: '',
        warehouseType: 'invalid' as any,
        isActive: true
      }
      const error = createMockAxiosError(422, 'Validation failed')
      mockedAxios.post.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(warehousesService.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update warehouse successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Warehouse',
        description: 'Updated description'
      }
      const mockWarehouse = createMockWarehouse({ ...updateData, id: '1' })
      const mockResponse = createMockJsonApiResponse(mockWarehouse)
      mockedAxios.patch.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await warehousesService.update('1', updateData)

      // Assert
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/v1/warehouses/1', {
        data: {
          type: 'warehouses',
          id: '1',
          attributes: updateData
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on warehouse not found', async () => {
      // Arrange
      const updateData = { name: 'Updated' }
      const error = createMockAxiosError(404, 'Warehouse not found')
      mockedAxios.patch.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(warehousesService.update('999', updateData)).rejects.toThrow('Warehouse not found')
    })
  })

  describe('delete', () => {
    it('should delete warehouse successfully', async () => {
      // Arrange
      mockedAxios.delete.mockResolvedValueOnce(createMockAxiosSuccess(null))

      // Act
      await warehousesService.delete('1')

      // Assert
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/v1/warehouses/1')
    })

    it('should throw error on foreign key constraint', async () => {
      // Arrange
      const error = createMockAxiosError(409, 'Foreign key constraint violation')
      mockedAxios.delete.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(warehousesService.delete('1')).rejects.toThrow('Foreign key constraint violation')
    })

    it('should throw error on warehouse not found', async () => {
      // Arrange
      const error = createMockAxiosError(404, 'Warehouse not found')
      mockedAxios.delete.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(warehousesService.delete('999')).rejects.toThrow('Warehouse not found')
    })
  })

  describe('getLocations', () => {
    it('should fetch warehouse locations successfully', async () => {
      // Arrange
      const mockLocations = [
        { id: '1', name: 'Location 1', warehouseId: '1' },
        { id: '2', name: 'Location 2', warehouseId: '1' }
      ]
      const mockResponse = createMockJsonApiListResponse(mockLocations)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await warehousesService.getLocations('1')

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/locations', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('should include relationships for locations', async () => {
      // Arrange
      const include = ['stock']
      const mockResponse = createMockJsonApiListResponse([])
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getLocations('1', include)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/locations', {
        params: { include: 'stock' }
      })
    })
  })

  describe('getStock', () => {
    it('should fetch warehouse stock successfully', async () => {
      // Arrange
      const mockStock = [
        { id: '1', quantity: 100, warehouseId: '1' },
        { id: '2', quantity: 200, warehouseId: '1' }
      ]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await warehousesService.getStock('1')

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/stock', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('should include relationships for stock', async () => {
      // Arrange
      const include = ['product', 'location']
      const mockResponse = createMockJsonApiListResponse([])
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await warehousesService.getStock('1', include)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/stock', {
        params: { include: 'product,location' }
      })
    })
  })
})