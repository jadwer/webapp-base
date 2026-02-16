/**
 * PRODUCT CONVERSIONS SERVICE
 * API layer para product-conversions con JSON:API
 */

import axiosClient from '@/lib/axiosClient'
import type {
  ProductConversion,
  CreateProductConversionData,
  UpdateProductConversionData,
  ProductConversionFilters,
  ProductConversionSortOptions,
} from '../types/productConversion'
import type { PaginationParams, JsonApiResponse } from '../types'

export const productConversionsService = {
  getAll: async (params: {
    filters?: ProductConversionFilters
    sort?: ProductConversionSortOptions
    pagination?: PaginationParams
    include?: string[]
  } = {}): Promise<JsonApiResponse<ProductConversion[]>> => {
    const { filters = {}, sort, pagination, include } = params

    const queryParams: Record<string, string | number> = {}

    if (filters.sourceProduct) {
      queryParams['filter[sourceProduct]'] = filters.sourceProduct
    }
    if (filters.destinationProduct) {
      queryParams['filter[destinationProduct]'] = filters.destinationProduct
    }
    if (filters.isActive !== undefined) {
      queryParams['filter[isActive]'] = filters.isActive
    }

    if (sort) {
      const sortDirection = sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${sortDirection}${sort.field}`
    } else {
      queryParams.sort = '-createdAt'
    }

    if (pagination?.page) {
      queryParams['page[number]'] = pagination.page
    }
    if (pagination?.size) {
      queryParams['page[size]'] = pagination.size
    }

    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }

    const response = await axiosClient.get('/api/v1/product-conversions', { params: queryParams })
    return response.data
  },

  getById: async (
    id: string,
    include?: string[]
  ): Promise<JsonApiResponse<ProductConversion>> => {
    const queryParams: Record<string, string | number> = {}

    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }

    const response = await axiosClient.get(`/api/v1/product-conversions/${id}`, { params: queryParams })
    return response.data
  },

  create: async (data: CreateProductConversionData): Promise<JsonApiResponse<ProductConversion>> => {
    const payload = {
      data: {
        type: 'product-conversions',
        attributes: {
          sourceProductId: Number(data.sourceProductId),
          destinationProductId: Number(data.destinationProductId),
          conversionFactor: Number(data.conversionFactor),
          wastePercentage: data.wastePercentage !== undefined ? Number(data.wastePercentage) : 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          notes: data.notes || undefined,
        }
      }
    }

    const response = await axiosClient.post('/api/v1/product-conversions', payload)
    return response.data
  },

  update: async (
    id: string,
    data: UpdateProductConversionData
  ): Promise<JsonApiResponse<ProductConversion>> => {
    const attributes: Record<string, unknown> = {}

    if (data.sourceProductId !== undefined) attributes.sourceProductId = Number(data.sourceProductId)
    if (data.destinationProductId !== undefined) attributes.destinationProductId = Number(data.destinationProductId)
    if (data.conversionFactor !== undefined) attributes.conversionFactor = Number(data.conversionFactor)
    if (data.wastePercentage !== undefined) attributes.wastePercentage = Number(data.wastePercentage)
    if (data.isActive !== undefined) attributes.isActive = data.isActive
    if (data.notes !== undefined) attributes.notes = data.notes

    const payload = {
      data: {
        type: 'product-conversions',
        id,
        attributes
      }
    }

    const response = await axiosClient.patch(`/api/v1/product-conversions/${id}`, payload)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/product-conversions/${id}`)
  },

  getBySourceProduct: async (
    sourceProductId: string,
    include?: string[]
  ): Promise<JsonApiResponse<ProductConversion[]>> => {
    const queryParams: Record<string, string | number> = {
      'filter[sourceProduct]': sourceProductId,
      'filter[isActive]': '1',
      sort: 'conversionFactor',
    }

    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }

    const response = await axiosClient.get('/api/v1/product-conversions', { params: queryParams })
    return response.data
  },
}
