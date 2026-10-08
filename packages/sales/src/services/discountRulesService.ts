/**
 * DiscountRules Service Layer
 *
 * Complete JSON:API service implementation for automatic discount rules.
 *
 * Backend: Modules/Sales/app/Http/Controllers/Api/V1/DiscountRuleController.php
 * API: /api/v1/discount-rules
 */

import { axiosClient as axios } from '@lwm/auth'
import type {
  DiscountRule,
  ParsedDiscountRule,
  CreateDiscountRuleRequest,
  UpdateDiscountRuleRequest,
  DiscountRuleFilters,
  DiscountRuleSortOptions
} from '../types'
import { formatDateOnly } from '@lwm/ui'

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

// El Schema declara los atributos en camelCase; mandar snake_case daba 400
// (atributo no soportado). Solo se limpian los undefined.
function toApiAttributes(data: Record<string, unknown>): Record<string, unknown> {
  const attributes: Record<string, unknown> = {}
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) attributes[key] = value
  })
  return attributes
}

// Generate discount display string
function getDiscountDisplay(rule: ParsedDiscountRule): string {
  switch (rule.discountType) {
    case 'percentage':
      return `${rule.discountValue}%`
    case 'fixed_amount':
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
    return `Valido hasta ${formatDateOnly(rule.endDate)}`
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

  // Sorting: el Schema declara los campos ordenables en camelCase
  if (sort?.field) {
    params.sort = sort.direction === 'desc' ? `-${sort.field}` : sort.field
  }

  // Filters
  if (filters) {
    if (filters.search) {
      params['filter[search]'] = filters.search
    }

    if (filters.discountType) {
      params['filter[discountType]'] = filters.discountType
    }

    if (filters.appliesTo) {
      params['filter[appliesTo]'] = filters.appliesTo
    }

    if (filters.isActive !== undefined) {
      params['filter[isActive]'] = filters.isActive ? '1' : '0'
    }

    if (filters.code) {
      params['filter[code]'] = filters.code
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


    const parsed = response.data.data.map(item =>
      parseDiscountRule(
        item as unknown as { id: string; attributes: Record<string, unknown> }
      )
    )
    // filter[valid] no existe en DiscountRuleSchema: la vigencia se filtra aqui
    const discountRules = filters?.validOnly ? parsed.filter(rule => rule.isValid) : parsed

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
    const attributes = toApiAttributes(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        attributes
      }
    }


    const response = await axios.post<JsonApiResponse<DiscountRule>>(BASE_URL, requestData)


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
    const attributes = toApiAttributes(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: RESOURCE_TYPE,
        id,
        attributes
      }
    }


    const response = await axios.patch<JsonApiResponse<DiscountRule>>(`${BASE_URL}/${id}`, requestData)


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

    await axios.delete(`${BASE_URL}/${id}`)

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
