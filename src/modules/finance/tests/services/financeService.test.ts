/**
 * FINANCE SERVICE TESTS
 * Unit tests for Finance module API services
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as financeService from '../../services'
import axiosClient from '@/lib/axiosClient'
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
vi.mock('@/lib/axiosClient', () => ({
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
      // Service uses transformer with snake_case attributes for AP Invoices
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ap-invoices', {
        data: {
          type: 'a-p-invoices',
          attributes: {
            contact_id: 1,
            invoice_number: 'FACT-TEST',
            invoice_date: '2025-08-20',
            due_date: '2025-09-20',
            purchase_order_id: null,
            currency: 'MXN',
            subtotal: 1000.00,
            tax_amount: 160.00,
            total_amount: 1160.00,
            status: 'draft',
            notes: null,
            metadata: {}
          }
        }
      })
      expect(result.invoiceNumber).toBe('FACT-TEST')
    })

    it('should update AP invoice successfully', async () => {
      // Arrange
      const updateData = { status: 'sent' as const }
      const mockResponse = createMockAPInvoice({ ...updateData, id: '1' })
      mockAxios.patch.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.updateAPInvoice('1', updateData as any)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/ap-invoices/1', {
        data: {
          type: 'ap-invoices',
          id: '1',
          attributes: updateData
        }
      })
      expect(result).toEqual(mockResponse)
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
      // Service uses transformer with snake_case attributes for AR Invoices
      // FI-M002: Includes early payment discount fields
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/ar-invoices', {
        data: {
          type: 'a-r-invoices',
          attributes: {
            contact_id: 10,
            invoice_number: 'INV-TEST',
            invoice_date: '2025-08-20',
            due_date: '2025-09-20',
            sales_order_id: null,
            currency: 'MXN',
            subtotal: 2000.00,
            tax_amount: 320.00,
            total_amount: 2320.00,
            status: 'draft',
            notes: null,
            metadata: {},
            // FI-M002: Early Payment Discount fields
            discount_percent: null,
            discount_days: null,
            discount_date: null,
            discount_amount: null,
            discount_applied: false,
            discount_applied_amount: null,
            discount_applied_date: null
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
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: {} })
      expect(result.data).toHaveLength(2)
    })

    it('should create AP payment with proper validation', async () => {
      // Arrange
      const paymentData = {
        contactId: 1,
        paymentDate: '2025-08-20',
        paymentMethod: 'transfer',
        currency: 'MXN',
        amount: 500.00,
        bankAccountId: 1,
        status: 'draft' as const
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
      // Service uses transformer with camelCase attributes and type 'a-p-payments'
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payments', {
        data: {
          type: 'a-p-payments',
          attributes: {
            contactId: 1,
            paymentDate: '2025-08-20',
            paymentMethod: 'transfer',
            currency: 'MXN',
            amount: 500.00,
            bankAccountId: 1,
            status: 'draft'
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
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/payments', { params: {} })
      expect(result.data).toHaveLength(2)
    })

    it('should create AR receipt with receiptDate field', async () => {
      // Arrange
      const receiptData = {
        contactId: 1,
        receiptDate: '2025-08-20', // Key field per documentation
        paymentMethod: 'transfer',
        currency: 'MXN',
        amount: 1000.00,
        bankAccountId: 1,
        status: 'draft' as const
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
      // Service uses transformer with camelCase attributes and type 'a-r-receipts'
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/payments', {
        data: {
          type: 'a-r-receipts',
          attributes: {
            contactId: 1,
            receiptDate: '2025-08-20',
            paymentMethod: 'transfer',
            currency: 'MXN',
            amount: 1000.00,
            bankAccountId: 1,
            status: 'draft'
          }
        }
      })
      expect(result.receiptDate).toBe('2025-08-20')
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
        clabe: '021180009876543210',
        currency: 'MXN',
        accountType: 'savings',
        openingBalance: '25000.00',
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
      expect(result.bankName).toBe('HSBC')
      expect(result.accountType).toBe('savings')
      expect(result.openingBalance).toBe('25000.00')
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
      const filters = { status: 'sent', contactId: 5 }
      const pagination = { page: 2, size: 10 }
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await financeService.getAPInvoices({ filters, pagination })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/ap-invoices', {
        params: {
          'filter[status]': 'sent',
          'filter[contactId]': 5,
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