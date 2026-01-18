/**
 * CycleCount Service Layer
 *
 * Complete JSON:API service implementation following the established
 * pattern from products and inventory modules.
 *
 * Backend: Modules/Inventory/app/Http/Controllers/Api/V1/CycleCountController.php
 * API: /api/v1/cycle-counts
 */

import axios from '@/lib/axiosClient'
import type {
  CycleCount,
  ParsedCycleCount,
  CreateCycleCountRequest,
  UpdateCycleCountRequest,
  CycleCountFilters,
  CycleCountSortOptions,
  JsonApiResponse
} from '../types'

// JSON:API resource type
const RESOURCE_TYPE = 'cycle-counts'
const BASE_URL = `/api/v1/${RESOURCE_TYPE}`

// Transform snake_case to camelCase for API responses
function transformToCamelCase(data: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!data) {
    return {}
  }

  const transformed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    let transformedKey = key

    // Handle specific field mappings
    switch (key) {
      case 'count_number':
        transformedKey = 'countNumber'
        break
      case 'scheduled_date':
        transformedKey = 'scheduledDate'
        break
      case 'completed_date':
        transformedKey = 'completedDate'
        break
      case 'system_quantity':
        transformedKey = 'systemQuantity'
        break
      case 'counted_quantity':
        transformedKey = 'countedQuantity'
        break
      case 'variance_quantity':
        transformedKey = 'varianceQuantity'
        break
      case 'variance_value':
        transformedKey = 'varianceValue'
        break
      case 'abc_class':
        transformedKey = 'abcClass'
        break
      case 'assigned_to':
        transformedKey = 'assignedTo'
        break
      case 'counted_by':
        transformedKey = 'countedBy'
        break
      case 'has_variance':
        transformedKey = 'hasVariance'
        break
      case 'variance_percentage':
        transformedKey = 'variancePercentage'
        break
      case 'warehouse_id':
        transformedKey = 'warehouseId'
        break
      case 'warehouse_location_id':
        transformedKey = 'warehouseLocationId'
        break
      case 'product_id':
        transformedKey = 'productId'
        break
      case 'created_at':
        transformedKey = 'createdAt'
        break
      case 'updated_at':
        transformedKey = 'updatedAt'
        break
      default:
        // Convert snake_case to camelCase for other fields
        transformedKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    }

    transformed[transformedKey] = value
  }

  return transformed
}

// Types for JSON:API relationship data
type JsonApiRelationshipData = { id: string; type: string }
type JsonApiItem = { id: string; type: string; attributes: Record<string, unknown> }
type JsonApiRelationships = {
  product?: { data: JsonApiRelationshipData }
  warehouse?: { data: JsonApiRelationshipData }
  warehouseLocation?: { data: JsonApiRelationshipData }
  assignedTo?: { data: JsonApiRelationshipData }
  countedBy?: { data: JsonApiRelationshipData }
}

// Parse JSON:API response to UI-friendly format
function parseCycleCount(
  data: { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships },
  included?: JsonApiItem[]
): ParsedCycleCount {
  const parsed = transformToCamelCase(data.attributes) as unknown as ParsedCycleCount
  parsed.id = data.id

  // Parse relationships from included data
  if (included && data.relationships) {
    // Parse product relationship
    if (data.relationships.product?.data) {
      const productData = included?.find(
        (item: JsonApiItem) => item.type === 'products' && item.id === data.relationships?.product?.data.id
      )
      if (productData) {
        parsed.product = {
          id: productData.id,
          name: productData.attributes.name as string,
          sku: productData.attributes.sku as string
        }
      }
    }

    // Parse warehouse relationship
    if (data.relationships.warehouse?.data) {
      const warehouseData = included?.find(
        (item: JsonApiItem) => item.type === 'warehouses' && item.id === data.relationships?.warehouse?.data.id
      )
      if (warehouseData) {
        parsed.warehouse = {
          id: warehouseData.id,
          name: warehouseData.attributes.name as string,
          code: warehouseData.attributes.code as string
        }
      }
    }

    // Parse warehouse location relationship
    if (data.relationships.warehouseLocation?.data) {
      const locationData = included?.find(
        (item: JsonApiItem) =>
          item.type === 'warehouse-locations' && item.id === data.relationships?.warehouseLocation?.data.id
      )
      if (locationData) {
        parsed.warehouseLocation = {
          id: locationData.id,
          name: locationData.attributes.name as string,
          code: locationData.attributes.code as string
        }
      }
    } else {
      parsed.warehouseLocation = null
    }

    // Parse assignedTo (user) relationship
    if (data.relationships.assignedTo?.data) {
      const userData = included?.find(
        (item: JsonApiItem) => item.type === 'users' && item.id === data.relationships?.assignedTo?.data.id
      )
      if (userData) {
        parsed.assignedTo = {
          id: userData.id,
          name: userData.attributes.name as string,
          email: userData.attributes.email as string
        }
      }
    } else {
      parsed.assignedTo = null
    }

    // Parse countedBy (user) relationship
    if (data.relationships.countedBy?.data) {
      const userData = included?.find(
        (item: JsonApiItem) => item.type === 'users' && item.id === data.relationships?.countedBy?.data.id
      )
      if (userData) {
        parsed.countedBy = {
          id: userData.id,
          name: userData.attributes.name as string,
          email: userData.attributes.email as string
        }
      }
    } else {
      parsed.countedBy = null
    }
  }

  return parsed
}

// Build query parameters for API requests
function buildQueryParams(
  filters?: CycleCountFilters,
  sort?: CycleCountSortOptions,
  page?: number,
  pageSize: number = 20
): Record<string, string> {
  const params: Record<string, string> = {}

  // Include relationships
  params.include = 'product,warehouse,warehouseLocation,assignedTo,countedBy'

  // Pagination
  if (page && page > 0) {
    params['page[number]'] = page.toString()
  }
  if (pageSize) {
    params['page[size]'] = pageSize.toString()
  }

  // Sorting - convert camelCase to snake_case for backend
  if (sort?.field) {
    const fieldMap: Record<string, string> = {
      countNumber: 'count_number',
      scheduledDate: 'scheduled_date',
      completedDate: 'completed_date',
      systemQuantity: 'system_quantity',
      varianceQuantity: 'variance_quantity',
      abcClass: 'abc_class',
      createdAt: 'created_at'
    }
    const sortField = fieldMap[sort.field] || sort.field
    params.sort = sort.direction === 'desc' ? `-${sortField}` : sortField
  }

  // Filters
  if (filters) {
    if (filters.search) {
      params['filter[search]'] = filters.search
    }

    if (filters.status && filters.status.length > 0) {
      params['filter[status]'] = filters.status.join(',')
    }

    if (filters.abcClass && filters.abcClass.length > 0) {
      params['filter[abc_class]'] = filters.abcClass.join(',')
    }

    if (filters.warehouseId) {
      params['filter[warehouse_id]'] = filters.warehouseId
    }

    if (filters.productId) {
      params['filter[product_id]'] = filters.productId
    }

    if (filters.assignedTo) {
      params['filter[assigned_to]'] = filters.assignedTo
    }

    if (filters.scheduledAfter) {
      params['filter[scheduled_after]'] = filters.scheduledAfter
    }

    if (filters.scheduledBefore) {
      params['filter[scheduled_before]'] = filters.scheduledBefore
    }

    if (filters.hasVariance !== undefined) {
      params['filter[has_variance]'] = filters.hasVariance.toString()
    }

    if (filters.overdue) {
      params['filter[overdue]'] = 'true'
    }
  }

  return params
}

// Service object with all CRUD operations
export const cycleCountsService = {
  /**
   * Get all cycle counts with filtering and pagination
   */
  async getAll(filters?: CycleCountFilters, sort?: CycleCountSortOptions, page?: number, pageSize?: number) {
    const params = buildQueryParams(filters, sort, page, pageSize)

    const response = await axios.get<JsonApiResponse<CycleCount[]>>(BASE_URL, {
      params
    })

    const cycleCounts = response.data.data.map(item =>
      parseCycleCount(
        item as unknown as { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships },
        response.data.included as JsonApiItem[]
      )
    )

    return {
      data: cycleCounts,
      meta: response.data.meta
    }
  },

  /**
   * Get single cycle count by ID
   */
  async getById(id: string) {
    const params = { include: 'product,warehouse,warehouseLocation,assignedTo,countedBy' }

    const response = await axios.get<JsonApiResponse<CycleCount>>(`${BASE_URL}/${id}`, { params })

    return parseCycleCount(
      response.data.data as unknown as {
        id: string
        attributes: Record<string, unknown>
        relationships?: JsonApiRelationships
      },
      response.data.included as JsonApiItem[]
    )
  },

  /**
   * Create new cycle count
   */
  async create(data: CreateCycleCountRequest) {
    // Separate relationships from attributes
    const { warehouseId, productId, warehouseLocationId, assignedTo, ...attributes } = data

    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        attributes: attributes,
        relationships: {
          warehouse: {
            data: { type: 'warehouses', id: warehouseId }
          },
          product: {
            data: { type: 'products', id: productId }
          },
          ...(warehouseLocationId && {
            warehouseLocation: {
              data: { type: 'warehouse-locations', id: warehouseLocationId }
            }
          }),
          ...(assignedTo && {
            assignedTo: {
              data: { type: 'users', id: assignedTo }
            }
          })
        }
      }
    }

    const response = await axios.post<JsonApiResponse<CycleCount>>(BASE_URL, requestData)

    return parseCycleCount(
      response.data.data as unknown as {
        id: string
        attributes: Record<string, unknown>
        relationships?: JsonApiRelationships
      },
      response.data.included as JsonApiItem[]
    )
  },

  /**
   * Update existing cycle count
   */
  async update(id: string, data: UpdateCycleCountRequest) {
    // Separate relationships from attributes
    const { warehouseId, productId, warehouseLocationId, assignedTo, countedBy, ...attributes } = data

    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        id,
        attributes: attributes,
        ...((warehouseId || productId || warehouseLocationId || assignedTo || countedBy) && {
          relationships: {
            ...(warehouseId && {
              warehouse: {
                data: { type: 'warehouses', id: warehouseId }
              }
            }),
            ...(productId && {
              product: {
                data: { type: 'products', id: productId }
              }
            }),
            ...(warehouseLocationId && {
              warehouseLocation: {
                data: { type: 'warehouse-locations', id: warehouseLocationId }
              }
            }),
            ...(assignedTo && {
              assignedTo: {
                data: { type: 'users', id: assignedTo }
              }
            }),
            ...(countedBy && {
              countedBy: {
                data: { type: 'users', id: countedBy }
              }
            })
          }
        })
      }
    }

    const response = await axios.patch<JsonApiResponse<CycleCount>>(`${BASE_URL}/${id}`, requestData)

    return parseCycleCount(
      response.data.data as unknown as {
        id: string
        attributes: Record<string, unknown>
        relationships?: JsonApiRelationships
      },
      response.data.included as JsonApiItem[]
    )
  },

  /**
   * Delete cycle count
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`)
  },

  /**
   * Start a cycle count (change status from scheduled to in_progress)
   */
  async startCount(id: string) {
    return this.update(id, { status: 'in_progress' })
  },

  /**
   * Record count results (complete the count with counted quantity)
   */
  async recordCount(id: string, countedQuantity: number, notes?: string) {
    return this.update(id, {
      status: 'completed',
      countedQuantity,
      completedDate: new Date().toISOString().split('T')[0],
      ...(notes && { notes })
    })
  },

  /**
   * Cancel a cycle count
   */
  async cancelCount(id: string, reason?: string) {
    return this.update(id, {
      status: 'cancelled',
      ...(reason && { notes: reason })
    })
  },

  /**
   * Get counts due today
   */
  async getDueToday(warehouseId?: string) {
    const today = new Date().toISOString().split('T')[0]
    return this.getAll(
      {
        status: ['scheduled'],
        scheduledBefore: today,
        scheduledAfter: today,
        ...(warehouseId && { warehouseId })
      },
      { field: 'scheduledDate', direction: 'asc' }
    )
  },

  /**
   * Get overdue counts
   */
  async getOverdue(warehouseId?: string) {
    return this.getAll(
      {
        status: ['scheduled'],
        overdue: true,
        ...(warehouseId && { warehouseId })
      },
      { field: 'scheduledDate', direction: 'asc' }
    )
  },

  /**
   * Get counts with variance
   */
  async getWithVariance(warehouseId?: string) {
    return this.getAll(
      {
        status: ['completed'],
        hasVariance: true,
        ...(warehouseId && { warehouseId })
      },
      { field: 'varianceQuantity', direction: 'desc' }
    )
  }
}
