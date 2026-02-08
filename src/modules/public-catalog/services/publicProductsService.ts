/**
 * PUBLIC PRODUCTS SERVICE
 * Complete API service for Public Products following JSON:API 5.x specification
 * Endpoints: /api/public/v1/public-products
 */

import axiosClient from '@/lib/axiosClient'
import type {
  PublicProduct,
  PublicProductFilters,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  PublicProductsQueryParams,
  PublicProductsResponse,
  SinglePublicProductResponse,
  EnhancedPublicProduct,
  PublicUnit,
  PublicCategory,
  PublicBrand
} from '../types/publicProduct'

class PublicProductsService {
  private readonly baseUrl = '/api/public/v1/public-products'

  /**
   * Transform filters to JSON:API query parameters
   */
  private buildQueryParams(
    filters?: PublicProductFilters,
    sort?: PublicProductSort[],
    pagination?: PublicProductPagination,
    include?: PublicProductInclude
  ): PublicProductsQueryParams {
    const params: PublicProductsQueryParams = {}

    // Apply filters
    if (filters) {
      if (filters.search) {
        params['filter[search]'] = filters.search
      }
      
      if (filters.categoryId) {
        params['filter[category_id]'] = Array.isArray(filters.categoryId) 
          ? filters.categoryId.join(',') 
          : filters.categoryId
      }
      
      if (filters.categorySlug) {
        params['filter[category_slug]'] = Array.isArray(filters.categorySlug)
          ? filters.categorySlug.join(',')
          : filters.categorySlug
      }
      
      if (filters.brandId) {
        params['filter[brand_id]'] = Array.isArray(filters.brandId)
          ? filters.brandId.join(',')
          : filters.brandId
      }
      
      if (filters.brandSlug) {
        params['filter[brand_slug]'] = Array.isArray(filters.brandSlug)
          ? filters.brandSlug.join(',')
          : filters.brandSlug
      }
      
      if (filters.unitId) {
        params['filter[unit_id]'] = Array.isArray(filters.unitId)
          ? filters.unitId.join(',')
          : filters.unitId
      }
      
      if (filters.priceMin !== undefined) {
        params['filter[price_min]'] = filters.priceMin.toString()
      }
      
      if (filters.priceMax !== undefined) {
        params['filter[price_max]'] = filters.priceMax.toString()
      }
      
      // is_active filter not supported by API - removing for now
      // if (filters.isActive !== undefined) {
      //   params['filter[is_active]'] = filters.isActive ? '1' : '0'
      // }

      // On sale filter
      if (filters.isOnSale !== undefined) {
        params['filter[is_on_sale]'] = filters.isOnSale ? '1' : '0'
      }

      if (filters.sku) {
        params['filter[sku]'] = filters.sku
      }
      
      if (filters.barcode) {
        params['filter[barcode]'] = filters.barcode
      }
      
      if (filters.createdAfter) {
        params['filter[created_after]'] = filters.createdAfter
      }
      
      if (filters.createdBefore) {
        params['filter[created_before]'] = filters.createdBefore
      }
      
      if (filters.updatedAfter) {
        params['filter[updated_after]'] = filters.updatedAfter
      }
      
      if (filters.updatedBefore) {
        params['filter[updated_before]'] = filters.updatedBefore
      }
    }

    // Apply sorting
    if (sort && sort.length > 0) {
      const sortString = sort
        .map(s => s.direction === 'desc' ? `-${s.field}` : s.field)
        .join(',')
      params.sort = sortString
    }

    // Apply pagination
    if (pagination) {
      if (pagination.page !== undefined) {
        params['page[number]'] = pagination.page.toString()
      }
      if (pagination.size !== undefined) {
        params['page[size]'] = pagination.size.toString()
      }
    }

    // Apply includes
    if (include) {
      params.include = include
    }

    return params
  }

  /**
   * Resolve relationships from included resources
   */
  private resolveRelationships(
    product: PublicProduct,
    included?: (PublicUnit | PublicCategory | PublicBrand)[]
  ): EnhancedPublicProduct {
    const enhanced: EnhancedPublicProduct = {
      ...product,
      displayName: product.attributes.name,
      displayPrice: this.formatPrice(product.attributes.price),
      displayCategory: 'Sin categoría',
      displayBrand: 'Sin marca',
      displayUnit: 'Sin unidad'
    }

    if (!included) return enhanced

    // Resolve unit relationship
    if (product.relationships.unit.data) {
      const unit = included.find(
        item => item.type === 'units' && item.id === product.relationships.unit.data?.id
      ) as PublicUnit | undefined
      
      if (unit) {
        enhanced.unit = unit
        enhanced.displayUnit = unit.attributes.abbreviation || unit.attributes.name
      }
    }

    // Resolve category relationship
    if (product.relationships.category.data) {
      const category = included.find(
        item => item.type === 'categories' && item.id === product.relationships.category.data?.id
      ) as PublicCategory | undefined
      
      if (category) {
        enhanced.category = category
        enhanced.displayCategory = category.attributes.name
      }
    }

    // Resolve brand relationship
    if (product.relationships.brand.data) {
      const brand = included.find(
        item => item.type === 'brands' && item.id === product.relationships.brand.data?.id
      ) as PublicBrand | undefined
      
      if (brand) {
        enhanced.brand = brand
        enhanced.displayBrand = brand.attributes.name
      }
    }

    return enhanced
  }

  /**
   * Format price for display
   */
  private formatPrice(price: number | null): string {
    if (price === null || price === undefined) {
      return 'Precio no disponible'
    }
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(price)
  }

  /**
   * Get all public products with filtering, sorting, and pagination
   */
  async getPublicProducts(
    filters?: PublicProductFilters,
    sort?: PublicProductSort[],
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<{
    products: EnhancedPublicProduct[]
    meta: PublicProductsResponse['meta']
    links: PublicProductsResponse['links']
  }> {
    const queryParams = this.buildQueryParams(filters, sort, pagination, include)

    const response = await axiosClient.get<PublicProductsResponse>(this.baseUrl, {
      params: queryParams
    })

    // Enhance products with resolved relationships
    const enhancedProducts = response.data.data.map(product =>
      this.resolveRelationships(product, response.data.included)
    )

    return {
      products: enhancedProducts,
      meta: response.data.meta,
      links: response.data.links
    }
  }

  /**
   * Get a single public product by ID
   */
  async getPublicProduct(
    id: string,
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<EnhancedPublicProduct> {
    const response = await axiosClient.get<SinglePublicProductResponse>(
      `${this.baseUrl}/${id}`,
      {
        params: { include }
      }
    )

    // Enhance product with resolved relationships
    return this.resolveRelationships(
      response.data.data,
      response.data.included
    )
  }

  /**
   * Search products by query string
   */
  async searchProducts(
    query: string,
    pagination?: PublicProductPagination,
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<{
    products: EnhancedPublicProduct[]
    meta: PublicProductsResponse['meta']
    links: PublicProductsResponse['links']
  }> {
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
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<{
    products: EnhancedPublicProduct[]
    meta: PublicProductsResponse['meta']
    links: PublicProductsResponse['links']
  }> {
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
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<{
    products: EnhancedPublicProduct[]
    meta: PublicProductsResponse['meta']
    links: PublicProductsResponse['links']
  }> {
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
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<{
    products: EnhancedPublicProduct[]
    meta: PublicProductsResponse['meta']
    links: PublicProductsResponse['links']
  }> {
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
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<EnhancedPublicProduct[]> {
    const result = await this.getPublicProducts(
      undefined, // Remove isActive filter as it's not supported
      [{ field: 'name', direction: 'asc' }], // Use 'name' instead of 'created_at'
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
    include: PublicProductInclude = 'unit,category,brand'
  ): Promise<{
    products: EnhancedPublicProduct[]
    meta: PublicProductsResponse['meta']
    links: PublicProductsResponse['links']
  }> {
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
    include: PublicProductInclude = 'unit,category,brand'
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
        [{ field: 'name', direction: 'asc' }], // Use 'name' instead of 'created_at'
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