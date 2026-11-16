/**
 * cycleCountsService Tests
 * Tests for the cycle counts API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '../../lib/axiosClient'
import { cycleCountsService } from '../../services'
import { todayDateInput } from '@lwm/ui'

// Mock axios client
vi.mock('../../lib/axiosClient')

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
    assignedUser: { data: { type: 'users', id: '1' } },
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
          include: 'product,warehouse,warehouseLocation,assignedUser,countedByUser',
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

    it('manda un solo estatus (el filtro del backend no admite lista)', async () => {
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
          'filter[status]': 'scheduled'
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
          'filter[abcClass]': 'A,B'
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
          'filter[warehouseId]': '5'
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
          'filter[productId]': '10'
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
          'filter[hasVariance]': 'true'
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
          sort: '-scheduledDate'
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
        params: { include: 'product,warehouse,warehouseLocation,assignedUser,countedByUser' }
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
    it('manda almacen, producto y ubicacion como atributos (las relaciones son de solo lectura)', async () => {
      const createdCycleCount = createApiCycleCount({ scheduled_date: '2025-01-20' })
      vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...createdCycleCount, id: '10' }, included: createIncludedResources() } })

      const result = await cycleCountsService.create({
        warehouseId: '1',
        productId: '3',
        warehouseLocationId: '2',
        scheduledDate: '2025-01-20',
        abcClass: 'A',
        assignedTo: '5',
      })

      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        data: {
          type: 'cycle-counts',
          attributes: { scheduledDate: '2025-01-20', abcClass: 'A', warehouseId: 1, productId: 3, warehouseLocationId: 2, assignedTo: 5 },
        },
      })
      expect(result.scheduledDate).toBe('2025-01-20')
    })

    it('should throw validation error on invalid data', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('Validation failed'))
      await expect(cycleCountsService.create({ warehouseId: '', productId: '', scheduledDate: '' })).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('manda solo los datos editables, como atributos', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: { data: createApiCycleCount({ notes: 'Updated notes' }), included: createIncludedResources() } })

      const result = await cycleCountsService.update('1', { notes: 'Updated notes', warehouseId: '5', warehouseLocationId: null })

      expect(axios.patch).toHaveBeenCalledWith('/api/v1/cycle-counts/1', {
        data: { type: 'cycle-counts', id: '1', attributes: { warehouseId: 5, warehouseLocationId: null, notes: 'Updated notes' } },
      })
      expect(result.notes).toBe('Updated notes')
    })

    it('should throw 404 error when updating non-existent cycle count', async () => {
      vi.mocked(axios.patch).mockRejectedValue(new Error('Not found'))
      await expect(cycleCountsService.update('999', { notes: 'x' })).rejects.toThrow('Not found')
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

  describe('acciones', () => {
    const result = { id: '1', countNumber: 'CC1', status: 'completed', systemQuantity: 10, countedQuantity: 7, varianceQuantity: -3, varianceValue: -60, adjustmentMovementId: 99 }

    it('inicia con POST start', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...result, status: 'in_progress' } } })
      const r = await cycleCountsService.startCount('1')
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts/1/start')
      expect(r.status).toBe('in_progress')
    })

    it('registra con POST record, con ajuste y notas', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { data: result } })
      const r = await cycleCountsService.recordCount('1', 7, true, 'Faltan 3')
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts/1/record', { counted_quantity: 7, adjust: true, notes: 'Faltan 3' })
      expect(r.adjustmentMovementId).toBe(99)
    })

    it('registra sin ajuste y sin notas', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...result, adjustmentMovementId: null } } })
      await cycleCountsService.recordCount('1', 7, false)
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts/1/record', { counted_quantity: 7, adjust: false })
    })

    it('cancela con POST cancel y motivo opcional', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...result, status: 'cancelled' } } })
      await cycleCountsService.cancelCount('1', 'Se cambió de almacén')
      expect(axios.post).toHaveBeenCalledWith('/api/v1/cycle-counts/1/cancel', { reason: 'Se cambió de almacén' })
      await cycleCountsService.cancelCount('1')
      expect(axios.post).toHaveBeenLastCalledWith('/api/v1/cycle-counts/1/cancel', {})
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
      // Fecha local, como el servicio (todayDateInput); en UTC fallaba de 18:00 a 24:00 hora de Mexico
      const today = todayDateInput()
      expect(axios.get).toHaveBeenCalledWith('/api/v1/cycle-counts', {
        params: expect.objectContaining({
          'filter[status]': 'scheduled',
          'filter[scheduledBefore]': today,
          'filter[scheduledAfter]': today,
          sort: 'scheduledDate'
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
          'filter[warehouseId]': '5'
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
          sort: 'scheduledDate'
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
          'filter[warehouseId]': '3'
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
          'filter[hasVariance]': 'true',
          sort: '-varianceQuantity'
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
          'filter[warehouseId]': '7'
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
