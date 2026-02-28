/**
 * Tests for publicProductsService
 * Tests public products API service functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import axiosClient from '@/lib/axiosClient'
import { publicProductsService } from '../../services/publicProductsService'

// Mock axiosClient
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockAxiosClient = vi.mocked(axiosClient)

// Mock response factory
function createMockProductsResponse(productCount: number = 2) {
  const products = Array.from({ length: productCount }, (_, i) => ({
    id: String(i + 1),
    type: 'public-products',
    attributes: {
      name: `Product ${i + 1}`,
      description: `Description ${i + 1}`,
      price: (i + 1) * 100,
      sku: `SKU-${i + 1}`,
      barcode: `BAR-${i + 1}`,
      imageUrl: `https://example.com/image${i + 1}.jpg`,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    relationships: {
      unit: { data: { id: '1', type: 'units' } },
      category: { data: { id: '1', type: 'categories' } },
      brand: { data: { id: '1', type: 'brands' } },
    },
  }))

  return {
    data: {
      data: products,
      included: [
        { id: '1', type: 'units', attributes: { name: 'Pieces', abbreviation: 'pz', description: null } },
        { id: '1', type: 'categories', attributes: { name: 'Category 1', description: null, slug: 'category-1', imageUrl: null } },
        { id: '1', type: 'brands', attributes: { name: 'Brand 1', description: null, slug: 'brand-1', logoUrl: null, websiteUrl: null } },
      ],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: productCount,
        from: 1,
        to: productCount,
        path: '/api/public/v1/public-products',
      },
      links: {
        first: '/api/public/v1/public-products?page[number]=1',
        last: '/api/public/v1/public-products?page[number]=1',
        prev: null,
        next: null,
      },
    },
  }
}

function createMockSingleProductResponse() {
  return {
    data: {
      data: {
        id: '1',
        type: 'public-products',
        attributes: {
          name: 'Single Product',
          description: 'Single product description',
          price: 150,
          sku: 'SINGLE-001',
          barcode: 'BAR-SINGLE',
          imageUrl: 'https://example.com/single.jpg',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        relationships: {
          unit: { data: { id: '1', type: 'units' } },
          category: { data: { id: '1', type: 'categories' } },
          brand: { data: { id: '1', type: 'brands' } },
        },
      },
      included: [
        { id: '1', type: 'units', attributes: { name: 'Pieces', abbreviation: 'pz', description: null } },
        { id: '1', type: 'categories', attributes: { name: 'Category 1', description: null, slug: 'category-1', imageUrl: null } },
        { id: '1', type: 'brands', attributes: { name: 'Brand 1', description: null, slug: 'brand-1', logoUrl: null, websiteUrl: null } },
      ],
    },
  }
}

describe('publicProductsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPublicProducts', () => {
    it('should fetch all public products successfully', async () => {
      const mockResponse = createMockProductsResponse(5)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getPublicProducts()

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            include: 'unit,category,brand,currency',
          }),
        })
      )

      expect(result.products.length).toBe(5)
      expect(result.meta.total).toBe(5)
    })

    it('should pass search filter correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      await publicProductsService.getPublicProducts({ search: 'test query' })

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[search]': 'test query',
          }),
        })
      )
    })

    it('should pass category filter correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      await publicProductsService.getPublicProducts({ categoryId: '5' })

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[category_id]': '5',
          }),
        })
      )
    })

    it('should pass brand filter correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      await publicProductsService.getPublicProducts({ brandId: '3' })

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[brand_id]': '3',
          }),
        })
      )
    })

    it('should pass price range filters correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      await publicProductsService.getPublicProducts({ priceMin: 100, priceMax: 500 })

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[price_min]': '100',
            'filter[price_max]': '500',
          }),
        })
      )
    })

    it('should pass sorting parameters correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      await publicProductsService.getPublicProducts(
        undefined,
        [{ field: 'price', direction: 'desc' }]
      )

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            sort: '-price',
          }),
        })
      )
    })

    it('should pass pagination parameters correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      await publicProductsService.getPublicProducts(
        undefined,
        undefined,
        { page: 2, size: 10 }
      )

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'page[number]': '2',
            'page[size]': '10',
          }),
        })
      )
    })

    it('should resolve relationships correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getPublicProducts()

      expect(result.products[0].displayUnit).toBe('pz')
      expect(result.products[0].displayCategory).toBe('Category 1')
      expect(result.products[0].displayBrand).toBe('Brand 1')
    })

    it('should handle API errors', async () => {
      mockAxiosClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(publicProductsService.getPublicProducts()).rejects.toThrow('Network error')
    })
  })

  describe('getPublicProduct', () => {
    it('should fetch single product by ID', async () => {
      const mockResponse = createMockSingleProductResponse()
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getPublicProduct('1')

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products/1',
        expect.objectContaining({
          params: { include: 'unit,category,brand,images,currency' },
        })
      )

      expect(result.id).toBe('1')
      expect(result.displayName).toBe('Single Product')
    })

    it('should resolve relationships for single product', async () => {
      const mockResponse = createMockSingleProductResponse()
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getPublicProduct('1')

      expect(result.displayUnit).toBe('pz')
      expect(result.displayCategory).toBe('Category 1')
      expect(result.displayBrand).toBe('Brand 1')
    })

    it('should handle non-existent product', async () => {
      mockAxiosClient.get.mockRejectedValueOnce({ response: { status: 404 } })

      await expect(publicProductsService.getPublicProduct('999')).rejects.toMatchObject({
        response: { status: 404 },
      })
    })
  })

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const mockResponse = createMockProductsResponse(2)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.searchProducts('test')

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[search]': 'test',
          }),
        })
      )

      expect(result.products.length).toBe(2)
    })
  })

  describe('getProductsByCategory', () => {
    it('should fetch products by category ID', async () => {
      const mockResponse = createMockProductsResponse(3)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getProductsByCategory('5')

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[category_id]': '5',
          }),
        })
      )

      expect(result.products.length).toBe(3)
    })
  })

  describe('getProductsByBrand', () => {
    it('should fetch products by brand ID', async () => {
      const mockResponse = createMockProductsResponse(4)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getProductsByBrand('2')

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[brand_id]': '2',
          }),
        })
      )

      expect(result.products.length).toBe(4)
    })
  })

  describe('getProductsByPriceRange', () => {
    it('should fetch products within price range', async () => {
      const mockResponse = createMockProductsResponse(2)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getProductsByPriceRange(100, 500)

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'filter[price_min]': '100',
            'filter[price_max]': '500',
          }),
        })
      )

      expect(result.products.length).toBe(2)
    })
  })

  describe('getFeaturedProducts', () => {
    it('should fetch featured products with limit', async () => {
      const mockResponse = createMockProductsResponse(6)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getFeaturedProducts(6)

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/api/public/v1/public-products',
        expect.objectContaining({
          params: expect.objectContaining({
            'page[size]': '6',
          }),
        })
      )

      expect(result.length).toBe(6)
    })
  })

  describe('getProductSuggestions', () => {
    it('should fetch product suggestions based on category', async () => {
      // First call gets the product
      const singleResponse = createMockSingleProductResponse()
      mockAxiosClient.get.mockResolvedValueOnce(singleResponse)

      // Second call gets suggestions
      const suggestionsResponse = createMockProductsResponse(5)
      mockAxiosClient.get.mockResolvedValueOnce(suggestionsResponse)

      const result = await publicProductsService.getProductSuggestions('1', 4)

      expect(mockAxiosClient.get).toHaveBeenCalledTimes(2)
      // Should filter out the original product and limit to requested count
      expect(result.length).toBeLessThanOrEqual(4)
    })

    it('should return empty array on error', async () => {
      mockAxiosClient.get.mockRejectedValueOnce(new Error('Network error'))

      const result = await publicProductsService.getProductSuggestions('1', 4)

      expect(result).toEqual([])
    })
  })

  describe('price formatting', () => {
    it('should format price correctly', async () => {
      const mockResponse = createMockProductsResponse(1)
      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getPublicProducts()

      // Price is 100, should be formatted as Mexican Pesos
      expect(result.products[0].displayPrice).toMatch(/\$100/)
    })

    it('should handle null price', async () => {
      const mockResponse = {
        data: {
          data: [{
            id: '1',
            type: 'public-products',
            attributes: {
              name: 'Product with null price',
              description: null,
              price: null,
              sku: null,
              barcode: null,
              imageUrl: null,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            relationships: {
              unit: { data: null },
              category: { data: null },
              brand: { data: null },
            },
          }],
          included: [],
          meta: {
            currentPage: 1,
            lastPage: 1,
            perPage: 20,
            total: 1,
            from: 1,
            to: 1,
            path: '/api/public/v1/public-products',
          },
          links: {
            first: '/api/public/v1/public-products?page[number]=1',
            last: '/api/public/v1/public-products?page[number]=1',
            prev: null,
            next: null,
          },
        },
      }

      mockAxiosClient.get.mockResolvedValueOnce(mockResponse)

      const result = await publicProductsService.getPublicProducts()

      expect(result.products[0].displayPrice).toBe('Precio no disponible')
    })
  })
})
