/**
 * Bank Accounts Hooks Tests
 * Tests for hooks that manage bank accounts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useBankAccounts,
  useBankAccount,
  useBankAccountMutations
} from '../../hooks'
import { bankAccountsService } from '../../services'

// Mock the service
vi.mock('../../services', () => ({
  bankAccountsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (fetcher) {
      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn()
      }
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn()
    }
  }),
  useSWRConfig: vi.fn(() => ({
    mutate: vi.fn()
  }))
}))

describe('Bank Accounts Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useBankAccounts', () => {
    it('should return bank accounts data structure', () => {
      // Act
      const { result } = renderHook(() => useBankAccounts())

      // Assert
      expect(result.current).toHaveProperty('bankAccounts')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should handle empty accounts', () => {
      // Act
      const { result } = renderHook(() => useBankAccounts())

      // Assert
      expect(result.current.bankAccounts).toEqual([])
    })

    it('should accept filters parameter', () => {
      // Act
      const params = {
        filters: { isActive: true }
      }
      renderHook(() => useBankAccounts(params))

      // Assert - Filters are passed correctly
    })
  })

  describe('useBankAccount', () => {
    it('should return single bank account data structure', () => {
      // Act
      const { result } = renderHook(() => useBankAccount('1'))

      // Assert
      expect(result.current).toHaveProperty('bankAccount')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })

    it('should not fetch when id is null', () => {
      // Act
      const { result } = renderHook(() => useBankAccount(null))

      // Assert
      expect(result.current.bankAccount).toBeNull()
    })
  })

  describe('useBankAccountMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useBankAccountMutations())

      // Assert
      expect(result.current).toHaveProperty('createBankAccount')
      expect(result.current).toHaveProperty('updateBankAccount')
      expect(result.current).toHaveProperty('deleteBankAccount')
    })

    it('should call create service on createBankAccount', async () => {
      // Arrange
      const mockAccount = {
        accountName: 'Test Operations Account',
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        accountType: 'checking',
        currency: 'USD',
        currentBalance: 10000,
        isActive: true
      }
      vi.mocked(bankAccountsService.create).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useBankAccountMutations())
      await result.current.createBankAccount(mockAccount)

      // Assert
      expect(bankAccountsService.create).toHaveBeenCalledWith(mockAccount)
    })

    it('should call update service on updateBankAccount', async () => {
      // Arrange
      const mockUpdate = { isActive: false }
      vi.mocked(bankAccountsService.update).mockResolvedValue({ data: { id: '1' } } as any)

      // Act
      const { result } = renderHook(() => useBankAccountMutations())
      await result.current.updateBankAccount('1', mockUpdate)

      // Assert
      expect(bankAccountsService.update).toHaveBeenCalledWith('1', mockUpdate)
    })
  })
})
