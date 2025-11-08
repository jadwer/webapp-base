/**
 * JOURNAL ENTRIES SERVICE TESTS
 * Unit tests for Journal Entries API service
 * Testing CRUD operations and data transformations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { journalEntriesService } from '../../services'
import axiosClient from '@/lib/axiosClient'
import { createMockJournalEntry, createMockAPIResponse } from '../utils/test-utils'
import type { JournalEntryFormData } from '../../types'

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

describe('Journal Entries Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all journal entries successfully', async () => {
      // Arrange
      const mockEntries = [
        createMockJournalEntry(),
        createMockJournalEntry({ id: '2', number: 'JE-2025-002' })
      ]
      const mockResponse = createMockAPIResponse(mockEntries)
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await journalEntriesService.getAll({})

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
    })

    it('should pass filters correctly', async () => {
      // Arrange
      const filters = { 'filter[status]': 'posted', 'page[number]': 1 }
      const mockResponse = createMockAPIResponse([])
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      await journalEntriesService.getAll(filters)

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('should fetch single journal entry by id', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry()
      mockAxios.get.mockResolvedValue({
        data: { data: mockEntry }
      })

      // Act
      const result = await journalEntriesService.getById('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/journal-entries/1')
      expect(result.data).toEqual(mockEntry)
    })

    it('should include relationships when specified', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry()
      mockAxios.get.mockResolvedValue({
        data: { data: mockEntry, included: [] }
      })

      // Act
      await journalEntriesService.getById('1', ['journalLines'])

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('should create new journal entry successfully', async () => {
      // Arrange
      const formData: JournalEntryFormData = {
        date: '2025-01-05',
        description: 'Test journal entry',
        reference: 'REF-001'
      }
      const mockEntry = createMockJournalEntry(formData)
      mockAxios.post.mockResolvedValue({ data: { data: mockEntry } })

      // Act
      const result = await journalEntriesService.create(formData)

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/journal-entries', expect.any(Object))
      expect(result.data).toEqual(mockEntry)
    })
  })

  describe('update', () => {
    it('should update existing journal entry', async () => {
      // Arrange
      const updateData = { description: 'Updated description' }
      const mockEntry = createMockJournalEntry(updateData)
      mockAxios.patch.mockResolvedValue({ data: { data: mockEntry } })

      // Act
      const result = await journalEntriesService.update('1', updateData)

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/journal-entries/1', expect.any(Object))
      expect(result.data).toEqual(mockEntry)
    })
  })

  describe('delete', () => {
    it('should delete journal entry by id', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({ data: {} })

      // Act
      await journalEntriesService.delete('1')

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/journal-entries/1')
    })
  })

  describe('post', () => {
    it('should post a draft journal entry', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry({ status: 'posted' })
      mockAxios.post.mockResolvedValue({ data: { data: mockEntry } })

      // Act
      const result = await journalEntriesService.post('1')

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/journal-entries/1/post')
      expect(result.data.status).toBe('posted')
    })
  })

  describe('getWithLines', () => {
    it('should fetch journal entry with lines included', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry()
      mockAxios.get.mockResolvedValue({
        data: { data: mockEntry, included: [] }
      })

      // Act
      const result = await journalEntriesService.getWithLines('1')

      // Assert
      expect(mockAxios.get).toHaveBeenCalled()
      expect(result.data).toEqual(mockEntry)
    })
  })
})
