/**
 * AR INVOICES SERVICE TESTS
 * Unit tests for AR Invoices API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { arInvoicesService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockARInvoice, createMockAPIResponse } from '../utils/test-utils'
import type { ARInvoiceForm } from '../../types'

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
  transformARInvoicesFromAPI: vi.fn((data) => data.data || []),
  transformARInvoiceFromAPI: vi.fn((data) => data),
  transformARInvoiceToAPI: vi.fn((data) => ({ data: { type: 'ar-invoices', attributes: data } }))
}))

const mockAxios = axiosClient as any

describe('AR Invoices Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all AR invoices successfully', async () => {
      // Arrange
      const mockInvoices = [
        createMockARInvoice(),
        createMockARInvoice({ id: '2', invoiceNumber: 'AR-002' })
      ]
      const mockResponse = createMockAPIResponse(mockInvoices)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await arInvoicesService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-invoices', { params: {} })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[status]': 'pending', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await arInvoicesService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-invoices', { params })
    })
  })

  describe('getById', () => {
    it('should fetch single AR invoice by id', async () => {
      // Arrange
      const mockInvoice = createMockARInvoice()
      mockAxios.get.mockResolvedValue({
        data: { data: mockInvoice, included: [] }
      })

      // Act
      const result = await arInvoicesService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-invoices/1')
      expect(result.data).toBeDefined()
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockInvoice = createMockARInvoice()
      mockAxios.get.mockResolvedValue({
        data: { data: mockInvoice, included: [] }
      })

      // Act
      await arInvoicesService.getById('1', ['contact', 'salesOrder'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-invoices/1?include=contact,salesOrder')
    })
  })

  describe('create', () => {
    it('should create new AR invoice', async () => {
      // Arrange
      const formData: ARInvoiceForm = {
        contactId: 1,
        invoiceNumber: 'AR-001',
        invoiceDate: '2025-01-15',
        dueDate: '2025-02-15',
        amount: 2000,
        status: 'pending'
      }
      const mockInvoice = createMockARInvoice()
      mockAxios.post.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await arInvoicesService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/ar-invoices',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'ar-invoices'
          })
        })
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update existing AR invoice', async () => {
      // Arrange
      const updateData = { status: 'paid' as const }
      const mockInvoice = createMockARInvoice({ status: 'paid' })
      mockAxios.patch.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await arInvoicesService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/ar-invoices/1',
        {
          data: {
            type: 'ar-invoices',
            id: '1',
            attributes: updateData
          }
        }
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete AR invoice', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({})

      // Act
      await arInvoicesService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/ar-invoices/1')
    })
  })

  describe('post', () => {
    it('should post AR invoice', async () => {
      // Arrange
      const mockInvoice = createMockARInvoice({ status: 'posted' })
      mockAxios.post.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await arInvoicesService.post('1')

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-invoices/1/post')
      expect(result.data).toBeDefined()
    })
  })
})
