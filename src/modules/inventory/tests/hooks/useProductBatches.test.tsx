/**
 * useProductBatches Hook Tests
 * 
 * Comprehensive tests for the useProductBatches hook with SWR integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useProductBatches, useProductBatchesByProduct, useExpiringProductBatches } from '../../hooks/useProductBatches'
import { productBatchService } from '../../services/productBatchService'
import { createMockProductBatch } from '../utils/test-utils'
import type { ReactNode } from 'react'

// Mock the service
vi.mock('../../services/productBatchService', () => ({
  productBatchService: {
    getAll: vi.fn()
  }
}))

const mockedService = vi.mocked(productBatchService)

// SWR wrapper for testing
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    )
  }
}

describe('useProductBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('basic functionality', () => {
    it('should return loading state initially', () => {
      // Arrange
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatches(), { wrapper })

      // Assert
      expect(result.current.isLoading).toBe(true)
      expect(result.current.productBatches).toEqual([])
      expect(result.current.error).toBe(null)
    })

    it('should fetch product batches successfully', async () => {
      // Arrange
      const mockBatches = [
        createMockProductBatch({ id: '1', batchNumber: 'BATCH-001' }),
        createMockProductBatch({ id: '2', batchNumber: 'BATCH-002' })
      ]
      mockedService.getAll.mockResolvedValueOnce({
        data: mockBatches,
        meta: { 
          pagination: {
            total: 2,
            size: 20,
            page: 1,
            pages: 1
          }
        }
      })
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatches(), { wrapper })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.productBatches).toHaveLength(2)
      expect(result.current.productBatches[0].batchNumber).toBe('BATCH-001')
      expect(result.current.productBatches[1].batchNumber).toBe('BATCH-002')
      expect(result.current.meta?.total).toBe(2)
      expect(result.current.error).toBe(null)
    })

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('API Error')
      mockedService.getAll.mockRejectedValueOnce(mockError)
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatches(), { wrapper })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.productBatches).toEqual([])
      expect(result.current.error).toEqual(mockError)
    })

    it('should call service with correct default parameters', async () => {
      // Arrange
      mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
      const wrapper = createWrapper()

      // Act
      renderHook(() => useProductBatches(), { wrapper })

      // Assert
      await waitFor(() => {
        expect(mockedService.getAll).toHaveBeenCalledWith(
          undefined,
          { field: 'createdAt', direction: 'desc' },
          1,
          20
        )
      })
    })
  })

  describe('with filters', () => {
    it('should pass filters to service', async () => {
      // Arrange
      const filters = {
        search: 'BATCH-001',
        status: ['active'],
        productId: '1'
      }
      mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
      const wrapper = createWrapper()

      // Act
      renderHook(() => useProductBatches({ filters }), { wrapper })

      // Assert
      await waitFor(() => {
        expect(mockedService.getAll).toHaveBeenCalledWith(
          filters,
          { field: 'createdAt', direction: 'desc' },
          1,
          20
        )
      })
    })

    it('should pass custom sort to service', async () => {
      // Arrange
      const sort = { field: 'batchNumber', direction: 'asc' } as const
      mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
      const wrapper = createWrapper()

      // Act
      renderHook(() => useProductBatches({ sort }), { wrapper })

      // Assert
      await waitFor(() => {
        expect(mockedService.getAll).toHaveBeenCalledWith(
          undefined,
          sort,
          1,
          20
        )
      })
    })

    it('should pass pagination parameters to service', async () => {
      // Arrange
      mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
      const wrapper = createWrapper()

      // Act
      renderHook(() => useProductBatches({ page: 2, pageSize: 50 }), { wrapper })

      // Assert
      await waitFor(() => {
        expect(mockedService.getAll).toHaveBeenCalledWith(
          undefined,
          { field: 'createdAt', direction: 'desc' },
          2,
          50
        )
      })
    })

    it('should not fetch when enabled is false', () => {
      // Arrange
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(() => useProductBatches({ enabled: false }), { wrapper })

      // Assert
      expect(result.current.isLoading).toBe(false)
      expect(result.current.productBatches).toEqual([])
      expect(mockedService.getAll).not.toHaveBeenCalled()
    })
  })

  describe('cache key generation', () => {
    it('should generate different cache keys for different parameters', async () => {
      // Arrange
      mockedService.getAll.mockResolvedValue({ data: [], meta: {} })
      const wrapper = createWrapper()

      // Act - Render hooks with different parameters
      renderHook(
        (props) => useProductBatches(props),
        { 
          wrapper,
          initialProps: { filters: { search: 'BATCH-001' } }
        }
      )

      renderHook(
        (props) => useProductBatches(props),
        { 
          wrapper,
          initialProps: { filters: { search: 'BATCH-002' } }
        }
      )

      // Assert
      await waitFor(() => {
        expect(mockedService.getAll).toHaveBeenCalledTimes(2)
      })

      // Verify different calls were made
      expect(mockedService.getAll).toHaveBeenNthCalledWith(1,
        { search: 'BATCH-001' },
        { field: 'createdAt', direction: 'desc' },
        1,
        20
      )
      expect(mockedService.getAll).toHaveBeenNthCalledWith(2,
        { search: 'BATCH-002' },
        { field: 'createdAt', direction: 'desc' },
        1,
        20
      )
    })
  })
})

describe('useProductBatchesByProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch product batches filtered by product', async () => {
    // Arrange
    const productId = '123'
    mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
    const wrapper = createWrapper()

    // Act
    renderHook(() => useProductBatchesByProduct(productId), { wrapper })

    // Assert
    await waitFor(() => {
      expect(mockedService.getAll).toHaveBeenCalledWith(
        { productId },
        { field: 'expirationDate', direction: 'asc' },
        1,
        20
      )
    })
  })
})

describe('useExpiringProductBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch expiring product batches with default 30 days', async () => {
    // Arrange
    // Test expiring batches with default 30 days
    
    // Mock Date to return consistent values
    const mockDate = new Date('2025-01-15T00:00:00.000Z')
    vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
    
    mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
    const wrapper = createWrapper()

    // Act
    renderHook(() => useExpiringProductBatches(), { wrapper })

    // Assert
    await waitFor(() => {
      expect(mockedService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['active'],
          expiresAfter: expect.any(String),
          expiresBefore: expect.any(String)
        }),
        { field: 'expirationDate', direction: 'asc' },
        1,
        20
      )
    })
  })

  it('should fetch expiring product batches with custom days', async () => {
    // Arrange
    const mockDate = new Date('2025-01-15T00:00:00.000Z')
    vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
    
    mockedService.getAll.mockResolvedValueOnce({ data: [], meta: {} })
    const wrapper = createWrapper()

    // Act
    renderHook(() => useExpiringProductBatches(7), { wrapper })

    // Assert
    await waitFor(() => {
      expect(mockedService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['active'],
          expiresAfter: expect.any(String),
          expiresBefore: expect.any(String)
        }),
        { field: 'expirationDate', direction: 'asc' },
        1,
        20
      )
    })
  })
})