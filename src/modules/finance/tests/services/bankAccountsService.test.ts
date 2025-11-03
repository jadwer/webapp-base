/**
 * BANK ACCOUNTS SERVICE TESTS
 * Unit tests for Bank Accounts API service
 * Testing all CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { bankAccountsService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockBankAccount, createMockAPIResponse } from '../utils/test-utils'
import type { BankAccountForm } from '../../types'

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
  transformBankAccountsFromAPI: vi.fn((data) => data.data || []),
  transformBankAccountFromAPI: vi.fn((data) => data),
  transformBankAccountToAPI: vi.fn((data) => ({ data: { type: 'bank-accounts', attributes: data } }))
}))

const mockAxios = axiosClient as any

describe('Bank Accounts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all bank accounts successfully', async () => {
      // Arrange
      const mockAccounts = [
        createMockBankAccount(),
        createMockBankAccount({ id: '2', accountNumber: '9876543210' })
      ]
      const mockResponse = createMockAPIResponse(mockAccounts)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await bankAccountsService.getAll()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-accounts', { params: {} })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('jsonapi')
    })

    it('should pass query parameters correctly', async () => {
      // Arrange
      const params = { 'filter[isActive]': true, 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await bankAccountsService.getAll(params)

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-accounts', { params })
    })
  })

  describe('getById', () => {
    it('should fetch single bank account by id', async () => {
      // Arrange
      const mockAccount = createMockBankAccount()
      mockAxios.get.mockResolvedValue({
        data: { data: mockAccount, included: [] }
      })

      // Act
      const result = await bankAccountsService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/bank-accounts/1')
      expect(result.data).toBeDefined()
    })
  })

  describe('create', () => {
    it('should create new bank account', async () => {
      // Arrange
      const formData: BankAccountForm = {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        accountType: 'checking',
        currency: 'USD',
        balance: 10000,
        isActive: true
      }
      const mockAccount = createMockBankAccount()
      mockAxios.post.mockResolvedValue({
        data: { data: mockAccount }
      })

      // Act
      const result = await bankAccountsService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/bank-accounts',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'bank-accounts'
          })
        })
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update existing bank account', async () => {
      // Arrange
      const updateData = { isActive: false }
      const mockAccount = createMockBankAccount({ isActive: false })
      mockAxios.patch.mockResolvedValue({
        data: { data: mockAccount }
      })

      // Act
      const result = await bankAccountsService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/bank-accounts/1',
        {
          data: {
            type: 'bank-accounts',
            id: '1',
            attributes: updateData
          }
        }
      )
      expect(result.data).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete bank account', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({})

      // Act
      await bankAccountsService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/bank-accounts/1')
    })
  })
})
