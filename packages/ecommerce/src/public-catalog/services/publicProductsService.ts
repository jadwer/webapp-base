/**
 * PUBLIC PRODUCTS SERVICE
 * Complete API service for Public Products following JSON:API 5.x specification
 * Endpoints: /api/public/v1/public-products
 *
 * El armado de query y la resolucion de relaciones viven en
 * publicProductsTransform.ts (puro) para compartirlos con los fetchers de
 * servidor (server.ts). Aqui solo queda el transporte con axios.
 */

import { axiosClient } from '@lwm/auth'
import type {
  PublicProductFilters,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  PublicProductsResponse,
  SinglePublicProductResponse,
  EnhancedPublicProduct
} from '../types/publicProduct'
import {
  PUBLIC_PRODUCTS_PATH,
  buildPublicProductsQueryParams,
  enhancePublicProductResponse,
  enhancePublicProductsResponse,
  type PublicProductsPage
} from './publicProductsTransform'

class PublicProductsService {
  private readonly baseUrl = PUBLIC_PRODUCTS_PATH

  /**
   * Get all public products with filtering, sorting, and pagination
   */
  async getPublicProducts(
    filters?: PublicProductFilters,
    sort?: PublicProductSort[],
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<PublicProductsPage> {
    const queryParams = buildPublicProductsQueryParams(filters, sort, pagination, include)

    const response = await axiosClient.get<PublicProductsResponse>(this.baseUrl, {
      params: queryParams
    })

    return enhancePublicProductsResponse(response.data)
  }

  /**
   * Get a single public product by ID
   */
  async getPublicProduct(
    id: string,
    include: PublicProductInclude = 'unit,category,brand,images,currency'
  ): Promise<EnhancedPublicProduct> {
    const response = await axiosClient.get<SinglePublicProductResponse>(
      `${this.baseUrl}/${id}`,
      {
        params: { include }
      }
    )

    return enhancePublicProductResponse(response.data)
  }

  /**
   * Search products by query string
   */
  async searchProducts(
    query: string,
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<PublicProductsPage> {
    return this.getPublicProducts(
      { search: query },
      undefined,
      pagination,
      include
    )
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<PublicProductsPage> {
    return this.getPublicProducts(
      { categoryId },
      undefined,
      pagination,
      include
    )
  }

  /**
   * Get products by brand
   */
  async getProductsByBrand(
    brandId: string,
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<PublicProductsPage> {
    return this.getPublicProducts(
      { brandId },
      undefined,
      pagination,
      include
    )
  }

  /**
   * Get products in price range
   */
  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<PublicProductsPage> {
    return this.getPublicProducts(
      {
        priceMin: minPrice,
        priceMax: maxPrice
      },
      undefined,
      pagination,
      include
    )
  }

  /**
   * Get featured/latest products
   */
  async getFeaturedProducts(
    limit: number = 12,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<EnhancedPublicProduct[]> {
    const result = await this.getPublicProducts(
      undefined,
      [{ field: 'name', direction: 'asc' }],
      { size: limit },
      include
    )

    return result.products
  }

  /**
   * Get products with discount/offers
   * Note: This would require backend support for discount fields
   */
  async getProductsOnOffer(
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<PublicProductsPage> {
    // For now, return products sorted by price (ascending) as "offers"
    return this.getPublicProducts(
      { isActive: true },
      [{ field: 'price', direction: 'asc' }],
      pagination,
      include
    )
  }

  /**
   * Get product suggestions based on category or brand
   */
  async getProductSuggestions(
    productId: string,
    limit: number = 6,
    include: PublicProductInclude = 'unit,category,brand,currency'
  ): Promise<EnhancedPublicProduct[]> {
    try {
      // First get the product to know its category and brand
      const product = await this.getPublicProduct(productId, include)

      // Get related products from same category
      const filters: PublicProductFilters = {}

      if (product.category) {
        filters.categoryId = product.category.id
      } else if (product.brand) {
        filters.brandId = product.brand.id
      }

      const result = await this.getPublicProducts(
        filters,
        [{ field: 'name', direction: 'asc' }],
        { size: limit + 1 }, // +1 to exclude current product
        include
      )

      // Filter out the current product
      return result.products.filter(p => p.id !== productId).slice(0, limit)
    } catch {
      // Return empty array on error - product suggestions are non-critical
      return []
    }
  }
}

// Export singleton instance
export const publicProductsService = new PublicProductsService()
export default publicProductsService
