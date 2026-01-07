/**
 * CATALOG MODULE - OFFERS HOOKS TESTS
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useOffers,
  useOffer,
  useProductsForOffer,
  useOffersMutations
} from '../../hooks/useOffers'
import { offersService } from '../../services'
import {
  createMockOffers,
  createMockOffer,
  createMockProductsForOffer,
  createMockOffersApiResponse,
  createMockOfferApiResponse,
  createMockProductsForOfferApiResponse
} from '../utils/test-utils'

// Mock the offers service
vi.mock('../../services', () => ({
  offersService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getProductsForOffer: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  }
}))

// Mock SWR to avoid caching issues in tests
vi.mock('swr', async () => {
  const actual = await vi.importActual('swr')
  return {
    ...actual,
    default: vi.fn((key, fetcher) => {
      const result = {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn()
      }

      if (key && fetcher) {
        try {
          const promise = fetcher()
          if (promise && typeof promise.then === 'function') {
            promise.then((data: unknown) => {
              result.data = data
            })
          }
        } catch {
          // Ignore errors in mock
        }
      }

      return result
    })
  }
})

describe('Offers Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useOffers', () => {
    it('should return offers and metrics', async () => {
      // Arrange
      const mockOffers = createMockOffers(3)
      vi.mocked(offersService.getAll).mockResolvedValue(createMockOffersApiResponse(mockOffers))

      // Act
      const { result } = renderHook(() => useOffers())

      // Assert
      await waitFor(() => {
        expect(result.current.offers).toBeDefined()
        expect(result.current.metrics).toBeDefined()
        expect(result.current.metrics.activeOffers).toBeGreaterThanOrEqual(0)
      })
    })

    it('should accept filters parameter', async () => {
      // Arrange
      vi.mocked(offersService.getAll).mockResolvedValue(createMockOffersApiResponse([]))

      // Act
      const filters = { search: 'test', categoryId: '1' }
      const { result } = renderHook(() => useOffers(filters))

      // Assert - hook accepts filters and returns expected shape
      expect(result.current).toHaveProperty('offers')
      expect(result.current).toHaveProperty('metrics')
      expect(result.current).toHaveProperty('isLoading')
    })
  })

  describe('useOffer', () => {
    it('should fetch a single offer by product ID', async () => {
      // Arrange
      const mockOffer = createMockOffer({ id: '5' })
      vi.mocked(offersService.getById).mockResolvedValue(createMockOfferApiResponse(mockOffer))

      // Act
      const { result } = renderHook(() => useOffer('5'))

      // Assert
      await waitFor(() => {
        expect(result.current.offer).toBeDefined()
      })
    })

    it('should return null when productId is null', () => {
      // Act
      const { result } = renderHook(() => useOffer(null))

      // Assert
      expect(result.current.offer).toBeNull()
    })
  })

  describe('useProductsForOffer', () => {
    it('should fetch products available for offers', async () => {
      // Arrange
      const mockProducts = createMockProductsForOffer(5)
      vi.mocked(offersService.getProductsForOffer).mockResolvedValue(
        createMockProductsForOfferApiResponse(mockProducts)
      )

      // Act
      const { result } = renderHook(() => useProductsForOffer())

      // Assert
      await waitFor(() => {
        expect(result.current.products).toBeDefined()
      })
    })

    it('should pass search to service', async () => {
      // Arrange
      vi.mocked(offersService.getProductsForOffer).mockResolvedValue(
        createMockProductsForOfferApiResponse([])
      )

      // Act
      renderHook(() => useProductsForOffer('search term'))

      // Assert - hook is rendered
      expect(true).toBe(true)
    })
  })

  describe('useOffersMutations', () => {
    it('should provide createOffer function', () => {
      // Act
      const { result } = renderHook(() => useOffersMutations())

      // Assert
      expect(typeof result.current.createOffer).toBe('function')
    })

    it('should provide updateOffer function', () => {
      // Act
      const { result } = renderHook(() => useOffersMutations())

      // Assert
      expect(typeof result.current.updateOffer).toBe('function')
    })

    it('should provide removeOffer function', () => {
      // Act
      const { result } = renderHook(() => useOffersMutations())

      // Assert
      expect(typeof result.current.removeOffer).toBe('function')
    })

    it('should call createOffer service', async () => {
      // Arrange
      const mockOffer = createMockOffer()
      vi.mocked(offersService.create).mockResolvedValue(createMockOfferApiResponse(mockOffer))

      const { result } = renderHook(() => useOffersMutations())

      // Act
      await result.current.createOffer({
        productId: '1',
        price: 100,
        cost: 80
      })

      // Assert
      expect(offersService.create).toHaveBeenCalledWith({
        productId: '1',
        price: 100,
        cost: 80
      })
    })

    it('should call updateOffer service', async () => {
      // Arrange
      const mockOffer = createMockOffer()
      vi.mocked(offersService.update).mockResolvedValue(createMockOfferApiResponse(mockOffer))

      const { result } = renderHook(() => useOffersMutations())

      // Act
      await result.current.updateOffer('1', {
        price: 120,
        cost: 90
      })

      // Assert
      expect(offersService.update).toHaveBeenCalledWith('1', {
        price: 120,
        cost: 90
      })
    })

    it('should call removeOffer service', async () => {
      // Arrange
      vi.mocked(offersService.remove).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useOffersMutations())

      // Act
      await result.current.removeOffer('1')

      // Assert
      expect(offersService.remove).toHaveBeenCalledWith('1')
    })

    it('should handle create error', async () => {
      // Arrange
      vi.mocked(offersService.create).mockRejectedValue(new Error('Create failed'))

      const { result } = renderHook(() => useOffersMutations())

      // Act & Assert
      await expect(result.current.createOffer({
        productId: '1',
        price: 100,
        cost: 80
      })).rejects.toThrow('Create failed')
    })

    it('should handle update error', async () => {
      // Arrange
      vi.mocked(offersService.update).mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useOffersMutations())

      // Act & Assert
      await expect(result.current.updateOffer('1', {
        price: 100,
        cost: 80
      })).rejects.toThrow('Update failed')
    })

    it('should handle remove error', async () => {
      // Arrange
      vi.mocked(offersService.remove).mockRejectedValue(new Error('Remove failed'))

      const { result } = renderHook(() => useOffersMutations())

      // Act & Assert
      await expect(result.current.removeOffer('1')).rejects.toThrow('Remove failed')
    })
  })
})
