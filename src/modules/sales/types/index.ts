export interface SalesOrder {
  id: string
  contactId: number
  contact?: Contact
  orderNumber: string
  orderDate: string
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  financialStatus?: 'not_invoiced' | 'invoiced' | 'paid'
  invoicingStatus?: 'not_invoiced' | 'partially_invoiced' | 'fully_invoiced'
  arInvoiceId?: number | null
  subtotalAmount?: number
  taxAmount?: number
  discountTotal?: number
  totalAmount: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface SalesOrderItem {
  id: string
  salesOrderId: string
  productId: number
  product?: Record<string, unknown>
  salesOrder?: Record<string, unknown>
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

export interface SalesOrderFormData {
  contactId: number
  orderNumber: string
  orderDate: string
  status: string
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