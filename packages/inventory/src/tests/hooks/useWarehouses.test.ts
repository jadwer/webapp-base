/**
 * useWarehouses Hooks Tests
 * Tests for warehouses SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useWarehouses,
  useWarehouse,
  useWarehousesMutations,
  useWarehouseLocations,
  useWarehouseStock,
} from '../../hooks/useWarehouses'
import { warehousesService } from '../../services'
import { createMockWarehouse } from '../utils/test-utils'
import { processJsonApiResponse } from '../../utils/jsonApi'
import type { Warehouse, WarehouseParsed, ApiResponse } from '../../types'

// Helper to create Warehouse with attributes structure for service mocks
const createMockWarehouseApiFormat = (parsedWarehouse: WarehouseParsed): Warehouse => ({
  id: parsedWarehouse.id,
  type: 'warehouses',
  attributes: {
    name: parsedWarehouse.name,
    slug: parsedWarehouse.slug,
    description: parsedWarehouse.description,
    code: parsedWarehouse.code,
    warehouseType: parsedWarehouse.warehouseType,
    address: parsedWarehouse.address,
    city: parsedWarehouse.city,
    state: parsedWarehouse.state,
    country: parsedWarehouse.country,
    postalCode: parsedWarehouse.postalCode,
    phone: parsedWarehouse.phone,
    email: parsedWarehouse.email,
    managerName: parsedWarehouse.managerName,
    maxCapacity: parsedWarehouse.maxCapacity,
    capacityUnit: parsedWarehouse.capacityUnit,
    isActive: parsedWarehouse.isActive,
    createdAt: parsedWarehouse.createdAt,
    updatedAt: parsedWarehouse.updatedAt,
  }
})

// Mock the warehouses service
vi.mock('../../services')

// Mock the JSON API utility
vi.mock('../../utils/jsonApi')

describe('useWarehouses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return warehouses', async () => {
    // Arrange
    const parsedWarehouses = [
      createMockWarehouse({ id: '1', name: 'Warehouse 1' }),
      createMockWarehouse({ id: '2', name: 'Warehouse 2' }),
    ]
    const apiWarehouses = parsedWarehouses.map(createMockWarehouseApiFormat)
    const apiResponse = { data: apiWarehouses, meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 2, total: 2 } } } as unknown as ApiResponse<Warehouse>
    vi.mocked(warehousesService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({
      data: parsedWarehouses,
      meta: {},
    })

    // Act
    const { result } = renderHook(() => useWarehouses())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.warehouses).toEqual(parsedWarehouses)
    expect(result.current.error).toBeUndefined()
    expect(warehousesService.getAll).toHaveBeenCalled()
  })

  it('should fetch warehouses with filters', async () => {
    // Arrange
    const parsedWarehouses = [createMockWarehouse({ id: '1', name: 'Main Warehouse' })]
    const apiWarehouses = parsedWarehouses.map(createMockWarehouseApiFormat)
    const apiResponse = { data: apiWarehouses, meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } } as unknown as ApiResponse<Warehouse>
    vi.mocked(warehousesService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: parsedWarehouses })

    // Act
    const { result } = renderHook(() =>
      useWarehouses({ filters: { search: 'Main' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.warehouses).toEqual(parsedWarehouses)
    expect(warehousesService.getAll).toHaveBeenCalledWith({
      filters: { search: 'Main' },
    })
  })

  it('should fetch warehouses with sorting', async () => {
    // Arrange
    const parsedWarehouses = [createMockWarehouse()]
    const apiWarehouses = parsedWarehouses.map(createMockWarehouseApiFormat)
    const apiResponse = { data: apiWarehouses, meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } } as unknown as ApiResponse<Warehouse>
    vi.mocked(warehousesService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: parsedWarehouses })

    // Act
    const { result } = renderHook(() =>
      useWarehouses({ sort: { field: 'name', direction: 'desc' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.warehouses).toEqual(parsedWarehouses)
    expect(warehousesService.getAll).toHaveBeenCalledWith({
      sort: { field: 'name', direction: 'desc' },
    })
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const parsedWarehouses = [createMockWarehouse()]
    const apiWarehouses = parsedWarehouses.map(createMockWarehouseApiFormat)
    const apiResponse = { data: apiWarehouses, meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } } as unknown as ApiResponse<Warehouse>
    vi.mocked(warehousesService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: parsedWarehouses })

    // Act
    const { result } = renderHook(() => useWarehouses())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useWarehouse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single warehouse by ID', async () => {
    // Arrange
    const parsedWarehouse = createMockWarehouse({ id: '5', name: 'Warehouse 5' })
    const apiWarehouse = createMockWarehouseApiFormat(parsedWarehouse)
    const apiResponse = { data: [apiWarehouse], meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } } as unknown as ApiResponse<Warehouse>
    vi.mocked(warehousesService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: parsedWarehouse })

    // Act
    const { result } = renderHook(() => useWarehouse('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.warehouse).toEqual(parsedWarehouse)
    expect(result.current.error).toBeUndefined()
    expect(warehousesService.getById).toHaveBeenCalledWith('5', undefined)
  })

  it('should fetch warehouse with includes', async () => {
    // Arrange
    const parsedWarehouse = createMockWarehouse({ id: '5' })
    const apiWarehouse = createMockWarehouseApiFormat(parsedWarehouse)
    const apiResponse = { data: [apiWarehouse], meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } } as unknown as ApiResponse<Warehouse>
    vi.mocked(warehousesService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: parsedWarehouse })

    // Act
    const { result } = renderHook(() => useWarehouse('5', ['locations', 'stock']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.warehouse).toEqual(parsedWarehouse)
    expect(warehousesService.getById).toHaveBeenCalledWith('5', ['locations', 'stock'])
  })

  it('should not fetch when ID is null', () => {
    // Act
    const { result } = renderHook(() => useWarehouse(null))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.warehouse).toBeUndefined()
    expect(warehousesService.getById).not.toHaveBeenCalled()
  })

  it('should handle 404 error', async () => {
    // Arrange
    const error = new Error('Not found')
    vi.mocked(warehousesService.getById).mockRejectedValue(error)

    // Act
    const { result } = renderHook(() => useWarehouse('999'))

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.warehouse).toBeUndefined()
    expect(result.current.error).toBeDefined()
  })
})

describe('useWarehousesMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createWarehouse', () => {
    it('should create a new warehouse', async () => {
      // Arrange
      const warehouseData = {
        name: 'New Warehouse',
        slug: 'new-warehouse',
        code: 'WH-NEW',
        warehouseType: 'main' as const,
        isActive: true,
      }
      const parsedWarehouse = createMockWarehouse({
        id: '10',
        ...warehouseData,
      })
      const apiWarehouse = createMockWarehouseApiFormat(parsedWarehouse)
      vi.mocked(warehousesService.create).mockResolvedValue({
        data: [apiWarehouse],
        meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } }
      } as unknown as ApiResponse<Warehouse>)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      const createdResult = await result.current.createWarehouse(warehouseData)

      // Assert
      expect(createdResult).toEqual({ data: [apiWarehouse], meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } })
      expect(warehousesService.create).toHaveBeenCalledWith(warehouseData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const warehouseData = {
        name: '',
        slug: '',
        code: '',
        warehouseType: 'main' as const,
        isActive: true,
      }
      const error = new Error('Validation failed')
      vi.mocked(warehousesService.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await expect(result.current.createWarehouse(warehouseData)).rejects.toThrow('Validation failed')
    })

    it('should set loading state during creation', async () => {
      // Arrange
      const warehouseData = {
        name: 'New Warehouse',
        slug: 'new-warehouse',
        code: 'WH-NEW',
        warehouseType: 'main' as const,
        isActive: true,
      }
      vi.mocked(warehousesService.create).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: [createMockWarehouseApiFormat(createMockWarehouse())],
          meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } }
        } as unknown as ApiResponse<Warehouse>), 100))
      )

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      const promise = result.current.createWarehouse(warehouseData)

      // Assert - Loading state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await promise

      // Assert - Loading completed
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('updateWarehouse', () => {
    it('should update an existing warehouse', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Warehouse',
        isActive: false,
      }
      const parsedWarehouse = createMockWarehouse({
        id: '1',
        name: 'Updated Warehouse',
        isActive: false,
      })
      const apiWarehouse = createMockWarehouseApiFormat(parsedWarehouse)
      vi.mocked(warehousesService.update).mockResolvedValue({
        data: [apiWarehouse],
        meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } }
      } as unknown as ApiResponse<Warehouse>)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      const updatedResult = await result.current.updateWarehouse('1', updateData)

      // Assert
      expect(updatedResult).toEqual({ data: [apiWarehouse], meta: { page: { currentPage: 1, from: 1, lastPage: 1, perPage: 20, to: 1, total: 1 } } })
      expect(warehousesService.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData = { name: 'Updated' }
      const error = new Error('Not found')
      vi.mocked(warehousesService.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await expect(result.current.updateWarehouse('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('deleteWarehouse', () => {
    it('should delete a warehouse', async () => {
      // Arrange
      vi.mocked(warehousesService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())
      await result.current.deleteWarehouse('1')

      // Assert
      expect(warehousesService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = new Error('Foreign key constraint failed')
      vi.mocked(warehousesService.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useWarehousesMutations())

      // Assert
      await expect(result.current.deleteWarehouse('1')).rejects.toThrow('Foreign key constraint failed')
    })
  })
})

describe('useWarehouseLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch locations for a warehouse', async () => {
    // Arrange
    const locations = [
      { id: '1', name: 'Location 1', code: 'A-1-1' },
      { id: '2', name: 'Location 2', code: 'A-1-2' },
    ]
    vi.mocked(warehousesService.getLocations).mockResolvedValue({ data: locations })

    // Act
    const { result } = renderHook(() => useWarehouseLocations('1'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.locations).toEqual(locations)
    expect(warehousesService.getLocations).toHaveBeenCalledWith('1', undefined)
  })

  it('should not fetch when warehouseId is null', () => {
    // Act
    const { result } = renderHook(() => useWarehouseLocations(null))

    // Assert
    expect(result.current.locations).toEqual([])
    expect(warehousesService.getLocations).not.toHaveBeenCalled()
  })

  it('should fetch locations with includes', async () => {
    // Arrange
    const locations = [{ id: '1', name: 'Location 1' }]
    vi.mocked(warehousesService.getLocations).mockResolvedValue({ data: locations })

    // Act
    const { result } = renderHook(() => useWarehouseLocations('1', ['stock']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.locations).toEqual(locations)
    expect(warehousesService.getLocations).toHaveBeenCalledWith('1', ['stock'])
  })
})

describe('useWarehouseStock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch stock for a warehouse', async () => {
    // Arrange
    const stock = [
      { id: '1', quantity: 100, productId: '1' },
      { id: '2', quantity: 200, productId: '2' },
    ]
    vi.mocked(warehousesService.getStock).mockResolvedValue({ data: stock })

    // Act
    const { result } = renderHook(() => useWarehouseStock('1'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(warehousesService.getStock).toHaveBeenCalledWith('1', undefined)
  })

  it('should not fetch when warehouseId is null', () => {
    // Act
    const { result } = renderHook(() => useWarehouseStock(null))

    // Assert
    expect(result.current.stock).toEqual([])
    expect(warehousesService.getStock).not.toHaveBeenCalled()
  })

  it('should fetch stock with includes', async () => {
    // Arrange
    const stock = [{ id: '1', quantity: 100 }]
    vi.mocked(warehousesService.getStock).mockResolvedValue({ data: stock })

    // Act
    const { result } = renderHook(() => useWarehouseStock('1', ['product', 'location']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(warehousesService.getStock).toHaveBeenCalledWith('1', ['product', 'location'])
  })
})
