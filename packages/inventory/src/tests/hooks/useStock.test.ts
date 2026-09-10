/**
 * useStock Hooks Tests
 * Tests for stock SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useStock,
  useStockItem,
  useStockMutations,
  useStockByProduct,
  useWarehouseStockSummary,
  useLocationStockSummary,
} from '../../hooks/useStock'
import { stockService } from '../../services'
import { createMockStock } from '../utils/test-utils'
import { processJsonApiResponse } from '../../utils/jsonApi'

// Mock the stock service
vi.mock('../../services')

// Mock the JSON API utility
vi.mock('../../utils/jsonApi')

describe('useStock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return stock', async () => {
    // Arrange
    const stock = [
      createMockStock({ id: '1', quantity: 100 }),
      createMockStock({ id: '2', quantity: 200 }),
    ]
    const apiResponse = { data: stock, meta: {} }
    vi.mocked(stockService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({
      data: stock,
      meta: {},
    })

    // Act
    const { result } = renderHook(() => useStock())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(result.current.error).toBeUndefined()
    expect(stockService.getAll).toHaveBeenCalled()
  })

  it('should fetch stock with filters', async () => {
    // Arrange
    const stock = [createMockStock({ id: '1', productId: '5' })]
    const apiResponse = { data: stock }
    vi.mocked(stockService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: stock })

    // Act
    const { result } = renderHook(() =>
      useStock({ filters: { productId: '5' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(stockService.getAll).toHaveBeenCalledWith({
      filters: { productId: '5' },
    })
  })

  it('should fetch stock with sorting', async () => {
    // Arrange
    const stock = [createMockStock()]
    const apiResponse = { data: stock }
    vi.mocked(stockService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: stock })

    // Act
    const { result } = renderHook(() =>
      useStock({ sort: { field: 'quantity', direction: 'desc' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(stockService.getAll).toHaveBeenCalledWith({
      sort: { field: 'quantity', direction: 'desc' },
    })
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const stock = [createMockStock()]
    const apiResponse = { data: stock }
    vi.mocked(stockService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: stock })

    // Act
    const { result } = renderHook(() => useStock())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useStockItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.log from the hook
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should fetch a single stock item by ID', async () => {
    // Arrange
    const stockItem = createMockStock({ id: '5', quantity: 150 })
    const apiResponse = { data: stockItem }
    vi.mocked(stockService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: stockItem })

    // Act
    const { result } = renderHook(() => useStockItem('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stockItem).toEqual(stockItem)
    expect(result.current.error).toBeUndefined()
    expect(stockService.getById).toHaveBeenCalledWith('5', undefined)
  })

  it('should fetch stock item with includes', async () => {
    // Arrange
    const stockItem = createMockStock({ id: '5' })
    const apiResponse = { data: stockItem }
    vi.mocked(stockService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: stockItem })

    // Act
    const { result } = renderHook(() => useStockItem('5', ['product', 'warehouse', 'location']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stockItem).toEqual(stockItem)
    expect(stockService.getById).toHaveBeenCalledWith('5', ['product', 'warehouse', 'location'])
  })

  it('should not fetch when ID is null', () => {
    // Act
    const { result } = renderHook(() => useStockItem(null))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.stockItem).toBeUndefined()
    expect(stockService.getById).not.toHaveBeenCalled()
  })

  it('should handle 404 error', async () => {
    // Arrange
    const error = new Error('Not found')
    vi.mocked(stockService.getById).mockRejectedValue(error)

    // Act
    const { result } = renderHook(() => useStockItem('999'))

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stockItem).toBeUndefined()
    expect(result.current.error).toBeDefined()
  })
})

describe('useStockMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createStock', () => {
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
      vi.mocked(stockService.create).mockResolvedValue({
        data: createdStock,
      })

      // Act
      const { result } = renderHook(() => useStockMutations())
      const createdResult = await result.current.createStock(stockData)

      // Assert
      expect(createdResult).toEqual({ data: createdStock })
      expect(stockService.create).toHaveBeenCalledWith(stockData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const stockData = {
        productId: '1',
        warehouseId: '2',
        warehouseLocationId: '3',
        quantity: -10, // invalid
        availableQuantity: -10,
        status: 'available' as const,
      }
      const error = new Error('Validation failed')
      vi.mocked(stockService.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useStockMutations())

      // Assert
      await expect(result.current.createStock(stockData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateStock', () => {
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
      vi.mocked(stockService.update).mockResolvedValue({
        data: updatedStock,
      })

      // Act
      const { result } = renderHook(() => useStockMutations())
      const updatedResult = await result.current.updateStock('1', updateData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedStock })
      expect(stockService.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData = { quantity: 150 }
      const error = new Error('Not found')
      vi.mocked(stockService.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useStockMutations())

      // Assert
      await expect(result.current.updateStock('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('deleteStock', () => {
    it('should delete a stock entry', async () => {
      // Arrange
      vi.mocked(stockService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useStockMutations())
      await result.current.deleteStock('1')

      // Assert
      expect(stockService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = new Error('Foreign key constraint failed')
      vi.mocked(stockService.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useStockMutations())

      // Assert
      await expect(result.current.deleteStock('1')).rejects.toThrow('Foreign key constraint failed')
    })
  })
})

describe('useStockByProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch stock by product ID', async () => {
    // Arrange
    const stock = [
      createMockStock({ id: '1', productId: '7', warehouseId: '1' }),
      createMockStock({ id: '2', productId: '7', warehouseId: '2' }),
    ]
    vi.mocked(stockService.getByProduct).mockResolvedValue({ data: stock })

    // Act
    const { result } = renderHook(() => useStockByProduct('7'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stockByProduct).toEqual(stock)
    expect(stockService.getByProduct).toHaveBeenCalledWith('7', undefined)
  })

  it('should not fetch when productId is null', () => {
    // Act
    const { result } = renderHook(() => useStockByProduct(null))

    // Assert
    expect(result.current.stockByProduct).toEqual([])
    expect(stockService.getByProduct).not.toHaveBeenCalled()
  })

  it('should fetch stock by product with includes', async () => {
    // Arrange
    const stock = [createMockStock({ id: '1', productId: '7' })]
    vi.mocked(stockService.getByProduct).mockResolvedValue({ data: stock })

    // Act
    const { result } = renderHook(() => useStockByProduct('7', ['warehouse', 'location']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stockByProduct).toEqual(stock)
    expect(stockService.getByProduct).toHaveBeenCalledWith('7', ['warehouse', 'location'])
  })
})

describe('useWarehouseStockSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch warehouse stock summary', async () => {
    // Arrange
    const summary = {
      data: [
        { productId: 1, totalQuantity: 500, locations: 3 },
        { productId: 2, totalQuantity: 300, locations: 2 },
      ]
    }
    vi.mocked(stockService.getWarehouseSummary).mockResolvedValue(summary)

    // Act
    const { result } = renderHook(() => useWarehouseStockSummary('1'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.summary).toEqual(summary.data)
    expect(stockService.getWarehouseSummary).toHaveBeenCalledWith('1')
  })

  it('should not fetch when warehouseId is null', () => {
    // Act
    const { result } = renderHook(() => useWarehouseStockSummary(null))

    // Assert
    expect(result.current.summary).toEqual([])
    expect(stockService.getWarehouseSummary).not.toHaveBeenCalled()
  })
})

describe('useLocationStockSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch location stock summary', async () => {
    // Arrange
    const summary = {
      data: [
        { productId: 1, quantity: 100 },
        { productId: 2, quantity: 50 },
      ]
    }
    vi.mocked(stockService.getLocationSummary).mockResolvedValue(summary)

    // Act
    const { result } = renderHook(() => useLocationStockSummary('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.summary).toEqual(summary.data)
    expect(stockService.getLocationSummary).toHaveBeenCalledWith('5')
  })

  it('should not fetch when locationId is null', () => {
    // Act
    const { result } = renderHook(() => useLocationStockSummary(null))

    // Assert
    expect(result.current.summary).toEqual([])
    expect(stockService.getLocationSummary).not.toHaveBeenCalled()
  })
})
