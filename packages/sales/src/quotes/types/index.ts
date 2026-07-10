/**
 * Quote Types - SA-M004
 *
 * Type definitions for the Quote module (Cotizaciones).
 * Backend: Modules/Sales/app/Models/Quote.php
 */

import type { PaymentMethod, SalesOrderType } from '../../types'

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
  purchaseOrderId: number | null
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
  // Fase A - Venta directa vs Pedido: condiciones de pago (viajan a la orden al convertir)
  paymentMethod: PaymentMethod | null
  creditDays: number | null
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
  type: 'person' | 'company'
}

export interface StockRef {
  id: string
  warehouseId: number
  warehouseName?: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  status: string
}

export interface ProductRef {
  id: string
  name: string
  sku: string
  price: number
  stock?: StockRef[]
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
  paymentMethod?: PaymentMethod
  creditDays?: number
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
  paymentMethod?: PaymentMethod | null
  creditDays?: number | null
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
  /** Enviar discountPercentage O discountAmount, nunca ambos (el backend responde 422) */
  discountPercentage?: number
  discountAmount?: number
  taxRate?: number
  productName?: string
  productSku?: string
  notes?: string
}

export interface UpdateQuoteItemRequest {
  quantity?: number
  quotedPrice?: number
  /** Enviar discountPercentage O discountAmount, nunca ambos (el backend responde 422) */
  discountPercentage?: number
  discountAmount?: number
  taxRate?: number
  notes?: string
}

/**
 * Body de POST /quotes/{id}/convert (REST plano, snake_case).
 *
 * - order_type 'direct_sale': valida stock de TODOS los items; 422 con
 *   detalle de faltantes si alguno no alcanza. La orden nace 'confirmed'.
 * - order_type 'order': no bloquea por stock; la respuesta incluye
 *   items_requiring_purchase. Requiere customer_po_number. Nace 'pending'.
 * - payment_method / credit_days: defaults desde la quote si se omiten.
 */
export interface ConvertQuoteRequest {
  order_type?: SalesOrderType
  customer_po_number?: string
  payment_method?: PaymentMethod
  credit_days?: number
  shipping_address?: Address
  billing_address?: Address
}

/**
 * Item con stock insuficiente. Aparece en el 422 de convert (venta directa)
 * y en items_requiring_purchase de la respuesta de convert (pedido).
 */
export interface StockShortageItem {
  product_id: number
  product_name: string
  requested: number
  available: number
}

export interface RejectQuoteRequest {
  reason?: string
}

// Filter and pagination types
export interface QuoteFilters {
  search?: string
  status?: QuoteStatus | QuoteStatus[]
  contactId?: number
  contactEmail?: string  // For customer portal - filter by contact's email
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
  meta?: QuotePaginationMeta
}

export interface QuoteResponse {
  data: Quote
  message?: string
}

export interface QuoteItemsResponse {
  data: QuoteItem[]
  meta?: QuotePaginationMeta
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

// QuotePaginationMeta is the local name for what sales/types calls
// PaginationMeta. Same shape; renamed here to avoid re-export collisions
// when packages/sales/src/index.ts merges both barrels via export *.
export interface QuotePaginationMeta {
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

export function canEditQuote(quote: Quote, isAdmin?: boolean): boolean {
  // Admins can edit quotes in any non-terminal status
  if (isAdmin && !['converted', 'cancelled'].includes(quote.status)) {
    return true
  }
  return QUOTE_STATUS_CONFIG[quote.status]?.canEdit ?? false
}

export function canSendQuote(quote: Quote): boolean {
  return QUOTE_STATUS_CONFIG[quote.status]?.canSend && (quote.itemsCount ?? 0) > 0
}

export function canConvertQuote(quote: Quote): boolean {
  return QUOTE_STATUS_CONFIG[quote.status]?.canConvert ?? false
}
