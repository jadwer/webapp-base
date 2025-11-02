/**
 * warehousesService Tests
 * Tests for the warehouses API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { warehousesService } from '../../services'
import { createMockWarehouse } from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('warehousesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all warehouses without params', async () => {
      // Arrange
      const warehouses = [
        createMockWarehouse({ id: '1', name: 'Warehouse 1' }),
        createMockWarehouse({ id: '2', name: 'Warehouse 2' }),
      ]
      const apiResponse = {
        data: warehouses,
        meta: { pagination: { total: 2 } },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with search filter', async () => {
      // Arrange
      const warehouses = [createMockWarehouse({ id: '1', name: 'Main Warehouse' })]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        filters: { search: 'Main' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { 'filter[search_name]': 'Main' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with code filter', async () => {
      // Arrange
      const warehouses = [createMockWarehouse({ id: '1', code: 'WH-001' })]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        filters: { code: 'WH-001' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { 'filter[search_code]': 'WH-001' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with warehouseType filter', async () => {
      // Arrange
      const warehouses = [createMockWarehouse({ id: '1', warehouseType: 'main' })]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        filters: { warehouseType: 'main' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { 'filter[warehouse_type]': 'main' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with isActive filter', async () => {
      // Arrange
      const warehouses = [createMockWarehouse({ id: '1', isActive: true })]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        filters: { isActive: true }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { 'filter[is_active]': 1 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with sorting', async () => {
      // Arrange
      const warehouses = [createMockWarehouse()]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        sort: { field: 'name', direction: 'desc' }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { sort: '-name' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with pagination', async () => {
      // Arrange
      const warehouses = [createMockWarehouse()]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        pagination: { page: 2, size: 10 }
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { 'page[number]': 2, 'page[size]': 10 }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouses with includes', async () => {
      // Arrange
      const warehouses = [createMockWarehouse()]
      const apiResponse = { data: warehouses }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getAll({
        include: ['locations', 'stock']
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses', {
        params: { include: 'locations,stock' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await warehousesService.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(warehousesService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch a single warehouse by ID', async () => {
      // Arrange
      const warehouse = createMockWarehouse({ id: '5', name: 'Warehouse 5' })
      const apiResponse = { data: warehouse }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/5', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch warehouse with includes', async () => {
      // Arrange
      const warehouse = createMockWarehouse({ id: '5' })
      const apiResponse = { data: warehouse }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getById('5', ['locations', 'stock'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/5', {
        params: { include: 'locations,stock' }
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when warehouse not found', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(warehousesService.getById('999')).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('should create a new warehouse', async () => {
      // Arrange
      const warehouseData = {
        name: 'New Warehouse',
        slug: 'new-warehouse',
        code: 'WH-NEW',
        warehouseType: 'main' as const,
        isActive: true,
      }
      const createdWarehouse = createMockWarehouse({
        id: '10',
        ...warehouseData,
      })
      const apiResponse = { data: createdWarehouse }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.create(warehouseData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/warehouses', {
        data: {
          type: 'warehouses',
          attributes: warehouseData,
        },
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = {
        name: '',
        slug: '',
        code: '',
        warehouseType: 'main' as const,
        isActive: true,
      }
      const error = new Error('Validation failed')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(warehousesService.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing warehouse', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Warehouse',
        isActive: false,
      }
      const updatedWarehouse = createMockWarehouse({
        id: '1',
        name: 'Updated Warehouse',
        isActive: false,
      })
      const apiResponse = { data: updatedWarehouse }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.update('1', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/warehouses/1', {
        data: {
          type: 'warehouses',
          id: '1',
          attributes: updateData,
        },
      })
      expect(result).toEqual(apiResponse)
    })

    it('should throw 404 error when updating non-existent warehouse', async () => {
      // Arrange
      const updateData = { name: 'Updated' }
      const error = new Error('Not found')
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(warehousesService.update('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('delete', () => {
    it('should delete a warehouse', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await warehousesService.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/warehouses/1')
    })

    it('should throw 404 error when deleting non-existent warehouse', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(warehousesService.delete('999')).rejects.toThrow('Not found')
    })

    it('should handle foreign key constraint error', async () => {
      // Arrange
      const error = new Error('Foreign key constraint failed')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(warehousesService.delete('1')).rejects.toThrow('Foreign key constraint failed')
    })
  })

  describe('getLocations', () => {
    it('should fetch locations for a warehouse', async () => {
      // Arrange
      const locations = [
        { id: '1', name: 'Location 1', code: 'A-1-1' },
        { id: '2', name: 'Location 2', code: 'A-1-2' },
      ]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getLocations('1')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/locations', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch locations with includes', async () => {
      // Arrange
      const locations = [{ id: '1', name: 'Location 1' }]
      const apiResponse = { data: locations }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getLocations('1', ['stock'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/locations', {
        params: { include: 'stock' }
      })
      expect(result).toEqual(apiResponse)
    })
  })

  describe('getStock', () => {
    it('should fetch stock for a warehouse', async () => {
      // Arrange
      const stock = [
        { id: '1', quantity: 100, productId: '1' },
        { id: '2', quantity: 200, productId: '2' },
      ]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getStock('1')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/stock', { params: {} })
      expect(result).toEqual(apiResponse)
    })

    it('should fetch stock with includes', async () => {
      // Arrange
      const stock = [{ id: '1', quantity: 100 }]
      const apiResponse = { data: stock }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await warehousesService.getStock('1', ['product', 'location'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/warehouses/1/stock', {
        params: { include: 'product,location' }
      })
      expect(result).toEqual(apiResponse)
    })
  })
})
