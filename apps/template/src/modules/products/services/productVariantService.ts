/**
 * Product Variants Service
 *
 * API layer for product variants (size, color, etc.)
 */

import axios from '@/lib/axiosClient'

const VARIANTS_ENDPOINT = '/api/v1/product-variants'

export interface ProductVariant {
  id: string
  productId: number
  sku: string
  name: string
  attributes: Record<string, string>  // { "color": "Black", "size": "256GB" }
  price: number | null                 // Override parent price
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVariantRequest {
  productId: number
  sku: string
  name: string
  attributes: Record<string, string>
  price?: number | null
  isActive?: boolean
}

export interface UpdateVariantRequest {
  sku?: string
  name?: string
  attributes?: Record<string, string>
  price?: number | null
  isActive?: boolean
}

interface JsonApiVariant {
  id: string
  type: string
  attributes: Omit<ProductVariant, 'id'>
}

export const productVariantService = {
  /**
   * Get all variants for a product
   */
  async getVariants(productId: number): Promise<ProductVariant[]> {
    const response = await axios.get(VARIANTS_ENDPOINT, {
      params: {
        'filter[product_id]': productId
      }
    })

    return (response.data.data || []).map((item: JsonApiVariant) => ({
      id: item.id,
      ...item.attributes
    }))
  },

  /**
   * Get single variant by ID
   */
  async getVariant(id: string): Promise<ProductVariant> {
    const response = await axios.get(`${VARIANTS_ENDPOINT}/${id}`)

    const item = response.data.data as JsonApiVariant
    return {
      id: item.id,
      ...item.attributes
    }
  },

  /**
   * Create new variant
   */
  async createVariant(data: CreateVariantRequest): Promise<ProductVariant> {
    const payload = {
      data: {
        type: 'product-variants',
        attributes: {
          productId: data.productId,
          sku: data.sku,
          name: data.name,
          attributes: data.attributes,
          price: data.price ?? null,
          isActive: data.isActive ?? true
        }
      }
    }

    const response = await axios.post(VARIANTS_ENDPOINT, payload)

    const item = response.data.data as JsonApiVariant
    return {
      id: item.id,
      ...item.attributes
    }
  },

  /**
   * Update variant
   */
  async updateVariant(id: string, data: UpdateVariantRequest): Promise<ProductVariant> {
    const attributes: Record<string, unknown> = {}

    if (data.sku !== undefined) attributes.sku = data.sku
    if (data.name !== undefined) attributes.name = data.name
    if (data.attributes !== undefined) attributes.attributes = data.attributes
    if (data.price !== undefined) attributes.price = data.price
    if (data.isActive !== undefined) attributes.isActive = data.isActive

    const payload = {
      data: {
        type: 'product-variants',
        id,
        attributes
      }
    }

    const response = await axios.patch(`${VARIANTS_ENDPOINT}/${id}`, payload)

    const item = response.data.data as JsonApiVariant
    return {
      id: item.id,
      ...item.attributes
    }
  },

  /**
   * Delete variant
   */
  async deleteVariant(id: string): Promise<void> {
    await axios.delete(`${VARIANTS_ENDPOINT}/${id}`)
  }
}
