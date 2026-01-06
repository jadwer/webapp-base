/**
 * cycleCountsService Tests
 * Tests for the cycle counts API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { cycleCountsService } from '../../services'

// Mock axios client
vi.mock('@/lib/axiosClient')

// Helper to create JSON:API format response for cycle count
const createApiCycleCount = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  type: 'cycle-counts',
  attributes: {
    count_number: 'CC-2025-0001',
    scheduled_date: '2025-01-15',
    completed_date: null,
    status: 'scheduled',
    system_quantity: 100,
    counted_quantity: null,
    variance_quantity: null,
    variance_value: null,
    abc_class: 'A',
    notes: 'Test cycle count',
    has_variance: false,
    variance_percentage: null,
    created_at: '2025-01-14T10:00:00.000Z',
    updated_at: '2025-01-14T10:00:00.000Z',
    ...overrides
  },
  relationships: {
    product: { data: { type: 'products', id: '1' } },
    warehouse: { data: { type: 'warehouses', id: '1' } },
    warehouseLocation: { data: { type: 'warehouse-locations', id: '1' } },
    assignedTo: { data: { type: 'users', id: '1' } },
    countedBy: null
  }
})

// Helper to create included resources
const createIncludedResources = () => [
  {
    id: '1',
    type: 'products',
    attributes: { name: 'Test Product', sku: 'TEST-001' }
  },
  {
    id: '1',
    type: 'warehouses',
    attributes: { name: 'Test Warehouse', code: 'WH-001' }
  },
  {
    id: '1',
    type: 'warehouse-locations',
    attributes: { name: 'Zone A', code: 'A-1-1' }
  },
  {
    id: '1',
    type: 'users',
    attributes: { name: 'Test User', email: 'test@example.com' }
  }
]

describe('cycleCountsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all cycle counts without filters', async () => {
      // Arrange
      const cycleCount = createApiCycleCount()
      const apiResponse = {
        data: [cycleCount],
        included: createIncludedResources(),
        meta: { currentPage: 1, total: 1, perPage: 20, lastPage: 1 }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          include: 'product,warehouse,warehouseLocation,assignedTo,countedBy',
          'page[size]': '20'
        })
      })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].countNumber).toBe('CC-2025-0001')
    })

    it('should fetch cycle counts with status filter', async () => {
      // Arrange
      const cycleCount = createApiCycleCount({ status: 'in_progress' })
      const apiResponse = {
        data: [cycleCount],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ status: ['in_progress'] })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[status]': 'in_progress'
        })
      })
    })

    it('should fetch cycle counts with multiple status filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ status: ['scheduled', 'in_progress'] })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[status]': 'scheduled,in_progress'
        })
      })
    })

    it('should fetch cycle counts with ABC class filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ abcClass: ['A', 'B'] })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[abc_class]': 'A,B'
        })
      })
    })

    it('should fetch cycle counts with search filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ search: 'CC-2025' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[search]': 'CC-2025'
        })
      })
    })

    it('should fetch cycle counts with warehouse filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ warehouseId: '5' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[warehouse_id]': '5'
        })
      })
    })

    it('should fetch cycle counts with product filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ productId: '10' })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[product_id]': '10'
        })
      })
    })

    it('should fetch cycle counts with overdue filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ overdue: true })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[overdue]': 'true'
        })
      })
    })

    it('should fetch cycle counts with hasVariance filter', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll({ hasVariance: true })

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[has_variance]': 'true'
        })
      })
    })

    it('should fetch cycle counts with sorting', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll(
        undefined,
        { field: 'scheduledDate', direction: 'desc' }
      )

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          sort: '-scheduled_date'
        })
      })
    })

    it('should fetch cycle counts with pagination', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getAll(undefined, undefined, 2, 10)

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'page[number]': '2',
          'page[size]': '10'
        })
      })
    })

    it('should parse relationships correctly', async () => {
      // Arrange
      const cycleCount = createApiCycleCount()
      const apiResponse = {
        data: [cycleCount],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.getAll()

      // Assert
      expect(result.data[0].product).toEqual({
        id: '1',
        name: 'Test Product',
        sku: 'TEST-001'
      })
      expect(result.data[0].warehouse).toEqual({
        id: '1',
        name: 'Test Warehouse',
        code: 'WH-001'
      })
      expect(result.data[0].assignedTo).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      })
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [], meta: {} } })

      // Act
      const result = await cycleCountsService.getAll()

      // Assert
      expect(result.data).toEqual([])
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(cycleCountsService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch a single cycle count by ID', async () => {
      // Arrange
      const cycleCount = createApiCycleCount({ id: '5' })
      const apiResponse = {
        data: { ...cycleCount, id: '5' },
        included: createIncludedResources()
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts/5', {
        params: { include: 'product,warehouse,warehouseLocation,assignedTo,countedBy' }
      })
      expect(result.id).toBe('5')
      expect(result.countNumber).toBe('CC-2025-0001')
    })

    it('should throw 404 error when cycle count not found', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(cycleCountsService.getById('999')).rejects.toThrow('Not found')
    })
  })

  describe('create', () => {
    it('should create a new cycle count', async () => {
      // Arrange
      const createData = {
        warehouseId: '1',
        productId: '1',
        scheduledDate: '2025-01-20',
        status: 'scheduled' as const,
        abcClass: 'A' as const,
        systemQuantity: 100
      }
      const createdCycleCount = createApiCycleCount({
        scheduled_date: '2025-01-20',
        system_quantity: 100
      })
      const apiResponse = {
        data: { ...createdCycleCount, id: '10' },
        included: createIncludedResources()
      }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.create(createData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        data: {
          type: 'cycle-counts',
          attributes: {
            scheduledDate: '2025-01-20',
            status: 'scheduled',
            abcClass: 'A',
            systemQuantity: 100
          },
          relationships: {
            warehouse: { data: { type: 'warehouses', id: '1' } },
            product: { data: { type: 'products', id: '1' } }
          }
        }
      })
      expect(result.scheduledDate).toBe('2025-01-20')
    })

    it('should create cycle count with optional warehouseLocation', async () => {
      // Arrange
      const createData = {
        warehouseId: '1',
        productId: '1',
        warehouseLocationId: '2',
        scheduledDate: '2025-01-20',
        status: 'scheduled' as const
      }
      const apiResponse = {
        data: createApiCycleCount(),
        included: createIncludedResources()
      }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.create(createData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        data: expect.objectContaining({
          relationships: expect.objectContaining({
            warehouseLocation: { data: { type: 'warehouse-locations', id: '2' } }
          })
        })
      })
    })

    it('should create cycle count with assigned user', async () => {
      // Arrange
      const createData = {
        warehouseId: '1',
        productId: '1',
        scheduledDate: '2025-01-20',
        status: 'scheduled' as const,
        assignedTo: '5'
      }
      const apiResponse = {
        data: createApiCycleCount(),
        included: createIncludedResources()
      }
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.create(createData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        data: expect.objectContaining({
          relationships: expect.objectContaining({
            assignedTo: { data: { type: 'users', id: '5' } }
          })
        })
      })
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const error = new Error('Validation failed')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(
        cycleCountsService.create({
          warehouseId: '',
          productId: '',
          scheduledDate: '',
          status: 'scheduled'
        })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing cycle count', async () => {
      // Arrange
      const updateData = {
        notes: 'Updated notes',
        status: 'in_progress' as const
      }
      const updatedCycleCount = createApiCycleCount({
        notes: 'Updated notes',
        status: 'in_progress'
      })
      const apiResponse = {
        data: updatedCycleCount,
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.update('1', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: {
          type: 'cycle-counts',
          id: '1',
          attributes: {
            notes: 'Updated notes',
            status: 'in_progress'
          }
        }
      })
      expect(result.notes).toBe('Updated notes')
    })

    it('should update cycle count with new warehouse', async () => {
      // Arrange
      const updateData = { warehouseId: '5' }
      const apiResponse = {
        data: createApiCycleCount(),
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.update('1', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: expect.objectContaining({
          relationships: {
            warehouse: { data: { type: 'warehouses', id: '5' } }
          }
        })
      })
    })

    it('should throw 404 error when updating non-existent cycle count', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(
        cycleCountsService.update('999', { notes: 'Test' })
      ).rejects.toThrow('Not found')
    })
  })

  describe('delete', () => {
    it('should delete a cycle count', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await cycleCountsService.delete('1')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/cycle-counts/1')
    })

    it('should throw 404 error when deleting non-existent cycle count', async () => {
      // Arrange
      const error = new Error('Not found')
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(cycleCountsService.delete('999')).rejects.toThrow('Not found')
    })
  })

  describe('startCount', () => {
    it('should start a cycle count (change status to in_progress)', async () => {
      // Arrange
      const startedCycleCount = createApiCycleCount({ status: 'in_progress' })
      const apiResponse = {
        data: startedCycleCount,
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.startCount('1')

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: {
          type: 'cycle-counts',
          id: '1',
          attributes: { status: 'in_progress' }
        }
      })
      expect(result.status).toBe('in_progress')
    })
  })

  describe('recordCount', () => {
    it('should record count result with counted quantity', async () => {
      // Arrange
      const completedCycleCount = createApiCycleCount({
        status: 'completed',
        counted_quantity: 95,
        variance_quantity: -5,
        has_variance: true
      })
      const apiResponse = {
        data: completedCycleCount,
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.recordCount('1', 95)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: {
          type: 'cycle-counts',
          id: '1',
          attributes: expect.objectContaining({
            status: 'completed',
            countedQuantity: 95,
            completedDate: expect.any(String)
          })
        }
      })
      expect(result.status).toBe('completed')
    })

    it('should record count with notes', async () => {
      // Arrange
      const apiResponse = {
        data: createApiCycleCount({ status: 'completed' }),
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.recordCount('1', 100, 'Count verified by supervisor')

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: {
          type: 'cycle-counts',
          id: '1',
          attributes: expect.objectContaining({
            notes: 'Count verified by supervisor'
          })
        }
      })
    })
  })

  describe('cancelCount', () => {
    it('should cancel a cycle count', async () => {
      // Arrange
      const cancelledCycleCount = createApiCycleCount({ status: 'cancelled' })
      const apiResponse = {
        data: cancelledCycleCount,
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.cancelCount('1')

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: {
          type: 'cycle-counts',
          id: '1',
          attributes: { status: 'cancelled' }
        }
      })
      expect(result.status).toBe('cancelled')
    })

    it('should cancel a cycle count with reason', async () => {
      // Arrange
      const apiResponse = {
        data: createApiCycleCount({ status: 'cancelled' }),
        included: createIncludedResources()
      }
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.cancelCount('1', 'Product discontinued')

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: {
          type: 'cycle-counts',
          id: '1',
          attributes: {
            status: 'cancelled',
            notes: 'Product discontinued'
          }
        }
      })
    })
  })

  describe('getDueToday', () => {
    it('should fetch cycle counts due today', async () => {
      // Arrange
      const apiResponse = {
        data: [createApiCycleCount()],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getDueToday()

      // Assert
      const today = new Date().toISOString().split('T')[0]
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[status]': 'scheduled',
          'filter[scheduled_before]': today,
          'filter[scheduled_after]': today,
          sort: 'scheduled_date'
        })
      })
    })

    it('should fetch cycle counts due today for specific warehouse', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getDueToday('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[warehouse_id]': '5'
        })
      })
    })
  })

  describe('getOverdue', () => {
    it('should fetch overdue cycle counts', async () => {
      // Arrange
      const apiResponse = {
        data: [createApiCycleCount()],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getOverdue()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[status]': 'scheduled',
          'filter[overdue]': 'true',
          sort: 'scheduled_date'
        })
      })
    })

    it('should fetch overdue cycle counts for specific warehouse', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getOverdue('3')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[warehouse_id]': '3'
        })
      })
    })
  })

  describe('getWithVariance', () => {
    it('should fetch cycle counts with variance', async () => {
      // Arrange
      const cycleCountWithVariance = createApiCycleCount({
        status: 'completed',
        has_variance: true,
        variance_quantity: -5
      })
      const apiResponse = {
        data: [cycleCountWithVariance],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getWithVariance()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[status]': 'completed',
          'filter[has_variance]': 'true',
          sort: '-variance_quantity'
        })
      })
    })

    it('should fetch cycle counts with variance for specific warehouse', async () => {
      // Arrange
      const apiResponse = {
        data: [],
        included: [],
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      await cycleCountsService.getWithVariance('7')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[warehouse_id]': '7'
        })
      })
    })
  })

  describe('data transformation', () => {
    it('should transform snake_case to camelCase', async () => {
      // Arrange
      const cycleCount = createApiCycleCount({
        count_number: 'CC-TEST-001',
        scheduled_date: '2025-02-01',
        completed_date: '2025-02-01',
        system_quantity: 150,
        counted_quantity: 145,
        variance_quantity: -5,
        variance_value: -50.00,
        abc_class: 'B',
        has_variance: true,
        variance_percentage: -3.33
      })
      const apiResponse = {
        data: [cycleCount],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.getAll()

      // Assert
      const parsed = result.data[0]
      expect(parsed.countNumber).toBe('CC-TEST-001')
      expect(parsed.scheduledDate).toBe('2025-02-01')
      expect(parsed.completedDate).toBe('2025-02-01')
      expect(parsed.systemQuantity).toBe(150)
      expect(parsed.countedQuantity).toBe(145)
      expect(parsed.varianceQuantity).toBe(-5)
      expect(parsed.varianceValue).toBe(-50.00)
      expect(parsed.abcClass).toBe('B')
      expect(parsed.hasVariance).toBe(true)
      expect(parsed.variancePercentage).toBe(-3.33)
    })

    it('should handle null relationships gracefully', async () => {
      // Arrange
      const cycleCount = {
        ...createApiCycleCount(),
        relationships: {
          product: { data: { type: 'products', id: '1' } },
          warehouse: { data: { type: 'warehouses', id: '1' } },
          warehouseLocation: null,
          assignedTo: null,
          countedBy: null
        }
      }
      const apiResponse = {
        data: [cycleCount],
        included: createIncludedResources(),
        meta: {}
      }
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await cycleCountsService.getAll()

      // Assert
      expect(result.data[0].warehouseLocation).toBeNull()
      expect(result.data[0].assignedTo).toBeNull()
      expect(result.data[0].countedBy).toBeNull()
    })
  })
})
