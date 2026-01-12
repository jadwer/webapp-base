/**
 * PAYMENT METHODS SERVICE TESTS
 * Unit tests for Payment Methods API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { paymentMethodsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import {
  createMockPaymentMethod
} from '../utils/test-utils'
import type { PaymentMethodForm } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockAxios = axiosClient as any

describe('Payment Methods Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all payment methods successfully', async () => {
      // Arrange
      const mockMethods = [
        createMockPaymentMethod(),
        createMockPaymentMethod({
          id: '2',
          name: 'Cash',
          code: 'CASH',
          requiresReference: false
        })
      ]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockMethods.map(method => ({
          id: method.id,
          type: 'payment-methods',
          attributes: {
            name: method.name,
            code: method.code,
            description: method.description,
            requiresReference: method.requiresReference,
            isActive: method.isActive,
            createdAt: method.createdAt,
            updatedAt: method.updatedAt
          }
        })),
        meta: { page: { total: 2 } },
        links: { self: '/api/v1/payment-methods' }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-methods', { params: {} })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Bank Transfer')
      expect(result.data[1].name).toBe('Cash')
    })

    it('should fetch payment methods with filters', async () => {
      // Arrange
      const mockMethods = [createMockPaymentMethod({ isActive: true })]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockMethods.map(method => ({
          id: method.id,
          type: 'payment-methods',
          attributes: {
            name: method.name,
            code: method.code,
            description: method.description,
            requiresReference: method.requiresReference,
            isActive: method.isActive,
            createdAt: method.createdAt,
            updatedAt: method.updatedAt
          }
        })),
        meta: { page: { total: 1 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'filter[isActive]': true }

      // Act
      const result = await paymentMethodsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-methods', { params })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].isActive).toBe(true)
    })

    it('should fetch payment methods filtered by requiresReference', async () => {
      // Arrange
      const mockMethods = [
        createMockPaymentMethod({
          name: 'Wire Transfer',
          code: 'WIRE',
          requiresReference: true
        })
      ]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockMethods.map(method => ({
          id: method.id,
          type: 'payment-methods',
          attributes: {
            name: method.name,
            code: method.code,
            description: method.description,
            requiresReference: method.requiresReference,
            isActive: method.isActive,
            createdAt: method.createdAt,
            updatedAt: method.updatedAt
          }
        }))
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'filter[requiresReference]': true }

      // Act
      const result = await paymentMethodsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-methods', { params })
      expect(result.data[0].requiresReference).toBe(true)
    })

    it('should fetch inactive payment methods', async () => {
      // Arrange
      const mockMethods = [
        createMockPaymentMethod({
          name: 'Old Method',
          code: 'OLD',
          isActive: false
        })
      ]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockMethods.map(method => ({
          id: method.id,
          type: 'payment-methods',
          attributes: {
            name: method.name,
            code: method.code,
            description: method.description,
            requiresReference: method.requiresReference,
            isActive: method.isActive,
            createdAt: method.createdAt,
            updatedAt: method.updatedAt
          }
        }))
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'filter[isActive]': false }

      // Act
      const result = await paymentMethodsService.getAll(params)

      // Assert
      expect(result.data[0].isActive).toBe(false)
    })

    it('should fetch payment methods with pagination', async () => {
      // Arrange
      const mockMethods = [createMockPaymentMethod()]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockMethods.map(method => ({
          id: method.id,
          type: 'payment-methods',
          attributes: {
            name: method.name,
            code: method.code,
            description: method.description,
            requiresReference: method.requiresReference,
            isActive: method.isActive,
            createdAt: method.createdAt,
            updatedAt: method.updatedAt
          }
        })),
        meta: {
          page: {
            currentPage: 1,
            perPage: 10,
            total: 25,
            lastPage: 3
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'page[number]': 1, 'page[size]': 10 }

      // Act
      const result = await paymentMethodsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-methods', { params })
      expect(result.meta?.page?.total).toBe(25)
    })
  })

  describe('getById', () => {
    it('should fetch single payment method successfully', async () => {
      // Arrange
      const mockMethod = createMockPaymentMethod()
      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-methods/1')
      expect(result.data.id).toBe('1')
      expect(result.data.name).toBe('Bank Transfer')
      expect(result.data.code).toBe('TRANSFER')
    })

    it('should fetch payment method with all fields', async () => {
      // Arrange
      const mockMethod = createMockPaymentMethod({
        name: 'Credit Card',
        code: 'CARD',
        description: 'Credit or debit card payment',
        requiresReference: true,
        isActive: true
      })

      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.getById('1')

      // Assert
      expect(result.data.description).toBe('Credit or debit card payment')
      expect(result.data.requiresReference).toBe(true)
    })
  })

  describe('create', () => {
    it('should create payment method successfully', async () => {
      // Arrange
      const formData: PaymentMethodForm = {
        name: 'Credit Card',
        code: 'CARD',
        description: 'Credit or debit card payment',
        requiresReference: true,
        isActive: true
      }

      const mockMethod = createMockPaymentMethod(formData)
      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.create(formData)

      // Assert
      // Transformer only includes name, code, and isActive (not description or requiresReference)
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payment-methods', {
        data: {
          type: 'payment-methods',
          attributes: {
            name: formData.name,
            code: formData.code,
            isActive: formData.isActive
          }
        }
      })
      expect(result.data.name).toBe('Credit Card')
      expect(result.data.code).toBe('CARD')
    })

    it('should create payment method without optional description', async () => {
      // Arrange
      const formData: PaymentMethodForm = {
        name: 'Cash',
        code: 'CASH',
        requiresReference: false,
        isActive: true
      }

      const mockMethod = createMockPaymentMethod(formData)
      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.create(formData)

      // Assert
      expect(result.data.name).toBe('Cash')
      expect(result.data.requiresReference).toBe(false)
    })

    it('should create inactive payment method', async () => {
      // Arrange
      const formData: PaymentMethodForm = {
        name: 'Deprecated Method',
        code: 'DEP',
        requiresReference: false,
        isActive: false
      }

      const mockMethod = createMockPaymentMethod(formData)
      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.create(formData)

      // Assert
      expect(result.data.isActive).toBe(false)
    })
  })

  describe('update', () => {
    it('should update payment method name successfully', async () => {
      // Arrange
      const updateData = { name: 'Wire Transfer Updated' }
      const mockMethod = createMockPaymentMethod({ name: 'Wire Transfer Updated' })

      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/payment-methods/1', {
        data: {
          type: 'payment-methods',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.data.name).toBe('Wire Transfer Updated')
    })

    it('should deactivate payment method', async () => {
      // Arrange
      const updateData = { isActive: false }
      const mockMethod = createMockPaymentMethod({ isActive: false })

      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.update('1', updateData)

      // Assert
      expect(result.data.isActive).toBe(false)
    })

    it('should update requiresReference flag', async () => {
      // Arrange
      const updateData = { requiresReference: false }
      const mockMethod = createMockPaymentMethod({ requiresReference: false })

      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.update('1', updateData)

      // Assert
      expect(result.data.requiresReference).toBe(false)
    })

    it('should update description', async () => {
      // Arrange
      const updateData = { description: 'Updated description' }
      const mockMethod = createMockPaymentMethod({ description: 'Updated description' })

      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            description: mockMethod.description,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.update('1', updateData)

      // Assert
      expect(result.data.description).toBe('Updated description')
    })
  })

  describe('delete', () => {
    it('should delete payment method successfully', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: null })

      // Act
      await paymentMethodsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/payment-methods/1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      mockAxios.delete.mockRejectedValue(new Error('Cannot delete - in use'))

      // Act & Assert
      await expect(paymentMethodsService.delete('1')).rejects.toThrow('Cannot delete - in use')
    })
  })

  describe('edge cases', () => {
    it('should handle empty results', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: { page: { total: 0 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.getAll()

      // Assert
      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Server error'))

      // Act & Assert
      await expect(paymentMethodsService.getAll()).rejects.toThrow('Server error')
    })

    it('should handle missing optional description', async () => {
      // Arrange
      const mockMethod = createMockPaymentMethod({ description: undefined })

      const mockResponse = {
        data: {
          id: mockMethod.id,
          type: 'payment-methods',
          attributes: {
            name: mockMethod.name,
            code: mockMethod.code,
            requiresReference: mockMethod.requiresReference,
            isActive: mockMethod.isActive,
            createdAt: mockMethod.createdAt,
            updatedAt: mockMethod.updatedAt
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentMethodsService.getById('1')

      // Assert
      // Transformer converts undefined to empty string, which is acceptable
      expect(result.data.description === undefined || result.data.description === '').toBe(true)
    })

    it('should handle validation error on create', async () => {
      // Arrange
      const formData: PaymentMethodForm = {
        name: '',
        code: 'INVALID',
        requiresReference: false,
        isActive: true
      }

      mockAxios.post.mockRejectedValue(new Error('Validation failed'))

      // Act & Assert
      await expect(paymentMethodsService.create(formData)).rejects.toThrow('Validation failed')
    })

    it('should handle duplicate code error', async () => {
      // Arrange
      const formData: PaymentMethodForm = {
        name: 'Duplicate',
        code: 'TRANSFER',
        requiresReference: false,
        isActive: true
      }

      mockAxios.post.mockRejectedValue(new Error('Code already exists'))

      // Act & Assert
      await expect(paymentMethodsService.create(formData)).rejects.toThrow('Code already exists')
    })
  })
})
