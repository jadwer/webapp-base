/**
 * FINANCE SERVICE TESTS
 * Unit tests for Finance module API services
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as financeService from '../../services'
import axiosClient from '../../lib/axiosClient'
import { 
  createMockAPInvoice, 
  createMockARInvoice,
  createMockAPPayment,
  createMockARReceipt,
  createMockBankAccount,
  createMockAPIResponse,
  setupCommonMocks,
  cleanupMocks
} from '../utils/test-utils'

// Mock axios client
vi.mock('../../lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockAxios = axiosClient as any

describe('Finance Service', () => {
  beforeEach(() => {
    cleanupMocks()
    setupCommonMocks()
  })

  describe('AP Invoices', () => {
    it('should fetch AP invoices successfully', async () => {
      // Arrange
      const mockInvoices = [createMockAPInvoice(), createMockAPInvoice({ id: '2' })]
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockInvoices.map(inv => ({
          id: inv.id,
          type: 'ap-invoices',
          attributes: inv
        })),
        meta: { page: { total: 2 } }
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getAPInvoices()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices', { params: {} })
      expect(result.data).toHaveLength(2)
      expect(result.meta).toBeDefined()
    })

    it('should fetch single AP invoice successfully', async () => {
      // Arrange
      const mockInvoice = createMockAPInvoice()
      const mockResponse = {
        data: {
          id: mockInvoice.id,
          type: 'ap-invoices',
          attributes: mockInvoice
        }
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getAPInvoice('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices/1')
      expect(result.id).toBe('1')
    })

    it('should create AP invoice successfully', async () => {
      // Arrange
      const invoiceData = {
        contactId: 1,
        invoiceNumber: 'FACT-TEST',
        invoiceDate: '2025-08-20',
        dueDate: '2025-09-20',
        currency: 'MXN',
        subtotal: 1000.00,
        taxAmount: 160.00,
        totalAmount: 1160.00,
        status: 'draft' as const
      }
      const mockInvoice = createMockAPInvoice(invoiceData)
      const mockResponse = {
        data: {
          id: mockInvoice.id,
          type: 'ap-invoices',
          attributes: mockInvoice
        }
      }
      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.createAPInvoice(invoiceData)

      // Assert
      // Tipo ap-invoices y atributos camelCase de APInvoiceSchema
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ap-invoices', {
        data: {
          type: 'ap-invoices',
          attributes: {
            invoiceNumber: 'FACT-TEST',
            invoiceDate: '2025-08-20',
            dueDate: '2025-09-20',
            contactId: 1,
            purchaseOrderId: null,
            currency: 'MXN',
            subtotal: 1000.00,
            taxAmount: 160.00,
            totalAmount: 1160.00,
            status: 'draft',
          }
        }
      })
      expect(result.invoiceNumber).toBe('FACT-TEST')
    })

    it('should update AP invoice successfully', async () => {
      // Arrange
      // Llaves que no son atributo (paidDate, contactName) no viajan; numeros como number
      const updateData = { status: 'posted' as const, totalAmount: '1500' as unknown as number, contactName: 'X' }
      mockAxios.patch.mockResolvedValue({
        data: { data: { id: '1', type: 'ap-invoices', attributes: { status: 'posted', totalAmount: 1500 } } }
      })

      // Act
      const result = await financeService.updateAPInvoice('1', updateData as never)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/ap-invoices/1', {
        data: {
          type: 'ap-invoices',
          id: '1',
          attributes: { totalAmount: 1500, status: 'posted' }
        }
      })
      expect(result.status).toBe('posted')
      expect(result.totalAmount).toBe(1500)
    })

    it('should delete AP invoice successfully', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: null })

      // Act
      await financeService.deleteAPInvoice('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/ap-invoices/1')
    })
  })

  describe('AR Invoices', () => {
    it('should fetch AR invoices successfully', async () => {
      // Arrange
      const mockInvoices = [createMockARInvoice(), createMockARInvoice({ id: '2' })]
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockInvoices.map(inv => ({
          id: inv.id,
          type: 'ar-invoices',
          attributes: inv
        })),
        meta: { page: { total: 2 } }
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getARInvoices()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ar-invoices', { params: {} })
      expect(result.data).toHaveLength(2)
    })

    it('should create AR invoice with correct data transformation', async () => {
      // Arrange
      const invoiceData = {
        contactId: 10,
        invoiceNumber: 'INV-TEST',
        invoiceDate: '2025-08-20',
        dueDate: '2025-09-20',
        currency: 'MXN',
        subtotal: 2000.00,
        taxAmount: 320.00,
        totalAmount: 2320.00,
        status: 'draft' as const
      }
      const mockInvoice = createMockARInvoice(invoiceData)
      const mockResponse = {
        data: {
          id: mockInvoice.id,
          type: 'ar-invoices',
          attributes: mockInvoice
        }
      }
      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.createARInvoice(invoiceData)

      // Assert
      // Tipo ar-invoices y atributos camelCase de ARInvoiceSchema
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-invoices', {
        data: {
          type: 'ar-invoices',
          attributes: {
            invoiceNumber: 'INV-TEST',
            invoiceDate: '2025-08-20',
            dueDate: '2025-09-20',
            contactId: 10,
            salesOrderId: null,
            currency: 'MXN',
            subtotal: 2000.00,
            taxAmount: 320.00,
            totalAmount: 2320.00,
            status: 'draft',
          }
        }
      })
      expect(result.invoiceNumber).toBe('INV-TEST')
    })
  })

  describe('AP Payments', () => {
    it('should fetch AP payments successfully', async () => {
      // Arrange
      const mockPayments = [createMockAPPayment(), createMockAPPayment({ id: '2' })]
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockPayments.map(pay => ({
          id: pay.id,
          type: 'payments',
          attributes: pay
        })),
        meta: { page: { total: 2 } }
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getAPPayments()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { 'filter[direction]': 'ap' } })
      expect(result.data).toHaveLength(2)
    })

    it('should create AP payment as a payments resource', async () => {
      // Arrange: valores como llegan de un formulario (string) se envian como number
      const paymentData = {
        paymentNumber: 'PAG-001',
        contactId: '1' as unknown as number,
        paymentDate: '2025-08-20',
        paymentMethodId: '4' as unknown as number,
        currency: 'MXN',
        amount: '500.00' as unknown as number,
        bankAccountId: 1,
      }
      const mockPayment = createMockAPPayment(paymentData)
      const mockResponse = {
        data: {
          id: mockPayment.id,
          type: 'payments',
          attributes: mockPayment
        }
      }
      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.createAPPayment(paymentData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payments', {
        data: {
          type: 'payments',
          attributes: {
            paymentNumber: 'PAG-001',
            paymentDate: '2025-08-20',
            contactId: 1,
            bankAccountId: 1,
            paymentMethodId: 4,
            amount: 500,
            currency: 'MXN',
            appliedAmount: 0,
            unappliedAmount: 500,
            status: 'unapplied',
          }
        }
      })
      expect(result.amount).toBe(500.00)
    })
  })

  describe('AR Receipts', () => {
    it('should fetch AR receipts successfully', async () => {
      // Arrange
      const mockReceipts = [createMockARReceipt(), createMockARReceipt({ id: '2' })]
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockReceipts.map(rec => ({
          id: rec.id,
          type: 'payments',
          attributes: rec
        })),
        meta: { page: { total: 2 } }
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getARReceipts()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: { 'filter[direction]': 'ar' } })
      expect(result.data).toHaveLength(2)
    })

    it('should create AR receipt as a payments resource with paymentDate', async () => {
      // Arrange
      const receiptData = {
        paymentNumber: 'REC-001',
        contactId: 1,
        paymentDate: '2025-08-20',
        paymentMethodId: 2,
        currency: 'MXN',
        amount: 1000.00,
        bankAccountId: 1,
        reference: 'SPEI-123',
      }
      const mockReceipt = createMockARReceipt(receiptData)
      const mockResponse = {
        data: {
          id: mockReceipt.id,
          type: 'payments',
          attributes: mockReceipt
        }
      }
      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.createARReceipt(receiptData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payments', {
        data: {
          type: 'payments',
          attributes: {
            paymentNumber: 'REC-001',
            paymentDate: '2025-08-20',
            contactId: 1,
            bankAccountId: 1,
            paymentMethodId: 2,
            amount: 1000,
            currency: 'MXN',
            appliedAmount: 0,
            unappliedAmount: 1000,
            status: 'unapplied',
            reference: 'SPEI-123',
          }
        }
      })
      expect(result.paymentDate).toBe('2025-08-20')
    })
  })

  describe('Bank Accounts', () => {
    it('should fetch bank accounts successfully', async () => {
      // Arrange
      const mockAccounts = [createMockBankAccount(), createMockBankAccount({ id: '2' })]
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockAccounts.map(acc => ({
          id: acc.id,
          type: 'bank-accounts',
          attributes: acc
        })),
        meta: { page: { total: 2 } }
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getBankAccounts()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-accounts', { params: {} })
      expect(result.data).toHaveLength(2)
    })

    it('should create bank account with all required fields', async () => {
      // Arrange
      const accountData = {
        accountName: 'HSBC Savings Account',
        bankName: 'HSBC',
        accountNumber: '987654321098',
        currency: 'MXN',
        glAccountId: '12' as unknown as number,
        openingBalance: '25000.00' as unknown as number,
        status: 'active' as const
      }
      const mockAccount = createMockBankAccount(accountData)
      const mockResponse = {
        data: {
          id: mockAccount.id,
          type: 'bank-accounts',
          attributes: mockAccount
        }
      }
      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.createBankAccount(accountData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/bank-accounts', {
        data: {
          type: 'bank-accounts',
          attributes: {
            accountNumber: '987654321098',
            accountName: 'HSBC Savings Account',
            bankName: 'HSBC',
            currency: 'MXN',
            glAccountId: 12,
            openingBalance: 25000,
            status: 'active',
          }
        }
      })
      expect(result.bankName).toBe('HSBC')
      expect(result.openingBalance).toBe(25000)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors properly', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 422,
          data: {
            errors: [{ detail: 'Validation failed' }]
          }
        }
      }
      mockAxios.get.mockRejectedValue(errorResponse)

      // Act & Assert
      await expect(financeService.getAPInvoices()).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Network Error'))

      // Act & Assert
      await expect(financeService.getAPInvoices()).rejects.toThrow('Network Error')
    })
  })

  describe('Query Parameters', () => {
    it('should handle filters and pagination correctly', async () => {
      // Arrange
      const filters = { status: 'posted', contact_id: 5 }
      const pagination = { page: 2, size: 10 }
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await financeService.getAPInvoices({ filters, pagination })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices', {
        params: {
          'filter[status]': 'posted',
          'filter[contact_id]': 5,
          'page[number]': 2,
          'page[size]': 10
        }
      })
    })

    it('should handle includes parameter', async () => {
      // Arrange
      const includes = ['contact', 'payments']
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await financeService.getAPInvoices({ include: includes })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices', {
        params: {
          include: 'contact,payments'
        }
      })
    })
  })
})