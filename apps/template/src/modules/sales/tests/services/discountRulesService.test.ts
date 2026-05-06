/**
 * DiscountRules Service Tests
 *
 * Unit tests for the discountRulesService module (v1.1 SA-M003).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { discountRulesService } from '../../services/discountRulesService'
import {
  mockDiscountRule,
  mockJsonApiDiscountRuleResponse,
  mockJsonApiDiscountRulesResponse
} from '../utils/test-utils'

// Mock axios
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('discountRulesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all discount rules', async () => {
      const rules = [mockDiscountRule(), mockDiscountRule({ id: '2', code: 'DISC2' })]
      const mockResponse = mockJsonApiDiscountRulesResponse(rules)

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.getAll()

      expect(axios.get).toHaveBeenCalledWith('/api/v1/discount-rules', { params: expect.any(Object) })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].code).toBe('SUMMER2025')
    })

    it('should apply filters correctly', async () => {
      const rules = [mockDiscountRule()]
      const mockResponse = mockJsonApiDiscountRulesResponse(rules)

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      await discountRulesService.getAll(
        { search: 'summer', discountType: 'percentage', isActive: true },
        { field: 'priority', direction: 'desc' },
        1,
        10
      )

      expect(axios.get).toHaveBeenCalledWith('/api/v1/discount-rules', {
        params: expect.objectContaining({
          'filter[search]': 'summer',
          'filter[discount_type]': 'percentage',
          'filter[is_active]': '1',
          'page[size]': '10',
          sort: '-priority'
        })
      })
    })

    it('should handle pagination parameters', async () => {
      const rules = [mockDiscountRule()]
      const mockResponse = mockJsonApiDiscountRulesResponse(rules, {
        currentPage: 2,
        perPage: 20,
        total: 50,
        lastPage: 3
      })

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.getAll(undefined, undefined, 2, 20)

      expect(axios.get).toHaveBeenCalledWith('/api/v1/discount-rules', {
        params: expect.objectContaining({
          'page[number]': '2',
          'page[size]': '20'
        })
      })
      expect(result.meta?.currentPage).toBe(2)
    })
  })

  describe('getById', () => {
    it('should fetch a single discount rule by ID', async () => {
      const rule = mockDiscountRule()
      const mockResponse = mockJsonApiDiscountRuleResponse(rule)

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.getById('1')

      expect(axios.get).toHaveBeenCalledWith('/api/v1/discount-rules/1')
      expect(result.id).toBe('1')
      expect(result.code).toBe('SUMMER2025')
      expect(result.discountType).toBe('percentage')
    })

    it('should transform snake_case to camelCase', async () => {
      const rule = mockDiscountRule({
        discountType: 'buy_x_get_y',
        buyQuantity: 2,
        getQuantity: 1
      })
      const mockResponse = mockJsonApiDiscountRuleResponse(rule)

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.getById('1')

      expect(result.discountType).toBe('buy_x_get_y')
      expect(result.buyQuantity).toBe(2)
      expect(result.getQuantity).toBe(1)
      expect(result.isCombinable).toBe(true)
      expect(result.isActive).toBe(true)
    })
  })

  describe('getByCode', () => {
    it('should fetch a discount rule by code', async () => {
      const rule = mockDiscountRule()
      const mockResponse = mockJsonApiDiscountRulesResponse([rule])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.getByCode('SUMMER2025')

      expect(axios.get).toHaveBeenCalledWith('/api/v1/discount-rules', {
        params: {
          'filter[code]': 'SUMMER2025',
          'page[size]': '1'
        }
      })
      expect(result?.code).toBe('SUMMER2025')
    })

    it('should return null if no rule found', async () => {
      const mockResponse = mockJsonApiDiscountRulesResponse([])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.getByCode('NONEXISTENT')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new discount rule', async () => {
      const newRule = mockDiscountRule()
      const mockResponse = mockJsonApiDiscountRuleResponse(newRule)

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.create({
        name: 'Summer Sale',
        code: 'SUMMER2025',
        discountType: 'percentage',
        discountValue: 10,
        appliesTo: 'order'
      })

      expect(axios.post).toHaveBeenCalledWith('/api/v1/discount-rules', {
        data: {
          type: 'discount-rules',
          attributes: expect.objectContaining({
            name: 'Summer Sale',
            code: 'SUMMER2025',
            discount_type: 'percentage',
            discount_value: 10,
            applies_to: 'order'
          })
        }
      })
      expect(result.code).toBe('SUMMER2025')
    })

    it('should transform camelCase to snake_case in request', async () => {
      const newRule = mockDiscountRule({
        discountType: 'buy_x_get_y',
        buyQuantity: 3,
        getQuantity: 1
      })
      const mockResponse = mockJsonApiDiscountRuleResponse(newRule)

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse })

      await discountRulesService.create({
        name: 'Buy 3 Get 1',
        code: 'B3G1',
        discountType: 'buy_x_get_y',
        discountValue: 0,
        buyQuantity: 3,
        getQuantity: 1,
        appliesTo: 'product',
        minOrderAmount: 100,
        isCombinable: false,
        isActive: true
      })

      expect(axios.post).toHaveBeenCalledWith('/api/v1/discount-rules', {
        data: {
          type: 'discount-rules',
          attributes: expect.objectContaining({
            discount_type: 'buy_x_get_y',
            buy_quantity: 3,
            get_quantity: 1,
            applies_to: 'product',
            min_order_amount: 100,
            is_combinable: false,
            is_active: true
          })
        }
      })
    })
  })

  describe('update', () => {
    it('should update an existing discount rule', async () => {
      const updatedRule = mockDiscountRule({ discountValue: 15 })
      const mockResponse = mockJsonApiDiscountRuleResponse(updatedRule)

      vi.mocked(axios.patch).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.update('1', { discountValue: 15 })

      expect(axios.patch).toHaveBeenCalledWith('/api/v1/discount-rules/1', {
        data: {
          type: 'discount-rules',
          id: '1',
          attributes: {
            discount_value: 15
          }
        }
      })
      expect(result.discountValue).toBe(15) // updated value from mock
    })

    it('should handle partial updates', async () => {
      const updatedRule = mockDiscountRule({ isActive: false })
      const mockResponse = mockJsonApiDiscountRuleResponse(updatedRule)

      vi.mocked(axios.patch).mockResolvedValueOnce({ data: mockResponse })

      await discountRulesService.update('1', { isActive: false })

      expect(axios.patch).toHaveBeenCalledWith('/api/v1/discount-rules/1', {
        data: {
          type: 'discount-rules',
          id: '1',
          attributes: {
            is_active: false
          }
        }
      })
    })
  })

  describe('delete', () => {
    it('should delete a discount rule', async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce({ status: 204 })

      await discountRulesService.delete('1')

      expect(axios.delete).toHaveBeenCalledWith('/api/v1/discount-rules/1')
    })
  })

  describe('toggleActive', () => {
    it('should toggle active status to true', async () => {
      const updatedRule = mockDiscountRule({ isActive: true })
      const mockResponse = mockJsonApiDiscountRuleResponse(updatedRule)

      vi.mocked(axios.patch).mockResolvedValueOnce({ data: mockResponse })

      await discountRulesService.toggleActive('1', true)

      expect(axios.patch).toHaveBeenCalledWith('/api/v1/discount-rules/1', {
        data: {
          type: 'discount-rules',
          id: '1',
          attributes: {
            is_active: true
          }
        }
      })
    })

    it('should toggle active status to false', async () => {
      const updatedRule = mockDiscountRule({ isActive: false })
      const mockResponse = mockJsonApiDiscountRuleResponse(updatedRule)

      vi.mocked(axios.patch).mockResolvedValueOnce({ data: mockResponse })

      await discountRulesService.toggleActive('1', false)

      expect(axios.patch).toHaveBeenCalledWith('/api/v1/discount-rules/1', {
        data: {
          type: 'discount-rules',
          id: '1',
          attributes: {
            is_active: false
          }
        }
      })
    })
  })

  describe('getActiveRules', () => {
    it('should fetch only active and valid rules sorted by priority', async () => {
      const rules = [mockDiscountRule()]
      const mockResponse = mockJsonApiDiscountRulesResponse(rules)

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      await discountRulesService.getActiveRules()

      expect(axios.get).toHaveBeenCalledWith('/api/v1/discount-rules', {
        params: expect.objectContaining({
          'filter[is_active]': '1',
          'filter[valid]': 'true',
          sort: 'priority'
        })
      })
    })
  })

  describe('validateCode', () => {
    it('should return valid for active, non-expired rule', async () => {
      const rule = mockDiscountRule({ isActive: true, isValid: true, isExpired: false })
      const mockResponse = mockJsonApiDiscountRulesResponse([rule])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.validateCode('SUMMER2025')

      expect(result.valid).toBe(true)
      expect(result.rule).toBeDefined()
    })

    it('should return invalid for non-existent code', async () => {
      const mockResponse = mockJsonApiDiscountRulesResponse([])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.validateCode('NONEXISTENT')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Codigo de descuento no encontrado')
    })

    it('should return invalid for inactive rule', async () => {
      const rule = mockDiscountRule({ isActive: false })
      const mockResponse = mockJsonApiDiscountRulesResponse([rule])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.validateCode('SUMMER2025')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Este descuento esta inactivo')
    })

    it('should return invalid for expired rule', async () => {
      const rule = mockDiscountRule({ isExpired: true })
      const mockResponse = mockJsonApiDiscountRulesResponse([rule])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.validateCode('SUMMER2025')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Este descuento ha expirado')
    })

    it('should return invalid for rule at usage limit', async () => {
      const rule = mockDiscountRule({ usageLimit: 100, currentUsage: 100 })
      const mockResponse = mockJsonApiDiscountRulesResponse([rule])

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await discountRulesService.validateCode('SUMMER2025')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Este descuento ha alcanzado su limite de uso')
    })
  })
})
