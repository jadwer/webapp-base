export interface PurchaseOrder {
  id: string
  contactId: number
  contact?: Contact
  orderNumber: string
  orderDate: string
  status: 'pending' | 'approved' | 'received' | 'completed' | 'cancelled'
  financialStatus?: 'not_invoiced' | 'invoiced' | 'paid'
  apInvoiceId?: number | null
  subtotalAmount?: number
  taxAmount?: number
  discountTotal?: number
  totalAmount: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: number
  product?: any
  purchaseOrder?: any
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
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
  orderNumber: string
  orderDate: string
  status: string
  notes?: string
  items?: PurchaseOrderItem[]
}

// JSON:API related types (common interface used across modules)
export interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, any>
  relationships?: Record<string, any>
}

export interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[]
  meta?: any
  included?: JsonApiResource[]
}

// API Response types
export interface PurchaseOrdersResponse {
  data: PurchaseOrder[]
  meta: any
}

export interface PurchaseOrderItemsResponse {
  data: PurchaseOrderItem[]
  meta: any
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