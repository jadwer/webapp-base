/**
 * inventoryMovementsService Tests
 * Tests for the inventory movements API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { inventoryMovementsService } from '../../services'
import { createMockMovement } from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('inventoryMovementsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('getAll', () => {
    it('should fetch all movements with default sort', async () => {
      // Arrange
      const movements = [
        createMockMovement({ id: '1', movementType: 'entry' }),
        createMockMovement({ id: '2', movementType: 'exit' }),
      ]
      const apiResponse = {
        data: movements,
        meta: { pagination: { total: 2 } },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with search filter', async () => {
      // Arrange
      const movements = [createMockMovement({ id: '1' })]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        filters: { search: 'Product A' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[search]': 'Product A', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with movementType filter', async () => {
      // Arrange
      const movements = [createMockMovement({ id: '1', movementType: 'entry' })]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        filters: { movementType: 'entry' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[movement_type]': 'entry', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with status filter', async () => {
      // Arrange
      const movements = [createMockMovement({ id: '1', status: 'completed' })]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        filters: { status: 'completed' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[status]': 'completed', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with productId filter', async () => {
      // Arrange
      const movements = [createMockMovement({ id: '1', productId: 5 })]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        filters: { productId: 5 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[product_id]': 5, sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with warehouseId filter', async () => {
      // Arrange
      const movements = [createMockMovement({ id: '1', warehouseId: 3 })]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        filters: { warehouseId: 3 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[warehouse_id]': 3, sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with date range filters', async () => {
      // Arrange
      const movements = [createMockMovement({ id: '1' })]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        filters: { dateFrom: '2025-01-01', dateTo: '2025-01-31' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: {
          'filter[dateFrom]': '2025-01-01',
          'filter[dateTo]': '2025-01-31',
          sort: '-movementDate'
        }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch movements with custom sorting', async () => {
      // Arrange
      const movements = [createMockMovement()]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getAll({
        sort: { field: 'quantity', direction: 'desc' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { sort: '-quantity' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await inventoryMovementsService.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(inventoryMovementsService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch a single movement by ID', async () => {
      // Arrange
      const movement = createMockMovement({ id: '5' })
      const apiResponse = { data: movement }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements/5', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when movement not found', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(inventoryMovementsService.getById('999')).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('should create a new movement', async () => {
      // Arrange
      const movementData = {
        productId: 1,
        warehouseId: 2,
        movementType: 'entry' as const,
        referenceType: 'purchase_order' as const,
        movementDate: '2025-01-01',
        quantity: 100,
        status: 'completed' as const,
        userId: 1,
      }
      const createdMovement = createMockMovement({
        id: '10',
        ...movementData,
      })
      const apiResponse = { data: createdMovement }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.create(movementData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/inventory-movements', expect.objectContaining({
        data: expect.objectContaining({
          type: 'inventory-movements',
          attributes: expect.objectContaining({
            productId: 1,
            warehouseId: 2,
            movementType: 'entry',
          }),
        }),
      }))
      expect(result).toEqual(apiResponse)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = {
        productId: 1,
        warehouseId: 2,
        movementType: 'entry' as const,
        referenceType: 'purchase_order' as const,
        movementDate: '2025-01-01',
        quantity: -10, // invalid
        status: 'completed' as const,
        userId: 1,
      }
      const error = new Error('Validation failed')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(inventoryMovementsService.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing movement', async () => {
      // Arrange
      const updateData = {
        quantity: 150,
        status: 'completed' as const,
      }
      const updatedMovement = createMockMovement({
        id: '1',
        quantity: 150,
        status: 'completed',
      })
      const apiResponse = { data: updatedMovement }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.update('1', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/inventory-movements/1', expect.objectContaining({
        data: expect.objectContaining({
          type: 'inventory-movements',
          id: '1',
        }),
      }))
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when updating non-existent movement', async () => {
      // Arrange
      const updateData = { quantity: 150 }
      const error = new Error('Not found')
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(inventoryMovementsService.update('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('delete', () => {
    it('should delete a movement', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await inventoryMovementsService.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/inventory-movements/1')
    })

    it('should throw error when delete is not allowed', async () => {
      // Arrange
      const error = new Error('Delete not allowed for audit reasons')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(inventoryMovementsService.delete('1')).rejects.toThrow('Delete not allowed for audit reasons')
    })
  })

  describe('getByProduct', () => {
    it('should fetch movements by product ID', async () => {
      // Arrange
      const movements = [
        createMockMovement({ id: '1', productId: 7 }),
        createMockMovement({ id: '2', productId: 7 }),
      ]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getByProduct('7')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[product_id]': '7', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })
  })

  describe('getByWarehouse', () => {
    it('should fetch movements by warehouse ID', async () => {
      // Arrange
      const movements = [
        createMockMovement({ id: '1', warehouseId: 3 }),
        createMockMovement({ id: '2', warehouseId: 3 }),
      ]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getByWarehouse('3')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[warehouse_id]': '3', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })
  })

  describe('getEntries', () => {
    it('should fetch entry movements', async () => {
      // Arrange
      const movements = [
        createMockMovement({ id: '1', movementType: 'entry' }),
        createMockMovement({ id: '2', movementType: 'entry' }),
      ]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getEntries()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[movement_type]': 'entry', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })
  })

  describe('getExits', () => {
    it('should fetch exit movements', async () => {
      // Arrange
      const movements = [
        createMockMovement({ id: '1', movementType: 'exit' }),
        createMockMovement({ id: '2', movementType: 'exit' }),
      ]
      const apiResponse = { data: movements }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await inventoryMovementsService.getExits()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/inventory-movements', {
        params: { 'filter[movement_type]': 'exit', sort: '-movementDate' }
      })
      expect(result).toEqual(apiResponse)
    })
  })
})
