/**
 * ACCOUNTS SERVICE TESTS
 * Unit tests for Accounts API service
 * Testing CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { accountsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockAccount, createMockAPIResponse } from '../utils/test-utils'
import type { AccountForm } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock transformers
vi.mock('../../utils/transformers', () => ({
  transformAccountsFromAPI: vi.fn((data) => data.data || []),
  transformAccountFromAPI: vi.fn((data) => data),
  transformAccountToAPI: vi.fn((data) => ({ data: { type: 'accounts', attributes: data } }))
}))

const mockAxios = axiosClient as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('Accounts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all accounts successfully', async () => {
      // Arrange
      const mockAccounts = [
        createMockAccount(),
        createMockAccount({ id: '2', code: '1002', name: 'Bancos' })
      ]
      const mockResponse = createMockAPIResponse(mockAccounts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', { params: {} })
      expect(result).toHaveProperty('data')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[accountType]': 'asset', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await accountsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', { params })
    })
  })

  describe('getById', () => {
    it('should fetch single account by id', async () => {
      // Arrange
      const mockAccount = createMockAccount()
      mockAxios.get.mockResolvedValue({
        data: { data: mockAccount }
      })

      // Act
      const result = await accountsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts/1')
      expect(result.data).toEqual(mockAccount)
    })
  })

  describe('create', () => {
    it('should create new account successfully', async () => {
      // Arrange
      const formData: AccountForm = {
        code: '1003',
        name: 'Test Account',
        accountType: 'asset',
        level: 1,
        isPostable: true,
        status: 'active'
      }
      const mockAccount = createMockAccount(formData)
      mockAxios.post.mockResolvedValue({ data: { data: mockAccount } })

      // Act
      const result = await accountsService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/accounts', expect.any(Object))
      expect(result.data).toEqual(mockAccount)
    })
  })

  describe('update', () => {
    it('should update existing account', async () => {
      // Arrange
      const updateData = { name: 'Updated Account' }
      const mockAccount = createMockAccount(updateData)
      mockAxios.patch.mockResolvedValue({ data: { data: mockAccount } })

      // Act
      const result = await accountsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/accounts/1', expect.any(Object))
      expect(result.data).toEqual(mockAccount)
    })
  })

  describe('delete', () => {
    it('should delete account by id', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: {} })

      // Act
      await accountsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/accounts/1')
    })
  })

  describe('getPostableAccounts', () => {
    it('should fetch only postable accounts', async () => {
      // Arrange
      const mockAccounts = [createMockAccount({ isPostable: true })]
      const mockResponse = createMockAPIResponse(mockAccounts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await accountsService.getPostableAccounts()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/accounts', {
        params: { 'filter[isPostable]': 1 }
      })
      expect(result.data).toEqual(mockAccounts)
    })
  })
})
