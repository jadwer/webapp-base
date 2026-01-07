/**
 * productBatchService Tests
 * Tests for the product batch API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { productBatchService } from '../../services'
import { createMockProductBatch } from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('productBatchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('getAll', () => {
    it('should fetch all product batches without params', async () => {
      // Arrange
      const batches = [
        createMockProductBatch({ id: '1', batchNumber: 'BATCH-001' }),
        createMockProductBatch({ id: '2', batchNumber: 'BATCH-002' }),
      ]
      const apiResponse = {
        data: batches,
        meta: { pagination: { total: 2 } },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            include: 'product,warehouse,warehouseLocation',
            'page[size]': '20'
          })
        })
      )
      expect(result.data).toHaveLength(2)
      expect(result.meta).toEqual({ pagination: { total: 2 } })
    })

    it('should fetch batches with search filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', batchNumber: 'BATCH-SEARCH' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ search: 'BATCH-SEARCH' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[search]': 'BATCH-SEARCH'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with status filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', status: 'active' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ status: ['active'] })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[status]': 'active'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with multiple status values', async () => {
      // Arrange
      const batches = [
        createMockProductBatch({ id: '1', status: 'active' }),
        createMockProductBatch({ id: '2', status: 'expired' }),
      ]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ status: ['active', 'expired'] })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[status]': 'active,expired'
          })
        })
      )
      expect(result.data).toHaveLength(2)
    })

    it('should fetch batches with productId filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ productId: '5' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[product_id]': '5'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with warehouseId filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ warehouseId: '3' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[warehouse_id]': '3'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with warehouseLocationId filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ warehouseLocationId: '10' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[warehouse_location_id]': '10'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with expiration date range', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', expirationDate: '2025-06-30' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({
        expiresAfter: '2025-01-01',
        expiresBefore: '2025-12-31'
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[expires_after]': '2025-01-01',
            'filter[expires_before]': '2025-12-31'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with manufacturing date range', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', manufacturingDate: '2024-06-15' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({
        manufacturedAfter: '2024-01-01',
        manufacturedBefore: '2024-12-31'
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[manufactured_after]': '2024-01-01',
            'filter[manufactured_before]': '2024-12-31'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with supplierName filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', supplierName: 'ACME Corp' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ supplierName: 'ACME Corp' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[supplier_name]': 'ACME Corp'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with minQuantity filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', currentQuantity: 100 })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ minQuantity: 50 })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[min_quantity]': '50'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with maxQuantity filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', currentQuantity: 50 })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ maxQuantity: 100 })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[max_quantity]': '100'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with hasTestResults filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', testResults: { quality: 'A' } })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ hasTestResults: true })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[has_test_results]': 'true'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with hasCertifications filter', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1', certifications: { ISO: true } })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({ hasCertifications: true })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[has_certifications]': 'true'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with custom sorting', async () => {
      // Arrange
      const batches = [createMockProductBatch()]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll(
        undefined,
        { field: 'expirationDate', direction: 'asc' }
      )

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            sort: 'expirationDate'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with descending sort', async () => {
      // Arrange
      const batches = [createMockProductBatch()]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll(
        undefined,
        { field: 'currentQuantity', direction: 'desc' }
      )

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            sort: '-currentQuantity'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with pagination', async () => {
      // Arrange
      const batches = [createMockProductBatch()]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll(undefined, undefined, 2, 10)

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'page[number]': '2',
            'page[size]': '10'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should fetch batches with complex filters', async () => {
      // Arrange
      const batches = [createMockProductBatch({ id: '1' })]
      const apiResponse = { data: batches, meta: {} }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getAll({
        search: 'BATCH',
        status: ['active'],
        productId: '5',
        warehouseId: '3',
        minQuantity: 10,
        maxQuantity: 100,
        expiresAfter: '2025-01-01',
        expiresBefore: '2025-12-31',
        hasTestResults: true,
        hasCertifications: true
      })

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[search]': 'BATCH',
            'filter[status]': 'active',
            'filter[product_id]': '5',
            'filter[warehouse_id]': '3',
            'filter[min_quantity]': '10',
            'filter[max_quantity]': '100',
            'filter[expires_after]': '2025-01-01',
            'filter[expires_before]': '2025-12-31',
            'filter[has_test_results]': 'true',
            'filter[has_certifications]': 'true'
          })
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [], meta: {} } })

      // Act
      const result = await productBatchService.getAll()

      // Assert
      expect(result.data).toEqual([])
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(productBatchService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch a single product batch by ID', async () => {
      // Arrange
      const batch = createMockProductBatch({ id: '5', batchNumber: 'BATCH-005' })
      // Transform to JSON:API format
      const apiResponse = {
        data: {
          id: '5',
          type: 'product-batches',
          attributes: batch
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        '/api/v1/product-batches/5',
        expect.objectContaining({
          params: { include: 'product,warehouse,warehouseLocation' }
        })
      )
      expect(result.id).toBe('5')
      expect(result.batchNumber).toBe('BATCH-005')
    })

    it('should throw 404 error when batch not found', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(productBatchService.getById('999')).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('should create a new product batch', async () => {
      // Arrange
      const batchData = {
        productId: '1',
        warehouseId: '2',
        warehouseLocationId: '3',
        batchNumber: 'BATCH-NEW-001',
        lotNumber: 'LOT-001',
        manufacturingDate: '2025-01-01',
        expirationDate: '2026-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        status: 'active' as const,
        unitCost: 10.50
      }
      const createdBatch = createMockProductBatch({
        id: '10',
        ...batchData,
      })
      // Transform to JSON:API format
      const apiResponse = {
        data: {
          id: '10',
          type: 'product-batches',
          attributes: createdBatch
        }
      }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.create(batchData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'product-batches',
            attributes: expect.objectContaining({
              batchNumber: 'BATCH-NEW-001',
              lotNumber: 'LOT-001',
              initialQuantity: 100
            }),
            relationships: expect.objectContaining({
              product: { data: { type: 'products', id: '1' } },
              warehouse: { data: { type: 'warehouses', id: '2' } },
              warehouseLocation: { data: { type: 'warehouse-locations', id: '3' } }
            })
          })
        })
      )
      expect(result.id).toBe('10')
      expect(result.batchNumber).toBe('BATCH-NEW-001')
    })

    it('should create batch without optional warehouseLocationId', async () => {
      // Arrange
      const batchData = {
        productId: '1',
        warehouseId: '2',
        batchNumber: 'BATCH-NEW-002',
        manufacturingDate: '2025-01-01',
        expirationDate: '2026-01-01',
        initialQuantity: 50,
        currentQuantity: 50,
        unitCost: 10.50,
        status: 'active' as const
      }
      const createdBatch = createMockProductBatch({
        id: '11',
        ...batchData,
      })
      // Transform to JSON:API format
      const apiResponse = {
        data: {
          id: '11',
          type: 'product-batches',
          attributes: createdBatch
        }
      }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.create(batchData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product-batches',
        expect.objectContaining({
          data: expect.objectContaining({
            relationships: expect.objectContaining({
              product: { data: { type: 'products', id: '1' } },
              warehouse: { data: { type: 'warehouses', id: '2' } }
            })
          })
        })
      )
      expect(result.id).toBe('11')
      expect(result.batchNumber).toBe('BATCH-NEW-002')
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const invalidData = {
        productId: '1',
        warehouseId: '2',
        batchNumber: '',
        manufacturingDate: '2025-01-01',
        expirationDate: '2026-01-01',
        initialQuantity: -10, // invalid
        currentQuantity: -10,
        unitCost: 10.50,
        status: 'active' as const
      }
      const error = new Error('Validation failed')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(productBatchService.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing product batch', async () => {
      // Arrange
      const updateData = {
        currentQuantity: 75,
        status: 'depleted' as const,
        qualityNotes: 'Updated quality notes'
      }
      const updatedBatch = createMockProductBatch({
        id: '1',
        currentQuantity: 75,
        status: 'depleted',
        qualityNotes: 'Updated quality notes'
      })
      // Transform to JSON:API format
      const apiResponse = {
        data: {
          id: '1',
          type: 'product-batches',
          attributes: updatedBatch
        }
      }
      vi.mocked(axios.put).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.update('1', updateData)

      // Assert
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/product-batches/1',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'product-batches',
            id: '1',
            attributes: expect.objectContaining({
              currentQuantity: 75,
              status: 'depleted',
              qualityNotes: 'Updated quality notes'
            })
          })
        })
      )
      expect(result.id).toBe('1')
      expect(result.currentQuantity).toBe(75)
      expect(result.status).toBe('depleted')
    })

    it('should update batch with relationship changes', async () => {
      // Arrange
      const updateData = {
        warehouseId: '5',
        warehouseLocationId: '10',
        currentQuantity: 50
      }
      const updatedBatch = createMockProductBatch({
        id: '1',
        currentQuantity: 50
      })
      // Transform to JSON:API format
      const apiResponse = {
        data: {
          id: '1',
          type: 'product-batches',
          attributes: updatedBatch
        }
      }
      vi.mocked(axios.put).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await productBatchService.update('1', updateData)

      // Assert
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/product-batches/1',
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              currentQuantity: 50
            }),
            relationships: expect.objectContaining({
              warehouse: { data: { type: 'warehouses', id: '5' } },
              warehouseLocation: { data: { type: 'warehouse-locations', id: '10' } }
            })
          })
        })
      )
      expect(result.id).toBe('1')
      expect(result.currentQuantity).toBe(50)
    })

    it('should throw 404 error when updating non-existent batch', async () => {
      // Arrange
      const updateData = { currentQuantity: 50 }
      const error = new Error('Not found')
      vi.mocked(axios.put).mockRejectedValue(error)

      // Act & Assert
      await expect(productBatchService.update('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('delete', () => {
    it('should delete a product batch', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await productBatchService.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/product-batches/1')
    })

    it('should throw error when batch has dependent records', async () => {
      // Arrange
      const error = new Error('Cannot delete batch with associated inventory movements')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(productBatchService.delete('1')).rejects.toThrow(
        'Cannot delete batch with associated inventory movements'
      )
    })

    it('should throw 404 error when deleting non-existent batch', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(productBatchService.delete('999')).rejects.toThrow('Not found')
    })
  })
})
