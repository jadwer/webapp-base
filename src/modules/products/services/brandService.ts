import axios from '@/lib/axiosClient'
import {
  BrandsResponse,
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
  QueryParams,
  BrandSortOptions
} from '../types'
import { transformJsonApiBrand, JsonApiResource } from '../utils/transformers'
import type { JsonApiResponse } from '../types'

const BRANDS_ENDPOINT = '/api/v1/brands'

export const brandService = {
  async getBrands(params?: {
    page?: { number?: number; size?: number }
    filter?: { name?: string; slug?: string }
    sort?: BrandSortOptions
  }): Promise<BrandsResponse> {
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

    const response = await axios.get(BRANDS_ENDPOINT, { params: queryParams })
    console.log('🔍 Brands API Request URL:', response.config?.url)
    console.log('🔍 Brands API Response:', response.data)
    console.log('🔍 Brands Raw Data:', JSON.stringify(response.data, null, 2))
    
    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource[]>
    
    // Transform the response
    const transformedData = Array.isArray(jsonApiResponse.data) 
      ? jsonApiResponse.data.map(resource => transformJsonApiBrand(resource))
      : []
    
    console.log('🔄 Transformed Brands:', transformedData)
    
    return {
      data: transformedData,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async getBrand(id: string): Promise<BrandResponse> {
    const response = await axios.get(`${BRANDS_ENDPOINT}/${id}`)
    console.log('🔍 Single Brand API Response:', response.data)
    
    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource>
    
    // Transform the single resource response
    const transformedBrand = transformJsonApiBrand(jsonApiResponse.data)
    
    console.log('🔄 Transformed Brand:', transformedBrand)
    
    return {
      data: transformedBrand,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async createBrand(data: CreateBrandRequest): Promise<BrandResponse> {
    const payload = {
      data: {
        type: 'brands',
        attributes: {
          name: data.name,
          ...(data.description && { description: data.description }),
          ...(data.slug && { slug: data.slug })
        }
      }
    }

    const response = await axios.post(BRANDS_ENDPOINT, payload)
    return response.data
  },

  async updateBrand(id: string, data: UpdateBrandRequest): Promise<BrandResponse> {
    const attributes: Record<string, string | boolean | number> = {}

    if (data.name !== undefined) attributes.name = data.name
    if (data.description !== undefined) attributes.description = data.description
    if (data.slug !== undefined) attributes.slug = data.slug

    const payload = {
      data: {
        type: 'brands',
        id,
        attributes
      }
    }

    const response = await axios.patch(`${BRANDS_ENDPOINT}/${id}`, payload)
    return response.data
  },

  async deleteBrand(id: string): Promise<void> {
    await axios.delete(`${BRANDS_ENDPOINT}/${id}`)
  }
}