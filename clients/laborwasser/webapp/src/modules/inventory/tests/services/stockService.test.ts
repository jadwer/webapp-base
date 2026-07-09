/**
 * stockService Tests
 * Tests for the stock API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { stockService } from '../../services'
import { createMockStock } from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('stockService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all stock without params', async () => {
      // Arrange
      const stock = [
        createMockStock({ id: '1', quantity: 100 }),
        createMockStock({ id: '2', quantity: 200 }),
      ]
      const apiResponse = {
        data: stock,
        meta: { pagination: { total: 2 } },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with search filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { search: 'Product A' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[search]': 'Product A' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with productId filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', productId: '5' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { productId: '5' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[product_id]': '5' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with warehouseId filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', warehouseId: '3' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { warehouseId: '3' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[warehouse_id]': '3' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with warehouseLocationId filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', warehouseLocationId: '10' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { warehouseLocationId: '10' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[warehouse_location_id]': '10' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with status filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', status: 'available' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { status: 'available' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[status]': 'available' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with lowStock filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { lowStock: true }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[low_stock]': 1 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with outOfStock filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', quantity: 0 })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { outOfStock: true }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[out_of_stock]': 1 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with minQuantity filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', quantity: 100 })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { minQuantity: 50 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[min_quantity]': 50 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with maxQuantity filter', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', quantity: 50 })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        filters: { maxQuantity: 100 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[max_quantity]': 100 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with sorting', async () => {
      // Arrange
      const stock = [createMockStock()]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        sort: { field: 'quantity', direction: 'desc' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { sort: '-quantity' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with pagination', async () => {
      // Arrange
      const stock = [createMockStock()]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        pagination: { page: 2, size: 10 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'page[number]': 2, 'page[size]': 10 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with includes', async () => {
      // Arrange
      const stock = [createMockStock()]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getAll({
        include: ['product', 'warehouse', 'location']
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { include: 'product,warehouse,location' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await stockService.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(stockService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch a single stock item by ID', async () => {
      // Arrange
      const stockItem = createMockStock({ id: '5', quantity: 150 })
      const apiResponse = { data: stockItem }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks/5', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with includes', async () => {
      // Arrange
      const stockItem = createMockStock({ id: '5' })
      const apiResponse = { data: stockItem }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getById('5', ['product', 'warehouse', 'location'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks/5', {
        params: { include: 'product,warehouse,location' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when stock not found', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(stockService.getById('999')).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('should create a new stock entry', async () => {
      // Arrange
      const stockData = {
        productId: '1',
        warehouseId: '2',
        warehouseLocationId: '3',
        quantity: 100,
        availableQuantity: 100,
        status: 'available' as const,
      }
      const createdStock = createMockStock({
        id: '10',
        ...stockData,
      })
      const apiResponse = { data: createdStock }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.create(stockData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/stocks', {
        data: {
          type: 'stocks',
          attributes: stockData,
        },
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = {
        productId: '1',
        warehouseId: '2',
        warehouseLocationId: '3',
        quantity: -10, // invalid negative quantity
        availableQuantity: -10,
        status: 'available' as const,
      }
      const error = new Error('Validation failed')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(stockService.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing stock entry', async () => {
      // Arrange
      const updateData = {
        quantity: 150,
        status: 'reserved' as const,
      }
      const updatedStock = createMockStock({
        id: '1',
        quantity: 150,
        status: 'reserved',
      })
      const apiResponse = { data: updatedStock }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.update('1', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/stocks/1', {
        data: {
          type: 'stocks',
          id: '1',
          attributes: updateData,
        },
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when updating non-existent stock', async () => {
      // Arrange
      const updateData = { quantity: 150 }
      const error = new Error('Not found')
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(stockService.update('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('delete', () => {
    it('should delete a stock entry', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await stockService.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/stocks/1')
    })

    it('should throw 404 error when deleting non-existent stock', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(stockService.delete('999')).rejects.toThrow('Not found')
    })

    it('should handle foreign key constraint error', async () => {
      // Arrange
      const error = new Error('Foreign key constraint failed')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(stockService.delete('1')).rejects.toThrow('Foreign key constraint failed')
    })
  })

  describe('getWarehouseSummary', () => {
    it('should fetch warehouse stock summary', async () => {
      // Arrange
      const summary = {
        data: [
          { productId: 1, totalQuantity: 500, locations: 3 },
          { productId: 2, totalQuantity: 300, locations: 2 },
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: summary })

      // Act
      const result = await stockService.getWarehouseSummary('1')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/stock')
      expect(result).toEqual(summary)
    })
  })

  describe('getLocationSummary', () => {
    it('should fetch location stock summary', async () => {
      // Arrange
      const summary = {
        data: [
          { productId: 1, quantity: 100 },
          { productId: 2, quantity: 50 },
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: summary })

      // Act
      const result = await stockService.getLocationSummary('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/5/stock')
      expect(result).toEqual(summary)
    })
  })

  describe('getByProduct', () => {
    it('should fetch stock by product ID', async () => {
      // Arrange
      const stock = [
        createMockStock({ id: '1', productId: '7', warehouseId: '1' }),
        createMockStock({ id: '2', productId: '7', warehouseId: '2' }),
      ]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getByProduct('7')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: { 'filter[product_id]': '7' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock by product with includes', async () => {
      // Arrange
      const stock = [createMockStock({ id: '1', productId: '7' })]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await stockService.getByProduct('7', ['warehouse', 'location'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks', {
        params: {
          'filter[product_id]': '7',
          include: 'warehouse,location'
        }
      })
      expect(result).toEqual(apiResponse)
    })
  })
})
