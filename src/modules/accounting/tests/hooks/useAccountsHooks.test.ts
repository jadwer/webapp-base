/**
 * ACCOUNTS HOOKS TESTS
 * Unit tests for Accounts SWR hooks
 * Testing data fetching and mutations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAccounts, useAccount, usePostableAccounts, useAccountMutations } from '../../hooks'
import * as accountsService from '../../services/index'
import { createMockAccount, createMockAPIResponse } from '../utils/test-utils'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    // If key is null/falsy, SWR doesn't fetch and isLoading is false
    if (!key || !fetcher) {
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn()
      }
    }
    // If key and fetcher exist, SWR is loading
    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn()
    }
  }),
  useSWRConfig: vi.fn(() => ({
    mutate: vi.fn()
  }))
}))

// Mock services
vi.mock('../../services', () => ({
  accountsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getPostableAccounts: vi.fn()
  }
}))

describe('Accounts Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAccounts', () => {
    it('should return empty array when no data', () => {
      // Act
      const { result } = renderHook(() => useAccounts())

      // Assert
      expect(result.current.accounts).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useAccount', () => {
    it('should return null when no id provided', () => {
      // Act
      const { result } = renderHook(() => useAccount(null))

      // Assert
      expect(result.current.account).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('usePostableAccounts', () => {
    it('should return empty array when no data', () => {
      // Act
      const { result } = renderHook(() => usePostableAccounts())

      // Assert
      expect(result.current.postableAccounts).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useAccountMutations', () => {
    it('should provide createAccount function', () => {
      // Act
      const { result } = renderHook(() => useAccountMutations())

      // Assert
      expect(result.current.createAccount).toBeDefined()
      expect(typeof result.current.createAccount).toBe('function')
    })

    it('should provide updateAccount function', () => {
      // Act
      const { result } = renderHook(() => useAccountMutations())

      // Assert
      expect(result.current.updateAccount).toBeDefined()
      expect(typeof result.current.updateAccount).toBe('function')
    })

    it('should provide deleteAccount function', () => {
      // Act
      const { result } = renderHook(() => useAccountMutations())

      // Assert
      expect(result.current.deleteAccount).toBeDefined()
      expect(typeof result.current.deleteAccount).toBe('function')
    })

    it('should call accountsService.create when creating account', async () => {
      // Arrange
      const mockAccount = createMockAccount()
      const createSpy = vi.spyOn(accountsService.accountsService, 'create')
        .mockResolvedValue({ data: mockAccount })

      const { result } = renderHook(() => useAccountMutations())

      // Act
      await result.current.createAccount({
        code: '1003',
        name: 'Test Account',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active'
      })

      // Assert
      expect(createSpy).toHaveBeenCalled()
    })
  })
})
