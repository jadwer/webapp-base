/**
 * PAYMENT APPLICATIONS SERVICE TESTS
 * Unit tests for Payment Applications API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { paymentApplicationsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import {
  createMockPaymentApplication
} from '../utils/test-utils'
import type { PaymentApplicationForm } from '../../types'

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

describe('Payment Applications Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all payment applications successfully', async () => {
      // Arrange
      const mockApplications = [
        createMockPaymentApplication(),
        createMockPaymentApplication({ id: '2', paymentId: 2 })
      ]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockApplications.map(app => ({
          id: app.id,
          type: 'payment-applications',
          attributes: {
            paymentId: app.paymentId,
            arInvoiceId: app.arInvoiceId,
            apInvoiceId: app.apInvoiceId,
            amount: app.amount,
            applicationDate: app.applicationDate,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
          }
        })),
        meta: { page: { total: 2 } },
        links: { self: '/api/v1/payment-applications' }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications', { params: {} })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].id).toBe('1')
      expect(result.meta).toBeDefined()
    })

    it('should fetch payment applications with filters', async () => {
      // Arrange
      const mockApplications = [createMockPaymentApplication({ paymentId: 5 })]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockApplications.map(app => ({
          id: app.id,
          type: 'payment-applications',
          attributes: {
            paymentId: app.paymentId,
            arInvoiceId: app.arInvoiceId,
            apInvoiceId: app.apInvoiceId,
            amount: app.amount,
            applicationDate: app.applicationDate,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
          }
        })),
        meta: { page: { total: 1 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'filter[paymentId]': '5' }

      // Act
      const result = await paymentApplicationsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications', { params })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].paymentId).toBe(5)
    })

    it('should fetch payment applications filtered by AR invoice', async () => {
      // Arrange
      const mockApplications = [createMockPaymentApplication({ arInvoiceId: 10, apInvoiceId: null })]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockApplications.map(app => ({
          id: app.id,
          type: 'payment-applications',
          attributes: {
            paymentId: app.paymentId,
            arInvoiceId: app.arInvoiceId,
            apInvoiceId: app.apInvoiceId,
            amount: app.amount,
            applicationDate: app.applicationDate,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
          }
        }))
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'filter[arInvoiceId]': '10' }

      // Act
      const result = await paymentApplicationsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications', { params })
      expect(result.data[0].arInvoiceId).toBe(10)
      expect(result.data[0].apInvoiceId).toBeNull()
    })

    it('should fetch payment applications filtered by AP invoice', async () => {
      // Arrange
      const mockApplications = [createMockPaymentApplication({ arInvoiceId: null, apInvoiceId: 15 })]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockApplications.map(app => ({
          id: app.id,
          type: 'payment-applications',
          attributes: {
            paymentId: app.paymentId,
            arInvoiceId: app.arInvoiceId,
            apInvoiceId: app.apInvoiceId,
            amount: app.amount,
            applicationDate: app.applicationDate,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
          }
        }))
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'filter[apInvoiceId]': '15' }

      // Act
      const result = await paymentApplicationsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications', { params })
      expect(result.data[0].apInvoiceId).toBe(15)
      expect(result.data[0].arInvoiceId).toBeNull()
    })

    it('should fetch payment applications with pagination', async () => {
      // Arrange
      const mockApplications = [createMockPaymentApplication()]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockApplications.map(app => ({
          id: app.id,
          type: 'payment-applications',
          attributes: {
            paymentId: app.paymentId,
            arInvoiceId: app.arInvoiceId,
            apInvoiceId: app.apInvoiceId,
            amount: app.amount,
            applicationDate: app.applicationDate,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
          }
        })),
        meta: {
          page: {
            currentPage: 2,
            perPage: 10,
            total: 50,
            lastPage: 5
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      const params = { 'page[number]': 2, 'page[size]': 10 }

      // Act
      const result = await paymentApplicationsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications', { params })
      expect(result.meta?.page?.currentPage).toBe(2)
      expect(result.meta?.page?.perPage).toBe(10)
    })
  })

  describe('getById', () => {
    it('should fetch single payment application successfully', async () => {
      // Arrange
      const mockApplication = createMockPaymentApplication()
      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            amount: mockApplication.amount,
            applicationDate: mockApplication.applicationDate,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications/1')
      expect(result.data.id).toBe('1')
      // Transformer returns paymentId as a number
      expect(result.data.paymentId).toBe(1)
    })

    it('should fetch payment application with includes', async () => {
      // Arrange
      const mockApplication = createMockPaymentApplication()
      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            amount: mockApplication.amount,
            applicationDate: mockApplication.applicationDate,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          },
          relationships: {
            arInvoice: { data: { type: 'ar-invoices', id: '1' } },
            payment: { data: { type: 'payments', id: '1' } }
          }
        },
        included: [
          {
            id: '1',
            type: 'ar-invoices',
            attributes: { invoiceNumber: 'INV-001' }
          },
          {
            id: '1',
            type: 'payments',
            attributes: { paymentNumber: 'PAY-001' }
          }
        ]
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.getById('1', ['arInvoice', 'payment'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payment-applications/1?include=arInvoice,payment')
      expect(result.data.invoiceNumber).toBe('INV-001')
      expect(result.data.paymentNumber).toBe('PAY-001')
    })
  })

  describe('create', () => {
    it('should create payment application for AR invoice successfully', async () => {
      // Arrange
      const formData: PaymentApplicationForm = {
        paymentId: 1,
        arInvoiceId: 1,
        apInvoiceId: null,
        appliedAmount: 500.00,
        notes: 'Payment application for AR invoice'
      }

      const mockApplication = createMockPaymentApplication({ paymentId: 1, arInvoiceId: 1, apInvoiceId: null, appliedAmount: 500.00 })
      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            appliedAmount: mockApplication.appliedAmount,
            notes: mockApplication.notes,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.create(formData)

      // Assert
      // Transformer sends amount (BE field name) instead of appliedAmount, no apInvoiceId (BE doesn't support it)
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payment-applications', {
        data: {
          type: 'payment-applications',
          attributes: {
            paymentId: formData.paymentId,
            arInvoiceId: formData.arInvoiceId,
            amount: formData.appliedAmount,
            notes: formData.notes,
            metadata: null
          }
        }
      })
      expect(result.data.id).toBe('1')
      expect(result.data.arInvoiceId).toBe(1)
    })

    it('should create payment application for AP invoice successfully', async () => {
      // Arrange
      const formData: PaymentApplicationForm = {
        paymentId: 2,
        arInvoiceId: null,
        apInvoiceId: 5,
        appliedAmount: 1200.00,
        notes: 'Payment application for AP invoice'
      }

      const mockApplication = createMockPaymentApplication({ paymentId: 2, arInvoiceId: null, apInvoiceId: 5, appliedAmount: 1200.00 })
      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            appliedAmount: mockApplication.appliedAmount,
            notes: mockApplication.notes,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.create(formData)

      // Assert
      expect(result.data.apInvoiceId).toBe(5)
      expect(result.data.arInvoiceId).toBeNull()
      expect(result.data.appliedAmount).toBe(1200.00)
    })
  })

  describe('update', () => {
    it('should update payment application successfully', async () => {
      // Arrange
      const updateData = { appliedAmount: 750.00 }
      const mockApplication = createMockPaymentApplication({ appliedAmount: 750.00 })

      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            appliedAmount: mockApplication.appliedAmount,
            notes: mockApplication.notes,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/payment-applications/1', {
        data: {
          type: 'payment-applications',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.data.appliedAmount).toBe(750.00)
    })

    it('should update notes successfully', async () => {
      // Arrange
      const updateData = { notes: 'Updated payment notes' }
      const mockApplication = createMockPaymentApplication({ notes: 'Updated payment notes' })

      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            appliedAmount: mockApplication.appliedAmount,
            notes: mockApplication.notes,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.update('1', updateData)

      // Assert
      expect(result.data.notes).toBe('Updated payment notes')
    })
  })

  describe('delete', () => {
    it('should delete payment application successfully', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: null })

      // Act
      await paymentApplicationsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/payment-applications/1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      mockAxios.delete.mockRejectedValue(new Error('Not found'))

      // Act & Assert
      await expect(paymentApplicationsService.delete('999')).rejects.toThrow('Not found')
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
      const result = await paymentApplicationsService.getAll()

      // Assert
      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(paymentApplicationsService.getAll()).rejects.toThrow('Network error')
    })

    it('should handle missing optional fields', async () => {
      // Arrange
      const mockApplication = createMockPaymentApplication({
        invoiceNumber: undefined,
        paymentNumber: undefined
      })

      const mockResponse = {
        data: {
          id: mockApplication.id,
          type: 'payment-applications',
          attributes: {
            paymentId: mockApplication.paymentId,
            arInvoiceId: mockApplication.arInvoiceId,
            apInvoiceId: mockApplication.apInvoiceId,
            amount: mockApplication.amount,
            applicationDate: mockApplication.applicationDate,
            createdAt: mockApplication.createdAt,
            updatedAt: mockApplication.updatedAt
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await paymentApplicationsService.getById('1')

      // Assert
      expect(result.data.invoiceNumber).toBeUndefined()
      expect(result.data.paymentNumber).toBeUndefined()
    })
  })
})
