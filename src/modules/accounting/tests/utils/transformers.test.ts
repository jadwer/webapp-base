/**
 * TRANSFORMERS TESTS
 * Unit tests for Accounting data transformers
 * Testing JSON:API to Frontend and vice versa transformations
 */

import { describe, it, expect } from 'vitest'
import {
  transformAccountFromAPI,
  transformAccountToAPI,
  transformAccountsFromAPI,
  transformJournalEntryFromAPI,
  transformJournalEntryToAPI,
  transformJournalEntriesFromAPI,
  transformJournalLineFromAPI,
  transformJournalLineToAPI,
  transformJournalLinesFromAPI,
  validateAccountData,
  validateJournalEntryData,
  validateJournalLineData,
} from '../../utils/transformers'
import type { AccountForm, JournalEntryForm, JournalLineForm } from '../../types'

describe('Account Transformers', () => {
  describe('transformAccountFromAPI', () => {
    it('should transform API response to Account entity', () => {
      // Arrange
      const apiData = {
        id: '1',
        type: 'accounts',
        attributes: {
          code: '1000',
          name: 'Caja General',
          accountType: 'asset',
          level: 1,
          parentId: null,
          currency: 'MXN',
          isPostable: true,
          status: 'active',
          metadata: { notes: 'Test account' },
          createdAt: '2025-08-20T10:00:00.000Z',
          updatedAt: '2025-08-20T10:00:00.000Z',
        },
      }

      // Act
      const result = transformAccountFromAPI(apiData)

      // Assert
      expect(result.id).toBe('1')
      expect(result.code).toBe('1000')
      expect(result.name).toBe('Caja General')
      expect(result.accountType).toBe('asset')
      expect(result.level).toBe(1)
      expect(result.isPostable).toBe(true)
      expect(result.status).toBe('active')
      expect(result.currency).toBe('MXN')
    })

    it('should handle parentId as string conversion', () => {
      // Arrange
      const apiData = {
        id: '2',
        attributes: {
          code: '1001',
          name: 'Bancos',
          accountType: 'asset',
          level: 2,
          parentId: 1, // Number from API
          isPostable: true,
          status: 'active',
        },
      }

      // Act
      const result = transformAccountFromAPI(apiData)

      // Assert
      expect(result.parentId).toBe('1')
      expect(typeof result.parentId).toBe('string')
    })

    it('should default currency to MXN when not provided', () => {
      // Arrange
      const apiData = {
        id: '1',
        attributes: {
          code: '1000',
          name: 'Test',
          accountType: 'asset',
          level: 1,
          isPostable: true,
          status: 'active',
        },
      }

      // Act
      const result = transformAccountFromAPI(apiData)

      // Assert
      expect(result.currency).toBe('MXN')
    })

    it('should handle null parentId', () => {
      // Arrange
      const apiData = {
        id: '1',
        attributes: {
          code: '1000',
          name: 'Test',
          accountType: 'asset',
          level: 1,
          parentId: null,
          isPostable: true,
          status: 'active',
        },
      }

      // Act
      const result = transformAccountFromAPI(apiData)

      // Assert
      expect(result.parentId).toBeNull()
    })
  })

  describe('transformAccountToAPI', () => {
    it('should transform AccountForm to API format', () => {
      // Arrange
      const formData: AccountForm = {
        code: '1000',
        name: 'Caja General',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active',
        currency: 'MXN',
        metadata: { notes: 'Test' },
      }

      // Act
      const result = transformAccountToAPI(formData)

      // Assert
      expect(result.data.type).toBe('accounts')
      expect(result.data.attributes.code).toBe('1000')
      expect(result.data.attributes.name).toBe('Caja General')
      expect(result.data.attributes.accountType).toBe('asset')
      expect(result.data.attributes.isPostable).toBe(true)
      expect(result.data.attributes.status).toBe('active')
    })

    it('should default currency to MXN when not provided', () => {
      // Arrange
      const formData: AccountForm = {
        code: '1000',
        name: 'Test',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active',
      }

      // Act
      const result = transformAccountToAPI(formData)

      // Assert
      expect(result.data.attributes.currency).toBe('MXN')
    })

    it('should default metadata to empty object when not provided', () => {
      // Arrange
      const formData: AccountForm = {
        code: '1000',
        name: 'Test',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active',
      }

      // Act
      const result = transformAccountToAPI(formData)

      // Assert
      expect(result.data.attributes.metadata).toEqual({})
    })

    it('should include optional parentId when provided', () => {
      // Arrange
      const formData: AccountForm = {
        code: '1001',
        name: 'Bancos',
        accountType: 'asset',
        level: 2,
        parentId: '1',
        isPostable: true,
        status: 'active',
      }

      // Act
      const result = transformAccountToAPI(formData)

      // Assert
      expect(result.data.attributes.parentId).toBe('1')
    })
  })

  describe('transformAccountsFromAPI', () => {
    it('should transform batch API response to Account array', () => {
      // Arrange
      const apiResponse = {
        data: [
          {
            id: '1',
            attributes: {
              code: '1000',
              name: 'Caja General',
              accountType: 'asset',
              level: 1,
              isPostable: true,
              status: 'active',
            },
          },
          {
            id: '2',
            attributes: {
              code: '1001',
              name: 'Bancos',
              accountType: 'asset',
              level: 1,
              isPostable: true,
              status: 'active',
            },
          },
        ],
      }

      // Act
      const result = transformAccountsFromAPI(apiResponse)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].code).toBe('1000')
      expect(result[1].id).toBe('2')
      expect(result[1].code).toBe('1001')
    })

    it('should return empty array when data is not an array', () => {
      // Arrange
      const apiResponse = { data: null }

      // Act
      const result = transformAccountsFromAPI(apiResponse)

      // Assert
      expect(result).toEqual([])
    })

    it('should return empty array when data is undefined', () => {
      // Arrange
      const apiResponse = {}

      // Act
      const result = transformAccountsFromAPI(apiResponse)

      // Assert
      expect(result).toEqual([])
    })
  })
})

describe('Journal Entry Transformers', () => {
  describe('transformJournalEntryFromAPI', () => {
    it('should transform API response to JournalEntry entity', () => {
      // Arrange
      const apiData = {
        id: '1',
        type: 'journal-entries',
        attributes: {
          journalId: 1,
          periodId: 1,
          number: 'JE-2025-001',
          date: '2025-08-20',
          currency: 'MXN',
          exchangeRate: '1.0',
          reference: 'Test Entry',
          description: 'Test Description',
          status: 'draft',
          totalDebit: '1000.00',
          totalCredit: '1000.00',
          createdAt: '2025-08-20T10:00:00.000Z',
          updatedAt: '2025-08-20T10:00:00.000Z',
        },
      }

      // Act
      const result = transformJournalEntryFromAPI(apiData)

      // Assert
      expect(result.id).toBe('1')
      expect(result.journalId).toBe('1')
      expect(result.periodId).toBe('1')
      expect(result.number).toBe('JE-2025-001')
      expect(result.date).toBe('2025-08-20')
      expect(result.status).toBe('draft')
      expect(result.totalDebit).toBe('1000.00')
      expect(result.totalCredit).toBe('1000.00')
    })

    it('should convert numeric IDs to strings', () => {
      // Arrange
      const apiData = {
        id: '1',
        attributes: {
          journalId: 5,
          periodId: 10,
          approvedById: 25,
          postedById: 30,
          number: 'JE-001',
          date: '2025-08-20',
          currency: 'MXN',
          exchangeRate: '1.0',
          description: 'Test',
          status: 'posted',
          totalDebit: '100.00',
          totalCredit: '100.00',
        },
      }

      // Act
      const result = transformJournalEntryFromAPI(apiData)

      // Assert
      expect(result.journalId).toBe('5')
      expect(result.periodId).toBe('10')
      expect(result.approvedById).toBe('25')
      expect(result.postedById).toBe('30')
      expect(typeof result.journalId).toBe('string')
    })

    it('should handle undefined optional fields', () => {
      // Arrange
      const apiData = {
        id: '1',
        attributes: {
          number: 'JE-001',
          date: '2025-08-20',
          currency: 'MXN',
          exchangeRate: '1.0',
          description: 'Test',
          status: 'draft',
          totalDebit: '0.00',
          totalCredit: '0.00',
        },
      }

      // Act
      const result = transformJournalEntryFromAPI(apiData)

      // Assert
      expect(result.journalId).toBeUndefined()
      expect(result.periodId).toBeUndefined()
      expect(result.approvedById).toBeUndefined()
      expect(result.postedById).toBeUndefined()
      expect(result.reversalOfId).toBeUndefined()
    })
  })

  describe('transformJournalEntryToAPI', () => {
    it('should transform JournalEntryForm to API format', () => {
      // Arrange
      const formData: JournalEntryForm = {
        journalId: 1,
        periodId: 1,
        number: 'JE-2025-001',
        date: '2025-08-20',
        currency: 'MXN',
        exchangeRate: 1.0,
        reference: 'Test',
        description: 'Test Description',
        status: 'draft',
      }

      // Act
      const result = transformJournalEntryToAPI(formData)

      // Assert
      expect(result.data.type).toBe('journal-entries')
      expect(result.data.attributes.date).toBe('2025-08-20')
      expect(result.data.attributes.description).toBe('Test Description')
      expect(result.data.attributes.currency).toBe('MXN')
    })

    it('should default currency to MXN when not provided', () => {
      // Arrange
      const formData: JournalEntryForm = {
        journalId: 1,
        periodId: 1,
        number: 'JE-001',
        date: '2025-08-20',
        exchangeRate: 1.0,
        description: 'Test',
        status: 'draft',
      }

      // Act
      const result = transformJournalEntryToAPI(formData)

      // Assert
      expect(result.data.attributes.currency).toBe('MXN')
    })
  })

  describe('transformJournalEntriesFromAPI', () => {
    it('should transform batch API response to JournalEntry array', () => {
      // Arrange
      const apiResponse = {
        data: [
          {
            id: '1',
            attributes: {
              number: 'JE-001',
              date: '2025-08-20',
              currency: 'MXN',
              exchangeRate: '1.0',
              description: 'Test 1',
              status: 'draft',
              totalDebit: '100.00',
              totalCredit: '100.00',
            },
          },
          {
            id: '2',
            attributes: {
              number: 'JE-002',
              date: '2025-08-21',
              currency: 'MXN',
              exchangeRate: '1.0',
              description: 'Test 2',
              status: 'posted',
              totalDebit: '200.00',
              totalCredit: '200.00',
            },
          },
        ],
      }

      // Act
      const result = transformJournalEntriesFromAPI(apiResponse)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].number).toBe('JE-001')
      expect(result[1].id).toBe('2')
      expect(result[1].number).toBe('JE-002')
    })

    it('should return empty array when data is not valid', () => {
      // Arrange
      const apiResponse = { data: null }

      // Act
      const result = transformJournalEntriesFromAPI(apiResponse)

      // Assert
      expect(result).toEqual([])
    })
  })
})

describe('Journal Line Transformers', () => {
  describe('transformJournalLineFromAPI', () => {
    it('should transform API response to JournalLine entity', () => {
      // Arrange
      const apiData = {
        id: '1',
        type: 'journal-lines',
        attributes: {
          journalEntryId: 1,
          accountId: 5,
          debit: '1000.00',
          credit: '0.00',
          baseAmount: '1000.00',
          memo: 'Test line',
          currency: 'MXN',
          exchangeRate: '1.0',
          createdAt: '2025-08-20T10:00:00.000Z',
          updatedAt: '2025-08-20T10:00:00.000Z',
        },
      }

      // Act
      const result = transformJournalLineFromAPI(apiData)

      // Assert
      expect(result.id).toBe('1')
      expect(result.journalEntryId).toBe('1')
      expect(result.accountId).toBe('5')
      expect(result.debit).toBe('1000.00')
      expect(result.credit).toBe('0.00')
      expect(result.memo).toBe('Test line')
    })

    it('should convert numeric IDs to strings', () => {
      // Arrange
      const apiData = {
        id: '1',
        attributes: {
          journalEntryId: 10,
          accountId: 20,
          costCenterId: 30,
          partnerId: 40,
          debit: '500.00',
          credit: '0.00',
          baseAmount: '500.00',
          currency: 'MXN',
          exchangeRate: '1.0',
        },
      }

      // Act
      const result = transformJournalLineFromAPI(apiData)

      // Assert
      expect(result.journalEntryId).toBe('10')
      expect(result.accountId).toBe('20')
      expect(result.costCenterId).toBe('30')
      expect(result.partnerId).toBe('40')
      expect(typeof result.journalEntryId).toBe('string')
      expect(typeof result.accountId).toBe('string')
    })

    it('should handle undefined optional fields', () => {
      // Arrange
      const apiData = {
        id: '1',
        attributes: {
          journalEntryId: 1,
          accountId: 5,
          debit: '100.00',
          credit: '0.00',
          baseAmount: '100.00',
          currency: 'MXN',
          exchangeRate: '1.0',
        },
      }

      // Act
      const result = transformJournalLineFromAPI(apiData)

      // Assert
      expect(result.costCenterId).toBeUndefined()
      expect(result.partnerId).toBeUndefined()
      expect(result.memo).toBeUndefined()
    })
  })

  describe('transformJournalLineToAPI', () => {
    it('should transform JournalLineForm to API format', () => {
      // Arrange
      const formData: JournalLineForm = {
        journalEntryId: '1',
        accountId: '5',
        debit: '1000.00',
        credit: '0.00',
        memo: 'Test line',
      }

      // Act
      const result = transformJournalLineToAPI(formData)

      // Assert
      expect(result.data.type).toBe('journal-lines')
      expect(result.data.attributes.accountId).toBe('5')
      expect(result.data.attributes.debit).toBe('1000.00')
      expect(result.data.attributes.credit).toBe('0.00')
      expect(result.data.attributes.memo).toBe('Test line')
    })

    it('should handle credit line', () => {
      // Arrange
      const formData: JournalLineForm = {
        journalEntryId: '1',
        accountId: '10',
        debit: '0.00',
        credit: '1000.00',
      }

      // Act
      const result = transformJournalLineToAPI(formData)

      // Assert
      expect(result.data.attributes.debit).toBe('0.00')
      expect(result.data.attributes.credit).toBe('1000.00')
    })
  })

  describe('transformJournalLinesFromAPI', () => {
    it('should transform batch API response to JournalLine array', () => {
      // Arrange
      const apiResponse = {
        data: [
          {
            id: '1',
            attributes: {
              journalEntryId: 1,
              accountId: 5,
              debit: '500.00',
              credit: '0.00',
              baseAmount: '500.00',
              currency: 'MXN',
              exchangeRate: '1.0',
            },
          },
          {
            id: '2',
            attributes: {
              journalEntryId: 1,
              accountId: 10,
              debit: '0.00',
              credit: '500.00',
              baseAmount: '500.00',
              currency: 'MXN',
              exchangeRate: '1.0',
            },
          },
        ],
      }

      // Act
      const result = transformJournalLinesFromAPI(apiResponse)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].debit).toBe('500.00')
      expect(result[1].id).toBe('2')
      expect(result[1].credit).toBe('500.00')
    })

    it('should return empty array when data is not valid', () => {
      // Arrange
      const apiResponse = { data: null }

      // Act
      const result = transformJournalLinesFromAPI(apiResponse)

      // Assert
      expect(result).toEqual([])
    })
  })
})

describe('Validation Helpers', () => {
  describe('validateAccountData', () => {
    it('should return empty array for valid account data', () => {
      // Arrange
      const validData = {
        code: '1000',
        name: 'Test Account',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active',
      }

      // Act
      const errors = validateAccountData(validData)

      // Assert
      expect(errors).toEqual([])
    })

    it('should return error when code is missing', () => {
      // Arrange
      const invalidData = {
        name: 'Test',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active',
      }

      // Act
      const errors = validateAccountData(invalidData)

      // Assert
      expect(errors).toContain('code is required')
    })

    it('should return error when name is missing', () => {
      // Arrange
      const invalidData = {
        code: '1000',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active',
      }

      // Act
      const errors = validateAccountData(invalidData)

      // Assert
      expect(errors).toContain('name is required')
    })

    it('should return error when accountType is missing', () => {
      // Arrange
      const invalidData = {
        code: '1000',
        name: 'Test',
        level: 1,
        isPostable: true,
        status: 'active',
      }

      // Act
      const errors = validateAccountData(invalidData)

      // Assert
      expect(errors).toContain('accountType is required')
    })

    it('should return error when level is not a number', () => {
      // Arrange
      const invalidData = {
        code: '1000',
        name: 'Test',
        accountType: 'asset',
        level: '1', // String instead of number
        isPostable: true,
        status: 'active',
      }

      // Act
      const errors = validateAccountData(invalidData)

      // Assert
      expect(errors).toContain('level is required and must be a number')
    })

    it('should return error when isPostable is not boolean', () => {
      // Arrange
      const invalidData = {
        code: '1000',
        name: 'Test',
        accountType: 'asset',
        level: 1,
        isPostable: 'true', // String instead of boolean
        status: 'active',
      }

      // Act
      const errors = validateAccountData(invalidData)

      // Assert
      expect(errors).toContain('isPostable is required and must be boolean')
    })

    it('should return multiple errors for multiple missing fields', () => {
      // Arrange
      const invalidData = {
        level: '1', // Wrong type
      }

      // Act
      const errors = validateAccountData(invalidData)

      // Assert
      expect(errors).toHaveLength(6)
      expect(errors).toContain('code is required')
      expect(errors).toContain('name is required')
      expect(errors).toContain('accountType is required')
      expect(errors).toContain('status is required')
    })
  })

  describe('validateJournalEntryData', () => {
    it('should return empty array for valid journal entry data', () => {
      // Arrange
      const validData = {
        date: '2025-08-20',
        description: 'Test Entry',
      }

      // Act
      const errors = validateJournalEntryData(validData)

      // Assert
      expect(errors).toEqual([])
    })

    it('should return error when date is missing', () => {
      // Arrange
      const invalidData = {
        description: 'Test Entry',
      }

      // Act
      const errors = validateJournalEntryData(invalidData)

      // Assert
      expect(errors).toContain('date is required')
    })

    it('should return error when description is missing', () => {
      // Arrange
      const invalidData = {
        date: '2025-08-20',
      }

      // Act
      const errors = validateJournalEntryData(invalidData)

      // Assert
      expect(errors).toContain('description is required')
    })

    it('should return multiple errors when both fields are missing', () => {
      // Arrange
      const invalidData = {}

      // Act
      const errors = validateJournalEntryData(invalidData)

      // Assert
      expect(errors).toHaveLength(2)
      expect(errors).toContain('date is required')
      expect(errors).toContain('description is required')
    })
  })

  describe('validateJournalLineData', () => {
    it('should return empty array for valid debit line', () => {
      // Arrange
      const validData = {
        accountId: '5',
        debit: '1000.00',
      }

      // Act
      const errors = validateJournalLineData(validData)

      // Assert
      expect(errors).toEqual([])
    })

    it('should return empty array for valid credit line', () => {
      // Arrange
      const validData = {
        accountId: '5',
        credit: '1000.00',
      }

      // Act
      const errors = validateJournalLineData(validData)

      // Assert
      expect(errors).toEqual([])
    })

    it('should return error when accountId is missing', () => {
      // Arrange
      const invalidData = {
        debit: '1000.00',
        credit: '0.00',
      }

      // Act
      const errors = validateJournalLineData(invalidData)

      // Assert
      expect(errors).toContain('accountId is required')
    })

    it('should return error when both debit and credit are missing', () => {
      // Arrange
      const invalidData = {
        accountId: '5',
      }

      // Act
      const errors = validateJournalLineData(invalidData)

      // Assert
      expect(errors).toContain('either debit or credit must be provided')
    })

    it('should return error when both debit and credit are provided', () => {
      // Arrange
      const invalidData = {
        accountId: '5',
        debit: '500.00',
        credit: '500.00',
      }

      // Act
      const errors = validateJournalLineData(invalidData)

      // Assert
      expect(errors).toContain('cannot have both debit and credit in the same line')
    })
  })
})
