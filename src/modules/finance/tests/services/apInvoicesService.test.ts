/**
 * AP INVOICES SERVICE TESTS
 * Unit tests for AP Invoices API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apInvoicesService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockAPInvoice, createMockAPIResponse } from '../utils/test-utils'
import type { APInvoiceForm } from '../../types'

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
  transformAPInvoicesFromAPI: vi.fn((data) => data.data || []),
  transformAPInvoiceFromAPI: vi.fn((data) => data),
  transformAPInvoiceToAPI: vi.fn((data) => ({ data: { type: 'ap-invoices', attributes: data } }))
}))

const mockAxios = axiosClient as any

describe('AP Invoices Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all AP invoices successfully', async () => {
      // Arrange
      const mockInvoices = [
        createMockAPInvoice(),
        createMockAPInvoice({ id: '2', invoiceNumber: 'AP-002' })
      ]
      const mockResponse = createMockAPIResponse(mockInvoices)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await apInvoicesService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices', { params: {} })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[status]': 'pending', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await apInvoicesService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices', { params })
    })
  })

  describe('getById', () => {
    it('should fetch single AP invoice by id', async () => {
      // Arrange
      const mockInvoice = createMockAPInvoice()
      mockAxios.get.mockResolvedValue({
        data: { data: mockInvoice, included: [] }
      })

      // Act
      const result = await apInvoicesService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices/1')
      expect(result.data).toBeDefined()
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockInvoice = createMockAPInvoice()
      mockAxios.get.mockResolvedValue({
        data: { data: mockInvoice, included: [] }
      })

      // Act
      await apInvoicesService.getById('1', ['contact', 'purchaseOrder'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices/1?include=contact,purchaseOrder')
    })
  })

  describe('create', () => {
    it('should create new AP invoice', async () => {
      // Arrange
      const formData: APInvoiceForm = {
        contactId: 1,
        invoiceNumber: 'AP-001',
        invoiceDate: '2025-01-15',
        dueDate: '2025-02-15',
        amount: 1000,
        status: 'pending'
      }
      const mockInvoice = createMockAPInvoice()
      mockAxios.post.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await apInvoicesService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/ap-invoices',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'ap-invoices'
          })
        })
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update existing AP invoice', async () => {
      // Arrange
      const updateData = { status: 'paid' as const }
      const mockInvoice = createMockAPInvoice({ status: 'paid' })
      mockAxios.patch.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await apInvoicesService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/ap-invoices/1',
        {
          data: {
            type: 'ap-invoices',
            id: '1',
            attributes: updateData
          }
        }
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete AP invoice', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({})

      // Act
      await apInvoicesService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/ap-invoices/1')
    })
  })

  describe('post', () => {
    it('should post AP invoice', async () => {
      // Arrange
      const mockInvoice = createMockAPInvoice({ status: 'posted' })
      mockAxios.post.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await apInvoicesService.post('1')

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ap-invoices/1/post')
      expect(result.data).toBeDefined()
    })
  })
})
