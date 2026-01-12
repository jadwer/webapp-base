/**
 * Public Product Service
 *
 * API layer for public product catalog (no auth required)
 * Only returns active products
 */

import axios from '@/lib/axiosClient'
import type { Product } from '../types'

const PUBLIC_PRODUCTS_ENDPOINT = '/api/public/v1/public-products'

interface JsonApiPublicProduct {
  id: string
  type: string
  attributes: Omit<Product, 'id'>
}

interface PublicProductsResponse {
  data: Product[]
  meta?: Record<string, unknown>
  links?: Record<string, string>
}

export const publicProductService = {
  /**
   * Get all public products (active only)
   */
  async getProducts(params?: {
    categoryId?: number
    brandId?: number
    search?: string
    sort?: string
    include?: string[]
  }): Promise<PublicProductsResponse> {
    const queryParams: Record<string, unknown> = {}

    if (params?.categoryId) {
      queryParams['filter[category_id]'] = params.categoryId
    }
    if (params?.brandId) {
      queryParams['filter[brand_id]'] = params.brandId
    }
    if (params?.search) {
      queryParams['filter[search]'] = params.search
    }
    if (params?.sort) {
      queryParams.sort = params.sort
    }
    if (params?.include) {
      queryParams.include = params.include.join(',')
    }

    const response = await axios.get(PUBLIC_PRODUCTS_ENDPOINT, { params: queryParams })

    const products = (response.data.data || []).map((item: JsonApiPublicProduct) => ({
      id: item.id,
      ...item.attributes
    }))

    return {
      data: products,
      meta: response.data.meta,
      links: response.data.links
    }
  },

  /**
   * Get single public product by ID
   */
  async getProduct(id: string, include?: string[]): Promise<Product> {
    const params: Record<string, unknown> = {}

    if (include) {
      params.include = include.join(',')
    }

    const response = await axios.get(`${PUBLIC_PRODUCTS_ENDPOINT}/${id}`, { params })

    const item = response.data.data as JsonApiPublicProduct
    return {
      id: item.id,
      ...item.attributes
    }
  }
}
