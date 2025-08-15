/**
 * STOCK SERVICE TESTS
 * Comprehensive unit tests for stockService following AAA pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { stockService } from '../../services'
import { createMockAxiosSuccess, createMockAxiosError, createMockJsonApiListResponse, createMockJsonApiSingleResponse, createMockStock } from '../utils/test-utils'

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

describe('stockService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all stock successfully', async () => {
      // Arrange
      const mockStock = [
        createMockStock({ id: '1', quantity: 100, productId: '1' }),
        createMockStock({ id: '2', quantity: 50, productId: '2' })
      ]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await stockService.getAll()

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].quantity).toBe(100)
    })

    it('should pass filters as query parameters', async () => {
      // Arrange
      const mockStock = [createMockStock()]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const filters = { warehouseId: '1', status: 'active', lowStock: true }

      // Act
      await stockService.getAll({ filters })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { 
        params: { 
          'filter[warehouseId]': '1',
          'filter[status]': 'active',
          'filter[lowStock]': true
        } 
      })
    })

    it('should handle sorting parameters', async () => {
      // Arrange
      const mockStock = [createMockStock()]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const sort = { field: 'quantity' as const, direction: 'desc' as const }

      // Act
      await stockService.getAll({ sort })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { 
        params: { sort: '-quantity' } 
      })
    })

    it('should handle pagination parameters', async () => {
      // Arrange
      const mockStock = [createMockStock()]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const pagination = { page: 2, size: 20 }

      // Act
      await stockService.getAll({ pagination })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { 
        params: { 
          'page[number]': 2,
          'page[size]': 20
        } 
      })
    })

    it('should handle include parameters', async () => {
      // Arrange
      const mockStock = [createMockStock()]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'warehouse', 'location']

      // Act
      await stockService.getAll({ include })

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { 
        params: { include: 'product,warehouse,location' } 
      })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const mockError = createMockAxiosError(500, 'Internal Server Error')
      mockedAxiosClient.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(stockService.getAll()).rejects.toEqual(mockError)
    })
  })

  describe('getById', () => {
    it('should fetch stock by id successfully', async () => {
      // Arrange
      const mockStock = createMockStock({ id: '1', quantity: 100 })
      const mockResponse = createMockJsonApiSingleResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await stockService.getById('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks/1', { params: {} })
      expect(result).toEqual(mockResponse)
      expect(result.data.quantity).toBe(100)
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockStock = createMockStock()
      const mockResponse = createMockJsonApiSingleResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['product', 'warehouse', 'location']

      // Act
      await stockService.getById('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks/1', { 
        params: { include: 'product,warehouse,location' } 
      })
    })

    it('should throw error on not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Stock not found')
      mockedAxiosClient.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(stockService.getById('999')).rejects.toEqual(mockError)
    })
  })

  describe('create', () => {
    it('should create stock successfully', async () => {
      // Arrange
      const stockData = { 
        quantity: 100,
        reservedQuantity: 10,
        availableQuantity: 90,
        unitCost: 15.50,
        productId: '1',
        warehouseId: '1',
        locationId: '1'
      }
      const mockStock = createMockStock(stockData)
      const mockResponse = createMockJsonApiSingleResponse(mockStock)
      mockedAxiosClient.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const result = await stockService.create(stockData)

      // Assert
      expect(mockedAxiosClient.post).toHaveBeenCalledWith('/api/v1/stocks', {
        data: {
          type: 'stocks',
          attributes: {
            quantity: 100,
            reservedQuantity: 10,
            availableQuantity: 90,
            unitCost: 15.50
          },
          relationships: {
            product: {
              data: { type: 'products', id: '1' }
            },
            warehouse: {
              data: { type: 'warehouses', id: '1' }
            },
            location: {
              data: { type: 'warehouse-locations', id: '1' }
            }
          }
        }
      })
      expect(result).toEqual(mockResponse)
      expect(result.data.quantity).toBe(100)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = { quantity: 0, productId: '', warehouseId: '' }
      const mockError = createMockAxiosError(422, 'Validation failed')
      mockedAxiosClient.post.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(stockService.create(invalidData)).rejects.toEqual(mockError)
    })
  })

  describe('update', () => {
    it('should update stock successfully', async () => {
      // Arrange
      const updateData = { quantity: 150, availableQuantity: 140, unitCost: 16.00 }
      const mockStock = createMockStock({ ...updateData, id: '1' })
      const mockResponse = createMockJsonApiSingleResponse(mockStock)
      mockedAxiosClient.patch.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await stockService.update('1', updateData)

      // Assert
      expect(mockedAxiosClient.patch).toHaveBeenCalledWith('/api/v1/stocks/1', {
        data: {
          type: 'stocks',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.data.quantity).toBe(150)
    })

    it('should throw error on stock not found', async () => {
      // Arrange
      const updateData = { quantity: 100 }
      const mockError = createMockAxiosError(404, 'Stock not found')
      mockedAxiosClient.patch.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(stockService.update('999', updateData)).rejects.toEqual(mockError)
    })
  })

  describe('delete', () => {
    it('should delete stock successfully', async () => {
      // Arrange
      mockedAxiosClient.delete.mockResolvedValueOnce(createMockAxiosSuccess({}, 204))

      // Act
      await stockService.delete('1')

      // Assert
      expect(mockedAxiosClient.delete).toHaveBeenCalledWith('/api/v1/stocks/1')
    })

    it('should throw error on foreign key constraint', async () => {
      // Arrange
      const mockError = createMockAxiosError(409, 'Cannot delete stock with associated movements')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(stockService.delete('1')).rejects.toEqual(mockError)
    })

    it('should throw error on stock not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Stock not found')
      mockedAxiosClient.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(stockService.delete('999')).rejects.toEqual(mockError)
    })
  })

  describe('getByProduct', () => {
    it('should fetch stock by product successfully', async () => {
      // Arrange
      const mockStock = [
        createMockStock({ id: '1', productId: '1', warehouseId: '1', quantity: 100 }),
        createMockStock({ id: '2', productId: '1', warehouseId: '2', quantity: 50 })
      ]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await stockService.getByProduct('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { params: { 'filter[productId]': '1' } })
      expect(result.data).toHaveLength(2)
    })

    it('should include relationships for product stock', async () => {
      // Arrange
      const mockStock = [createMockStock()]
      const mockResponse = createMockJsonApiListResponse(mockStock)
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const include = ['warehouse', 'location']

      // Act
      await stockService.getByProduct('1', include)

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/stocks', { 
        params: { 'filter[productId]': '1', include: 'warehouse,location' } 
      })
    })
  })

  describe('getWarehouseSummary', () => {
    it('should fetch warehouse stock summary successfully', async () => {
      // Arrange
      const mockSummary = {
        totalItems: 250,
        totalValue: 12500.00,
        lowStockItems: 5,
        outOfStockItems: 2,
        categories: [
          { categoryId: '1', quantity: 100, value: 5000 },
          { categoryId: '2', quantity: 150, value: 7500 }
        ]
      }
      const mockResponse = { data: mockSummary }
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await stockService.getWarehouseSummary('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses/1/stock')
      expect(result.data.totalItems).toBe(250)
      expect(result.data.totalValue).toBe(12500.00)
    })

    it('should fetch warehouse summary for different warehouse', async () => {
      // Arrange
      const mockSummary = { totalItems: 100, totalValue: 5000 }
      const mockResponse = { data: mockSummary }
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await stockService.getWarehouseSummary('2')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouses/2/stock')
    })
  })

  describe('getLocationSummary', () => {
    it('should fetch location stock summary successfully', async () => {
      // Arrange
      const mockSummary = {
        totalItems: 50,
        totalValue: 2500.00,
        availableCapacity: 75,
        utilizationPercentage: 25
      }
      const mockResponse = { data: mockSummary }
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await stockService.getLocationSummary('1')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1/stock')
      expect(result.data.totalItems).toBe(50)
      expect(result.data.utilizationPercentage).toBe(25)
    })

    it('should fetch location summary for different location', async () => {
      // Arrange
      const mockSummary = { totalItems: 25, totalValue: 1250 }
      const mockResponse = { data: mockSummary }
      mockedAxiosClient.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await stockService.getLocationSummary('2')

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/2/stock')
    })
  })
})