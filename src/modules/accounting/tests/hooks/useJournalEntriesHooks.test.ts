/**
 * JOURNAL ENTRIES HOOKS TESTS
 * Unit tests for Journal Entries SWR hooks
 * Testing data fetching and mutations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useJournalEntries,
  useJournalEntry,
  useJournalEntryWithLines,
  useJournalEntryMutations
} from '../../hooks'
import * as journalEntriesService from '../../services/index'
import { createMockJournalEntry, createMockAPIResponse } from '../utils/test-utils'

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

// Mock services
vi.mock('../../services', () => ({
  journalEntriesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
    getWithLines: vi.fn()
  },
  journalEntryService: {
    createWithLines: vi.fn(),
    validateBalance: vi.fn()
  }
}))

describe('Journal Entries Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useJournalEntries', () => {
    it('should return empty array when no data', () => {
      // Act
      const { result } = renderHook(() => useJournalEntries())

      // Assert
      expect(result.current.journalEntries).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('should handle filter parameters', () => {
      // Act
      const { result } = renderHook(() => useJournalEntries({
        'filter[status]': 'posted'
      }))

      // Assert
      expect(result.current.journalEntries).toEqual([])
    })
  })

  describe('useJournalEntry', () => {
    it('should return null when no id provided', () => {
      // Act
      const { result } = renderHook(() => useJournalEntry(null))

      // Assert
      expect(result.current.journalEntry).toBeNull()
    })

    it('should handle valid id', () => {
      // Act
      const { result } = renderHook(() => useJournalEntry('1'))

      // Assert
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useJournalEntryWithLines', () => {
    it('should return null when no id provided', () => {
      // Act
      const { result } = renderHook(() => useJournalEntryWithLines(null))

      // Assert
      expect(result.current.journalEntry).toBeNull()
      expect(result.current).toHaveProperty('isLoading')
    })
  })

  describe('useJournalEntryMutations', () => {
    it('should provide createJournalEntry function', () => {
      // Act
      const { result } = renderHook(() => useJournalEntryMutations())

      // Assert
      expect(result.current.createJournalEntry).toBeDefined()
      expect(typeof result.current.createJournalEntry).toBe('function')
    })

    it('should provide updateJournalEntry function', () => {
      // Act
      const { result } = renderHook(() => useJournalEntryMutations())

      // Assert
      expect(result.current.updateJournalEntry).toBeDefined()
      expect(typeof result.current.updateJournalEntry).toBe('function')
    })

    it('should provide deleteJournalEntry function', () => {
      // Act
      const { result } = renderHook(() => useJournalEntryMutations())

      // Assert
      expect(result.current.deleteJournalEntry).toBeDefined()
      expect(typeof result.current.deleteJournalEntry).toBe('function')
    })

    it('should provide postJournalEntry function', () => {
      // Act
      const { result } = renderHook(() => useJournalEntryMutations())

      // Assert
      expect(result.current.postJournalEntry).toBeDefined()
      expect(typeof result.current.postJournalEntry).toBe('function')
    })

    it('should provide createJournalEntryWithLines function', () => {
      // Act
      const { result } = renderHook(() => useJournalEntryMutations())

      // Assert
      expect(result.current.createJournalEntryWithLines).toBeDefined()
      expect(typeof result.current.createJournalEntryWithLines).toBe('function')
    })

    it('should call journalEntriesService.create when creating entry', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry()
      const createSpy = vi.spyOn(journalEntriesService.journalEntriesService, 'create')
        .mockResolvedValue({ data: mockEntry })

      const { result } = renderHook(() => useJournalEntryMutations())

      // Act
      await result.current.createJournalEntry({
        journalId: 1,
        fiscalPeriodId: 1,
        number: 'JE-2025-001',
        date: '2025-08-20',
        currency: 'MXN',
        exchangeRate: '1.0',
        reference: 'Test Entry',
        description: 'Test Description',
        status: 'draft'
      })

      // Assert
      expect(createSpy).toHaveBeenCalled()
    })

    it('should call journalEntriesService.post when posting entry', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry({ status: 'posted' })
      const postSpy = vi.spyOn(journalEntriesService.journalEntriesService, 'post')
        .mockResolvedValue({ data: mockEntry })

      const { result } = renderHook(() => useJournalEntryMutations())

      // Act
      await result.current.postJournalEntry('1')

      // Assert
      expect(postSpy).toHaveBeenCalledWith('1')
    })

    it('should call journalEntryService.createWithLines when creating with lines', async () => {
      // Arrange
      const mockEntry = createMockJournalEntry()
      const createWithLinesSpy = vi.spyOn(journalEntriesService.journalEntryService, 'createWithLines')
        .mockResolvedValue({ data: mockEntry })

      const { result } = renderHook(() => useJournalEntryMutations())

      // Act
      await result.current.createJournalEntryWithLines({
        journalId: 1,
        fiscalPeriodId: 1,
        number: 'JE-2025-001',
        date: '2025-08-20',
        currency: 'MXN',
        exchangeRate: '1.0',
        reference: 'Test',
        description: 'Test',
        status: 'draft',
        lines: []
      })

      // Assert
      expect(createWithLinesSpy).toHaveBeenCalled()
    })
  })
})
