/**
 * locationsService Tests
 * Tests for the warehouse locations API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { locationsService } from '../../services'
import { createMockLocation } from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('locationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all locations without params', async () => {
      // Arrange
      const locations = [
        createMockLocation({ id: '1', name: 'Location A-1-1' }),
        createMockLocation({ id: '2', name: 'Location A-1-2' }),
      ]
      const apiResponse = {
        data: locations,
        meta: { pagination: { total: 2 } },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with search filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', name: 'Zone A-1-1' })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { search: 'Zone A' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[search_name]': 'Zone A' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with code filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', code: 'A-1-1' })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { code: 'A-1' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[search_code]': 'A-1' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with warehouseId filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', warehouseId: 5 })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { warehouseId: 5 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[warehouse_id]': 5 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with locationType filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', locationType: 'shelf' })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { locationType: 'shelf' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[location_type]': 'shelf' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with isActive filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', isActive: true })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { isActive: true }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[is_active]': 1 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with isPickable filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', isPickable: true })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { isPickable: true }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[is_pickable]': 1 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with isReceivable filter', async () => {
      // Arrange
      const locations = [createMockLocation({ id: '1', isReceivable: true })]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        filters: { isReceivable: true }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'filter[is_receivable]': 1 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with sorting', async () => {
      // Arrange
      const locations = [createMockLocation()]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        sort: { field: 'name', direction: 'desc' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { sort: '-name' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with pagination', async () => {
      // Arrange
      const locations = [createMockLocation()]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        pagination: { page: 2, size: 10 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { 'page[number]': 2, 'page[size]': 10 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with includes', async () => {
      // Arrange
      const locations = [createMockLocation()]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getAll({
        include: ['warehouse', 'stock']
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        params: { include: 'warehouse,stock' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await locationsService.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(locationsService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch a single location by ID', async () => {
      // Arrange
      const location = createMockLocation({ id: '5', name: 'Location A-5-1' })
      const apiResponse = { data: location }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/5', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch location with includes', async () => {
      // Arrange
      const location = createMockLocation({ id: '5' })
      const apiResponse = { data: location }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getById('5', ['warehouse', 'stock'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/5', {
        params: { include: 'warehouse,stock' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when location not found', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(locationsService.getById('999')).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('should create a new location', async () => {
      // Arrange
      const locationData = {
        warehouseId: 1,
        name: 'New Location',
        code: 'A-1-NEW',
        locationType: 'shelf' as const,
        isActive: true,
        isPickable: true,
        isReceivable: true,
      }
      const createdLocation = createMockLocation({
        id: '10',
        ...locationData,
      })
      const apiResponse = { data: createdLocation }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.create(locationData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/warehouse-locations', {
        data: {
          type: 'warehouse-locations',
          attributes: locationData,
        },
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = {
        warehouseId: 1,
        name: '',
        code: '',
        locationType: 'shelf' as const,
        isActive: true,
        isPickable: true,
        isReceivable: true,
      }
      const error = new Error('Validation failed')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(locationsService.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing location', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Location',
        isActive: false,
      }
      const updatedLocation = createMockLocation({
        id: '1',
        name: 'Updated Location',
        isActive: false,
      })
      const apiResponse = { data: updatedLocation }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.update('1', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/warehouse-locations/1', {
        data: {
          type: 'warehouse-locations',
          id: '1',
          attributes: updateData,
        },
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when updating non-existent location', async () => {
      // Arrange
      const updateData = { name: 'Updated' }
      const error = new Error('Not found')
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(locationsService.update('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('delete', () => {
    it('should delete a location', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await locationsService.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/warehouse-locations/1')
    })

    it('should throw 404 error when deleting non-existent location', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(locationsService.delete('999')).rejects.toThrow('Not found')
    })

    it('should handle foreign key constraint error', async () => {
      // Arrange
      const error = new Error('Foreign key constraint failed')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(locationsService.delete('1')).rejects.toThrow('Foreign key constraint failed')
    })
  })

  describe('getStock', () => {
    it('should fetch stock for a location', async () => {
      // Arrange
      const stock = [
        { id: '1', quantity: 100, productId: '1' },
        { id: '2', quantity: 200, productId: '2' },
      ]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getStock('1')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1/stock', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with includes', async () => {
      // Arrange
      const stock = [{ id: '1', quantity: 100 }]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await locationsService.getStock('1', ['product', 'productBatch'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouse-locations/1/stock', {
        params: { include: 'product,productBatch' }
      })
      expect(result).toEqual(apiResponse)
    })
  })
})
