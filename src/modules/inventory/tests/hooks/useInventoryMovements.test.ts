/**
 * useInventoryMovements Hooks Tests
 * Tests for inventory movements SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useInventoryMovements,
  useInventoryMovement,
  useInventoryMovementsMutations,
  useMovementsByProduct,
  useMovementsByWarehouse,
  useEntryMovements,
  useExitMovements,
} from '../../hooks/useInventoryMovements'
import { inventoryMovementsService } from '../../services'
import { createMockMovement } from '../utils/test-utils'
import { processJsonApiResponse } from '../../utils/jsonApi'

// Mock the inventory movements service
vi.mock('../../services')

// Mock the JSON API utility
vi.mock('../../utils/jsonApi')

describe('useInventoryMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return movements', async () => {
    // Arrange
    const movements = [
      createMockMovement({ id: '1', movementType: 'entry' }),
      createMockMovement({ id: '2', movementType: 'exit' }),
    ]
    const apiResponse = { data: movements, meta: {} }
    vi.mocked(inventoryMovementsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({
      data: movements,
      meta: {},
    })

    // Act
    const { result } = renderHook(() => useInventoryMovements())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.movements).toEqual(movements)
    expect(result.current.error).toBeUndefined()
    expect(inventoryMovementsService.getAll).toHaveBeenCalled()
  })

  it('should fetch movements with filters', async () => {
    // Arrange
    const movements = [createMockMovement({ id: '1', movementType: 'entry' })]
    const apiResponse = { data: movements }
    vi.mocked(inventoryMovementsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: movements })

    // Act
    const { result } = renderHook(() =>
      useInventoryMovements({ filters: { movementType: 'entry' } })
    )

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.movements).toEqual(movements)
    expect(inventoryMovementsService.getAll).toHaveBeenCalledWith({
      filters: { movementType: 'entry' },
    })
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const movements = [createMockMovement()]
    const apiResponse = { data: movements }
    vi.mocked(inventoryMovementsService.getAll).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: movements })

    // Act
    const { result } = renderHook(() => useInventoryMovements())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useInventoryMovement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single movement by ID', async () => {
    // Arrange
    const movement = createMockMovement({ id: '5' })
    const apiResponse = { data: movement }
    vi.mocked(inventoryMovementsService.getById).mockResolvedValue(apiResponse)
    vi.mocked(processJsonApiResponse).mockReturnValue({ data: movement })

    // Act
    const { result } = renderHook(() => useInventoryMovement('5'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.movement).toEqual(movement)
    expect(result.current.error).toBeUndefined()
    expect(inventoryMovementsService.getById).toHaveBeenCalledWith('5', undefined)
  })

  it('should not fetch when ID is null', () => {
    // Act
    const { result } = renderHook(() => useInventoryMovement(null))

    // Assert - SWR won't fetch with falsy key
    expect(result.current.movement).toBeUndefined()
    expect(inventoryMovementsService.getById).not.toHaveBeenCalled()
  })

  it('should handle 404 error', async () => {
    // Arrange
    const error = new Error('Not found')
    vi.mocked(inventoryMovementsService.getById).mockRejectedValue(error)

    // Act
    const { result } = renderHook(() => useInventoryMovement('999'))

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.movement).toBeUndefined()
    expect(result.current.error).toBeDefined()
  })
})

describe('useInventoryMovementsMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMovement', () => {
    it('should create a new movement', async () => {
      // Arrange
      const movementData = {
        productId: '1',
        warehouseId: '2',
        movementType: 'entry' as const,
        referenceType: 'purchase_order',
        movementDate: '2025-01-01',
        quantity: 100,
        status: 'completed',
      }
      const createdMovement = createMockMovement({
        id: '10',
        ...movementData,
      })
      vi.mocked(inventoryMovementsService.create).mockResolvedValue({
        data: createdMovement,
      })

      // Act
      const { result } = renderHook(() => useInventoryMovementsMutations())
      const createdResult = await result.current.createMovement(movementData)

      // Assert
      expect(createdResult).toEqual({ data: createdMovement })
      expect(inventoryMovementsService.create).toHaveBeenCalledWith(movementData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const movementData = {
        productId: '1',
        warehouseId: '2',
        movementType: 'entry' as const,
        referenceType: 'purchase_order',
        movementDate: '2025-01-01',
        quantity: -10,
        status: 'completed',
      }
      const error = new Error('Validation failed')
      vi.mocked(inventoryMovementsService.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useInventoryMovementsMutations())

      // Assert
      await expect(result.current.createMovement(movementData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateMovement', () => {
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
      vi.mocked(inventoryMovementsService.update).mockResolvedValue({
        data: updatedMovement,
      })

      // Act
      const { result } = renderHook(() => useInventoryMovementsMutations())
      const updatedResult = await result.current.updateMovement('1', updateData)

      // Assert
      expect(updatedResult).toEqual({ data: updatedMovement })
      expect(inventoryMovementsService.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const updateData = { quantity: 150 }
      const error = new Error('Not found')
      vi.mocked(inventoryMovementsService.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useInventoryMovementsMutations())

      // Assert
      await expect(result.current.updateMovement('999', updateData)).rejects.toThrow('Not found')
    })
  })

  describe('deleteMovement', () => {
    it('should delete a movement', async () => {
      // Arrange
      vi.mocked(inventoryMovementsService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useInventoryMovementsMutations())
      await result.current.deleteMovement('1')

      // Assert
      expect(inventoryMovementsService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = new Error('Delete not allowed')
      vi.mocked(inventoryMovementsService.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useInventoryMovementsMutations())

      // Assert
      await expect(result.current.deleteMovement('1')).rejects.toThrow('Delete not allowed')
    })
  })
})

describe('useMovementsByProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch movements by product ID', async () => {
    // Arrange
    const movements = [
      createMockMovement({ id: '1', productId: '7' }),
      createMockMovement({ id: '2', productId: '7' }),
    ]
    vi.mocked(inventoryMovementsService.getByProduct).mockResolvedValue({ data: movements })

    // Act
    const { result } = renderHook(() => useMovementsByProduct('7'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.movementsByProduct).toEqual(movements)
    expect(inventoryMovementsService.getByProduct).toHaveBeenCalledWith('7', undefined)
  })

  it('should not fetch when productId is null', () => {
    // Act
    const { result } = renderHook(() => useMovementsByProduct(null))

    // Assert
    expect(result.current.movementsByProduct).toEqual([])
    expect(inventoryMovementsService.getByProduct).not.toHaveBeenCalled()
  })
})

describe('useMovementsByWarehouse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch movements by warehouse ID', async () => {
    // Arrange
    const movements = [
      createMockMovement({ id: '1', warehouseId: '3' }),
      createMockMovement({ id: '2', warehouseId: '3' }),
    ]
    vi.mocked(inventoryMovementsService.getByWarehouse).mockResolvedValue({ data: movements })

    // Act
    const { result } = renderHook(() => useMovementsByWarehouse('3'))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.movementsByWarehouse).toEqual(movements)
    expect(inventoryMovementsService.getByWarehouse).toHaveBeenCalledWith('3', undefined)
  })

  it('should not fetch when warehouseId is null', () => {
    // Act
    const { result } = renderHook(() => useMovementsByWarehouse(null))

    // Assert
    expect(result.current.movementsByWarehouse).toEqual([])
    expect(inventoryMovementsService.getByWarehouse).not.toHaveBeenCalled()
  })
})

describe('useEntryMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch entry movements', async () => {
    // Arrange
    const movements = [
      createMockMovement({ id: '1', movementType: 'entry' }),
      createMockMovement({ id: '2', movementType: 'entry' }),
    ]
    vi.mocked(inventoryMovementsService.getEntries).mockResolvedValue({ data: movements })

    // Act
    const { result } = renderHook(() => useEntryMovements())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.entryMovements).toEqual(movements)
    expect(inventoryMovementsService.getEntries).toHaveBeenCalledWith(undefined)
  })
})

describe('useExitMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch exit movements', async () => {
    // Arrange
    const movements = [
      createMockMovement({ id: '1', movementType: 'exit' }),
      createMockMovement({ id: '2', movementType: 'exit' }),
    ]
    vi.mocked(inventoryMovementsService.getExits).mockResolvedValue({ data: movements })

    // Act
    const { result } = renderHook(() => useExitMovements())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.exitMovements).toEqual(movements)
    expect(inventoryMovementsService.getExits).toHaveBeenCalledWith(undefined)
  })
})
