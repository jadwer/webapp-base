/**
 * Quote Types - SA-M004
 *
 * Type definitions for the Quote module (Cotizaciones).
 * Backend: Modules/Sales/app/Models/Quote.php
 */

// Quote Status Flow: draft → sent → accepted/rejected/expired → converted/cancelled
export type QuoteStatus =
  | 'draft'      // Created, not sent
  | 'sent'       // Sent to customer
  | 'accepted'   // Customer accepted
  | 'rejected'   // Customer rejected
  | 'expired'    // Passed valid_until date
  | 'converted'  // Converted to SalesOrder
  | 'cancelled'  // Cancelled

export interface Quote {
  id: string
  contactId: number
  shoppingCartId: number | null
  salesOrderId: number | null
  quoteNumber: string
  status: QuoteStatus
  quoteDate: string
  validUntil: string | null
  estimatedEta: string | null
  subtotalAmount: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
  notes: string | null
  internalNotes: string | null
  termsAndConditions: string | null
  shippingAddress: Address | null
  billingAddress: Address | null
  metadata: Record<string, unknown> | null
  sentAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  convertedAt: string | null
  createdAt: string
  updatedAt: string
  // Computed attributes
  itemsCount: number
  totalQuantity: number
  isExpired?: boolean
  canBeSent?: boolean
  canBeConverted?: boolean
  // Relationships
  contact?: Contact
  items?: QuoteItem[]
  salesOrder?: SalesOrderRef
}

export interface QuoteItem {
  id: string
  quoteId: number
  productId: number
  quantity: number
  unitPrice: number      // Original price
  quotedPrice: number    // Quoted price (editable)
  discountPercentage: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  productName: string | null
  productSku: string | null
  notes: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  // Computed attributes
  subtotalBeforeDiscount?: number
  subtotalAfterDiscount?: number
  priceVariance?: number
  effectiveDiscountPercentage?: number
  // Relationships
  product?: ProductRef
  quote?: Quote
}

export interface Address {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  [key: string]: string | undefined
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  type: 'individual' | 'company'
}

export interface ProductRef {
  id: string
  name: string
  sku: string
  price: number
}

export interface SalesOrderRef {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
}

// Form data types
export interface CreateQuoteRequest {
  contactId: number
  quoteDate: string
  validUntil?: string
  estimatedEta?: string
  currency?: string
  notes?: string
  internalNotes?: string
  termsAndConditions?: string
  shippingAddress?: Address
  billingAddress?: Address
}

export interface UpdateQuoteRequest {
  contactId?: number
  validUntil?: string
  estimatedEta?: string
  notes?: string
  internalNotes?: string
  termsAndConditions?: string
  shippingAddress?: Address
  billingAddress?: Address
}

export interface CreateQuoteFromCartRequest {
  shopping_cart_id: number
  contact_id: number
  valid_until?: string
  notes?: string
  terms_and_conditions?: string
  shipping_address?: Address
  billing_address?: Address
}

export interface CreateQuoteItemRequest {
  quoteId: number
  productId: number
  quantity: number
  unitPrice: number
  quotedPrice: number
  discountPercentage?: number
  taxRate?: number
  productName?: string
  productSku?: string
  notes?: string
}

export interface UpdateQuoteItemRequest {
  quantity?: number
  quotedPrice?: number
  discountPercentage?: number
  taxRate?: number
  notes?: string
}

export interface ConvertQuoteRequest {
  shipping_address?: Address
  billing_address?: Address
}

export interface RejectQuoteRequest {
  reason?: string
}

// Filter and pagination types
export interface QuoteFilters {
  search?: string
  status?: QuoteStatus | QuoteStatus[]
  contactId?: number
  dateFrom?: string
  dateTo?: string
  expiringWithinDays?: number
}

export interface QuoteSortOptions {
  field: 'quoteNumber' | 'quoteDate' | 'validUntil' | 'totalAmount' | 'status' | 'createdAt'
  direction: 'asc' | 'desc'
}

// API Response types
export interface QuotesResponse {
  data: Quote[]
  meta?: PaginationMeta
}

export interface QuoteResponse {
  data: Quote
  message?: string
}

export interface QuoteItemsResponse {
  data: QuoteItem[]
  meta?: PaginationMeta
}

export interface QuoteSummary {
  total: number
  draft: number
  sent: number
  accepted: number
  converted: number
  rejected: number
  expired: number
  cancelled: number
  totalValue: number
  averageValue: number
  conversionRate: number
}

export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
  from?: number
  to?: number
}

// Status configuration
export interface QuoteStatusConfig {
  label: string
  color: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  description: string
  canEdit: boolean
  canSend: boolean
  canAccept: boolean
  canReject: boolean
  canConvert: boolean
  canCancel: boolean
}

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, QuoteStatusConfig> = {
  draft: {
    label: 'Borrador',
    color: 'secondary',
    description: 'Cotización en preparación',
    canEdit: true,
    canSend: true,
    canAccept: false,
    canReject: false,
    canConvert: false,
    canCancel: true
  },
  sent: {
    label: 'Enviada',
    color: 'default',
    description: 'Esperando respuesta del cliente',
    canEdit: false,
    canSend: false,
    canAccept: true,
    canReject: true,
    canConvert: false,
    canCancel: true
  },
  accepted: {
    label: 'Aceptada',
    color: 'success',
    description: 'Cliente aceptó la cotización',
    canEdit: false,
    canSend: false,
    canAccept: false,
    canReject: false,
    canConvert: true,
    canCancel: true
  },
  rejected: {
    label: 'Rechazada',
    color: 'destructive',
    description: 'Cliente rechazó la cotización',
    canEdit: false,
    canSend: false,
    canAccept: false,
    canReject: false,
    canConvert: false,
    canCancel: false
  },
  expired: {
    label: 'Expirada',
    color: 'warning',
    description: 'La cotización ha expirado',
    canEdit: false,
    canSend: false,
    canAccept: false,
    canReject: false,
    canConvert: false,
    canCancel: false
  },
  converted: {
    label: 'Convertida',
    color: 'success',
    description: 'Convertida a orden de venta',
    canEdit: false,
    canSend: false,
    canAccept: false,
    canReject: false,
    canConvert: false,
    canCancel: false
  },
  cancelled: {
    label: 'Cancelada',
    color: 'destructive',
    description: 'Cotización cancelada',
    canEdit: false,
    canSend: false,
    canAccept: false,
    canReject: false,
    canConvert: false,
    canCancel: false
  }
}

// Helper functions
export function getStatusConfig(status: QuoteStatus): QuoteStatusConfig {
  return QUOTE_STATUS_CONFIG[status] || QUOTE_STATUS_CONFIG.draft
}

export function canEditQuote(quote: Quote): boolean {
  return QUOTE_STATUS_CONFIG[quote.status]?.canEdit ?? false
}

export function canSendQuote(quote: Quote): boolean {
  return QUOTE_STATUS_CONFIG[quote.status]?.canSend && (quote.itemsCount ?? 0) > 0
}

export function canConvertQuote(quote: Quote): boolean {
  return QUOTE_STATUS_CONFIG[quote.status]?.canConvert ?? false
}
