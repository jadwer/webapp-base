/**
 * AP PAYMENTS SERVICE TESTS
 * Unit tests for AP Payments API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apPaymentsService } from '../../services'
import axiosClient from '../../lib/axiosClient'
import { createMockAPPayment, createMockAPIResponse } from '../utils/test-utils'
import type { APPaymentForm } from '../../types'

// Mock axios client
vi.mock('../../lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

// FromAPI mockeados; los ToAPI son los reales para asertar el payload exacto
vi.mock('../../utils/transformers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/transformers')>()
  return {
    ...actual,
    transformAPPaymentsFromAPI: vi.fn((data) => data.data || []),
    transformAPPaymentFromAPI: vi.fn((data) => data),
  }
})

const mockAxios = axiosClient as any

describe('AP Payments Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all AP payments successfully', async () => {
      // Arrange
      const mockPayments = [
        createMockAPPayment(),
        createMockAPPayment({ id: '2', reference: 'PAY-002' })
      ]
      const mockResponse = createMockAPIResponse(mockPayments)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await apPaymentsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { 'filter[direction]': 'ap' } })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[status]': 'applied', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await apPaymentsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { ...params, 'filter[direction]': 'ap' } })
    })

    it('siempre filtra direction=ap aunque el llamador mande otro valor', async () => {
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      await apPaymentsService.getAll({ 'filter[direction]': 'ar' })

      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { 'filter[direction]': 'ap' } })
    })
  })

  describe('getById', () => {
    it('should fetch single AP payment by id', async () => {
      // Arrange
      const mockPayment = createMockAPPayment()
      mockAxios.get.mockResolvedValue({
        data: { data: mockPayment, included: [] }
      })

      // Act
      const result = await apPaymentsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments/1')
      expect(result.data).toBeDefined()
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockPayment = createMockAPPayment()
      mockAxios.get.mockResolvedValue({
        data: { data: mockPayment, included: [] }
      })

      // Act
      await apPaymentsService.getById('1', ['contact', 'paymentMethod'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments/1?include=contact,paymentMethod')
    })
  })

  describe('create', () => {
    it('should create new AP payment', async () => {
      // Arrange
      const formData: APPaymentForm = {
        paymentNumber: 'PAG-001',
        contactId: 1,
        paymentMethodId: 2,
        bankAccountId: 3,
        paymentDate: '2025-01-15',
        currency: 'MXN',
        amount: 1000,
        reference: 'REF-001',
      }
      const mockPayment = createMockAPPayment()
      mockAxios.post.mockResolvedValue({
        data: { data: mockPayment }
      })

      // Act
      const result = await apPaymentsService.create(formData)

      // Assert
      // Recurso `payments` con atributos de PaymentSchema; nace sin aplicar
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payments', {
        data: {
          type: 'payments',
          attributes: {
            paymentNumber: 'PAG-001',
            paymentDate: '2025-01-15',
            contactId: 1,
            bankAccountId: 3,
            paymentMethodId: 2,
            amount: 1000,
            currency: 'MXN',
            appliedAmount: 0,
            unappliedAmount: 1000,
            status: 'unapplied',
            reference: 'REF-001',
          },
        },
      })
      expect(result.data).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update existing AP payment', async () => {
      // Arrange
      const updateData = { status: 'applied' as const }
      const mockPayment = createMockAPPayment({ status: 'applied' })
      mockAxios.patch.mockResolvedValue({
        data: { data: mockPayment }
      })

      // Act
      const result = await apPaymentsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/payments/1',
        {
          data: {
            type: 'payments',
            id: '1',
            attributes: updateData
          }
        }
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete AP payment', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({})

      // Act
      await apPaymentsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/payments/1')
    })
  })

})
