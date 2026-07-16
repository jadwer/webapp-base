/**
 * Quote Service Layer - SA-M004
 *
 * Complete JSON:API service implementation for quotes (cotizaciones).
 *
 * Backend: Modules/Sales/app/Http/Controllers/Api/V1/QuoteController.php
 * API: /api/v1/quotes
 */

import { axiosClient as axios } from '@lwm/auth'
import type {
  Quote,
  Contact,
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
  QuotePaginationMeta,
  ProductRef,
  StockRef,
  StockShortageItem
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
  meta?: QuotePaginationMeta
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

// Resolve the contact (Cliente) for a quote from the JSON:API `included` array.
// El detalle y la tabla de cotizaciones piden include=contact, pero sin esto
// nunca se resolvia el nombre real (se mostraba "Contact #2") ni el correo
// (falso aviso "no tiene correo registrado" al enviar).
function resolveQuoteContact(
  resource: JsonApiResource,
  includedMap: Map<string, JsonApiResource>
): Contact | undefined {
  const contactRel = resource.relationships?.contact as
    | { data?: { type: string; id: string } | null }
    | undefined
  if (!contactRel?.data) return undefined

  const contactResource = includedMap.get(`${contactRel.data.type}:${contactRel.data.id}`)
  if (!contactResource) return undefined

  const attrs = transformToCamelCase(contactResource.attributes)
  return {
    id: contactResource.id,
    name: (attrs.name as string) || '',
    email: attrs.email as string | undefined,
    phone: attrs.phone as string | undefined,
    type: (attrs.type as 'person' | 'company') || 'person'
  }
}

// Parse JSON:API quote response. When an includedMap is supplied, the contact
// relationship is resolved from `included` so quote.contact carries name/email.
function parseQuote(resource: JsonApiResource, includedMap?: Map<string, JsonApiResource>): Quote {
  const attributes = transformToCamelCase(resource.attributes)
  const quote = {
    id: resource.id,
    ...attributes
  } as Quote

  if (includedMap) {
    const contact = resolveQuoteContact(resource, includedMap)
    if (contact) {
      quote.contact = contact
    }
  }

  return quote
}

// Parse JSON:API quote item response
function parseQuoteItem(resource: JsonApiResource): QuoteItem {
  const attributes = transformToCamelCase(resource.attributes)
  return {
    id: resource.id,
    ...attributes
  } as QuoteItem
}

// Resolve the product (with its stock) for a quote item from the JSON:API
// `included` array. El semaforo de stock (QuoteItemsTable y los modales de
// Generar venta / Generar pedido) depende de item.product.stock.
function resolveQuoteItemProduct(
  resource: JsonApiResource,
  includedMap: Map<string, JsonApiResource>
): ProductRef | undefined {
  const productRel = resource.relationships?.product as
    | { data?: { type: string; id: string } | null }
    | undefined
  if (!productRel?.data) return undefined

  const productResource = includedMap.get(`${productRel.data.type}:${productRel.data.id}`)
  if (!productResource) return undefined

  const productAttrs = transformToCamelCase(productResource.attributes)

  // Stock relationship (HasMany) -> stocks in included
  const stockRel = productResource.relationships?.stock as
    | { data?: Array<{ type: string; id: string }> }
    | undefined
  const stock: StockRef[] = (stockRel?.data || [])
    .map((ref) => includedMap.get(`${ref.type}:${ref.id}`))
    .filter((s): s is JsonApiResource => Boolean(s))
    .map((s) => ({
      id: s.id,
      ...transformToCamelCase(s.attributes)
    })) as StockRef[]

  return {
    id: productResource.id,
    name: (productAttrs.name as string) || '',
    sku: (productAttrs.sku as string) || '',
    price: (productAttrs.price as number) || 0,
    stock
  }
}

function buildIncludedMap(included?: JsonApiResource[]): Map<string, JsonApiResource> {
  const map = new Map<string, JsonApiResource>()
  for (const resource of included || []) {
    map.set(`${resource.type}:${resource.id}`, resource)
  }
  return map
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
  ): Promise<{ data: Quote[]; meta?: QuotePaginationMeta }> {
    const params = buildQueryParams(filters, sort, page, pageSize, include || ['contact', 'items'])

    const response = await axios.get<JsonApiResponse<JsonApiResource[]>>(QUOTES_BASE_URL, { params })

    const includedMap = buildIncludedMap(response.data.included)
    const quotes = response.data.data.map((resource) => parseQuote(resource, includedMap))

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

    const includedMap = buildIncludedMap(response.data.included)
    return parseQuote(response.data.data, includedMap)
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
   * Convert quote to sales order (venta directa o pedido).
   *
   * order_type 'direct_sale' con stock insuficiente responde 422 con
   * `errors: StockShortageItem[]`. order_type 'order' regresa ademas
   * `items_requiring_purchase` (informativo, no bloquea).
   */
  async convert(id: string, data?: ConvertQuoteRequest): Promise<{
    data: { quote: Quote; salesOrder: { type: string; id: string; attributes: Record<string, unknown> } }
    message: string
    items_requiring_purchase?: StockShortageItem[]
  }> {
    const response = await axios.post<{
      data: {
        quote: JsonApiResource
        salesOrder: { type: string; id: string; attributes: Record<string, unknown> }
      }
      message: string
      items_requiring_purchase?: StockShortageItem[]
      meta?: { items_requiring_purchase?: StockShortageItem[] }
    }>(`${QUOTES_BASE_URL}/${id}/convert`, data || {})

    return {
      data: {
        quote: parseQuote(response.data.data.quote),
        salesOrder: response.data.data.salesOrder
      },
      message: response.data.message,
      items_requiring_purchase:
        response.data.items_requiring_purchase ?? response.data.meta?.items_requiring_purchase
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
      data: response.data.data.map((resource) => parseQuote(resource)),
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
   * Generate purchase order from quote (for out-of-stock items).
   *
   * El backend exige supplier_id (required|exists:contacts,id): sin el la
   * llamada devolvia 422. Se envia el proveedor elegido por el usuario;
   * warehouse_id y notes son opcionales (el backend usa el primer almacen
   * activo si no se especifica).
   */
  async generatePurchaseOrder(
    id: string,
    supplierId: string | number,
    options?: { warehouseId?: string | number; notes?: string }
  ): Promise<{ message: string; data: Record<string, unknown> }> {
    const body: Record<string, unknown> = { supplier_id: supplierId }
    if (options?.warehouseId != null) body.warehouse_id = options.warehouseId
    if (options?.notes) body.notes = options.notes

    const response = await axios.post<{ message: string; data: Record<string, unknown> }>(
      `${QUOTES_BASE_URL}/${id}/generate-purchase-order`,
      body
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
        include: 'product,product.stock'
      }
    })

    // Resolver product + stock desde included para el semaforo de stock
    const includedMap = buildIncludedMap(response.data.included)

    return response.data.data.map((resource) => {
      const item = parseQuoteItem(resource)
      const product = resolveQuoteItemProduct(resource, includedMap)
      if (product) {
        item.product = product
      }
      return item
    })
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
