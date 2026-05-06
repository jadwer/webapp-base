// Backend API status values
export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  // Extended status from workflow (returned -> refunded)
  | 'returned'
  | 'refunded'
  | 'completed'
  // Legacy frontend value
  | 'pending'

export type InvoicingStatus = 'pending' | 'partial' | 'invoiced' | 'not_required'
export type FinancialStatus = 'pending' | 'partial' | 'paid' | 'overdue'

export interface SalesOrder {
  id: string
  contactId: number
  contact?: Contact
  orderNumber: string
  orderDate: string
  status: OrderStatus
  approvedAt: string | null
  deliveredAt: string | null
  // Finance integration fields
  arInvoiceId: number | null
  invoicingStatus: InvoicingStatus
  financialStatus?: FinancialStatus
  invoicingNotes: string | null
  // Amounts
  discountTotal: number
  totalAmount: number
  subtotalAmount?: number
  taxAmount?: number
  // Metadata
  notes: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface SalesOrderItem {
  id: string
  salesOrderId: number
  productId: number
  quantity: number
  unitPrice: number
  discount: number
  total: number
  totalPrice?: number // Legacy frontend alias for total
  // Finance integration fields
  arInvoiceLineId: number | null
  invoicedQuantity: number | null
  invoicedAmount: number | null
  // Metadata
  metadata?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  // Relationships
  product?: Record<string, unknown>
  salesOrder?: SalesOrder | Record<string, unknown>
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  type: 'individual' | 'company'
}

export interface SalesOrderFormData {
  contactId: number
  orderNumber: string
  orderDate: string
  status: OrderStatus
  approvedAt?: string | null
  deliveredAt?: string | null
  invoicingNotes?: string | null
  notes?: string
  items?: SalesOrderItem[]
}

// JSON:API related types (common interface used across modules)
export interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, unknown>
}

export interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[]
  meta?: Record<string, unknown>
  included?: JsonApiResource[]
}

// API Response types
export interface SalesOrdersResponse {
  data: SalesOrder[]
  meta: Record<string, unknown>
}

export interface SalesOrderItemsResponse {
  data: SalesOrderItem[]
  meta: Record<string, unknown>
}

// Filter and pagination types
export interface SalesOrderFilters {
  search?: string
  status?: string
  contactId?: number
  dateFrom?: string
  dateTo?: string
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

// Order Tracking types (custom REST endpoints, not JSON:API)
export interface OrderTracking {
  orderNumber: string
  status: string
  trackingNumber: string | null
  trackingUrl: string | null
  orderDate: string
  estimatedDelivery: string | null
  currentLocation: string | null
  timeline: OrderTimelineEvent[]
}

export interface OrderTimelineEvent {
  status: string
  label: string
  timestamp: string | null
  completed: boolean
}

export interface StatusHistoryEntry {
  status: string
  changedAt: string
  changedBy: number
  notes: string | null
}

// Reports types
export interface SalesReportData {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topCustomers: CustomerSalesData[]
  salesByStatus: StatusSalesData[]
  salesByPeriod: PeriodSalesData[]
}

export interface CustomerSalesData {
  customerId: number
  customerName: string
  totalSales: number
  orderCount: number
}

export interface StatusSalesData {
  status: string
  count: number
  totalAmount: number
}

export interface PeriodSalesData {
  period: string
  totalSales: number
  orderCount: number
}

// DiscountRule types - Backend v1.1 (SA-M003)
export type {
  DiscountType,
  DiscountAppliesTo,
  DiscountRule,
  ParsedDiscountRule,
  CreateDiscountRuleRequest,
  UpdateDiscountRuleRequest,
  DiscountRuleFilters,
  DiscountRuleSortOptions,
  DiscountRuleFormData,
  JsonApiDiscountRuleResponse,
  UseDiscountRulesResult,
  UseDiscountRuleResult,
  UseDiscountRuleMutationsResult,
  DiscountRuleStatusConfig,
  DiscountTypeConfig
} from './discountRule'

export {
  DISCOUNT_TYPE_CONFIG,
  APPLIES_TO_CONFIG,
  DISCOUNT_TYPE_OPTIONS,
  APPLIES_TO_OPTIONS
} from './discountRule'