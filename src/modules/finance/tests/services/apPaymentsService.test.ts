/**
 * AP PAYMENTS SERVICE TESTS
 * Unit tests for AP Payments API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apPaymentsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockAPPayment, createMockAPIResponse } from '../utils/test-utils'
import type { APPaymentForm } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock transformers
vi.mock('../../utils/transformers', () => ({
  transformAPPaymentsFromAPI: vi.fn((data) => data.data || []),
  transformAPPaymentFromAPI: vi.fn((data) => data),
  transformAPPaymentToAPI: vi.fn((data) => ({ data: { type: 'payments', attributes: data } }))
}))

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
        createMockAPPayment({ id: '2', referenceNumber: 'PAY-002' })
      ]
      const mockResponse = createMockAPIResponse(mockPayments)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await apPaymentsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: {} })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[status]': 'completed', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await apPaymentsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params })
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
      await apPaymentsService.getById('1', ['apInvoice', 'bankAccount'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments/1?include=apInvoice,bankAccount')
    })
  })

  describe('create', () => {
    it('should create new AP payment', async () => {
      // Arrange
      const formData: APPaymentForm = {
        apInvoiceId: 1,
        paymentMethodId: 1,
        paymentDate: '2025-01-15',
        amount: 1000,
        referenceNumber: 'PAY-001',
        status: 'pending'
      }
      const mockPayment = createMockAPPayment()
      mockAxios.post.mockResolvedValue({
        data: { data: mockPayment }
      })

      // Act
      const result = await apPaymentsService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/payments',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'payments'
          })
        })
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update existing AP payment', async () => {
      // Arrange
      const updateData = { status: 'completed' as const }
      const mockPayment = createMockAPPayment({ status: 'completed' })
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

  describe('post', () => {
    it('should post AP payment', async () => {
      // Arrange
      const mockPayment = createMockAPPayment({ status: 'posted' })
      mockAxios.post.mockResolvedValue({
        data: { data: mockPayment }
      })

      // Act
      const result = await apPaymentsService.post('1')

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payments/1/post')
      expect(result.data).toBeDefined()
    })
  })
})
