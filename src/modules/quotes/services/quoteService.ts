/**
 * Quote Service Layer - SA-M004
 *
 * Complete JSON:API service implementation for quotes (cotizaciones).
 *
 * Backend: Modules/Sales/app/Http/Controllers/Api/V1/QuoteController.php
 * API: /api/v1/quotes
 */

import axios from '@/lib/axiosClient'
import type {
  Quote,
  QuoteItem,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  CreateQuoteFromCartRequest,
  CreateQuoteItemRequest,
  UpdateQuoteItemRequest,
  ConvertQuoteRequest,
  RejectQuoteRequest,
  QuoteFilters,
  QuoteSortOptions,
  QuoteSummary,
  PaginationMeta
} from '../types'

// JSON:API resource types
const QUOTE_RESOURCE_TYPE = 'quotes'
const QUOTE_ITEM_RESOURCE_TYPE = 'quote-items'
const QUOTES_BASE_URL = `/api/v1/${QUOTE_RESOURCE_TYPE}`
const QUOTE_ITEMS_BASE_URL = `/api/v1/${QUOTE_ITEM_RESOURCE_TYPE}`

// JSON:API response interfaces
interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, unknown>
}

interface JsonApiResponse<T> {
  data: T
  meta?: PaginationMeta
  included?: JsonApiResource[]
}

// Transform snake_case to camelCase for API responses
function transformToCamelCase(data: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!data) return {}

  const transformed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    transformed[camelKey] = value
  }

  return transformed
}

// Strip undefined values from request data (JSON:API schema uses camelCase)
function stripUndefined(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}

// Parse JSON:API quote response
function parseQuote(resource: JsonApiResource): Quote {
  const attributes = transformToCamelCase(resource.attributes)
  return {
    id: resource.id,
    ...attributes
  } as Quote
}

// Parse JSON:API quote item response
function parseQuoteItem(resource: JsonApiResource): QuoteItem {
  const attributes = transformToCamelCase(resource.attributes)
  return {
    id: resource.id,
    ...attributes
  } as QuoteItem
}

// Build query parameters for API requests
function buildQueryParams(
  filters?: QuoteFilters,
  sort?: QuoteSortOptions,
  page?: number,
  pageSize: number = 20,
  include?: string[]
): Record<string, string> {
  const params: Record<string, string> = {}

  // Pagination
  if (page && page > 1) {
    params['page[number]'] = page.toString()
  }
  params['page[size]'] = pageSize.toString()

  // Sorting
  if (sort?.field) {
    // JSON:API sort uses camelCase field names (matching schema attribute names)
    const sortField = sort.field
    params.sort = sort.direction === 'desc' ? `-${sortField}` : sortField
  }

  // Filters
  if (filters) {
    if (filters.search) {
      params['filter[quote_number]'] = filters.search
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        params['filter[status]'] = filters.status.join(',')
      } else {
        params['filter[status]'] = filters.status
      }
    }

    if (filters.contactId) {
      params['filter[contact]'] = filters.contactId.toString()
    }

    // Customer portal filter - filter by contact email
    if (filters.contactEmail) {
      params['filter[contact_email]'] = filters.contactEmail
    }

    if (filters.dateFrom) {
      params['filter[quote_date][gte]'] = filters.dateFrom
    }

    if (filters.dateTo) {
      params['filter[quote_date][lte]'] = filters.dateTo
    }
  }

  // Include relationships
  if (include && include.length > 0) {
    params.include = include.join(',')
  }

  return params
}

// Quote Service
export const quoteService = {
  /**
   * Get all quotes with filtering and pagination
   */
  async getAll(
    filters?: QuoteFilters,
    sort?: QuoteSortOptions,
    page?: number,
    pageSize?: number,
    include?: string[]
  ): Promise<{ data: Quote[]; meta?: PaginationMeta }> {
    const params = buildQueryParams(filters, sort, page, pageSize, include || ['contact', 'items'])

    const response = await axios.get<JsonApiResponse<JsonApiResource[]>>(QUOTES_BASE_URL, { params })

    const quotes = response.data.data.map(parseQuote)

    return {
      data: quotes,
      meta: response.data.meta
    }
  },

  /**
   * Get single quote by ID
   */
  async getById(id: string, include?: string[]): Promise<Quote> {
    const params: Record<string, string> = {}
    if (include && include.length > 0) {
      params.include = include.join(',')
    } else {
      params.include = 'contact,items,items.product,items.product.stock'
    }

    const response = await axios.get<JsonApiResponse<JsonApiResource>>(`${QUOTES_BASE_URL}/${id}`, { params })

    return parseQuote(response.data.data)
  },

  /**
   * Create new quote
   */
  async create(data: CreateQuoteRequest): Promise<Quote> {
    const attributes = stripUndefined(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: QUOTE_RESOURCE_TYPE,
        attributes
      }
    }

    const response = await axios.post<JsonApiResponse<JsonApiResource>>(QUOTES_BASE_URL, requestData)

    return parseQuote(response.data.data)
  },

  /**
   * Request a quote as a customer (simplified flow)
   * This endpoint doesn't require contact selection - uses authenticated user's contact
   */
  async requestQuote(data: {
    items: Array<{ product_id: number; quantity: number }>
    notes?: string
    shipping_address?: Record<string, string>
  }): Promise<{
    success: boolean
    message: string
    data: {
      quote_number: string
      total_amount: number
      items_count: number
      valid_until: string
    }
  }> {
    const response = await axios.post(`${QUOTES_BASE_URL}/request`, data)
    return response.data
  },

  /**
   * Create quote from shopping cart
   */
  async createFromCart(data: CreateQuoteFromCartRequest): Promise<{ data: Quote; message: string }> {
    const response = await axios.post<{ data: JsonApiResource; message: string }>(
      `${QUOTES_BASE_URL}/from-cart`,
      data
    )

    return {
      data: parseQuote(response.data.data),
      message: response.data.message
    }
  },

  /**
   * Update existing quote
   */
  async update(id: string, data: UpdateQuoteRequest): Promise<Quote> {
    const attributes = stripUndefined(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: QUOTE_RESOURCE_TYPE,
        id,
        attributes
      }
    }

    const response = await axios.patch<JsonApiResponse<JsonApiResource>>(`${QUOTES_BASE_URL}/${id}`, requestData)

    return parseQuote(response.data.data)
  },

  /**
   * Delete quote
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${QUOTES_BASE_URL}/${id}`)
  },

  /**
   * Send quote to customer
   */
  async send(id: string): Promise<{ data: Quote; message: string }> {
    const response = await axios.post<{ data: JsonApiResource; message: string }>(
      `${QUOTES_BASE_URL}/${id}/send`
    )

    return {
      data: parseQuote(response.data.data),
      message: response.data.message
    }
  },

  /**
   * Mark quote as accepted
   */
  async accept(id: string): Promise<{ data: Quote; message: string }> {
    const response = await axios.post<{ data: JsonApiResource; message: string }>(
      `${QUOTES_BASE_URL}/${id}/accept`
    )

    return {
      data: parseQuote(response.data.data),
      message: response.data.message
    }
  },

  /**
   * Mark quote as rejected
   */
  async reject(id: string, data?: RejectQuoteRequest): Promise<{ data: Quote; message: string }> {
    const response = await axios.post<{ data: JsonApiResource; message: string }>(
      `${QUOTES_BASE_URL}/${id}/reject`,
      data || {}
    )

    return {
      data: parseQuote(response.data.data),
      message: response.data.message
    }
  },

  /**
   * Convert quote to sales order
   */
  async convert(id: string, data?: ConvertQuoteRequest): Promise<{
    data: { quote: Quote; salesOrder: { type: string; id: string; attributes: Record<string, unknown> } }
    message: string
  }> {
    const response = await axios.post<{
      data: {
        quote: JsonApiResource
        salesOrder: { type: string; id: string; attributes: Record<string, unknown> }
      }
      message: string
    }>(`${QUOTES_BASE_URL}/${id}/convert`, data || {})

    return {
      data: {
        quote: parseQuote(response.data.data.quote),
        salesOrder: response.data.data.salesOrder
      },
      message: response.data.message
    }
  },

  /**
   * Cancel quote
   */
  async cancel(id: string): Promise<{ data: Quote; message: string }> {
    const response = await axios.post<{ data: JsonApiResource; message: string }>(
      `${QUOTES_BASE_URL}/${id}/cancel`
    )

    return {
      data: parseQuote(response.data.data),
      message: response.data.message
    }
  },

  /**
   * Duplicate quote
   */
  async duplicate(id: string): Promise<{ data: Quote; message: string }> {
    const response = await axios.post<{ data: JsonApiResource; message: string }>(
      `${QUOTES_BASE_URL}/${id}/duplicate`
    )

    return {
      data: parseQuote(response.data.data),
      message: response.data.message
    }
  },

  /**
   * Get quotes expiring soon
   */
  async getExpiringSoon(days: number = 7): Promise<{ data: Quote[]; meta: { count: number; days: number } }> {
    const response = await axios.get<{
      data: JsonApiResource[]
      meta: { count: number; days: number }
    }>(`${QUOTES_BASE_URL}/expiring-soon`, {
      params: { days }
    })

    return {
      data: response.data.data.map(parseQuote),
      meta: response.data.meta
    }
  },

  /**
   * Get quote statistics/summary
   */
  async getSummary(): Promise<QuoteSummary> {
    const response = await axios.get<{ data: QuoteSummary }>(`${QUOTES_BASE_URL}/summary`)

    return response.data.data
  },

  /**
   * Download quote PDF
   * Opens a download in the browser
   */
  async downloadPdf(id: string): Promise<void> {
    const response = await axios.get(`${QUOTES_BASE_URL}/${id}/pdf/download`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cotizacion-${id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  /**
   * Preview quote PDF in a new tab
   */
  async previewPdf(id: string): Promise<void> {
    const response = await axios.get(`${QUOTES_BASE_URL}/${id}/pdf/stream`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  },

  /**
   * Generate purchase order from quote (for out-of-stock items)
   */
  async generatePurchaseOrder(id: string): Promise<{ message: string; data: Record<string, unknown> }> {
    const response = await axios.post<{ message: string; data: Record<string, unknown> }>(
      `${QUOTES_BASE_URL}/${id}/generate-purchase-order`
    )
    return response.data
  }
}

// Quote Item Service
export const quoteItemService = {
  /**
   * Get all items for a quote
   */
  async getByQuoteId(quoteId: string): Promise<QuoteItem[]> {
    const response = await axios.get<JsonApiResponse<JsonApiResource[]>>(QUOTE_ITEMS_BASE_URL, {
      params: {
        'filter[quote]': quoteId,
        include: 'product'
      }
    })

    return response.data.data.map(parseQuoteItem)
  },

  /**
   * Get single quote item by ID
   */
  async getById(id: string): Promise<QuoteItem> {
    const response = await axios.get<JsonApiResponse<JsonApiResource>>(`${QUOTE_ITEMS_BASE_URL}/${id}`, {
      params: {
        include: 'product'
      }
    })

    return parseQuoteItem(response.data.data)
  },

  /**
   * Create new quote item
   */
  async create(data: CreateQuoteItemRequest): Promise<QuoteItem> {
    const attributes = stripUndefined(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: QUOTE_ITEM_RESOURCE_TYPE,
        attributes
      }
    }

    const response = await axios.post<JsonApiResponse<JsonApiResource>>(QUOTE_ITEMS_BASE_URL, requestData)

    return parseQuoteItem(response.data.data)
  },

  /**
   * Update existing quote item
   */
  async update(id: string, data: UpdateQuoteItemRequest): Promise<QuoteItem> {
    const attributes = stripUndefined(data as unknown as Record<string, unknown>)

    const requestData = {
      data: {
        type: QUOTE_ITEM_RESOURCE_TYPE,
        id,
        attributes
      }
    }

    const response = await axios.patch<JsonApiResponse<JsonApiResource>>(
      `${QUOTE_ITEMS_BASE_URL}/${id}`,
      requestData
    )

    return parseQuoteItem(response.data.data)
  },

  /**
   * Delete quote item
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${QUOTE_ITEMS_BASE_URL}/${id}`)
  },

  /**
   * Bulk update quote items (useful for editing prices in table)
   */
  async bulkUpdate(items: Array<{ id: string; data: UpdateQuoteItemRequest }>): Promise<QuoteItem[]> {
    const results = await Promise.all(
      items.map(({ id, data }) => this.update(id, data))
    )
    return results
  }
}

// Export as default
const quoteServices = {
  quotes: quoteService,
  quoteItems: quoteItemService
}
export default quoteServices
