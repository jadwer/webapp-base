/**
 * JOURNAL LINES SERVICE TESTS
 * Unit tests for Journal Lines API service
 * Testing CRUD operations for journal entry lines
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { journalLinesService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockJournalLine, createMockAPIResponse } from '../utils/test-utils'
import type { JournalLineForm } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockAxios = axiosClient as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('Journal Lines Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all journal lines successfully', async () => {
      // Arrange
      const mockLines = [
        createMockJournalLine(),
        createMockJournalLine({ id: '2', debit: '0.00', credit: '500.00' })
      ]
      const mockResponse = createMockAPIResponse(mockLines)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await journalLinesService.getAll({})

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
    })
  })

  describe('getById', () => {
    it('should fetch single journal line by id', async () => {
      // Arrange
      const mockLine = createMockJournalLine()
      mockAxios.get.mockResolvedValue({
        data: { data: mockLine }
      })

      // Act
      const result = await journalLinesService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
      expect(result.data).toEqual(mockLine)
    })
  })

  describe('getByJournalEntry', () => {
    it('should fetch lines for specific journal entry', async () => {
      // Arrange
      const mockLines = [
        createMockJournalLine({ journalEntryId: '1' }),
        createMockJournalLine({ id: '2', journalEntryId: '1' })
      ]
      const mockResponse = createMockAPIResponse(mockLines)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await journalLinesService.getByJournalEntry('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
      expect(result.data).toEqual(mockLines)
    })

    it('should include account relationship when requested', async () => {
      // Arrange
      const mockLines = [createMockJournalLine()]
      const mockResponse = createMockAPIResponse(mockLines)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await journalLinesService.getByJournalEntry('1', ['account'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('should create new journal line successfully', async () => {
      // Arrange
      const formData: JournalLineForm = {
        accountId: '1001',
        debit: '1000.00',
        credit: '0.00',
        memo: 'Test line'
      }
      const mockLine = createMockJournalLine(formData)
      mockAxios.post.mockResolvedValue({ data: { data: mockLine } })

      // Act
      const result = await journalLinesService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/journal-lines', expect.any(Object))
      expect(result.data).toEqual(mockLine)
    })
  })

  describe('update', () => {
    it('should update existing journal line', async () => {
      // Arrange
      const updateData = { memo: 'Updated memo' }
      const mockLine = createMockJournalLine(updateData)
      mockAxios.patch.mockResolvedValue({ data: { data: mockLine } })

      // Act
      const result = await journalLinesService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/journal-lines/1', expect.any(Object))
      expect(result.data).toEqual(mockLine)
    })
  })

  describe('delete', () => {
    it('should delete journal line by id', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: {} })

      // Act
      await journalLinesService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/journal-lines/1')
    })
  })
})
