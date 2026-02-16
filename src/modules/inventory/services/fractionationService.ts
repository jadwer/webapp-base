/**
 * FRACTIONATION SERVICE
 * JSON:API for history + custom endpoints for calculate/execute
 */

import axiosClient from '@/lib/axiosClient'
import type {
  Fractionation,
  FractionationFilters,
  FractionationSortOptions,
  FractionationCalculateRequest,
  FractionationCalculateResponse,
  FractionationExecuteRequest,
  FractionationExecuteResponse,
} from '../types/fractionation'
import type { PaginationParams, JsonApiResponse } from '../types'

export const fractionationService = {
  // --- JSON:API endpoints (history/detail) ---

  getAll: async (params: {
    filters?: FractionationFilters
    sort?: FractionationSortOptions
    pagination?: PaginationParams
    include?: string[]
  } = {}): Promise<JsonApiResponse<Fractionation[]>> => {
    const { filters = {}, sort, pagination, include } = params

    const queryParams: Record<string, string | number> = {}

    if (filters.folioNumber) {
      queryParams['filter[folioNumber]'] = filters.folioNumber
    }
    if (filters.sourceProduct) {
      queryParams['filter[sourceProduct]'] = filters.sourceProduct
    }
    if (filters.destinationProduct) {
      queryParams['filter[destinationProduct]'] = filters.destinationProduct
    }
    if (filters.warehouse) {
      queryParams['filter[warehouse]'] = filters.warehouse
    }
    if (filters.user) {
      queryParams['filter[user]'] = filters.user
    }
    if (filters.status) {
      queryParams['filter[status]'] = filters.status
    }

    if (sort) {
      const sortDirection = sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${sortDirection}${sort.field}`
    } else {
      queryParams.sort = '-executedAt'
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

    const response = await axiosClient.get('/api/v1/fractionations', { params: queryParams })
    return response.data
  },

  getById: async (
    id: string,
    include?: string[]
  ): Promise<JsonApiResponse<Fractionation>> => {
    const queryParams: Record<string, string | number> = {}

    if (include && include.length > 0) {
      queryParams.include = include.join(',')
    }

    const response = await axiosClient.get(`/api/v1/fractionations/${id}`, { params: queryParams })
    return response.data
  },

  // --- Custom endpoints (calculate/execute) ---

  calculate: async (data: FractionationCalculateRequest): Promise<FractionationCalculateResponse> => {
    const response = await axiosClient.post('/api/v1/fraccionamiento/calculate', data)
    return response.data
  },

  execute: async (data: FractionationExecuteRequest): Promise<FractionationExecuteResponse> => {
    const response = await axiosClient.post('/api/v1/fraccionamiento/execute', data)
    return response.data
  },
}
