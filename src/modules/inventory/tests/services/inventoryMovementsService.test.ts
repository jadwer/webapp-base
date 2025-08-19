/**
 * INVENTORY MOVEMENTS SERVICE TESTS
 * Comprehensive unit tests for inventoryMovementsService following AAA pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { inventoryMovementsService } from '../../services'
import { createMockAxiosSuccess, createMockAxiosError, createMockJsonApiListResponse, createMockJsonApiSingleResponse, createMockMovement } from '../utils/test-utils'

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

describe('inventoryMovementsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all movements successfully', async () => {
      // Arrange
      const mockMovements = [
        createMockMovement({ id: '1', movementType: 'entry', quantity: 50 }),
        createMockMovement({ id: '2', movementType: 'exit', quantity: 25 })
      ]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.getAll()

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { params: { sort: '-movementDate' } })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].movementType).toBe('entry')
    })

    it('should pass filters as query parameters', async () => {
      // Arrange
      const mockMovements = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const filters = { 
        movementType: 'entry',
        status: 'completed',
        warehouseId: '1',
        productId: '1',
        referenceType: 'purchase',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31'
      }

      // Act
      await inventoryMovementsService.getAll({ filters })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { 
          'filter[movement_type]': 'entry',
          'filter[status]': 'completed',
          'filter[warehouse_id]': '1',
          'filter[product_id]': '1',
          'filter[reference_type]': 'purchase',
          'filter[dateFrom]': '2025-01-01',
          'filter[dateTo]': '2025-01-31',
          sort: '-movementDate'
        } 
      })
    })

    it('should handle sorting parameters', async () => {
      // Arrange
      const mockMovements = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const sort = { field: 'movementDate' as const, direction: 'desc' as const }

      // Act
      await inventoryMovementsService.getAll({ sort })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { sort: '-movementDate' } 
      })
    })

    it('should handle pagination parameters', async () => {
      // Arrange
      const mockMovements = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const pagination = { page: 3, size: 25 }

      // Act
      await inventoryMovementsService.getAll({ pagination })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { 
          'page[number]': 3,
          'page[size]': 25,
          sort: '-movementDate'
        } 
      })
    })

    it('should handle include parameters', async () => {
      // Arrange
      const mockMovements = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'warehouse', 'location', 'user']

      // Act
      await inventoryMovementsService.getAll({ include })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { include: 'product,warehouse,location,user', sort: '-movementDate' } 
      })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const mockError = createMockAxiosError(500, 'Internal Server Error')
      mockedAxiosClient.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(inventoryMovementsService.getAll()).rejects.toEqual(mockError)
    })
  })

  describe('getById', () => {
    it('should fetch movement by id successfully', async () => {
      // Arrange
      const mockMovement = createMockMovement({ id: '1', movementType: 'entry', quantity: 100 })
      const mockResponse = createMockJsonApiSingleResponse(mockMovement)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.getById('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements/1', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data.movementType).toBe('entry')
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockMovement = createMockMovement()
      const mockResponse = createMockJsonApiSingleResponse(mockMovement)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'warehouse', 'location', 'destinationWarehouse', 'destinationLocation', 'user']

      // Act
      await inventoryMovementsService.getById('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements/1', { 
        params: { include: 'product,warehouse,location,destinationWarehouse,destinationLocation,user' } 
      })
    })

    it('should throw error on not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Movement not found')
      mockedAxiosClient.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(inventoryMovementsService.getById('999')).rejects.toEqual(mockError)
    })
  })

  describe('create', () => {
    it('should create entry movement successfully', async () => {
      // Arrange
      const movementData = { 
        movementType: 'entry' as const,
        referenceType: 'purchase',
        referenceId: 123,
        quantity: 50,
        unitCost: 15.50,
        movementDate: '2025-01-14T10:00:00Z',
        description: 'Purchase order entry',
        status: 'completed',
        productId: '1',
        warehouseId: '1',
        locationId: '1'
      }
      const mockMovement = createMockMovement(movementData)
      const mockResponse = createMockJsonApiSingleResponse(mockMovement)
      mockedAxiosClient.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const result = await inventoryMovementsService.create(movementData)

      // Assert
      expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        data: {
          type: 'inventory-movements',
          attributes: {
            productId: 1,
            warehouseId: 1,
            locationId: 1,
            movementType: 'entry',
            referenceType: 'purchase',
            referenceId: 123,
            quantity: 50,
            unitCost: 15.50,
            movementDate: '2025-01-14T10:00:00Z',
            description: 'Purchase order entry',
            status: 'completed',
            userId: 1
          }
        }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data.movementType).toBe('entry')
    })

    it('should create transfer movement successfully', async () => {
      // Arrange
      const movementData = { 
        movementType: 'transfer' as const,
        referenceType: 'transfer',
        quantity: 25,
        movementDate: '2025-01-14T10:00:00Z',
        description: 'Inter-warehouse transfer',
        status: 'completed',
        productId: '1',
        warehouseId: '1',
        locationId: '1',
        destinationWarehouseId: '2',
        destinationLocationId: '2'
      }
      const mockMovement = createMockMovement(movementData)
      const mockResponse = createMockJsonApiSingleResponse(mockMovement)
      mockedAxiosClient.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const result = await inventoryMovementsService.create(movementData)

      // Assert
      expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        data: {
          type: 'inventory-movements',
          attributes: {
            productId: 1,
            warehouseId: 1,
            locationId: 1,
            destinationWarehouseId: 2,
            destinationLocationId: 2,
            movementType: 'transfer',
            referenceType: 'transfer',
            quantity: 25,
            movementDate: '2025-01-14T10:00:00Z',
            description: 'Inter-warehouse transfer',
            status: 'completed',
            userId: 1
          }
        }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data.destinationWarehouseId).toBe('2')
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = { movementType: 'entry' as const, quantity: 0, productId: '' }
      const mockError = createMockAxiosError(422, 'Validation failed')
      mockedAxiosClient.post.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(inventoryMovementsService.create(invalidData)).rejects.toEqual(mockError)
    })
  })

  describe('update', () => {
    it('should update movement successfully', async () => {
      // Arrange
      const updateData = { 
        description: 'Updated description',
        status: 'completed',
        unitCost: 16.00
      }
      const mockMovement = createMockMovement({ ...updateData, id: '1' })
      const mockResponse = createMockJsonApiSingleResponse(mockMovement)
      mockedAxiosClient.patch.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.update('1', updateData)

      // Assert
      expect(mockedAxiosClient.patch).toHaveBeenCalledWith('/api/v1/inventory-movements/1', {
        data: {
          type: 'inventory-movements',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.data.description).toBe('Updated description')
    })

    it('should throw error on movement not found', async () => {
      // Arrange
      const updateData = { description: 'Updated' }
      const mockError = createMockAxiosError(404, 'Movement not found')
      mockedAxiosClient.patch.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(inventoryMovementsService.update('999', updateData)).rejects.toEqual(mockError)
    })
  })

  describe('delete', () => {
    it('should delete movement successfully', async () => {
      // Arrange
      mockedAxiosClient.delete.mockResolvedValueOnce(createMockAxiosSuccess({}, 204))

      // Act
      await inventoryMovementsService.delete('1')

      // Assert
      expect(mockedAxiosClient.delete).toHaveBeenCalledWith('/api/v1/inventory-movements/1')
    })

    it('should throw error on movement not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Movement not found')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(inventoryMovementsService.delete('999')).rejects.toEqual(mockError)
    })

    it('should throw error on business rule violation', async () => {
      // Arrange
      const mockError = createMockAxiosError(409, 'Cannot delete completed movement')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(inventoryMovementsService.delete('1')).rejects.toEqual(mockError)
    })
  })

  describe('getByProduct', () => {
    it('should fetch movements by product successfully', async () => {
      // Arrange
      const mockMovements = [
        createMockMovement({ id: '1', productId: '1', movementType: 'entry', quantity: 50 }),
        createMockMovement({ id: '2', productId: '1', movementType: 'exit', quantity: 25 })
      ]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.getByProduct('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { params: { 'filter[product_id]': '1', sort: '-movementDate' } })
      expect(result.data).toHaveLength(2)
    })

    it('should include relationships for product movements', async () => {
      // Arrange
      const mockMovements = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['warehouse', 'location']

      // Act
      await inventoryMovementsService.getByProduct('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: {
          'filter[product_id]': '1',
          sort: '-movementDate',
          include: 'warehouse,location'
        }
      })
    })
  })

  describe('getByWarehouse', () => {
    it('should fetch movements by warehouse successfully', async () => {
      // Arrange
      const mockMovements = [
        createMockMovement({ id: '1', warehouseId: '1', movementType: 'entry' }),
        createMockMovement({ id: '2', warehouseId: '1', movementType: 'transfer' })
      ]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.getByWarehouse('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { params: { 'filter[warehouse_id]': '1', sort: '-movementDate' } })
      expect(result.data).toHaveLength(2)
    })

    it('should include relationships for warehouse movements', async () => {
      // Arrange
      const mockMovements = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockMovements)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'location']

      // Act
      await inventoryMovementsService.getByWarehouse('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: {
          'filter[warehouse_id]': '1',
          sort: '-movementDate',
          include: 'product,location'
        }
      })
    })
  })

  describe('getEntries', () => {
    it('should fetch entry movements successfully', async () => {
      // Arrange
      const mockEntries = [
        createMockMovement({ id: '1', movementType: 'entry', quantity: 100 }),
        createMockMovement({ id: '2', movementType: 'entry', quantity: 75 })
      ]
      const mockResponse = createMockJsonApiListResponse(mockEntries)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.getEntries()

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { 'filter[movement_type]': 'entry', sort: '-movementDate' }
      })
      expect(result.data).toHaveLength(2)
      expect(result.data.every(movement => movement.movementType === 'entry')).toBe(true)
    })

    it('should include relationships for entries', async () => {
      // Arrange
      const mockEntries = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockEntries)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['warehouse', 'product']

      // Act
      await inventoryMovementsService.getEntries(include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { 
          'filter[movement_type]': 'entry',
          sort: '-movementDate',
          include: 'warehouse,product'
        }
      })
    })
  })

  describe('getExits', () => {
    it('should fetch exit movements successfully', async () => {
      // Arrange
      const mockExits = [
        createMockMovement({ id: '1', movementType: 'exit', quantity: 50 }),
        createMockMovement({ id: '2', movementType: 'exit', quantity: 30 })
      ]
      const mockResponse = createMockJsonApiListResponse(mockExits)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await inventoryMovementsService.getExits()

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { 'filter[movement_type]': 'exit', sort: '-movementDate' }
      })
      expect(result.data).toHaveLength(2)
      expect(result.data.every(movement => movement.movementType === 'exit')).toBe(true)
    })

    it('should include relationships for exits', async () => {
      // Arrange
      const mockExits = [createMockMovement()]
      const mockResponse = createMockJsonApiListResponse(mockExits)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'warehouse', 'location']

      // Act
      await inventoryMovementsService.getExits(include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/inventory-movements', { 
        params: { 
          'filter[movement_type]': 'exit',
          sort: '-movementDate',
          include: 'product,warehouse,location'
        }
      })
    })
  })
})