import axios from '@/lib/axiosClient'
import type { ProductImage, CreateProductImageData, UpdateProductImageData } from '../types/productImage'

const ENDPOINT = '/api/v1/product-images'

interface JsonApiProductImage {
  type: string
  id: string
  attributes: Record<string, unknown>
}

function transformProductImage(resource: JsonApiProductImage): ProductImage {
  const attrs = resource.attributes
  return {
    id: resource.id,
    filePath: (attrs.filePath ?? attrs.file_path) as string,
    imageUrl: (attrs.imageUrl ?? attrs.image_url ?? null) as string | null,
    altText: (attrs.altText ?? attrs.alt_text ?? null) as string | null,
    sortOrder: (attrs.sortOrder ?? attrs.sort_order ?? 0) as number,
    isPrimary: (attrs.isPrimary ?? attrs.is_primary ?? false) as boolean,
    createdAt: (attrs.createdAt ?? attrs.created_at ?? '') as string,
    updatedAt: (attrs.updatedAt ?? attrs.updated_at ?? '') as string,
  }
}

export const productImageService = {
  async getByProduct(productId: string): Promise<ProductImage[]> {
    const response = await axios.get(ENDPOINT, {
      params: {
        'filter[product_id]': productId,
        'sort': 'sortOrder',
      },
    })
    const data = response.data?.data
    if (!Array.isArray(data)) return []
    return data.map(transformProductImage)
  },

  async create(data: CreateProductImageData): Promise<ProductImage> {
    const payload = {
      data: {
        type: 'product-images',
        attributes: {
          filePath: data.filePath,
          ...(data.altText && { altText: data.altText }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
        },
        relationships: {
          product: {
            data: { type: 'products', id: data.productId },
          },
        },
      },
    }

    const response = await axios.post(ENDPOINT, payload)
    return transformProductImage(response.data.data)
  },

  async update(id: string, data: UpdateProductImageData): Promise<ProductImage> {
    const attributes: Record<string, unknown> = {}
    if (data.altText !== undefined) attributes.altText = data.altText
    if (data.sortOrder !== undefined) attributes.sortOrder = data.sortOrder
    if (data.isPrimary !== undefined) attributes.isPrimary = data.isPrimary

    const payload = {
      data: {
        type: 'product-images',
        id,
        attributes,
      },
    }

    const response = await axios.patch(`${ENDPOINT}/${id}`, payload)
    return transformProductImage(response.data.data)
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${ENDPOINT}/${id}`)
  },

  async reorder(imageIds: string[]): Promise<void> {
    await axios.post(`${ENDPOINT}/reorder`, {
      image_ids: imageIds.map(Number),
    })
  },

  async setPrimary(id: string): Promise<ProductImage> {
    const response = await axios.post(`${ENDPOINT}/${id}/set-primary`)
    return transformProductImage(response.data.data)
  },
}
