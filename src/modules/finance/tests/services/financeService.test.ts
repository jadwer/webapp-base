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
      const mockResponse = createMockAPIResponse(mockInvoices)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getAPInvoices()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-p-invoices')
      expect(result.data).toEqual(mockInvoices)
      expect(result.meta).toBeDefined()
    })

    it('should fetch single AP invoice successfully', async () => {
      // Arrange
      const mockInvoice = createMockAPInvoice()
      mockAxios.get.mockResolvedValue({ data: { data: mockInvoice } })

      // Act
      const result = await financeService.getAPInvoice('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-p-invoices/1')
      expect(result).toEqual(mockInvoice)
    })

    it('should create AP invoice successfully', async () => {
      // Arrange
      const invoiceData = {
        contactId: 1,
        invoiceNumber: 'FACT-TEST',
        invoiceDate: '2025-08-20',
        dueDate: '2025-09-20',
        currency: 'MXN',
        exchangeRate: 1.0,
        subtotal: 1000.00,
        taxTotal: 160.00,
        total: 1160.00,
        status: 'draft' as const
      }
      const mockResponse = createMockAPInvoice(invoiceData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.createAPInvoice(invoiceData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/a-p-invoices', {
        data: {
          type: 'a-p-invoices',
          attributes: invoiceData
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should update AP invoice successfully', async () => {
      // Arrange
      const updateData = { status: 'posted' as const }
      const mockResponse = createMockAPInvoice({ ...updateData, id: '1' })
      mockAxios.patch.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.updateAPInvoice('1', updateData as any)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/a-p-invoices/1', {
        data: {
          type: 'a-p-invoices',
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
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/a-p-invoices/1')
    })
  })

  describe('AR Invoices', () => {
    it('should fetch AR invoices successfully', async () => {
      // Arrange
      const mockInvoices = [createMockARInvoice(), createMockARInvoice({ id: '2' })]
      const mockResponse = createMockAPIResponse(mockInvoices)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getARInvoices()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-r-invoices')
      expect(result.data).toEqual(mockInvoices)
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
        taxTotal: 320.00,
        total: 2320.00,
        status: 'draft' as const
      }
      const mockResponse = createMockARInvoice(invoiceData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.createARInvoice(invoiceData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/a-r-invoices', {
        data: {
          type: 'a-r-invoices',
          attributes: invoiceData
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('AP Payments', () => {
    it('should fetch AP payments successfully', async () => {
      // Arrange
      const mockPayments = [createMockAPPayment(), createMockAPPayment({ id: '2' })]
      const mockResponse = createMockAPIResponse(mockPayments)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getAPPayments()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-p-payments')
      expect(result.data).toEqual(mockPayments)
    })

    it('should create AP payment with proper validation', async () => {
      // Arrange
      const paymentData = {
        aPInvoiceId: 1,
        bankAccountId: 1,
        paymentDate: '2025-08-20',
        amount: 500.00,
        paymentMethod: 'transfer',
        reference: 'PAY-TEST'
      }
      const mockResponse = createMockAPPayment(paymentData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.createAPPayment(paymentData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/a-p-payments', {
        data: {
          type: 'a-p-payments',
          attributes: paymentData
        }
      })
      expect(result.amount).toBe(500.00)
    })
  })

  describe('AR Receipts', () => {
    it('should fetch AR receipts successfully', async () => {
      // Arrange
      const mockReceipts = [createMockARReceipt(), createMockARReceipt({ id: '2' })]
      const mockResponse = createMockAPIResponse(mockReceipts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getARReceipts()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-r-receipts')
      expect(result.data).toEqual(mockReceipts)
    })

    it('should create AR receipt with receiptDate field', async () => {
      // Arrange
      const receiptData = {
        aRInvoiceId: 1,
        bankAccountId: 1,
        receiptDate: '2025-08-20', // Key field per documentation
        amount: 1000.00,
        paymentMethod: 'transfer',
        reference: 'REC-TEST'
      }
      const mockResponse = createMockARReceipt(receiptData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.createARReceipt(receiptData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/a-r-receipts', {
        data: {
          type: 'a-r-receipts',
          attributes: receiptData
        }
      })
      expect(result.receiptDate).toBe('2025-08-20')
    })
  })

  describe('Bank Accounts', () => {
    it('should fetch bank accounts successfully', async () => {
      // Arrange
      const mockAccounts = [createMockBankAccount(), createMockBankAccount({ id: '2' })]
      const mockResponse = createMockAPIResponse(mockAccounts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await financeService.getBankAccounts()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-accounts')
      expect(result.data).toEqual(mockAccounts)
    })

    it('should create bank account with all required fields', async () => {
      // Arrange
      const accountData = {
        bankName: 'HSBC',
        accountNumber: '987654321098',
        clabe: '021180009876543210',
        currency: 'MXN',
        accountType: 'savings' as const,
        openingBalance: 25000.00,
        status: 'active' as const
      }
      const mockResponse = createMockBankAccount(accountData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await financeService.createBankAccount(accountData)

      // Assert
      expect(result.bankName).toBe('HSBC')
      expect(result.accountType).toBe('savings')
      expect(result.openingBalance).toBe(25000.00)
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
      const filters = { status: 'posted', contactId: 5 }
      const pagination = { page: 2, size: 10 }
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await financeService.getAPInvoices({ filters, pagination })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-p-invoices', {
        params: {
          'filter[status]': 'posted',
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
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/a-p-invoices', {
        params: {
          include: 'contact,payments'
        }
      })
    })
  })
})