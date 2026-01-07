/**
 * useLocations Hooks Tests
 * Tests for warehouse locations SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useLocations,
  useLocation,
  useLocationsMutations,
  useLocationStock,
} from '../../hooks/useLocations'
import { locationsService } from '../../services'
import { createMockLocation } from '../utils/test-utils'
import { processJsonApiResponse } from '../../utils/jsonApi'

// Mock the locations service
vi.mock('../../services')

// Mock the JSON API utility
vi.mock('../../utils/jsonApi')

describe('useLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return locations', async () => {
    // Arrange
    const locations = [
      createMockLocation({ id: '1', name: 'Location A-1-1' }),
      createMockLocation({ id: '2', name: 'Location A-1-2' }),
    ]
    const apiResponse = { data: locations, meta: {} }
    vi.mocked(locationsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({
      data: locations,
      meta: {},
    })

    // Act
    const { result } = renderHook(() => useLocations())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.locations).toEqual(locations)
    expect(result.current.error).toBeUndefined()
    expect(locationsService.getAll).toHaveBeenCalled()
  })

  it('should fetch locations with filters', async () => {
    // Arrange
    const locations = [createMockLocation({ id: '1', name: 'Zone A-1-1' })]
    const apiResponse = { data: locations }
    vi.mocked(locationsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: locations })

    // Act
    const { result } = renderHook(() =>
      useLocations({ filters: { search: 'Zone A' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.locations).toEqual(locations)
    expect(locationsService.getAll).toHaveBeenCalledWith({
      filters: { search: 'Zone A' },
    })
  })

  it('should fetch locations with sorting', async () => {
    // Arrange
    const locations = [createMockLocation()]
    const apiResponse = { data: locations }
    vi.mocked(locationsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: locations })

    // Act
    const { result } = renderHook(() =>
      useLocations({ sort: { field: 'name', direction: 'desc' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.locations).toEqual(locations)
    expect(locationsService.getAll).toHaveBeenCalledWith({
      sort: { field: 'name', direction: 'desc' },
    })
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const locations = [createMockLocation()]
    const apiResponse = { data: locations }
    vi.mocked(locationsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: locations })

    // Act
    const { result } = renderHook(() => useLocations())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single location by ID', async () => {
    // Arrange
    const location = createMockLocation({ id: '5', name: 'Location A-5-1' })
    const apiResponse = { data: location }
    vi.mocked(locationsService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: location })

    // Act
    const { result } = renderHook(() => useLocation('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.location).toEqual(location)
    expect(result.current.error).toBeUndefined()
    expect(locationsService.getById).toHaveBeenCalledWith('5', undefined)
  })

  it('should fetch location with includes', async () => {
    // Arrange
    const location = createMockLocation({ id: '5' })
    const apiResponse = { data: location }
    vi.mocked(locationsService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: location })

    // Act
    const { result } = renderHook(() => useLocation('5', ['warehouse', 'stock']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.location).toEqual(location)
    expect(locationsService.getById).toHaveBeenCalledWith('5', ['warehouse', 'stock'])
  })

  it('should not fetch when ID is null', () => {
    // Act
    const { result } = renderHook(() => useLocation(null))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.location).toBeUndefined()
    expect(locationsService.getById).not.toHaveBeenCalled()
  })

  it('should handle 404 error', async () => {
    // Arrange
    const error = new Error('Not found')
    vi.mocked(locationsService.getById).mockRejectedValue(error)

    // Act
    const { result } = renderHook(() => useLocation('999'))

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.location).toBeUndefined()
    expect(result.current.error).toBeDefined()
  })
})

describe('useLocationsMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createLocation', () => {
    it('should create a new location', async () => {
      // Arrange
      const locationData = {
        warehouseId: '1',
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
      vi.mocked(locationsService.create).mockResolvedValue({
        data: createdLocation,
      })

      // Act
      const { result } = renderHook(() => useLocationsMutations())
      const createdResult = await result.current.createLocation(locationData)

      // Assert
      expect(createdResult).toEqual({ data: createdLocation })
      expect(locationsService.create).toHaveBeenCalledWith(locationData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const locationData = {
        warehouseId: '1',
        name: '',
        code: '',
        locationType: 'shelf' as const,
        isActive: true,
        isPickable: true,
        isReceivable: true,
      }
      const error = new Error('Validation failed')
      vi.mocked(locationsService.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useLocationsMutations())

      // Assert
      await expect(result.current.createLocation(locationData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateLocation', () => {
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
      vi.mocked(locationsService.update).mockResolvedValue({
        data: updatedLocation,
      })

      // Act
      const { result } = renderHook(() => useLocationsMutations())
      const updatedResult = await result.current.updateLocation('1', updateData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedLocation })
      expect(locationsService.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData = { name: 'Updated' }
      const error = new Error('Not found')
      vi.mocked(locationsService.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useLocationsMutations())

      // Assert
      await expect(result.current.updateLocation('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('deleteLocation', () => {
    it('should delete a location', async () => {
      // Arrange
      vi.mocked(locationsService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useLocationsMutations())
      await result.current.deleteLocation('1')

      // Assert
      expect(locationsService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = new Error('Foreign key constraint failed')
      vi.mocked(locationsService.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useLocationsMutations())

      // Assert
      await expect(result.current.deleteLocation('1')).rejects.toThrow('Foreign key constraint failed')
    })
  })
})

describe('useLocationStock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch stock for a location', async () => {
    // Arrange
    const stock = [
      { id: '1', quantity: 100, productId: '1' },
      { id: '2', quantity: 200, productId: '2' },
    ]
    vi.mocked(locationsService.getStock).mockResolvedValue({ data: stock })

    // Act
    const { result } = renderHook(() => useLocationStock('1'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(locationsService.getStock).toHaveBeenCalledWith('1', undefined)
  })

  it('should not fetch when locationId is null', () => {
    // Act
    const { result } = renderHook(() => useLocationStock(null))

    // Assert
    expect(result.current.stock).toEqual([])
    expect(locationsService.getStock).not.toHaveBeenCalled()
  })

  it('should fetch stock with includes', async () => {
    // Arrange
    const stock = [{ id: '1', quantity: 100 }]
    vi.mocked(locationsService.getStock).mockResolvedValue({ data: stock })

    // Act
    const { result } = renderHook(() => useLocationStock('1', ['product', 'productBatch']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stock).toEqual(stock)
    expect(locationsService.getStock).toHaveBeenCalledWith('1', ['product', 'productBatch'])
  })
})
