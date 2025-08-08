import axios from '@/lib/axiosClient'
import {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  QueryParams,
  CategorySortOptions
} from '../types'
import { transformJsonApiCategory, JsonApiResource } from '../utils/transformers'
import type { JsonApiResponse } from '../types'

const CATEGORIES_ENDPOINT = '/api/v1/categories'

export const categoryService = {
  async getCategories(params?: {
    page?: { number?: number; size?: number }
    filter?: { name?: string; slug?: string }
    sort?: CategorySortOptions
  }): Promise<CategoriesResponse> {
    const queryParams: QueryParams = {}
    
    if (params?.page) {
      queryParams.page = params.page
    }
    
    if (params?.filter) {
      queryParams.filter = {}
      if (params.filter.name) queryParams.filter.name = params.filter.name
      if (params.filter.slug) queryParams.filter.slug = params.filter.slug
    }
    
    if (params?.sort) {
      const direction = params.sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${direction}${params.sort.field}`
    }

    const response = await axios.get(CATEGORIES_ENDPOINT, { params: queryParams })
    console.log('🔍 Categories API Request URL:', response.config?.url)
    console.log('🔍 Categories API Response:', response.data)
    console.log('🔍 Categories Raw Data:', JSON.stringify(response.data, null, 2))
    
    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource[]>
    
    // Transform the response
    const transformedData = Array.isArray(jsonApiResponse.data) 
      ? jsonApiResponse.data.map(resource => transformJsonApiCategory(resource))
      : []
    
    console.log('🔄 Transformed Categories:', transformedData)
    
    return {
      data: transformedData,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async getCategory(id: string): Promise<CategoryResponse> {
    const response = await axios.get(`${CATEGORIES_ENDPOINT}/${id}`)
    return response.data
  },

  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const payload = {
      data: {
        type: 'categories',
        attributes: {
          name: data.name,
          ...(data.description && { description: data.description }),
          ...(data.slug && { slug: data.slug })
        }
      }
    }

    const response = await axios.post(CATEGORIES_ENDPOINT, payload)
    return response.data
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    const attributes: Record<string, string | boolean | number> = {}

    if (data.name !== undefined) attributes.name = data.name
    if (data.description !== undefined) attributes.description = data.description
    if (data.slug !== undefined) attributes.slug = data.slug

    const payload = {
      data: {
        type: 'categories',
        id,
        attributes
      }
    }

    const response = await axios.patch(`${CATEGORIES_ENDPOINT}/${id}`, payload)
    return response.data
  },

  async deleteCategory(id: string): Promise<void> {
    await axios.delete(`${CATEGORIES_ENDPOINT}/${id}`)
  }
}