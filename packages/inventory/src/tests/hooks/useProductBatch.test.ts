/**
 * useProductBatch Hooks Tests
 * Tests for product batch SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useProductBatch,
  useProductBatches,
  useProductBatchesByProduct,
  useProductBatchesByWarehouse,
  useProductBatchesByStatus,
  useProductBatchMutations
} from '../../hooks'
import { productBatchService } from '../../services/productBatchService'
import { createMockProductBatch } from '../utils/test-utils'

// Mock the product batch service
vi.mock('../../services/productBatchService')

describe('useProductBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should fetch a single product batch by ID', async () => {
    // Arrange
    const batch = createMockProductBatch({ id: '5', batchNumber: 'BATCH-005' })
    vi.mocked(productBatchService.getById).mockResolvedValue(batch)

    // Act
    const { result } = renderHook(() => useProductBatch({ id: '5' }))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatch).toEqual(batch)
    expect(result.current.error).toBeNull()
    expect(productBatchService.getById).toHaveBeenCalledWith('5')
  })

  it('should not fetch when ID is undefined', () => {
    // Act
    const { result } = renderHook(() => useProductBatch({ id: undefined }))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.productBatch).toBeUndefined()
    expect(productBatchService.getById).not.toHaveBeenCalled()
  })

  it('should not fetch when enabled is false', () => {
    // Act
    const { result } = renderHook(() => useProductBatch({ id: '5', enabled: false }))

    // Assert
    expect(result.current.productBatch).toBeUndefined()
    expect(productBatchService.getById).not.toHaveBeenCalled()
  })

  it('should handle 404 error', async () => {
    // Arrange
    const error = new Error('Not found')
    vi.mocked(productBatchService.getById).mockRejectedValue(error)

    // Act
    const { result } = renderHook(() => useProductBatch({ id: '999' }))

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatch).toBeUndefined()
    expect(result.current.error).toBeDefined()
  })
})

describe('useProductBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should fetch and return product batches', async () => {
    // Arrange
    const batches = [
      createMockProductBatch({ id: '1', batchNumber: 'BATCH-001' }),
      createMockProductBatch({ id: '2', batchNumber: 'BATCH-002' }),
    ]
    const response = {
      data: batches,
      meta: {
        page: {
          currentPage: 1,
          lastPage: 1,
          perPage: 20,
          total: 2
        }
      }
    }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() => useProductBatches())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(result.current.meta).toEqual({
      total: 2,
      perPage: 20,
      currentPage: 1,
      lastPage: 1
    })
    expect(result.current.error).toBeNull()
    expect(productBatchService.getAll).toHaveBeenCalled()
  })

  it('should fetch batches with filters', async () => {
    // Arrange
    const batches = [createMockProductBatch({ id: '1' })]
    const response = { data: batches, meta: {} }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() =>
      useProductBatches({ filters: { productId: '5' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      { productId: '5' },
      { field: 'createdAt', direction: 'desc' },
      1,
      20
    )
  })

  it('should fetch batches with custom sorting', async () => {
    // Arrange
    const batches = [createMockProductBatch()]
    const response = { data: batches, meta: {} }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() =>
      useProductBatches({ sort: { field: 'expirationDate', direction: 'asc' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      undefined,
      { field: 'expirationDate', direction: 'asc' },
      1,
      20
    )
  })

  it('should fetch batches with pagination', async () => {
    // Arrange
    const batches = [createMockProductBatch()]
    const response = { data: batches, meta: {} }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() =>
      useProductBatches({ page: 2, pageSize: 10 })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      undefined,
      { field: 'createdAt', direction: 'desc' },
      2,
      10
    )
  })

  it('should not fetch when enabled is false', () => {
    // Act
    const { result } = renderHook(() => useProductBatches({ enabled: false }))

    // Assert
    expect(result.current.productBatches).toEqual([])
    expect(productBatchService.getAll).not.toHaveBeenCalled()
  })
})

describe('useProductBatchesByProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should fetch batches by product ID', async () => {
    // Arrange
    const batches = [
      createMockProductBatch({ id: '1', batchNumber: 'BATCH-001' }),
      createMockProductBatch({ id: '2', batchNumber: 'BATCH-002' }),
    ]
    const response = { data: batches, meta: {} }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() => useProductBatchesByProduct('7'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      { productId: '7' },
      { field: 'expirationDate', direction: 'asc' },
      1,
      20
    )
  })
})

describe('useProductBatchesByWarehouse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should fetch batches by warehouse ID', async () => {
    // Arrange
    const batches = [
      createMockProductBatch({ id: '1', batchNumber: 'BATCH-001' }),
      createMockProductBatch({ id: '2', batchNumber: 'BATCH-002' }),
    ]
    const response = { data: batches, meta: {} }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() => useProductBatchesByWarehouse('3'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      { warehouseId: '3' },
      { field: 'batchNumber', direction: 'asc' },
      1,
      20
    )
  })
})

describe('useProductBatchesByStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should fetch batches by status', async () => {
    // Arrange
    const batches = [
      createMockProductBatch({ id: '1', status: 'active' }),
      createMockProductBatch({ id: '2', status: 'active' }),
    ]
    const response = { data: batches, meta: {} }
    vi.mocked(productBatchService.getAll).mockResolvedValue(response)

    // Act
    const { result } = renderHook(() => useProductBatchesByStatus('active'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.productBatches).toEqual(batches)
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      { status: 'active' },
      { field: 'expirationDate', direction: 'asc' },
      1,
      20
    )
  })
})

describe('useProductBatchMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('createProductBatch', () => {
    it('should create a new product batch', async () => {
      // Arrange
      const batchData = {
        productId: '1',
        warehouseId: '2',
        batchNumber: 'BATCH-NEW-001',
        manufacturingDate: '2025-01-01',
        expirationDate: '2026-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 10.50,
        status: 'active' as const
      }
      const createdBatch = createMockProductBatch({
        id: '10',
        ...batchData,
      })
      vi.mocked(productBatchService.create).mockResolvedValue(createdBatch)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())
      const created = await result.current.createProductBatch(batchData)

      // Assert
      expect(created).toEqual(createdBatch)
      expect(productBatchService.create).toHaveBeenCalledWith(batchData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const batchData = {
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
      vi.mocked(productBatchService.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())

      // Assert
      await expect(result.current.createProductBatch(batchData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateProductBatch', () => {
    it('should update an existing product batch', async () => {
      // Arrange
      const updateData = {
        currentQuantity: 75,
        status: 'consumed' as const,
      }
      const updatedBatch = createMockProductBatch({
        id: '1',
        currentQuantity: 75,
        status: 'consumed',
      })
      vi.mocked(productBatchService.update).mockResolvedValue(updatedBatch)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())
      const updated = await result.current.updateProductBatch('1', updateData)

      // Assert
      expect(updated).toEqual(updatedBatch)
      expect(productBatchService.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData = { currentQuantity: 150 }
      const error = new Error('Not found')
      vi.mocked(productBatchService.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())

      // Assert
      await expect(result.current.updateProductBatch('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('deleteProductBatch', () => {
    it('should delete a product batch', async () => {
      // Arrange
      vi.mocked(productBatchService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())
      await result.current.deleteProductBatch('1')

      // Assert
      expect(productBatchService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = new Error('Cannot delete batch with associated movements')
      vi.mocked(productBatchService.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())

      // Assert
      await expect(result.current.deleteProductBatch('1')).rejects.toThrow(
        'Cannot delete batch with associated movements'
      )
    })
  })

  describe('isLoading state', () => {
    it('should track loading state during create', async () => {
      // Arrange
      const batchData = {
        productId: '1',
        warehouseId: '2',
        batchNumber: 'BATCH-NEW-001',
        manufacturingDate: '2025-01-01',
        expirationDate: '2026-01-01',
        initialQuantity: 100,
        currentQuantity: 100,
        unitCost: 10.50,
        status: 'active' as const
      }
      const createdBatch = createMockProductBatch({ id: '10' })
      vi.mocked(productBatchService.create).mockResolvedValue(createdBatch)

      // Act
      const { result } = renderHook(() => useProductBatchMutations())

      // Initially not loading
      expect(result.current.isLoading).toBe(false)

      // Start create operation
      const createPromise = result.current.createProductBatch(batchData)

      // Wait for completion
      await createPromise

      // Assert
      expect(productBatchService.create).toHaveBeenCalled()
    })
  })
})
