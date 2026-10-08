/**
 * AR INVOICES SERVICE TESTS
 * Unit tests for AR Invoices API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { arInvoicesService } from '../../services'
import axiosClient from '../../lib/axiosClient'
import { createMockARInvoice, createMockAPIResponse } from '../utils/test-utils'
import type { ARInvoiceForm } from '../../types'

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
    transformARInvoicesFromAPI: vi.fn((data) => data.data || []),
    transformARInvoiceFromAPI: vi.fn((data) => data),
  }
})

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
        subtotal: 1724.14,
        taxAmount: 275.86,
        totalAmount: 2000,
        status: 'pending'
      }
      const mockInvoice = createMockARInvoice()
      mockAxios.post.mockResolvedValue({
        data: { data: mockInvoice }
      })

      // Act
      const result = await arInvoicesService.create(formData)

      // Assert
      // Tipo y atributos exactos de ARInvoiceSchema (camelCase, numeros como number)
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-invoices', {
        data: {
          type: 'ar-invoices',
          attributes: {
            invoiceNumber: 'AR-001',
            invoiceDate: '2025-01-15',
            dueDate: '2025-02-15',
            contactId: 1,
            salesOrderId: null,
            currency: 'MXN',
            subtotal: 1724.14,
            taxAmount: 275.86,
            totalAmount: 2000,
            status: 'pending',
          },
        },
      })
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


  describe('registerPayment', () => {
    it('should send the payload with snake_case fields to the register-payment endpoint', async () => {
      // Arrange: respuesta real del ARInvoiceController (snake_case, ids numericos)
      const backendResponse = {
        message: 'Pago registrado exitosamente',
        payment: { id: 7, payment_number: 'PAY-2026-00007' },
        invoice: {
          id: 1,
          total_amount: 2320,
          paid_amount: 1000,
          balance: 1320,
          status: 'partial',
        },
      }
      mockAxios.post.mockResolvedValue({ data: backendResponse })

      // Act
      const result = await arInvoicesService.registerPayment('1', {
        paymentDate: '2026-07-10',
        amount: 500,
        formaPago: '03',
        reference: 'REF-123',
        comments: 'Pago parcial',
      })

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-invoices/1/register-payment', {
        payment_date: '2026-07-10',
        amount: 500,
        forma_pago: '03',
        reference: 'REF-123',
        comments: 'Pago parcial',
      })
      expect(result).toEqual({
        message: 'Pago registrado exitosamente',
        payment: { id: '7', paymentNumber: 'PAY-2026-00007' },
        invoice: {
          id: '1',
          totalAmount: 2320,
          paidAmount: 1000,
          balance: 1320,
          status: 'partial',
        },
      })
    })

    it('should omit optional reference and comments when not provided', async () => {
      // Arrange
      mockAxios.post.mockResolvedValue({
        data: {
          message: 'ok',
          payment: { id: 8, payment_number: 'PAY-2026-00008' },
          invoice: { id: 1, total_amount: 100, paid_amount: 100, balance: 0, status: 'paid' },
        },
      })

      // Act
      await arInvoicesService.registerPayment('1', {
        paymentDate: '2026-07-10',
        amount: 100,
        formaPago: '01',
      })

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-invoices/1/register-payment', {
        payment_date: '2026-07-10',
        amount: 100,
        forma_pago: '01',
      })
    })

    it('should propagate 422 errors from overpayment or invalid forma de pago', async () => {
      // Arrange
      const axiosError = {
        response: {
          status: 422,
          data: {
            message: 'El monto excede el saldo pendiente de la factura.',
            errors: [{ title: 'Unprocessable Entity', detail: 'El monto excede el saldo pendiente de la factura.' }],
          },
        },
      }
      mockAxios.post.mockRejectedValue(axiosError)

      // Act & Assert
      await expect(
        arInvoicesService.registerPayment('1', {
          paymentDate: '2026-07-10',
          amount: 999999,
          formaPago: '03',
        })
      ).rejects.toEqual(axiosError)
    })
  })
})
