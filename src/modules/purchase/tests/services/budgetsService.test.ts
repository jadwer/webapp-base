/**
 * Budgets Service Tests
 * Tests for the budgets API service layer (v1.1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { budgetsService } from '../../services'
import {
  mockBudget,
  mockBudgets,
  mockCreateBudgetRequest,
  mockUpdateBudgetRequest,
  mockJsonApiBudgetResponse,
  mockJsonApiBudgetsResponse,
  mock404Error,
  mock500Error,
  mock422Error,
} from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('budgetsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all budgets without filters', async () => {
      // Arrange
      const budgets = mockBudgets(3)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [url, config] = vi.mocked(axios.get).mock.calls[0]
      expect(url).toBe('/api/v1/budgets')
      expect(config).toHaveProperty('params')
      expect(result).toHaveProperty('data')
      expect(result.data.length).toBe(3)
    })

    it('should fetch budgets with budget type filter', async () => {
      // Arrange
      const budgets = mockBudgets(2)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getAll({ budgetType: 'department' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('filter[budget_type]', 'department')
      expect(result.data.length).toBe(2)
    })

    it('should fetch budgets with period type filter', async () => {
      // Arrange
      const budgets = mockBudgets(2)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getAll({ periodType: 'annual' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('filter[period_type]', 'annual')
    })

    it('should fetch budgets with active filter', async () => {
      // Arrange
      const budgets = mockBudgets(2)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getAll({ isActive: true })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('filter[is_active]', '1')
    })

    it('should fetch budgets with sorting', async () => {
      // Arrange
      const budgets = mockBudgets(3)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getAll(undefined, { field: 'name', direction: 'desc' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('sort', '-name')
    })

    it('should fetch budgets with pagination', async () => {
      // Arrange
      const budgets = mockBudgets(5)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getAll(undefined, undefined, 2, 10)

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('page[number]', '2')
      expect(config?.params).toHaveProperty('page[size]', '10')
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await budgetsService.getAll()

      // Assert
      expect(result.data).toEqual([])
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.getAll()).rejects.toEqual(error)
    })
  })

  describe('getById', () => {
    it('should fetch a single budget by ID', async () => {
      // Arrange
      const budget = mockBudget({ id: '5' })
      const apiResponse = mockJsonApiBudgetResponse(budget)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getById('5')

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/budgets/5?include=category,contact,allocations')
      expect(result).toBeDefined()
      expect(result.id).toBe('5')
    })

    it('should throw 404 error when budget not found', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.getById('999')).rejects.toEqual(error)
    })

    it('should throw error on server failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.getById('1')).rejects.toEqual(error)
    })
  })

  describe('create', () => {
    it('should create a new budget', async () => {
      // Arrange
      const createData = mockCreateBudgetRequest()
      const createdBudget = mockBudget({ name: createData.name, code: createData.code })
      const apiResponse = mockJsonApiBudgetResponse(createdBudget)
      vi.mocked(axios.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.create(createData)

      // Assert
      expect(axios.post).toHaveBeenCalled()
      const [url, payload] = vi.mocked(axios.post).mock.calls[0]
      expect(url).toBe('/api/v1/budgets')
      expect(payload).toHaveProperty('data.type', 'budgets')
      expect(payload).toHaveProperty('data.attributes')
      expect(result).toBeDefined()
    })

    it('should handle validation error on create', async () => {
      // Arrange
      const createData = mockCreateBudgetRequest({ name: '' })
      const error = mock422Error('name', 'The name field is required')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.create(createData)).rejects.toEqual(error)
    })

    it('should throw error on server failure during create', async () => {
      // Arrange
      const createData = mockCreateBudgetRequest()
      const error = mock500Error()
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.create(createData)).rejects.toEqual(error)
    })
  })

  describe('update', () => {
    it('should update an existing budget', async () => {
      // Arrange
      const updateData = mockUpdateBudgetRequest()
      const updatedBudget = mockBudget({ id: '5', name: updateData.name })
      const apiResponse = mockJsonApiBudgetResponse(updatedBudget)
      vi.mocked(axios.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.update('5', updateData)

      // Assert
      expect(axios.patch).toHaveBeenCalled()
      const [url, payload] = vi.mocked(axios.patch).mock.calls[0]
      expect(url).toBe('/api/v1/budgets/5')
      expect(payload).toHaveProperty('data.id', '5')
      expect(payload).toHaveProperty('data.type', 'budgets')
      expect(result).toBeDefined()
    })

    it('should handle 404 error on update', async () => {
      // Arrange
      const updateData = mockUpdateBudgetRequest()
      const error = mock404Error()
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.update('999', updateData)).rejects.toEqual(error)
    })

    it('should handle validation error on update', async () => {
      // Arrange
      const updateData = mockUpdateBudgetRequest({ budgetedAmount: -100 })
      const error = mock422Error('budgeted_amount', 'The budgeted amount must be positive')
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.update('5', updateData)).rejects.toEqual(error)
    })
  })

  describe('delete', () => {
    it('should delete an existing budget', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: {} })

      // Act
      await budgetsService.delete('5')

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/budgets/5')
    })

    it('should handle 404 error on delete', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.delete('999')).rejects.toEqual(error)
    })

    it('should throw error on server failure during delete', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.delete('1')).rejects.toEqual(error)
    })
  })

  describe('getSummary', () => {
    it('should fetch budget summary', async () => {
      // Arrange
      const summaryResponse = {
        data: {
          total_budgets: 10,
          active_budgets: 8,
          total_budgeted: 500000,
          total_committed: 150000,
          total_spent: 75000,
          total_available: 275000,
          budgets_over_warning: 2,
          budgets_over_critical: 1,
        }
      }
      vi.mocked(axios.get).mockResolvedValue({ data: summaryResponse })

      // Act
      const result = await budgetsService.getSummary()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/budgets/summary')
      expect(result).toBeDefined()
      expect(result.totalBudgets).toBe(10)
      expect(result.activeBudgets).toBe(8)
    })

    it('should throw error on server failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(budgetsService.getSummary()).rejects.toEqual(error)
    })
  })

  describe('getNeedsAttention', () => {
    it('should fetch budgets that need attention', async () => {
      // Arrange
      const needsAttentionResponse = {
        data: [
          {
            id: 1,
            name: 'Budget Over Warning',
            code: 'BOW-001',
            budgeted_amount: 100000,
            utilization_percent: 85,
            status_level: 'warning',
            available_amount: 15000,
          },
          {
            id: 2,
            name: 'Budget Over Critical',
            code: 'BOC-001',
            budgeted_amount: 50000,
            utilization_percent: 96,
            status_level: 'critical',
            available_amount: 2000,
          },
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: needsAttentionResponse })

      // Act
      const result = await budgetsService.getNeedsAttention()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/budgets/needs-attention')
      expect(result).toBeDefined()
      expect(result.length).toBe(2)
      expect(result[0].statusLevel).toBe('warning')
      expect(result[1].statusLevel).toBe('critical')
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await budgetsService.getNeedsAttention()

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('getCurrent', () => {
    it('should fetch current active budgets', async () => {
      // Arrange
      const budgets = mockBudgets(3)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getCurrent()

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('filter[current]', 'true')
      expect(config?.params).toHaveProperty('filter[is_active]', '1')
      expect(result.data.length).toBe(3)
    })

    it('should fetch current budgets with pagination', async () => {
      // Arrange
      const budgets = mockBudgets(5)
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getCurrent(2, 10)

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('page[number]', '2')
      expect(config?.params).toHaveProperty('page[size]', '10')
    })
  })

  describe('getByType', () => {
    it('should fetch budgets by type', async () => {
      // Arrange
      const budgets = mockBudgets(2).map(b => ({ ...b, budgetType: 'department' as const }))
      const apiResponse = mockJsonApiBudgetsResponse(budgets)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await budgetsService.getByType('department')

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const [, config] = vi.mocked(axios.get).mock.calls[0]
      expect(config?.params).toHaveProperty('filter[budget_type]', 'department')
    })
  })
})
