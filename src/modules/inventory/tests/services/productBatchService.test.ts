/**
 * ProductBatch Service Tests
 * 
 * Comprehensive unit tests for productBatchService following AAA pattern
 * and ensuring 70%+ coverage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { productBatchService } from '../../services/productBatchService'
import axiosClient from '@/lib/axiosClient'
import {
  createMockProductBatch,
  createMockJsonApiResponse,
  createMockJsonApiListResponse,
  createMockAxiosSuccess,
  createMockAxiosError
} from '../utils/test-utils'
import type { CreateProductBatchRequest, UpdateProductBatchRequest } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const mockedAxios = vi.mocked(axiosClient)

describe('productBatchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all product batches successfully', async () => {
      // Arrange
      const mockBatches = [
        {
          id: '1',
          type: 'product-batches',
          attributes: {
            batch_number: 'BATCH-001',
            current_quantity: 100,
            status: 'active',
            created_at: '2025-01-14T10:00:00.000Z',
            updated_at: '2025-01-14T10:00:00.000Z'
          },
          relationships: {}
        },
        {
          id: '2', 
          type: 'product-batches',
          attributes: {
            batch_number: 'BATCH-002',
            current_quantity: 200,
            status: 'active',
            created_at: '2025-01-14T10:00:00.000Z',
            updated_at: '2025-01-14T10:00:00.000Z'
          },
          relationships: {}
        }
      ]
      const mockResponse = createMockJsonApiListResponse(mockBatches)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await productBatchService.getAll()

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product-batches', {
        params: expect.objectContaining({
          include: 'product,warehouse,warehouseLocation',
          'page[size]': '20'
        })
      })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].batchNumber).toBe('BATCH-001')
      expect(result.meta).toBeDefined()
    })

    it('should handle filters correctly', async () => {
      // Arrange
      const mockBatches = [{
        id: '1',
        type: 'product-batches', 
        attributes: { batch_number: 'BATCH-001' },
        relationships: {}
      }]
      const mockResponse = createMockJsonApiListResponse(mockBatches)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const filters = {
        search: 'BATCH-001',
        status: ['active', 'quarantine'],
        productId: '1',
        warehouseId: '2'
      }

      // Act
      await productBatchService.getAll(filters)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product-batches', {
        params: expect.objectContaining({
          'filter[search]': 'BATCH-001',
          'filter[status]': 'active,quarantine',
          'filter[product_id]': '1',
          'filter[warehouse_id]': '2'
        })
      })
    })

    it('should handle sorting correctly', async () => {
      // Arrange
      const mockBatches = [{
        id: '1',
        type: 'product-batches',
        attributes: { batch_number: 'BATCH-001' },
        relationships: {}
      }]
      const mockResponse = createMockJsonApiListResponse(mockBatches)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))
      
      const sort = { field: 'batchNumber', direction: 'desc' } as const

      // Act
      await productBatchService.getAll(undefined, sort)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product-batches', {
        params: expect.objectContaining({
          sort: '-batch_number'
        })
      })
    })

    it('should handle pagination correctly', async () => {
      // Arrange
      const mockBatches = [{
        id: '1',
        type: 'product-batches',
        attributes: { batch_number: 'BATCH-001' },
        relationships: {}
      }]
      const mockResponse = createMockJsonApiListResponse(mockBatches)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await productBatchService.getAll(undefined, undefined, 2, 50)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product-batches', {
        params: expect.objectContaining({
          'page[number]': '2',
          'page[size]': '50'
        })
      })
    })

    it('should throw error when API fails', async () => {
      // Arrange
      const mockError = createMockAxiosError(500, 'Internal Server Error')
      mockedAxios.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(productBatchService.getAll()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getById', () => {
    it('should fetch single product batch successfully', async () => {
      // Arrange
      const mockBatch = {
        id: '1',
        type: 'product-batches',
        attributes: {
          batch_number: 'BATCH-001',
          current_quantity: 100,
          status: 'active',
          created_at: '2025-01-14T10:00:00.000Z',
          updated_at: '2025-01-14T10:00:00.000Z'
        },
        relationships: {}
      }
      const mockResponse = createMockJsonApiResponse(mockBatch)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await productBatchService.getById('1')

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product-batches/1', {
        params: { include: 'product,warehouse,warehouseLocation' }
      })
      expect(result.id).toBe('1')
      expect(result.batchNumber).toBe('BATCH-001')
    })

    it('should throw error when product batch not found', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Product batch not found')
      mockedAxios.get.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(productBatchService.getById('999')).rejects.toThrow('Product batch not found')
    })
  })

  describe('create', () => {
    it('should create product batch successfully', async () => {
      // Arrange
      const createData: CreateProductBatchRequest = {
        batchNumber: 'BATCH-NEW-001',
        manufacturingDate: '2025-01-01',
        expirationDate: '2027-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 50.00,
        status: 'active',
        productId: '1',
        warehouseId: '2'
      }
      
      const mockCreatedBatch = {
        id: '42',
        type: 'product-batches',
        attributes: {
          batch_number: 'BATCH-NEW-001',
          manufacturing_date: '2025-01-01T00:00:00.000Z',
          expiration_date: '2027-01-01T00:00:00.000Z',
          initial_quantity: 100,
          current_quantity: 100,
          unit_cost: 50.00,
          status: 'active',
          created_at: '2025-01-14T10:00:00.000Z',
          updated_at: '2025-01-14T10:00:00.000Z'
        },
        relationships: {}
      }
      const mockResponse = createMockJsonApiResponse(mockCreatedBatch)
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      const result = await productBatchService.create(createData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/product-batches', {
        data: {
          type: 'product-batches',
          attributes: expect.objectContaining({
            batch_number: 'BATCH-NEW-001',
            manufacturing_date: '2025-01-01',
            expiration_date: '2027-01-01',
            initial_quantity: 100,
            current_quantity: 100,
            unit_cost: 50.00,
            status: 'active'
          }),
          relationships: {
            product: { data: { type: 'products', id: '1' } },
            warehouse: { data: { type: 'warehouses', id: '2' } }
          }
        }
      })
      expect(result.id).toBe('42')
      expect(result.batchNumber).toBe('BATCH-NEW-001')
    })

    it('should create product batch with warehouse location', async () => {
      // Arrange
      const createData: CreateProductBatchRequest = {
        batchNumber: 'BATCH-NEW-002',
        manufacturingDate: '2025-01-01',
        expirationDate: '2027-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 50.00,
        status: 'active',
        productId: '1',
        warehouseId: '2',
        warehouseLocationId: '3'
      }
      
      const mockCreatedBatch = {
        id: '43',
        type: 'product-batches',
        attributes: {
          batch_number: 'BATCH-NEW-002',
          created_at: '2025-01-14T10:00:00.000Z',
          updated_at: '2025-01-14T10:00:00.000Z'
        },
        relationships: {}
      }
      const mockResponse = createMockJsonApiResponse(mockCreatedBatch)
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      await productBatchService.create(createData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/product-batches', {
        data: expect.objectContaining({
          relationships: expect.objectContaining({
            warehouseLocation: { data: { type: 'warehouse-locations', id: '3' } }
          })
        })
      })
    })

    it('should handle validation errors', async () => {
      // Arrange
      const createData: CreateProductBatchRequest = {
        batchNumber: '',
        manufacturingDate: '2025-01-01',
        expirationDate: '2027-01-01',
        initialQuantity: -1,
        currentQuantity: 100,
        unitCost: 50.00,
        status: 'active',
        productId: '1',
        warehouseId: '2'
      }
      
      const mockError = createMockAxiosError(422, 'Validation failed')
      mockedAxios.post.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(productBatchService.create(createData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update product batch successfully', async () => {
      // Arrange
      const updateData: UpdateProductBatchRequest = {
        currentQuantity: 50,
        status: 'quarantine',
        qualityNotes: 'Quality concerns detected'
      }
      
      const mockUpdatedBatch = {
        id: '1',
        type: 'product-batches',
        attributes: {
          batch_number: 'BATCH-001',
          current_quantity: 50,
          status: 'quarantine',
          quality_notes: 'Quality concerns detected',
          created_at: '2025-01-14T10:00:00.000Z',
          updated_at: '2025-01-14T10:00:00.000Z'
        },
        relationships: {}
      }
      const mockResponse = createMockJsonApiResponse(mockUpdatedBatch)
      mockedAxios.put.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await productBatchService.update('1', updateData)

      // Assert
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/v1/product-batches/1', {
        data: {
          type: 'product-batches',
          id: '1',
          attributes: expect.objectContaining({
            current_quantity: 50,
            status: 'quarantine',
            quality_notes: 'Quality concerns detected'
          })
        }
      })
      expect(result.currentQuantity).toBe(50)
      expect(result.status).toBe('quarantine')
    })

    it('should update with relationships', async () => {
      // Arrange
      const updateData: UpdateProductBatchRequest = {
        warehouseId: '3',
        warehouseLocationId: '5'
      }
      
      const mockUpdatedBatch = {
        id: '1',
        type: 'product-batches',
        attributes: {
          batch_number: 'BATCH-001',
          created_at: '2025-01-14T10:00:00.000Z',
          updated_at: '2025-01-14T10:00:00.000Z'
        },
        relationships: {}
      }
      const mockResponse = createMockJsonApiResponse(mockUpdatedBatch)
      mockedAxios.put.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      await productBatchService.update('1', updateData)

      // Assert
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/v1/product-batches/1', {
        data: expect.objectContaining({
          relationships: {
            warehouse: { data: { type: 'warehouses', id: '3' } },
            warehouseLocation: { data: { type: 'warehouse-locations', id: '5' } }
          }
        })
      })
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData: UpdateProductBatchRequest = { currentQuantity: -1 }
      const mockError = createMockAxiosError(422, 'Invalid quantity')
      mockedAxios.put.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(productBatchService.update('1', updateData)).rejects.toThrow('Invalid quantity')
    })
  })

  describe('delete', () => {
    it('should delete product batch successfully', async () => {
      // Arrange
      mockedAxios.delete.mockResolvedValueOnce(createMockAxiosSuccess(undefined, 204))

      // Act
      await productBatchService.delete('1')

      // Assert
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/v1/product-batches/1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const mockError = createMockAxiosError(404, 'Product batch not found')
      mockedAxios.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(productBatchService.delete('999')).rejects.toThrow('Product batch not found')
    })

    it('should handle constraint violations', async () => {
      // Arrange
      const mockError = createMockAxiosError(409, 'Cannot delete product batch with movements')
      mockedAxios.delete.mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(productBatchService.delete('1')).rejects.toThrow('Cannot delete product batch with movements')
    })
  })

  describe('data transformation', () => {
    it('should transform snake_case to camelCase correctly', async () => {
      // Arrange
      const mockBatch = {
        id: '1',
        attributes: {
          batch_number: 'BATCH-001',
          lot_number: 'LOT-001',
          manufacturing_date: '2025-01-01T00:00:00.000Z',
          expiration_date: '2027-01-01T00:00:00.000Z',
          best_before_date: '2026-06-01T00:00:00.000Z',
          initial_quantity: 100,
          current_quantity: 80,
          reserved_quantity: 5,
          available_quantity: 75,
          unit_cost: 50.00,
          total_value: 4000.00,
          supplier_name: 'Test Supplier',
          supplier_batch: 'SUP-001',
          quality_notes: 'Good quality',
          test_results: { ph: 7.0 },
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z'
        },
        relationships: {}
      }
      const mockResponse = createMockJsonApiResponse(mockBatch)
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse))

      // Act
      const result = await productBatchService.getById('1')

      // Assert
      expect(result).toEqual(expect.objectContaining({
        batchNumber: 'BATCH-001',
        lotNumber: 'LOT-001',
        manufacturingDate: '2025-01-01T00:00:00.000Z',
        expirationDate: '2027-01-01T00:00:00.000Z',
        bestBeforeDate: '2026-06-01T00:00:00.000Z',
        initialQuantity: 100,
        currentQuantity: 80,
        reservedQuantity: 5,
        availableQuantity: 75,
        unitCost: 50.00,
        totalValue: 4000.00,
        supplierName: 'Test Supplier',
        supplierBatch: 'SUP-001',
        qualityNotes: 'Good quality',
        testResults: { ph: 7.0 },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }))
    })

    it('should transform camelCase to snake_case for requests', async () => {
      // Arrange
      const createData: CreateProductBatchRequest = {
        batchNumber: 'BATCH-001',
        lotNumber: 'LOT-001',
        manufacturingDate: '2025-01-01',
        expirationDate: '2027-01-01',
        bestBeforeDate: '2026-06-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 50.00,
        status: 'active',
        supplierName: 'Test Supplier',
        supplierBatch: 'SUP-001',
        qualityNotes: 'Good quality',
        productId: '1',
        warehouseId: '2'
      }
      
      const mockCreatedBatch = createMockProductBatch()
      const mockResponse = createMockJsonApiResponse(mockCreatedBatch)
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosSuccess(mockResponse, 201))

      // Act
      await productBatchService.create(createData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/product-batches', {
        data: {
          type: 'product-batches',
          attributes: expect.objectContaining({
            batch_number: 'BATCH-001',
            lot_number: 'LOT-001',
            manufacturing_date: '2025-01-01',
            expiration_date: '2027-01-01',
            best_before_date: '2026-06-01',
            initial_quantity: 100,
            current_quantity: 100,
            unit_cost: 50.00,
            supplier_name: 'Test Supplier',
            supplier_batch: 'SUP-001',
            quality_notes: 'Good quality'
          }),
          relationships: expect.any(Object)
        }
      })
    })
  })
})