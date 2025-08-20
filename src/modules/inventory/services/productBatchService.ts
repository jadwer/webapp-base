/**
 * ProductBatch Service Layer
 * 
 * Complete JSON:API service implementation following the established
 * pattern from products and inventory modules.
 */

import axios from '@/lib/axiosClient'
import type {
  ProductBatch,
  ParsedProductBatch,
  CreateProductBatchRequest,
  UpdateProductBatchRequest,
  ProductBatchFilters,
  ProductBatchSortOptions,
  JsonApiResponse
} from '../types'

// JSON:API resource type
const RESOURCE_TYPE = 'product-batches'
const BASE_URL = `/api/v1/${RESOURCE_TYPE}`

// Transform camelCase to snake_case for API requests
function transformToSnakeCase(data: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    let transformedKey = key
    
    // Handle specific field mappings
    switch (key) {
      case 'productId':
        transformedKey = 'product_id'
        break
      case 'warehouseId':
        transformedKey = 'warehouse_id'
        break
      case 'warehouseLocationId':
        transformedKey = 'warehouse_location_id'
        break
      case 'batchNumber':
        transformedKey = 'batch_number'
        break
      case 'lotNumber':
        transformedKey = 'lot_number'
        break
      case 'manufacturingDate':
        transformedKey = 'manufacturing_date'
        break
      case 'expirationDate':
        transformedKey = 'expiration_date'
        break
      case 'bestBeforeDate':
        transformedKey = 'best_before_date'
        break
      case 'initialQuantity':
        transformedKey = 'initial_quantity'
        break
      case 'currentQuantity':
        transformedKey = 'current_quantity'
        break
      case 'reservedQuantity':
        transformedKey = 'reserved_quantity'
        break
      case 'availableQuantity':
        transformedKey = 'available_quantity'
        break
      case 'unitCost':
        transformedKey = 'unit_cost'
        break
      case 'totalValue':
        transformedKey = 'total_value'
        break
      case 'supplierName':
        transformedKey = 'supplier_name'
        break
      case 'supplierBatch':
        transformedKey = 'supplier_batch'
        break
      case 'qualityNotes':
        transformedKey = 'quality_notes'
        break
      case 'testResults':
        transformedKey = 'test_results'
        break
      case 'createdAt':
        transformedKey = 'created_at'
        break
      case 'updatedAt':
        transformedKey = 'updated_at'
        break
      default:
        // Convert camelCase to snake_case for other fields
        transformedKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    }
    
    transformed[transformedKey] = value
  }
  
  return transformed
}

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
      case 'batch_number':
        transformedKey = 'batchNumber'
        break
      case 'lot_number':
        transformedKey = 'lotNumber'
        break
      case 'manufacturing_date':
        transformedKey = 'manufacturingDate'
        break
      case 'expiration_date':
        transformedKey = 'expirationDate'
        break
      case 'best_before_date':
        transformedKey = 'bestBeforeDate'
        break
      case 'initial_quantity':
        transformedKey = 'initialQuantity'
        break
      case 'current_quantity':
        transformedKey = 'currentQuantity'
        break
      case 'reserved_quantity':
        transformedKey = 'reservedQuantity'
        break
      case 'available_quantity':
        transformedKey = 'availableQuantity'
        break
      case 'unit_cost':
        transformedKey = 'unitCost'
        break
      case 'total_value':
        transformedKey = 'totalValue'
        break
      case 'supplier_name':
        transformedKey = 'supplierName'
        break
      case 'supplier_batch':
        transformedKey = 'supplierBatch'
        break
      case 'quality_notes':
        transformedKey = 'qualityNotes'
        break
      case 'test_results':
        transformedKey = 'testResults'
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
}

// Parse JSON:API response to UI-friendly format
function parseProductBatch(data: { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships }, included?: JsonApiItem[]): ParsedProductBatch {
  const parsed = transformToCamelCase(data.attributes) as unknown as ParsedProductBatch
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
        (item: JsonApiItem) => item.type === 'warehouse-locations' && item.id === data.relationships?.warehouseLocation?.data.id
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
  }
  
  return parsed
}

// Build query parameters for API requests
function buildQueryParams(
  filters?: ProductBatchFilters,
  sort?: ProductBatchSortOptions,
  page?: number,
  pageSize: number = 20
): Record<string, string> {
  const params: Record<string, string> = {}
  
  // Include relationships
  params.include = 'product,warehouse,warehouseLocation'
  
  // Pagination
  if (page && page > 1) {
    params['page[number]'] = page.toString()
  }
  params['page[size]'] = pageSize.toString()
  
  // Sorting - keep camelCase for backend compatibility
  if (sort?.field) {
    const sortField = sort.field // Use camelCase directly
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
    
    if (filters.productId) {
      params['filter[product_id]'] = filters.productId
    }
    
    if (filters.warehouseId) {
      params['filter[warehouse_id]'] = filters.warehouseId
    }
    
    if (filters.warehouseLocationId) {
      params['filter[warehouse_location_id]'] = filters.warehouseLocationId
    }
    
    if (filters.expiresAfter) {
      params['filter[expires_after]'] = filters.expiresAfter
    }
    
    if (filters.expiresBefore) {
      params['filter[expires_before]'] = filters.expiresBefore
    }
    
    if (filters.manufacturedAfter) {
      params['filter[manufactured_after]'] = filters.manufacturedAfter
    }
    
    if (filters.manufacturedBefore) {
      params['filter[manufactured_before]'] = filters.manufacturedBefore
    }
    
    if (filters.supplierName) {
      params['filter[supplier_name]'] = filters.supplierName
    }
    
    if (filters.minQuantity !== undefined) {
      params['filter[min_quantity]'] = filters.minQuantity.toString()
    }
    
    if (filters.maxQuantity !== undefined) {
      params['filter[max_quantity]'] = filters.maxQuantity.toString()
    }
    
    if (filters.hasTestResults !== undefined) {
      params['filter[has_test_results]'] = filters.hasTestResults.toString()
    }
    
    if (filters.hasCertifications !== undefined) {
      params['filter[has_certifications]'] = filters.hasCertifications.toString()
    }
  }
  
  return params
}

// Service object with all CRUD operations
export const productBatchService = {
  /**
   * Get all product batches with filtering and pagination
   */
  async getAll(
    filters?: ProductBatchFilters,
    sort?: ProductBatchSortOptions,
    page?: number,
    pageSize?: number
  ) {
    const params = buildQueryParams(filters, sort, page, pageSize)
    
    const response = await axios.get<JsonApiResponse<ProductBatch[]>>(BASE_URL, {
      params
    })
    
    console.log('🔄 ProductBatch API Response:', response.data)
    
    const productBatches = response.data.data.map(item => 
      parseProductBatch(item as unknown as { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships }, response.data.included as JsonApiItem[])
    )
    
    return {
      data: productBatches,
      meta: response.data.meta
    }
  },

  /**
   * Get single product batch by ID
   */
  async getById(id: string) {
    const params = { include: 'product,warehouse,warehouseLocation' }
    
    const response = await axios.get<JsonApiResponse<ProductBatch>>(
      `${BASE_URL}/${id}`,
      { params }
    )
    
    console.log('🔄 ProductBatch Single API Response:', response.data)
    
    return parseProductBatch(response.data.data as unknown as { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships }, response.data.included as JsonApiItem[])
  },

  /**
   * Create new product batch
   */
  async create(data: CreateProductBatchRequest) {
    // Separate relationships from attributes
    const { productId, warehouseId, warehouseLocationId, ...attributes } = data
    
    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        attributes: attributes, // Send camelCase directly - backend expects it
        relationships: {
          product: {
            data: { type: 'products', id: productId }
          },
          warehouse: {
            data: { type: 'warehouses', id: warehouseId }
          },
          ...(warehouseLocationId && {
            warehouseLocation: {
              data: { type: 'warehouse-locations', id: warehouseLocationId }
            }
          })
        }
      }
    }
    
    console.log('🔄 ProductBatch Create Request:', requestData)
    
    const response = await axios.post<JsonApiResponse<ProductBatch>>(
      BASE_URL,
      requestData
    )
    
    console.log('🔄 ProductBatch Create Response:', response.data)
    
    return parseProductBatch(response.data.data as unknown as { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships }, response.data.included as JsonApiItem[])
  },

  /**
   * Update existing product batch
   */
  async update(id: string, data: UpdateProductBatchRequest) {
    // Separate relationships from attributes
    const { productId, warehouseId, warehouseLocationId, ...attributes } = data
    
    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        id,
        attributes: attributes, // Send camelCase directly
        ...(productId || warehouseId || warehouseLocationId) && {
          relationships: {
            ...(productId && {
              product: {
                data: { type: 'products', id: productId }
              }
            }),
            ...(warehouseId && {
              warehouse: {
                data: { type: 'warehouses', id: warehouseId }
              }
            }),
            ...(warehouseLocationId && {
              warehouseLocation: {
                data: { type: 'warehouse-locations', id: warehouseLocationId }
              }
            })
          }
        }
      }
    }
    
    console.log('🔄 ProductBatch Update Request:', requestData)
    
    const response = await axios.put<JsonApiResponse<ProductBatch>>(
      `${BASE_URL}/${id}`,
      requestData
    )
    
    console.log('🔄 ProductBatch Update Response:', response.data)
    
    return parseProductBatch(response.data.data as unknown as { id: string; attributes: Record<string, unknown>; relationships?: JsonApiRelationships }, response.data.included as JsonApiItem[])
  },

  /**
   * Delete product batch
   */
  async delete(id: string): Promise<void> {
    console.log('🔄 ProductBatch Delete Request:', id)
    
    await axios.delete(`${BASE_URL}/${id}`)
    
    console.log('✅ ProductBatch Deleted:', id)
  }
}