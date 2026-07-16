// Export all types
export * from './types'

// Export all hooks
export * from './hooks'

// Export all services
export * from './services'

// Export all transformers and utilities
export * from './utils/transformers'
export * from './utils/exportCsv'
export * from './utils/dates'

// Export all components
export * from './components'

// Re-export main items for convenience
export { 
  // Types
  type SalesOrder,
  type SalesOrderItem,
  type Contact,
  type SalesOrderFormData,
  type SalesOrderFilters,
  type SalesReportData,
  type CustomerSalesData,
  type StatusSalesData,
  type PeriodSalesData
} from './types'

export {
  // Hooks
  useSalesOrders,
  useSalesOrder,
  useSalesOrderItems,
  useSalesReports,
  useSalesCustomers,
  useSalesAnalytics,
  useSalesContacts,
  useSalesProducts,
  useSalesOrderMutations,
  useSalesOrderItemMutations,
  useSalesOrderWithItems
} from './hooks'

export {
  // Services
  salesService,
  salesReportsService,
  salesContactsService,
  salesProductsService
} from './services'

export {
  // Transformers
  transformJsonApiSalesOrder,
  transformJsonApiSalesOrderItem,
  transformSalesOrdersResponse,
  transformSalesOrderItemsResponse,
  transformSalesOrderFormToJsonApi,
  transformSalesOrderItemFormToJsonApi
} from './utils/transformers'

// Quotes (cotizaciones) sub-module — surfaced through @lwm/sales because
// quotes are part of the sales lifecycle (cart -> quote -> sales order).
export * from './quotes'