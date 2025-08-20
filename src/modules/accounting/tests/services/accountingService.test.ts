/**
 * ACCOUNTING SERVICE TESTS
 * Unit tests for Accounting module API services
 * Testing Chart of Accounts and Journal Entries operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as accountingService from '../../services'
import axiosClient from '@/lib/axiosClient'
import { 
  createMockAccount,
  createMockJournalEntry,
  createMockJournalLine,
  createMockAPIResponse,
  createMockSingleResponse,
  setupCommonMocks,
  cleanupMocks,
  testDataSets
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

describe('Accounting Service', () => {
  beforeEach(() => {
    cleanupMocks()
    setupCommonMocks()
  })

  describe('Chart of Accounts', () => {
    it('should fetch accounts successfully', async () => {
      // Arrange
      const mockAccounts = testDataSets.chartOfAccounts
      const mockResponse = createMockAPIResponse(mockAccounts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountingService.getAccounts()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts')
      expect(result.data).toEqual(mockAccounts)
      expect(result.meta).toBeDefined()
    })

    it('should fetch single account successfully', async () => {
      // Arrange
      const mockAccount = createMockAccount()
      const mockResponse = createMockSingleResponse(mockAccount)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountingService.getAccount('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts/1')
      expect(result).toEqual(mockAccount)
    })

    it('should create account with correct data transformation', async () => {
      // Arrange
      const accountData = {
        code: '1100',
        name: 'Bancos',
        accountType: 'asset' as const,
        level: 2,
        parentId: 1,
        currency: 'MXN',
        isPostable: true,
        status: 'active' as const
      }
      const mockResponse = createMockAccount(accountData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await accountingService.createAccount(accountData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/accounts', {
        data: {
          type: 'accounts',
          attributes: accountData
        }
      })
      expect(result.code).toBe('1100')
      expect(result.name).toBe('Bancos')
    })

    it('should update account successfully', async () => {
      // Arrange
      const updateData = { status: 'inactive' as const }
      const mockResponse = createMockAccount({ ...updateData, id: '1' })
      mockAxios.patch.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await accountingService.updateAccount('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/accounts/1', {
        data: {
          type: 'accounts',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.status).toBe('inactive')
    })

    it('should delete account successfully', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: null })

      // Act
      await accountingService.deleteAccount('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/accounts/1')
    })

    it('should filter accounts by postable status', async () => {
      // Arrange
      const filters = { isPostable: true }
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await accountingService.getAccounts({ filters })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', {
        params: {
          'filter[isPostable]': true
        }
      })
    })

    it('should filter accounts by account type', async () => {
      // Arrange
      const filters = { accountType: 'asset' } // Assets
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await accountingService.getAccounts({ filters })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', {
        params: {
          'filter[accountType]': 'asset'
        }
      })
    })
  })

  describe('Journal Entries', () => {
    it('should fetch journal entries successfully', async () => {
      // Arrange
      const mockEntries = [
        testDataSets.balancedJournalEntry.entry,
        testDataSets.unbalancedJournalEntry.entry
      ]
      const mockResponse = createMockAPIResponse(mockEntries)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountingService.getJournalEntries()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/journal-entries')
      expect(result.data).toEqual(mockEntries)
    })

    it('should fetch single journal entry with includes', async () => {
      // Arrange
      const mockEntry = testDataSets.balancedJournalEntry.entry
      const mockResponse = createMockSingleResponse(mockEntry)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountingService.getJournalEntry('1', ['journalLines', 'journalLines.account'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/journal-entries/1', {
        params: {
          include: 'journalLines,journalLines.account'
        }
      })
      expect(result).toEqual(mockEntry)
    })

    it('should create journal entry with balanced totals', async () => {
      // Arrange
      const entryData = {
        journalId: 1,
        periodId: 1,
        number: 'JE-2025-002',
        date: '2025-08-20',
        currency: 'MXN',
        exchangeRate: 1.0,
        reference: 'TEST-REF',
        description: 'Test journal entry',
        status: 'draft' as const,
        sourceType: 'manual'
      }
      const mockResponse = createMockJournalEntry(entryData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await accountingService.createJournalEntry(entryData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/journal-entries', {
        data: {
          type: 'journal-entries',
          attributes: entryData
        }
      })
      expect(result.number).toBe('JE-2025-002')
    })

    it('should update journal entry status to posted', async () => {
      // Arrange
      const updateData = { status: 'posted' as const }
      const mockResponse = createMockJournalEntry({ ...updateData, id: '1' })
      mockAxios.patch.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await accountingService.updateJournalEntry('1', updateData as any)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/journal-entries/1', {
        data: {
          type: 'journal-entries',
          id: '1',
          attributes: updateData
        }
      })
      expect(result.status).toBe('posted')
    })

    it('should delete journal entry successfully', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: null })

      // Act
      await accountingService.deleteJournalEntry('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/journal-entries/1')
    })

    it('should filter journal entries by status', async () => {
      // Arrange
      const filters = { status: 'draft' }
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await accountingService.getJournalEntries({ filters })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/journal-entries', {
        params: {
          'filter[status]': 'draft'
        }
      })
    })

    it('should filter journal entries by date range', async () => {
      // Arrange
      const filters = { 
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31'
      }
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await accountingService.getJournalEntries({ filters })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/journal-entries', {
        params: {
          'filter[dateFrom]': '2025-01-01',
          'filter[dateTo]': '2025-12-31'
        }
      })
    })
  })

  describe('Journal Lines', () => {
    it('should fetch journal lines for an entry', async () => {
      // Arrange
      const mockLines = testDataSets.balancedJournalEntry.lines
      const mockResponse = createMockAPIResponse(mockLines)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountingService.getJournalLines({ entryId: '1' })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/journal-lines', {
        params: {
          'filter[entryId]': '1'
        }
      })
      expect(result.data).toEqual(mockLines)
    })

    it('should create journal line with correct account relationship', async () => {
      // Arrange
      const lineData = {
        journalEntryId: 1,
        accountId: 1,
        debit: 1000.00,
        credit: 0.00,
        description: 'Test debit line',
        reference: 'TEST-001',
        currency: 'MXN',
        exchangeRate: 1.0
      }
      const mockResponse = createMockJournalLine(lineData)
      mockAxios.post.mockResolvedValue({ data: { data: mockResponse } })

      // Act
      const result = await accountingService.createJournalLine(lineData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/journal-lines', {
        data: {
          type: 'journal-lines',
          attributes: lineData
        }
      })
      expect(result.debit).toBe(1000.00)
      expect(result.credit).toBe(0.00)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors properly', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 422,
          data: {
            errors: [{ detail: 'Account code already exists' }]
          }
        }
      }
      mockAxios.get.mockRejectedValue(errorResponse)

      // Act & Assert
      await expect(accountingService.getAccounts()).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      // Arrange
      mockAxios.get.mockRejectedValue(new Error('Network Error'))

      // Act & Assert
      await expect(accountingService.getAccounts()).rejects.toThrow('Network Error')
    })

    it('should handle validation errors on account creation', async () => {
      // Arrange
      const invalidAccountData = {
        code: '', // Invalid empty code
        name: 'Test Account',
        accountType: 'asset' as const,
        level: 1,
        currency: 'MXN',
        isPostable: true,
        status: 'active' as const
      }
      const errorResponse = {
        response: {
          status: 422,
          data: {
            errors: [{ 
              source: { pointer: '/data/attributes/code' }, 
              detail: 'The code field is required.' 
            }]
          }
        }
      }
      mockAxios.post.mockRejectedValue(errorResponse)

      // Act & Assert
      await expect(accountingService.createAccount(invalidAccountData)).rejects.toThrow()
    })
  })

  describe('Query Parameters', () => {
    it('should handle complex filters and pagination for accounts', async () => {
      // Arrange
      const filters = { 
        accountType: '1', 
        status: 'active', 
        isPostable: true,
        search: 'Caja' 
      }
      const pagination = { page: 2, size: 10 }
      const include = ['parent', 'children']
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await accountingService.getAccounts({ filters, pagination, include })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', {
        params: {
          'filter[accountType]': '1',
          'filter[status]': 'active',
          'filter[isPostable]': true,
          'filter[search]': 'Caja',
          'page[number]': 2,
          'page[size]': 10,
          include: 'parent,children'
        }
      })
    })

    it('should handle sorting parameters', async () => {
      // Arrange
      const sort = ['code', '-name'] // Sort by code ascending, name descending
      mockAxios.get.mockResolvedValue({ data: createMockAPIResponse([]) })

      // Act
      await accountingService.getAccounts({ sort })

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', {
        params: {
          sort: 'code,-name'
        }
      })
    })
  })
})