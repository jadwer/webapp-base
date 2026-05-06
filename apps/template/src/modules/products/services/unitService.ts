import axios from '@/lib/axiosClient'
import {
  UnitsResponse,
  UnitResponse,
  CreateUnitRequest,
  UpdateUnitRequest,
  QueryParams,
  UnitSortOptions
} from '../types'
import { transformJsonApiUnit, JsonApiResource } from '../utils/transformers'
import type { JsonApiResponse } from '../types'

const UNITS_ENDPOINT = '/api/v1/units'

export const unitService = {
  async getUnits(params?: {
    page?: { number?: number; size?: number }
    filter?: { name?: string; code?: string; unitType?: string }
    sort?: UnitSortOptions
  }): Promise<UnitsResponse> {
    const queryParams: QueryParams = {}
    
    if (params?.page) {
      if (params.page.number !== undefined) {
        queryParams['page[number]'] = params.page.number
      }
      if (params.page.size !== undefined) {
        queryParams['page[size]'] = params.page.size
      }
    }
    
    if (params?.filter) {
      if (params.filter.name) queryParams['filter[name]'] = params.filter.name
      if (params.filter.code) queryParams['filter[code]'] = params.filter.code
      if (params.filter.unitType) queryParams['filter[unit_type]'] = params.filter.unitType
    }
    
    if (params?.sort) {
      const direction = params.sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${direction}${params.sort.field}`
    }

    const response = await axios.get(UNITS_ENDPOINT, { params: queryParams })

    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource[]>
    
    // Transform the response
    const transformedData = Array.isArray(jsonApiResponse.data) 
      ? jsonApiResponse.data.map(resource => transformJsonApiUnit(resource))
      : []
    
    return {
      data: transformedData,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async getUnit(id: string): Promise<UnitResponse> {
    const response = await axios.get(`${UNITS_ENDPOINT}/${id}`)

    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource>
    
    // Transform the single resource response
    const transformedUnit = transformJsonApiUnit(jsonApiResponse.data)
    
    return {
      data: transformedUnit,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async createUnit(data: CreateUnitRequest): Promise<UnitResponse> {
    const payload = {
      data: {
        type: 'units',
        attributes: {
          unitType: data.unitType,
          code: data.code,
          name: data.name
        }
      }
    }

    const response = await axios.post(UNITS_ENDPOINT, payload)
    return response.data
  },

  async updateUnit(id: string, data: UpdateUnitRequest): Promise<UnitResponse> {
    const attributes: Record<string, string | boolean | number> = {}

    if (data.unitType !== undefined) attributes.unitType = data.unitType
    if (data.code !== undefined) attributes.code = data.code
    if (data.name !== undefined) attributes.name = data.name

    const payload = {
      data: {
        type: 'units',
        id,
        attributes
      }
    }

    const response = await axios.patch(`${UNITS_ENDPOINT}/${id}`, payload)
    return response.data
  },

  async deleteUnit(id: string): Promise<void> {
    await axios.delete(`${UNITS_ENDPOINT}/${id}`)
  }
}