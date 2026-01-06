/**
 * DiscountRules Service Layer
 *
 * Complete JSON:API service implementation for automatic discount rules.
 *
 * Backend: Modules/Sales/app/Http/Controllers/Api/V1/DiscountRuleController.php
 * API: /api/v1/discount-rules
 */

import axios from '@/lib/axiosClient'
import type {
  DiscountRule,
  ParsedDiscountRule,
  CreateDiscountRuleRequest,
  UpdateDiscountRuleRequest,
  DiscountRuleFilters,
  DiscountRuleSortOptions
} from '../types'

// JSON:API resource type
const RESOURCE_TYPE = 'discount-rules'
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
      case 'discount_type':
        transformedKey = 'discountType'
        break
      case 'discount_value':
        transformedKey = 'discountValue'
        break
      case 'buy_quantity':
        transformedKey = 'buyQuantity'
        break
      case 'get_quantity':
        transformedKey = 'getQuantity'
        break
      case 'applies_to':
        transformedKey = 'appliesTo'
        break
      case 'min_order_amount':
        transformedKey = 'minOrderAmount'
        break
      case 'min_quantity':
        transformedKey = 'minQuantity'
        break
      case 'max_discount_amount':
        transformedKey = 'maxDiscountAmount'
        break
      case 'product_ids':
        transformedKey = 'productIds'
        break
      case 'category_ids':
        transformedKey = 'categoryIds'
        break
      case 'customer_ids':
        transformedKey = 'customerIds'
        break
      case 'customer_classifications':
        transformedKey = 'customerClassifications'
        break
      case 'start_date':
        transformedKey = 'startDate'
        break
      case 'end_date':
        transformedKey = 'endDate'
        break
      case 'usage_limit':
        transformedKey = 'usageLimit'
        break
      case 'usage_per_customer':
        transformedKey = 'usagePerCustomer'
        break
      case 'current_usage':
        transformedKey = 'currentUsage'
        break
      case 'is_combinable':
        transformedKey = 'isCombinable'
        break
      case 'is_active':
        transformedKey = 'isActive'
        break
      case 'is_valid':
        transformedKey = 'isValid'
        break
      case 'is_expired':
        transformedKey = 'isExpired'
        break
      case 'usage_remaining':
        transformedKey = 'usageRemaining'
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

// Transform camelCase to snake_case for API requests
function transformToSnakeCase(data: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue

    let transformedKey = key

    // Handle specific field mappings
    switch (key) {
      case 'discountType':
        transformedKey = 'discount_type'
        break
      case 'discountValue':
        transformedKey = 'discount_value'
        break
      case 'buyQuantity':
        transformedKey = 'buy_quantity'
        break
      case 'getQuantity':
        transformedKey = 'get_quantity'
        break
      case 'appliesTo':
        transformedKey = 'applies_to'
        break
      case 'minOrderAmount':
        transformedKey = 'min_order_amount'
        break
      case 'minQuantity':
        transformedKey = 'min_quantity'
        break
      case 'maxDiscountAmount':
        transformedKey = 'max_discount_amount'
        break
      case 'productIds':
        transformedKey = 'product_ids'
        break
      case 'categoryIds':
        transformedKey = 'category_ids'
        break
      case 'customerIds':
        transformedKey = 'customer_ids'
        break
      case 'customerClassifications':
        transformedKey = 'customer_classifications'
        break
      case 'startDate':
        transformedKey = 'start_date'
        break
      case 'endDate':
        transformedKey = 'end_date'
        break
      case 'usageLimit':
        transformedKey = 'usage_limit'
        break
      case 'usagePerCustomer':
        transformedKey = 'usage_per_customer'
        break
      case 'isCombinable':
        transformedKey = 'is_combinable'
        break
      case 'isActive':
        transformedKey = 'is_active'
        break
      default:
        // Convert camelCase to snake_case
        transformedKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    }

    transformed[transformedKey] = value
  }

  return transformed
}

// Generate discount display string
function getDiscountDisplay(rule: ParsedDiscountRule): string {
  switch (rule.discountType) {
    case 'percentage':
      return `${rule.discountValue}%`
    case 'fixed':
      return `$${rule.discountValue.toFixed(2)}`
    case 'buy_x_get_y':
      return `Compra ${rule.buyQuantity || 0} Lleva ${rule.getQuantity || 0}`
    default:
      return `${rule.discountValue}`
  }
}

// Generate status label
function getStatusLabel(rule: ParsedDiscountRule): string {
  if (!rule.isActive) return 'Inactivo'
  if (rule.isExpired) return 'Expirado'
  if (!rule.isValid) return 'No Valido'
  return 'Activo'
}

// Generate validity label
function getValidityLabel(rule: ParsedDiscountRule): string {
  if (rule.isExpired) return 'Expirado'
  if (rule.endDate) {
    const endDate = new Date(rule.endDate)
    return `Valido hasta ${endDate.toLocaleDateString('es-MX')}`
  }
  return 'Sin fecha de expiracion'
}

// Parse JSON:API response to UI-friendly format
function parseDiscountRule(
  data: { id: string; attributes: Record<string, unknown> }
): ParsedDiscountRule {
  const parsed = transformToCamelCase(data.attributes) as unknown as ParsedDiscountRule
  parsed.id = data.id

  // Add computed UI fields
  parsed.discountDisplay = getDiscountDisplay(parsed)
  parsed.statusLabel = getStatusLabel(parsed)
  parsed.validityLabel = getValidityLabel(parsed)

  return parsed
}

// Build query parameters for API requests
function buildQueryParams(
  filters?: DiscountRuleFilters,
  sort?: DiscountRuleSortOptions,
  page?: number,
  pageSize: number = 20
): Record<string, string> {
  const params: Record<string, string> = {}

  // Pagination
  if (page && page > 1) {
    params['page[number]'] = page.toString()
  }
  params['page[size]'] = pageSize.toString()

  // Sorting - convert camelCase to snake_case for backend
  if (sort?.field) {
    const fieldMap: Record<string, string> = {
      name: 'name',
      code: 'code',
      priority: 'priority',
      startDate: 'start_date',
      endDate: 'end_date',
      createdAt: 'created_at',
      currentUsage: 'current_usage'
    }
    const sortField = fieldMap[sort.field] || sort.field
    params.sort = sort.direction === 'desc' ? `-${sortField}` : sortField
  }

  // Filters
  if (filters) {
    if (filters.search) {
      params['filter[search]'] = filters.search
    }

    if (filters.discountType) {
      params['filter[discount_type]'] = filters.discountType
    }

    if (filters.appliesTo) {
      params['filter[applies_to]'] = filters.appliesTo
    }

    if (filters.isActive !== undefined) {
      params['filter[is_active]'] = filters.isActive ? '1' : '0'
    }

    if (filters.code) {
      params['filter[code]'] = filters.code
    }

    if (filters.validOnly) {
      params['filter[valid]'] = 'true'
    }
  }

  return params
}

// JSON:API response type
interface JsonApiResponse<T> {
  data: T
  meta?: {
    currentPage?: number
    perPage?: number
    total?: number
    lastPage?: number
  }
  included?: Array<{
    id: string
    type: string
    attributes: Record<string, unknown>
  }>
}

// Service object with all CRUD operations
export const discountRulesService = {
  /**
   * Get all discount rules with filtering and pagination
   */
  async getAll(filters?: DiscountRuleFilters, sort?: DiscountRuleSortOptions, page?: number, pageSize?: number) {
    const params = buildQueryParams(filters, sort, page, pageSize)

    const response = await axios.get<JsonApiResponse<DiscountRule[]>>(BASE_URL, {
      params
    })

    console.log('DiscountRules API Response:', response.data)

    const discountRules = response.data.data.map(item =>
      parseDiscountRule(
        item as unknown as { id: string; attributes: Record<string, unknown> }
      )
    )

    return {
      data: discountRules,
      meta: response.data.meta
    }
  },

  /**
   * Get single discount rule by ID
   */
  async getById(id: string) {
    const response = await axios.get<JsonApiResponse<DiscountRule>>(`${BASE_URL}/${id}`)

    console.log('DiscountRule Single API Response:', response.data)

    return parseDiscountRule(
      response.data.data as unknown as {
        id: string
        attributes: Record<string, unknown>
      }
    )
  },

  /**
   * Get discount rule by code
   */
  async getByCode(code: string) {
    const response = await axios.get<JsonApiResponse<DiscountRule[]>>(BASE_URL, {
      params: {
        'filter[code]': code,
        'page[size]': '1'
      }
    })

    console.log('DiscountRule by Code API Response:', response.data)

    const rules = response.data.data
    if (rules.length === 0) {
      return null
    }

    return parseDiscountRule(
      rules[0] as unknown as { id: string; attributes: Record<string, unknown> }
    )
  },

  /**
   * Create new discount rule
   */
  async create(data: CreateDiscountRuleRequest) {
    const attributes = transformToSnakeCase(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        attributes
      }
    }

    console.log('DiscountRule Create Request:', requestData)

    const response = await axios.post<JsonApiResponse<DiscountRule>>(BASE_URL, requestData)

    console.log('DiscountRule Create Response:', response.data)

    return parseDiscountRule(
      response.data.data as unknown as {
        id: string
        attributes: Record<string, unknown>
      }
    )
  },

  /**
   * Update existing discount rule
   */
  async update(id: string, data: UpdateDiscountRuleRequest) {
    const attributes = transformToSnakeCase(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        id,
        attributes
      }
    }

    console.log('DiscountRule Update Request:', requestData)

    const response = await axios.patch<JsonApiResponse<DiscountRule>>(`${BASE_URL}/${id}`, requestData)

    console.log('DiscountRule Update Response:', response.data)

    return parseDiscountRule(
      response.data.data as unknown as {
        id: string
        attributes: Record<string, unknown>
      }
    )
  },

  /**
   * Delete discount rule
   */
  async delete(id: string): Promise<void> {
    console.log('DiscountRule Delete Request:', id)

    await axios.delete(`${BASE_URL}/${id}`)

    console.log('DiscountRule Deleted:', id)
  },

  /**
   * Toggle discount rule active status
   */
  async toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  },

  /**
   * Get active discount rules (for applying to orders)
   */
  async getActiveRules() {
    return this.getAll(
      { isActive: true, validOnly: true },
      { field: 'priority', direction: 'asc' }
    )
  },

  /**
   * Validate discount code for an order
   */
  async validateCode(code: string) {
    const rule = await this.getByCode(code)

    if (!rule) {
      return {
        valid: false,
        error: 'Codigo de descuento no encontrado'
      }
    }

    if (!rule.isActive) {
      return {
        valid: false,
        error: 'Este descuento esta inactivo'
      }
    }

    if (rule.isExpired) {
      return {
        valid: false,
        error: 'Este descuento ha expirado'
      }
    }

    if (!rule.isValid) {
      return {
        valid: false,
        error: 'Este descuento no es valido actualmente'
      }
    }

    if (rule.usageLimit && rule.currentUsage >= rule.usageLimit) {
      return {
        valid: false,
        error: 'Este descuento ha alcanzado su limite de uso'
      }
    }

    return {
      valid: true,
      rule
    }
  }
}
