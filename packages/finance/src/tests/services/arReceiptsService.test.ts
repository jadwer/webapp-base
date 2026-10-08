/**
 * AR RECEIPTS SERVICE TESTS
 * Unit tests for AR Receipts API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { arReceiptsService } from '../../services'
import axiosClient from '../../lib/axiosClient'
import { createMockARReceipt, createMockAPIResponse } from '../utils/test-utils'
import type { ARReceiptForm } from '../../types'

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
    transformARReceiptsFromAPI: vi.fn((data) => data.data || []),
    transformARReceiptFromAPI: vi.fn((data) => data),
  }
})

const mockAxios = axiosClient as any

describe('AR Receipts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all AR receipts successfully', async () => {
      // Arrange
      const mockReceipts = [
        createMockARReceipt(),
        createMockARReceipt({ id: '2', reference: 'REC-002' })
      ]
      const mockResponse = createMockAPIResponse(mockReceipts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await arReceiptsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { 'filter[direction]': 'ar' } })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[status]': 'applied', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await arReceiptsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { ...params, 'filter[direction]': 'ar' } })
    })

    it('siempre filtra direction=ar aunque el llamador mande otro valor', async () => {
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      await arReceiptsService.getAll({ 'filter[direction]': 'ap' })

      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { 'filter[direction]': 'ar' } })
    })
  })

  describe('getById', () => {
    it('should fetch single AR receipt by id', async () => {
      // Arrange
      const mockReceipt = createMockARReceipt()
      mockAxios.get.mockResolvedValue({
        data: { data: mockReceipt, included: [] }
      })

      // Act
      const result = await arReceiptsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments/1')
      expect(result.data).toBeDefined()
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockReceipt = createMockARReceipt()
      mockAxios.get.mockResolvedValue({
        data: { data: mockReceipt, included: [] }
      })

      // Act
      await arReceiptsService.getById('1', ['contact', 'paymentMethod'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments/1?include=contact,paymentMethod')
    })
  })

  describe('create', () => {
    it('should create new AR receipt', async () => {
      // Arrange
      const formData: ARReceiptForm = {
        paymentNumber: 'PAG-001',
        contactId: 1,
        paymentMethodId: 2,
        bankAccountId: 3,
        paymentDate: '2025-01-15',
        currency: 'MXN',
        amount: 1000,
        reference: 'REF-001',
      }
      const mockReceipt = createMockARReceipt()
      mockAxios.post.mockResolvedValue({
        data: { data: mockReceipt }
      })

      // Act
      const result = await arReceiptsService.create(formData)

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
    it('should update existing AR receipt', async () => {
      // Arrange
      const updateData = { status: 'applied' as const }
      const mockReceipt = createMockARReceipt({ status: 'applied' })
      mockAxios.patch.mockResolvedValue({
        data: { data: mockReceipt }
      })

      // Act
      const result = await arReceiptsService.update('1', updateData)

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
    it('should delete AR receipt', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({})

      // Act
      await arReceiptsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/payments/1')
    })
  })

})
