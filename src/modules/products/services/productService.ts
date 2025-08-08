import axios from '@/lib/axiosClient'
import {
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  QueryParams,
  ProductFilters,
  ProductSortOptions
} from '../types'
import { transformJsonApiProduct, JsonApiResource } from '../utils/transformers'
import type { JsonApiResponse } from '../types'

const PRODUCTS_ENDPOINT = '/api/v1/products'

export const productService = {
  async getProducts(params?: {
    page?: { number?: number; size?: number }
    filters?: ProductFilters
    sort?: ProductSortOptions
    include?: string[]
  }): Promise<ProductsResponse> {
    const queryParams: QueryParams = {}
    
    if (params?.page) {
      queryParams.page = params.page
    }
    
    if (params?.filters) {
      queryParams.filter = {}
      if (params.filters.name) queryParams.filter.name = params.filters.name
      if (params.filters.sku) queryParams.filter.sku = params.filters.sku
      if (params.filters.unitId) queryParams.filter.unitId = params.filters.unitId
      if (params.filters.categoryId) queryParams.filter.categoryId = params.filters.categoryId
      if (params.filters.brandId) queryParams.filter.brandId = params.filters.brandId
      if (params.filters.brands) queryParams.filter.brands = params.filters.brands.join(',')
      if (params.filters.categories) queryParams.filter.categories = params.filters.categories.join(',')
    }
    
    if (params?.sort) {
      const direction = params.sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${direction}${params.sort.field}`
    }
    
    if (params?.include) {
      queryParams.include = params.include.join(',')
    }

    const response = await axios.get(PRODUCTS_ENDPOINT, { params: queryParams })
    console.log('🔍 Products API Request URL:', response.config?.url)
    console.log('🔍 Products API Response:', response.data)
    console.log('🔍 Products Raw Data:', JSON.stringify(response.data, null, 2))
    
    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource[]>
    
    // Transform the response
    const transformedData = Array.isArray(jsonApiResponse.data) 
      ? jsonApiResponse.data.map(resource => transformJsonApiProduct(
          resource as JsonApiResource, 
          (jsonApiResponse.included || []) as JsonApiResource[]
        ))
      : []
    
    console.log('🔄 Transformed Products:', transformedData)
    
    return {
      data: transformedData,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async getProduct(id: string, include?: string[]): Promise<ProductResponse> {
    const params: QueryParams = {}
    
    if (include) {
      params.include = include.join(',')
    }

    const response = await axios.get(`${PRODUCTS_ENDPOINT}/${id}`, { params })
    return response.data
  },

  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    const payload = {
      data: {
        type: 'products',
        attributes: {
          name: data.name,
          ...(data.sku && { sku: data.sku }),
          ...(data.description && { description: data.description }),
          ...(data.fullDescription && { fullDescription: data.fullDescription }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.cost !== undefined && { cost: data.cost }),
          iva: data.iva ?? false,
          ...(data.imgPath && { imgPath: data.imgPath }),
          ...(data.datasheetPath && { datasheetPath: data.datasheetPath })
        },
        relationships: {
          unit: {
            data: { type: 'units', id: data.unitId }
          },
          category: {
            data: { type: 'categories', id: data.categoryId }
          },
          brand: {
            data: { type: 'brands', id: data.brandId }
          }
        }
      }
    }

    const response = await axios.post(PRODUCTS_ENDPOINT, payload)
    return response.data
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
    const attributes: Record<string, string | boolean | number> = {}
    const relationships: Record<string, { data: { type: string; id: string } }> = {}

    if (data.name !== undefined) attributes.name = data.name
    if (data.sku !== undefined) attributes.sku = data.sku
    if (data.description !== undefined) attributes.description = data.description
    if (data.fullDescription !== undefined) attributes.fullDescription = data.fullDescription
    if (data.price !== undefined) attributes.price = data.price
    if (data.cost !== undefined) attributes.cost = data.cost
    if (data.iva !== undefined) attributes.iva = data.iva
    if (data.imgPath !== undefined) attributes.imgPath = data.imgPath
    if (data.datasheetPath !== undefined) attributes.datasheetPath = data.datasheetPath

    if (data.unitId) {
      relationships.unit = { data: { type: 'units', id: data.unitId } }
    }
    if (data.categoryId) {
      relationships.category = { data: { type: 'categories', id: data.categoryId } }
    }
    if (data.brandId) {
      relationships.brand = { data: { type: 'brands', id: data.brandId } }
    }

    const payload = {
      data: {
        type: 'products',
        id,
        ...(Object.keys(attributes).length > 0 && { attributes }),
        ...(Object.keys(relationships).length > 0 && { relationships })
      }
    }

    const response = await axios.patch(`${PRODUCTS_ENDPOINT}/${id}`, payload)
    return response.data
  },

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${PRODUCTS_ENDPOINT}/${id}`)
  },

  async duplicateProduct(id: string): Promise<ProductResponse> {
    const originalProduct = await this.getProduct(id)
    const productData = originalProduct.data
    
    const duplicateData: CreateProductRequest = {
      name: `${productData.name} (Copia)`,
      sku: undefined,
      description: productData.description,
      fullDescription: productData.fullDescription,
      price: productData.price,
      cost: productData.cost,
      iva: productData.iva,
      unitId: productData.unitId,
      categoryId: productData.categoryId,
      brandId: productData.brandId
    }

    return this.createProduct(duplicateData)
  }
}