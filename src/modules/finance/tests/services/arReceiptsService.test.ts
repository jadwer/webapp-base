/**
 * AR RECEIPTS SERVICE TESTS
 * Unit tests for AR Receipts API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { arReceiptsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockARReceipt, createMockAPIResponse } from '../utils/test-utils'
import type { ARReceiptForm } from '../../types'

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
  transformARReceiptsFromAPI: vi.fn((data) => data.data || []),
  transformARReceiptFromAPI: vi.fn((data) => data),
  transformARReceiptToAPI: vi.fn((data) => ({ data: { type: 'ar-receipts', attributes: data } }))
}))

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
        createMockARReceipt({ id: '2', referenceNumber: 'REC-002' })
      ]
      const mockResponse = createMockAPIResponse(mockReceipts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await arReceiptsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-receipts', { params: {} })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[status]': 'completed', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await arReceiptsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-receipts', { params })
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
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-receipts/1')
      expect(result.data).toBeDefined()
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockReceipt = createMockARReceipt()
      mockAxios.get.mockResolvedValue({
        data: { data: mockReceipt, included: [] }
      })

      // Act
      await arReceiptsService.getById('1', ['arInvoice', 'bankAccount'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-receipts/1?include=arInvoice,bankAccount')
    })
  })

  describe('create', () => {
    it('should create new AR receipt', async () => {
      // Arrange
      const formData: ARReceiptForm = {
        arInvoiceId: 1,
        paymentMethodId: 1,
        receiptDate: '2025-01-15',
        amount: 2000,
        referenceNumber: 'REC-001',
        status: 'pending'
      }
      const mockReceipt = createMockARReceipt()
      mockAxios.post.mockResolvedValue({
        data: { data: mockReceipt }
      })

      // Act
      const result = await arReceiptsService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/ar-receipts',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'ar-receipts'
          })
        })
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update existing AR receipt', async () => {
      // Arrange
      const updateData = { status: 'completed' as const }
      const mockReceipt = createMockARReceipt({ status: 'completed' })
      mockAxios.patch.mockResolvedValue({
        data: { data: mockReceipt }
      })

      // Act
      const result = await arReceiptsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/ar-receipts/1',
        {
          data: {
            type: 'ar-receipts',
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
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/ar-receipts/1')
    })
  })

  describe('post', () => {
    it('should post AR receipt', async () => {
      // Arrange
      const mockReceipt = createMockARReceipt({ status: 'posted' })
      mockAxios.post.mockResolvedValue({
        data: { data: mockReceipt }
      })

      // Act
      const result = await arReceiptsService.post('1')

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-receipts/1/post')
      expect(result.data).toBeDefined()
    })
  })
})
