// Backend API status values
export type PurchaseOrderStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'received'
  | 'cancelled'
  // Legacy frontend value
  | 'completed'

export type InvoicingStatus = 'pending' | 'partial' | 'invoiced' | 'not_required'
// Legacy frontend financial status
export type FinancialStatus = 'not_invoiced' | 'invoiced' | 'paid'

export interface PurchaseOrder {
  id: string
  contactId: number
  contact?: Contact
  orderNumber?: string // Frontend-generated, not in backend
  orderDate: string
  status: PurchaseOrderStatus
  totalAmount: number
  notes: string | null
  // Finance integration fields
  apInvoiceId: number | null
  invoicingStatus: InvoicingStatus | string | null
  invoicingNotes: string | null
  // Legacy frontend fields (not in backend)
  financialStatus?: FinancialStatus
  subtotalAmount?: number
  taxAmount?: number
  discountTotal?: number
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: number
  productId: number
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
  total: number
  totalPrice?: number // Legacy frontend alias for total
  metadata?: Record<string, unknown> | null
  // Finance integration fields
  apInvoiceLineId: number | null
  invoicedQuantity: number | null
  invoicedAmount: number | null
  // Metadata
  createdAt: string
  updatedAt: string
  // Relationships
  product?: Record<string, unknown>
  purchaseOrder?: PurchaseOrder | Record<string, unknown>
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  type: 'individual' | 'company'
}

export interface PurchaseOrderFormData {
  contactId: number
  orderNumber?: string
  orderDate: string
  status: PurchaseOrderStatus
  notes?: string | null
  items?: PurchaseOrderItem[]
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
export interface PurchaseOrdersResponse {
  data: PurchaseOrder[]
  meta: Record<string, unknown>
}

export interface PurchaseOrderItemsResponse {
  data: PurchaseOrderItem[]
  meta: Record<string, unknown>
}

// Filter and pagination types
export interface PurchaseOrderFilters {
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

// Reports types
export interface PurchaseReportData {
  totalPurchases: number
  totalOrders: number
  averageOrderValue: number
  topSuppliers: SupplierPurchaseData[]
  purchasesByStatus: StatusPurchaseData[]
  purchasesByPeriod: PeriodPurchaseData[]
}

export interface SupplierPurchaseData {
  supplierId: number
  supplierName: string
  totalPurchases: number
  orderCount: number
}

export interface StatusPurchaseData {
  status: string
  count: number
  totalAmount: number
}

export interface PeriodPurchaseData {
  period: string
  totalPurchases: number
  orderCount: number
}