/**
 * BANK TRANSACTIONS SERVICE TESTS
 * Unit tests for Bank Transactions API service
 * Testing all CRUD operations and reconciliation features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { bankTransactionsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import {
  createMockBankTransaction
} from '../utils/test-utils'
import type { CreateBankTransactionRequest, UpdateBankTransactionRequest } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockAxios = axiosClient as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('Bank Transactions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all bank transactions successfully', async () => {
      // Arrange
      const mockTransactions = [
        createMockBankTransaction(),
        createMockBankTransaction({
          id: '2',
          transactionType: 'debit',
          amount: 1500.00,
          reference: 'CHK-001'
        })
      ]

      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockTransactions.map(tx => ({
          id: tx.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: tx.bankAccountId,
            transaction_date: tx.transactionDate,
            amount: tx.amount,
            transaction_type: tx.transactionType,
            reference: tx.reference,
            description: tx.description,
            reconciliation_status: tx.reconciliationStatus,
            reconciled_by_id: tx.reconciledById,
            reconciled_at: tx.reconciledAt,
            reconciliation_notes: tx.reconciliationNotes,
            statement_number: tx.statementNumber,
            running_balance: tx.runningBalance,
            is_active: tx.isActive,
            created_at: tx.createdAt,
            updated_at: tx.updatedAt
          },
          relationships: {
            bankAccount: {
              data: { type: 'bank-accounts', id: '1' }
            }
          }
        })),
        included: [
          {
            id: '1',
            type: 'bank-accounts',
            attributes: {
              account_name: 'Main Operations Account'
            }
          }
        ],
        meta: {
          page: {
            currentPage: 1,
            perPage: 20,
            total: 2,
            lastPage: 1
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'page[number]': '1',
          'page[size]': '20',
          include: 'bankAccount,reconciledBy'
        })
      })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].transactionType).toBe('credit')
      expect(result.data[1].transactionType).toBe('debit')
    })

    it('should fetch transactions with filters', async () => {
      // Arrange
      const mockTransactions = [createMockBankTransaction()]
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: mockTransactions.map(tx => ({
          id: tx.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: tx.bankAccountId,
            transaction_date: tx.transactionDate,
            amount: tx.amount,
            transaction_type: tx.transactionType,
            reference: tx.reference,
            description: tx.description,
            reconciliation_status: tx.reconciliationStatus,
            reconciled_by_id: tx.reconciledById,
            reconciled_at: tx.reconciledAt,
            reconciliation_notes: tx.reconciliationNotes,
            statement_number: tx.statementNumber,
            running_balance: tx.runningBalance,
            is_active: tx.isActive,
            created_at: tx.createdAt,
            updated_at: tx.updatedAt
          }
        })),
        meta: { page: { total: 1 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankTransactionsService.getAll(
        { transactionType: 'credit', reconciliationStatus: 'unreconciled' },
        { field: 'transactionDate', direction: 'desc' },
        1,
        10
      )

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'filter[transaction_type]': 'credit',
          'filter[reconciliation_status]': 'unreconciled',
          'page[size]': '10',
          sort: '-transactionDate'
        })
      })
    })

    it('should fetch transactions filtered by bank account', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: { page: { total: 0 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankTransactionsService.getAll({ bankAccountId: 123 })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'filter[bank_account_id]': '123'
        })
      })
    })

    it('should apply ascending sort correctly', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: { page: { total: 0 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankTransactionsService.getAll(
        undefined,
        { field: 'amount', direction: 'asc' }
      )

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          sort: 'amount'
        })
      })
    })

    it('should handle pagination parameters', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: {
          page: {
            currentPage: 3,
            perPage: 50,
            total: 250,
            lastPage: 5
          }
        }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.getAll(undefined, undefined, 3, 50)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'page[number]': '3',
          'page[size]': '50'
        })
      })
      expect(result.meta?.currentPage).toBe(3)
      expect(result.meta?.total).toBe(250)
    })
  })

  describe('getById', () => {
    it('should fetch single bank transaction successfully', async () => {
      // Arrange
      const mockTransaction = createMockBankTransaction()
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            reconciled_by_id: mockTransaction.reconciledById,
            reconciled_at: mockTransaction.reconciledAt,
            reconciliation_notes: mockTransaction.reconciliationNotes,
            statement_number: mockTransaction.statementNumber,
            running_balance: mockTransaction.runningBalance,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          },
          relationships: {
            bankAccount: {
              data: { type: 'bank-accounts', id: '1' }
            }
          }
        },
        included: [
          {
            id: '1',
            type: 'bank-accounts',
            attributes: {
              account_name: 'Main Operations Account'
            }
          }
        ]
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions/1?include=bankAccount,reconciledBy')
      expect(result.id).toBe('1')
      expect(result.transactionType).toBe('credit')
      expect(result.amount).toBe(5000.00)
    })

    it('should include parsed fields in response', async () => {
      // Arrange
      const mockTransaction = createMockBankTransaction({
        transactionType: 'debit',
        reconciliationStatus: 'reconciled'
      })
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            reconciled_by_id: mockTransaction.reconciledById,
            reconciled_at: mockTransaction.reconciledAt,
            reconciliation_notes: mockTransaction.reconciliationNotes,
            statement_number: mockTransaction.statementNumber,
            running_balance: mockTransaction.runningBalance,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        },
        included: []
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.getById('1')

      // Assert
      expect(result.typeLabel).toBeDefined()
      expect(result.statusLabel).toBeDefined()
      expect(result.amountDisplay).toBeDefined()
    })
  })

  describe('create', () => {
    it('should create bank transaction successfully', async () => {
      // Arrange
      const formData: CreateBankTransactionRequest = {
        bankAccountId: 1,
        transactionDate: '2025-08-20',
        amount: 5000.00,
        transactionType: 'credit',
        reference: 'DEP-002',
        description: 'Wire transfer deposit'
      }

      const mockTransaction = createMockBankTransaction(formData)
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            reconciled_by_id: mockTransaction.reconciledById,
            reconciled_at: mockTransaction.reconciledAt,
            reconciliation_notes: mockTransaction.reconciliationNotes,
            statement_number: mockTransaction.statementNumber,
            running_balance: mockTransaction.runningBalance,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        data: {
          type: 'bank-transactions',
          attributes: expect.objectContaining({
            bank_account_id: 1,
            transaction_date: '2025-08-20',
            amount: 5000.00,
            transaction_type: 'credit',
            reference: 'DEP-002',
            description: 'Wire transfer deposit'
          })
        }
      })
      expect(result.transactionType).toBe('credit')
    })

    it('should create debit transaction', async () => {
      // Arrange
      const formData: CreateBankTransactionRequest = {
        bankAccountId: 1,
        transactionDate: '2025-08-20',
        amount: 1500.00,
        transactionType: 'debit',
        reference: 'CHK-001',
        description: 'Supplier payment'
      }

      const mockTransaction = createMockBankTransaction(formData)
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: 'unreconciled',
            is_active: true,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.post.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.create(formData)

      // Assert
      expect(result.transactionType).toBe('debit')
      expect(result.amount).toBe(1500.00)
    })
  })

  describe('update', () => {
    it('should update bank transaction successfully', async () => {
      // Arrange
      const updateData: UpdateBankTransactionRequest = {
        reference: 'DEP-001-UPDATED',
        description: 'Updated deposit description'
      }

      const mockTransaction = createMockBankTransaction({
        reference: 'DEP-001-UPDATED',
        description: 'Updated deposit description'
      })
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/bank-transactions/1', {
        data: {
          type: 'bank-transactions',
          id: '1',
          attributes: expect.objectContaining({
            reference: 'DEP-001-UPDATED',
            description: 'Updated deposit description'
          })
        }
      })
      expect(result.reference).toBe('DEP-001-UPDATED')
    })

    it('should update reconciliation status', async () => {
      // Arrange
      const updateData: UpdateBankTransactionRequest = {
        reconciliationStatus: 'reconciled',
        reconciliationNotes: 'Matched with statement'
      }

      const mockTransaction = createMockBankTransaction({
        reconciliationStatus: 'reconciled',
        reconciliationNotes: 'Matched with statement'
      })
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            reconciliation_notes: mockTransaction.reconciliationNotes,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.update('1', updateData)

      // Assert
      expect(result.reconciliationStatus).toBe('reconciled')
      expect(result.reconciliationNotes).toBe('Matched with statement')
    })
  })

  describe('delete', () => {
    it('should delete bank transaction successfully', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: null })

      // Act
      await bankTransactionsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/bank-transactions/1')
    })

    it('should handle delete errors', async () => {
      // Arrange
      mockAxios.delete.mockRejectedValue(new Error('Cannot delete reconciled transaction'))

      // Act & Assert
      await expect(bankTransactionsService.delete('1')).rejects.toThrow('Cannot delete reconciled transaction')
    })
  })

  describe('reconcile', () => {
    it('should mark transaction as reconciled', async () => {
      // Arrange
      const mockTransaction = createMockBankTransaction({
        reconciliationStatus: 'reconciled',
        reconciliationNotes: 'Matched with bank statement'
      })
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            reconciliation_notes: mockTransaction.reconciliationNotes,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.reconcile('1', 'Matched with bank statement')

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/bank-transactions/1', expect.objectContaining({
        data: expect.objectContaining({
          attributes: expect.objectContaining({
            reconciliation_status: 'reconciled',
            reconciliation_notes: 'Matched with bank statement'
          })
        })
      }))
      expect(result.reconciliationStatus).toBe('reconciled')
    })

    it('should reconcile without notes', async () => {
      // Arrange
      const mockTransaction = createMockBankTransaction({
        reconciliationStatus: 'reconciled'
      })
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.reconcile('1')

      // Assert
      expect(result.reconciliationStatus).toBe('reconciled')
    })
  })

  describe('unreconcile', () => {
    it('should mark transaction as unreconciled', async () => {
      // Arrange
      const mockTransaction = createMockBankTransaction({
        reconciliationStatus: 'unreconciled',
        reconciledAt: null,
        reconciledById: null,
        reconciliationNotes: null
      })
      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            reconciled_at: mockTransaction.reconciledAt,
            reconciled_by_id: mockTransaction.reconciledById,
            reconciliation_notes: mockTransaction.reconciliationNotes,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        }
      }

      mockAxios.patch.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.unreconcile('1')

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/bank-transactions/1', expect.objectContaining({
        data: expect.objectContaining({
          attributes: expect.objectContaining({
            reconciliation_status: 'unreconciled'
          })
        })
      }))
      expect(result.reconciliationStatus).toBe('unreconciled')
    })
  })

  describe('getByBankAccount', () => {
    it('should fetch transactions for specific bank account', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: { page: { total: 0 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankTransactionsService.getByBankAccount(123, 1, 20)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'filter[bank_account_id]': '123',
          sort: '-transactionDate'
        })
      })
    })
  })

  describe('getUnreconciled', () => {
    it('should fetch unreconciled transactions', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: { page: { total: 0 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankTransactionsService.getUnreconciled()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'filter[reconciliation_status]': 'unreconciled',
          sort: 'transactionDate'
        })
      })
    })

    it('should fetch unreconciled transactions for specific account', async () => {
      // Arrange
      const mockResponse = {
        jsonapi: { version: '1.0' },
        data: [],
        meta: { page: { total: 0 } }
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankTransactionsService.getUnreconciled(456)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-transactions', {
        params: expect.objectContaining({
          'filter[bank_account_id]': '456',
          'filter[reconciliation_status]': 'unreconciled'
        })
      })
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
      const result = await bankTransactionsService.getAll()

      // Assert
      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Server error'))

      // Act & Assert
      await expect(bankTransactionsService.getAll()).rejects.toThrow('Server error')
    })

    it('should handle missing optional fields', async () => {
      // Arrange
      const mockTransaction = createMockBankTransaction({
        reference: null,
        description: null,
        statementNumber: null,
        runningBalance: null
      })

      const mockResponse = {
        data: {
          id: mockTransaction.id,
          type: 'bank-transactions',
          attributes: {
            bank_account_id: mockTransaction.bankAccountId,
            transaction_date: mockTransaction.transactionDate,
            amount: mockTransaction.amount,
            transaction_type: mockTransaction.transactionType,
            reference: mockTransaction.reference,
            description: mockTransaction.description,
            reconciliation_status: mockTransaction.reconciliationStatus,
            statement_number: mockTransaction.statementNumber,
            running_balance: mockTransaction.runningBalance,
            is_active: mockTransaction.isActive,
            created_at: mockTransaction.createdAt,
            updated_at: mockTransaction.updatedAt
          }
        },
        included: []
      }

      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankTransactionsService.getById('1')

      // Assert
      expect(result.reference).toBeNull()
      expect(result.description).toBeNull()
    })
  })
})
