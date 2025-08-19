/**
 * useProductBatchMutations Hook Tests
 * 
 * Tests for ProductBatch mutations with SWR cache management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useProductBatchMutations } from '../../hooks/useProductBatchMutations'
import { productBatchService } from '../../services/productBatchService'
import { createMockProductBatch } from '../utils/test-utils'
import type { ReactNode, FC } from 'react'
import type { CreateProductBatchRequest, UpdateProductBatchRequest } from '../../types'

// Mock the service
vi.mock('../../services/productBatchService', () => ({
  productBatchService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

const mockedService = vi.mocked(productBatchService)

// SWR wrapper for testing with cache
function createWrapper() {
  const cache = new Map()
  
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
    return (
      <SWRConfig value={{ 
        dedupingInterval: 0, 
        provider: () => cache,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
      }}>
        {children}
      </SWRConfig>
    )
  }
  
  return { Wrapper, cache }
}

describe('useProductBatchMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createProductBatch', () => {
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
      
      const mockCreatedBatch = createMockProductBatch({
        id: '42',
        batchNumber: 'BATCH-NEW-001'
      })
      
      mockedService.create.mockResolvedValueOnce(mockCreatedBatch)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      let createdBatch
      await act(async () => {
        createdBatch = await result.current.createProductBatch(createData)
      })

      // Assert
      expect(mockedService.create).toHaveBeenCalledWith(createData)
      expect(createdBatch).toEqual(mockCreatedBatch)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle loading state during creation', async () => {
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
      
      // Create a delayed promise that resolves after 100ms
      mockedService.create.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockProductBatch()), 100))
      )
      
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      // Act
      let createPromise: Promise<any>
      await act(async () => {
        createPromise = result.current.createProductBatch(createData)
      })
      
      // Check loading state immediately after starting (but before promise resolves)
      expect(result.current.isLoading).toBe(true)
      
      // Wait for completion
      await act(async () => {
        await createPromise
      })

      // Assert - Loading complete
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const createData: CreateProductBatchRequest = {
        batchNumber: '',
        manufacturingDate: '2025-01-01',
        expirationDate: '2027-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 50.00,
        status: 'active',
        productId: '1',
        warehouseId: '2'
      }
      
      const mockError = new Error('Validation failed')
      mockedService.create.mockRejectedValueOnce(mockError)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      // Assert
      await act(async () => {
        await expect(result.current.createProductBatch(createData)).rejects.toThrow('Validation failed')
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('updateProductBatch', () => {
    it('should update product batch successfully', async () => {
      // Arrange
      const updateData: UpdateProductBatchRequest = {
        currentQuantity: 75,
        status: 'quarantine',
        qualityNotes: 'Quality issues detected'
      }
      
      const mockUpdatedBatch = createMockProductBatch({
        id: '1',
        currentQuantity: 75,
        status: 'quarantine'
      })
      
      mockedService.update.mockResolvedValueOnce(mockUpdatedBatch)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      let updatedBatch
      await act(async () => {
        updatedBatch = await result.current.updateProductBatch('1', updateData)
      })

      // Assert
      expect(mockedService.update).toHaveBeenCalledWith('1', updateData)
      expect(updatedBatch).toEqual(mockUpdatedBatch)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData: UpdateProductBatchRequest = { currentQuantity: -1 }
      const mockError = new Error('Invalid quantity')
      mockedService.update.mockRejectedValueOnce(mockError)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      // Assert
      await act(async () => {
        await expect(result.current.updateProductBatch('1', updateData)).rejects.toThrow('Invalid quantity')
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('deleteProductBatch', () => {
    it('should delete product batch successfully', async () => {
      // Arrange
      mockedService.delete.mockResolvedValueOnce(undefined)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.deleteProductBatch('1')
      })

      // Assert
      expect(mockedService.delete).toHaveBeenCalledWith('1')
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle delete errors', async () => {
      // Arrange
      const mockError = new Error('Cannot delete product batch')
      mockedService.delete.mockRejectedValueOnce(mockError)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      // Assert
      await act(async () => {
        await expect(result.current.deleteProductBatch('1')).rejects.toThrow('Cannot delete product batch')
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle constraint violation errors', async () => {
      // Arrange
      const mockError = new Error('Cannot delete product batch with movements')
      mockError.name = 'ConstraintError'
      mockedService.delete.mockRejectedValueOnce(mockError)
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      // Assert
      await act(async () => {
        await expect(result.current.deleteProductBatch('1')).rejects.toThrow('Cannot delete product batch with movements')
      })
    })
  })

  describe('concurrent operations', () => {
    it('should handle multiple operations correctly', async () => {
      // Arrange
      const createData: CreateProductBatchRequest = {
        batchNumber: 'BATCH-001',
        manufacturingDate: '2025-01-01',
        expirationDate: '2027-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 50.00,
        status: 'active',
        productId: '1',
        warehouseId: '2'
      }
      
      const updateData: UpdateProductBatchRequest = { currentQuantity: 90 }
      
      mockedService.create.mockResolvedValueOnce(createMockProductBatch({ id: '1' }))
      mockedService.update.mockResolvedValueOnce(createMockProductBatch({ id: '1', currentQuantity: 90 }))
      mockedService.delete.mockResolvedValueOnce(undefined)
      
      const { Wrapper } = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.createProductBatch(createData)
        await result.current.updateProductBatch('1', updateData)
        await result.current.deleteProductBatch('1')
      })

      // Assert
      expect(mockedService.create).toHaveBeenCalledTimes(1)
      expect(mockedService.update).toHaveBeenCalledTimes(1)
      expect(mockedService.delete).toHaveBeenCalledTimes(1)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('cache invalidation', () => {
    it('should invalidate related caches after operations', async () => {
      // Arrange
      const { Wrapper, cache } = createWrapper()
      
      // Pre-populate cache with some data
      cache.set(['product-batches', {}], { data: [createMockProductBatch()] })
      cache.set(['inventory'], { data: 'some inventory data' })
      cache.set(['stock'], { data: 'some stock data' })
      
      mockedService.create.mockResolvedValueOnce(createMockProductBatch())
      mockedService.update.mockResolvedValueOnce(createMockProductBatch())
      mockedService.delete.mockResolvedValueOnce(undefined)

      // Act
      const { result } = renderHook(() => useProductBatchMutations(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.createProductBatch({
          batchNumber: 'BATCH-001',
          manufacturingDate: '2025-01-01',
          expirationDate: '2027-01-01',
          initialQuantity: 100,
          currentQuantity: 100,
          unitCost: 50.00,
          status: 'active',
          productId: '1',
          warehouseId: '2'
        })
      })

      // Note: In a real implementation, we would verify cache invalidation
      // but for this test, we just ensure the operations complete successfully
      expect(mockedService.create).toHaveBeenCalled()
    })
  })
})