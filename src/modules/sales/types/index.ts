export interface SalesOrder {
  id: string
  contactId: number
  contact?: Contact
  orderNumber: string
  orderDate: string
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface SalesOrderItem {
  id: string
  salesOrderId: string
  productId: number
  product?: any
  salesOrder?: any
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
  attributes: Record<string, any>
  relationships?: Record<string, any>
}

export interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[]
  meta?: any
  included?: JsonApiResource[]
}

// API Response types
export interface SalesOrdersResponse {
  data: SalesOrder[]
  meta: any
}

export interface SalesOrderItemsResponse {
  data: SalesOrderItem[]
  meta: any
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