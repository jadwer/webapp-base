/**
 * Tests for usePublicProducts hooks
 * Tests SWR-powered public products hooks with service mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  usePublicProducts,
  usePublicProduct,
  usePublicProductSearch,
  usePublicProductsByCategory,
  usePublicProductsByBrand,
  useFeaturedProducts,
  useProductsOnOffer,
  useSaleProducts,
  useProductSuggestions,
  useProductsByPriceRange
} from '../../hooks/usePublicProducts'
import type { EnhancedPublicProduct, PublicProductsResponse } from '../../types/publicProduct'

// Mock SWR
vi.mock('swr/immutable', () => ({
  default: vi.fn(),
}))

// Mock the service
vi.mock('../../services/publicProductsService', () => ({
  publicProductsService: {
    getPublicProducts: vi.fn(),
    getPublicProduct: vi.fn(),
    getProductSuggestions: vi.fn(),
  },
}))

import useSWR from 'swr/immutable'
import { publicProductsService } from '../../services/publicProductsService'

const mockUseSWR = useSWR as unknown as ReturnType<typeof vi.fn>
const mockService = publicProductsService as {
  getPublicProducts: ReturnType<typeof vi.fn>
  getPublicProduct: ReturnType<typeof vi.fn>
  getProductSuggestions: ReturnType<typeof vi.fn>
}

// Mock product factory
function createMockProduct(id: string = '1', overrides: Partial<EnhancedPublicProduct> = {}): EnhancedPublicProduct {
  return {
    id,
    type: 'public-products',
    attributes: {
      name: `Product ${id}`,
      description: `Description for product ${id}`,
      price: 100,
      sku: `SKU-${id}`,
      barcode: `BAR-${id}`,
      imageUrl: `https://example.com/image${id}.jpg`,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    relationships: {
      unit: { data: { id: '1', type: 'units' } },
      category: { data: { id: '1', type: 'categories' } },
      brand: { data: { id: '1', type: 'brands' } },
    },
    displayName: `Product ${id}`,
    displayPrice: '$100.00',
    displayUnit: 'pz',
    displayCategory: 'Category 1',
    displayBrand: 'Brand 1',
    unit: {
      id: '1',
      type: 'units',
      attributes: {
        name: 'Pieces',
        abbreviation: 'pz',
        description: null,
      },
    },
    category: {
      id: '1',
      type: 'categories',
      attributes: {
        name: 'Category 1',
        description: null,
        slug: 'category-1',
        imageUrl: null,
      },
    },
    brand: {
      id: '1',
      type: 'brands',
      attributes: {
        name: 'Brand 1',
        description: null,
        slug: 'brand-1',
        logoUrl: null,
        websiteUrl: null,
      },
    },
    ...overrides,
  }
}

function createMockProductsResponse(products: EnhancedPublicProduct[]): PublicProductsResponse {
  return {
    products,
    meta: {
      currentPage: 1,
      lastPage: 1,
      perPage: 20,
      total: products.length,
      from: products.length > 0 ? 1 : null,
      to: products.length > 0 ? products.length : null,
      path: '/api/v1/public/products',
    },
    links: {
      first: '/api/v1/public/products?page[number]=1',
      last: '/api/v1/public/products?page[number]=1',
      prev: null,
      next: null,
    },
  }
}

describe('usePublicProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('usePublicProducts', () => {
    it('should return products when data is loaded', () => {
      // Arrange
      const mockProducts = [createMockProduct('1'), createMockProduct('2')]
      const mockResponse = createMockProductsResponse(mockProducts)

      mockUseSWR.mockReturnValue({
        data: mockResponse,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => usePublicProducts())

      // Assert
      expect(result.current.products).toHaveLength(2)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.meta.total).toBe(2)
    })

    it('should return loading state when data is being fetched', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: true,
      })

      // Act
      const { result } = renderHook(() => usePublicProducts())

      // Assert
      expect(result.current.isLoading).toBe(true)
      expect(result.current.products).toEqual([])
      expect(result.current.meta.total).toBe(0)
    })

    it('should return error state when fetch fails', () => {
      // Arrange
      const mockError = new Error('Network error')
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => usePublicProducts())

      // Assert
      expect(result.current.error).toBe(mockError)
      expect(result.current.products).toEqual([])
    })

    it('should pass filters to SWR key', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProducts({ search: 'test', categoryId: '1' }))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('filters'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should pass sort to SWR key', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProducts(undefined, [{ field: 'price', direction: 'asc' }]))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('sort'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should pass pagination to SWR key', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProducts(undefined, undefined, { page: 2, size: 10 }))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('pagination'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should provide mutate function', () => {
      // Arrange
      const mockMutate = vi.fn()
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: mockMutate,
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => usePublicProducts())

      // Assert
      expect(result.current.mutate).toBe(mockMutate)
    })
  })

  describe('usePublicProduct', () => {
    it('should return single product when data is loaded', () => {
      // Arrange
      const mockProduct = createMockProduct('1')
      mockUseSWR.mockReturnValue({
        data: mockProduct,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => usePublicProduct('1'))

      // Assert
      expect(result.current.product).toEqual(mockProduct)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should return null product when id is null', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => usePublicProduct(null))

      // Assert
      // Key should be null when id is null
      expect(mockUseSWR).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        expect.any(Object)
      )
      expect(result.current.product).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should be loading when id is provided and data not ready', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: true,
      })

      // Act
      const { result } = renderHook(() => usePublicProduct('1'))

      // Assert
      expect(result.current.isLoading).toBe(true)
    })

    it('should include custom includes in cache key', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProduct('1', 'unit,category'))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('unit,category'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('usePublicProductSearch', () => {
    it('should not search when query is too short', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductSearch('a'))

      // Assert - filters should be undefined (no search)
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.not.stringContaining('search'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should search when query is at least 2 characters', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([createMockProduct('1')]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductSearch('test product'))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('filters'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should trim whitespace from query', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductSearch('  ab  '))

      // Assert - trimmed 'ab' is 2 chars, should search
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('filters'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('usePublicProductsByCategory', () => {
    it('should filter by category when categoryId is provided', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([createMockProduct('1')]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductsByCategory('5'))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('categoryId'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should not filter when categoryId is null', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductsByCategory(null))

      // Assert - should not have categoryId filter
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.not.stringContaining('categoryId'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('usePublicProductsByBrand', () => {
    it('should filter by brand when brandId is provided', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([createMockProduct('1')]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductsByBrand('3'))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('brandId'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should not filter when brandId is null', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => usePublicProductsByBrand(null))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.not.stringContaining('brandId'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('useFeaturedProducts', () => {
    it('should return featured products with default limit', () => {
      // Arrange
      const mockProducts = Array.from({ length: 12 }, (_, i) => createMockProduct(`${i + 1}`))
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse(mockProducts),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => useFeaturedProducts())

      // Assert
      expect(result.current.products).toHaveLength(12)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should respect custom limit', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useFeaturedProducts(6))

      // Assert - pagination should include limit 6
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('"size":6'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should sort by name ascending', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useFeaturedProducts())

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('"field":"name"'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('useProductsOnOffer', () => {
    it('should sort by price ascending', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductsOnOffer())

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('"field":"price"'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('useSaleProducts', () => {
    it('should filter by isOnSale', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useSaleProducts())

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('isOnSale'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should sort by updatedAt descending', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useSaleProducts())

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('"field":"updatedAt"'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should use default limit of 6', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useSaleProducts())

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('"size":6'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('useProductSuggestions', () => {
    it('should return suggestions for a product', () => {
      // Arrange
      const suggestions = [createMockProduct('2'), createMockProduct('3')]
      mockUseSWR.mockReturnValue({
        data: suggestions,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => useProductSuggestions('1'))

      // Assert
      expect(result.current.suggestions).toHaveLength(2)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should return empty suggestions when productId is null', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      const { result } = renderHook(() => useProductSuggestions(null))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        expect.any(Object)
      )
      expect(result.current.suggestions).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it('should include productId in cache key', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: [],
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductSuggestions('42', 8))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        'product-suggestions:42:8:unit,category,brand',
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should respect custom limit', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: [],
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductSuggestions('1', 10))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining(':10:'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('useProductsByPriceRange', () => {
    it('should filter by price range when both min and max are provided', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductsByPriceRange(100, 500))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('priceMin'),
        expect.any(Function),
        expect.any(Object)
      )
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('priceMax'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should filter by min price only', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductsByPriceRange(100, null))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('priceMin'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should filter by max price only', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductsByPriceRange(null, 500))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('priceMax'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should not filter when both min and max are null', () => {
      // Arrange
      mockUseSWR.mockReturnValue({
        data: createMockProductsResponse([]),
        error: undefined,
        mutate: vi.fn(),
        isLoading: false,
      })

      // Act
      renderHook(() => useProductsByPriceRange(null, null))

      // Assert
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.not.stringContaining('priceMin'),
        expect.any(Function),
        expect.any(Object)
      )
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.not.stringContaining('priceMax'),
        expect.any(Function),
        expect.any(Object)
      )
    })
  })
})
