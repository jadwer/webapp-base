/**
 * Reports Module - Services
 *
 * API layer for read-only reports
 * All reports are generated dynamically (no create/update/delete)
 *
 * IMPORTANT: All endpoints are under /api/v1/reports/ prefix
 */

import axiosClient from '@/lib/axiosClient'
import type {
  BalanceSheetFilters,
  PeriodReportFilters,
  AgingReportFilters,
  SalesByEmployeeFilters,
  SalesByBatchFilters,
  SalesTrendFilters,
  SalesHistoryFilters,
  SalesHistoryReport,
} from '../types'
import {
  transformSalesHistoryResponse,
  transformSalesByEmployeeReport,
  transformSalesByBatchReport,
  transformProfitabilityReport,
  transformSalesTrendReport,
} from '../utils/transformers'

// Base URL for all reports
const REPORTS_BASE = '/api/v1/reports'

// ============================================================================
// FINANCIAL STATEMENTS
// ============================================================================

export const balanceSheetService = {
  get: async (filters?: BalanceSheetFilters) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[as_of_date]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `${REPORTS_BASE}/balance-sheets?${queryString}`
        : `${REPORTS_BASE}/balance-sheets`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const incomeStatementService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('filter[start_date]', filters.startDate)
      queryParams.append('filter[end_date]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `${REPORTS_BASE}/income-statements?${queryParams.toString()}`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const cashFlowService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('filter[start_date]', filters.startDate)
      queryParams.append('filter[end_date]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `${REPORTS_BASE}/cash-flows?${queryParams.toString()}`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const trialBalanceService = {
  get: async (filters?: BalanceSheetFilters) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[as_of_date]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `${REPORTS_BASE}/trial-balances?${queryString}`
        : `${REPORTS_BASE}/trial-balances`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// AGING REPORTS
// ============================================================================

export const arAgingReportService = {
  get: async (filters?: AgingReportFilters) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[as_of_date]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `${REPORTS_BASE}/ar-aging-reports?${queryString}`
        : `${REPORTS_BASE}/ar-aging-reports`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const apAgingReportService = {
  get: async (filters?: AgingReportFilters) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[as_of_date]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `${REPORTS_BASE}/ap-aging-reports?${queryString}`
        : `${REPORTS_BASE}/ap-aging-reports`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// MANAGEMENT REPORTS
// ============================================================================

export const salesByCustomerService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('filter[start_date]', filters.startDate)
      queryParams.append('filter[end_date]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `${REPORTS_BASE}/sales-by-customer-reports?${queryParams.toString()}`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const salesByProductService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('filter[start_date]', filters.startDate)
      queryParams.append('filter[end_date]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `${REPORTS_BASE}/sales-by-product-reports?${queryParams.toString()}`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const purchaseBySupplierService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('filter[start_date]', filters.startDate)
      queryParams.append('filter[end_date]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `${REPORTS_BASE}/purchase-by-supplier-reports?${queryParams.toString()}`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

export const purchaseByProductService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('filter[start_date]', filters.startDate)
      queryParams.append('filter[end_date]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `${REPORTS_BASE}/purchase-by-product-reports?${queryParams.toString()}`

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// INVENTORY REPORTS
// ============================================================================

export const inventoryValuationService = {
  get: async (filters?: { asOfDate?: string; warehouseId?: number; categoryId?: number }) => {
    const queryParams = new URLSearchParams()

    if (filters?.asOfDate) {
      queryParams.append('as_of', filters.asOfDate)
    }
    if (filters?.warehouseId) {
      queryParams.append('warehouse_id', filters.warehouseId.toString())
    }
    if (filters?.categoryId) {
      queryParams.append('category_id', filters.categoryId.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString
      ? `${REPORTS_BASE}/inventory-valuations?${queryString}`
      : `${REPORTS_BASE}/inventory-valuations`

    const response = await axiosClient.get(url)
    return response.data
  },
}

export const stockLevelsService = {
  get: async (filters?: { warehouseId?: number }) => {
    const queryParams = new URLSearchParams()

    if (filters?.warehouseId) {
      queryParams.append('warehouse_id', filters.warehouseId.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString
      ? `${REPORTS_BASE}/stock-levels?${queryString}`
      : `${REPORTS_BASE}/stock-levels`

    const response = await axiosClient.get(url)
    return response.data
  },
}

// ============================================================================
// SALES REPORTS
// ============================================================================

export const salesSummaryService = {
  get: async (filters: { startDate: string; endDate: string }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('start_date', filters.startDate)
    queryParams.append('end_date', filters.endDate)

    const url = `${REPORTS_BASE}/sales-summaries?${queryParams.toString()}`

    const response = await axiosClient.get(url)
    return response.data
  },
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export const analyticsService = {
  /**
   * Get dashboard summary
   */
  getDashboard: async () => {
    const response = await axiosClient.get('/api/v1/analytics/dashboard')
    return response.data
  },

  /**
   * Get KPIs
   */
  getKpis: async () => {
    const response = await axiosClient.get('/api/v1/analytics/kpis')
    return response.data
  },

  /**
   * Get trends for a metric
   */
  getTrends: async (params: { metric: string; period?: 'daily' | 'weekly' | 'monthly'; months?: number }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('metric', params.metric)
    if (params.period) queryParams.append('period', params.period)
    if (params.months) queryParams.append('months', params.months.toString())

    const response = await axiosClient.get(`/api/v1/analytics/trends?${queryParams.toString()}`)
    return response.data
  },

  /**
   * Get custom metrics
   */
  getMetrics: async (params: {
    metrics: string[]
    groupBy: 'day' | 'week' | 'month'
    startDate: string
    endDate: string
  }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('metrics', params.metrics.join(','))
    queryParams.append('groupBy', params.groupBy)
    queryParams.append('start', params.startDate)
    queryParams.append('end', params.endDate)

    const response = await axiosClient.get(`/api/v1/analytics/metrics?${queryParams.toString()}`)
    return response.data
  },
}

// ============================================================================
// PHASE 13: ADVANCED SALES REPORTS
// ============================================================================

export const salesByEmployeeService = {
  get: async (filters: SalesByEmployeeFilters) => {
    const queryParams = new URLSearchParams()
    queryParams.append('start_date', filters.startDate)
    queryParams.append('end_date', filters.endDate)
    if (filters.employeeId) {
      queryParams.append('employee_id', filters.employeeId.toString())
    }

    const url = `${REPORTS_BASE}/sales-by-employee?${queryParams.toString()}`
    const response = await axiosClient.get(url)
    // Backend responds { data: { period, report_type, employees, summary } } in snake_case
    return { data: transformSalesByEmployeeReport(response.data?.data) }
  },
}

export const salesByBatchService = {
  get: async (filters: SalesByBatchFilters) => {
    const queryParams = new URLSearchParams()
    queryParams.append('start_date', filters.startDate)
    queryParams.append('end_date', filters.endDate)
    if (filters.productId) {
      queryParams.append('product_id', filters.productId.toString())
    }
    if (filters.batchNumber) {
      queryParams.append('batch_number', filters.batchNumber)
    }

    const url = `${REPORTS_BASE}/sales-by-batch?${queryParams.toString()}`
    const response = await axiosClient.get(url)
    // Backend responds { data: { period, report_type, batches, summary } } in snake_case
    return { data: transformSalesByBatchReport(response.data?.data) }
  },
}

export const salesProfitabilityService = {
  get: async (filters: { startDate: string; endDate: string; categoryId?: number }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('start_date', filters.startDate)
    queryParams.append('end_date', filters.endDate)
    if (filters.categoryId) {
      queryParams.append('category_id', filters.categoryId.toString())
    }

    const url = `${REPORTS_BASE}/sales-profitability?${queryParams.toString()}`
    const response = await axiosClient.get(url)
    // Backend responds { data: { period, report_type, products, summary } } in snake_case
    return { data: transformProfitabilityReport(response.data?.data) }
  },
}

export const salesTrendService = {
  get: async (filters: SalesTrendFilters) => {
    const queryParams = new URLSearchParams()
    queryParams.append('start_date', filters.startDate)
    queryParams.append('end_date', filters.endDate)
    queryParams.append('group_by', filters.groupBy)

    const url = `${REPORTS_BASE}/sales-trend?${queryParams.toString()}`
    const response = await axiosClient.get(url)
    // Backend responds { data: { period, report_type, trends, summary } } in snake_case
    return { data: transformSalesTrendReport(response.data?.data) }
  },
}

// ============================================================================
// SALES HISTORY (Historico de Ventas)
// ============================================================================

export type SalesHistoryExportFormat = 'csv' | 'excel' | 'pdf'

/**
 * Builds snake_case query params for /reports/sales-history endpoints
 * from camelCase frontend filters.
 */
const buildSalesHistoryParams = (filters: SalesHistoryFilters): URLSearchParams => {
  const queryParams = new URLSearchParams()
  queryParams.append('start_date', filters.startDate)
  queryParams.append('end_date', filters.endDate)

  if (filters.contactId) queryParams.append('contact_id', filters.contactId.toString())
  if (filters.assignedTo) queryParams.append('assigned_to', filters.assignedTo.toString())
  if (filters.productId) queryParams.append('product_id', filters.productId.toString())
  if (filters.categoryId) queryParams.append('category_id', filters.categoryId.toString())
  if (filters.brandId) queryParams.append('brand_id', filters.brandId.toString())
  if (filters.status?.length) queryParams.append('status', filters.status.join(','))
  if (filters.currency) queryParams.append('currency', filters.currency)
  if (filters.iva !== undefined && filters.iva !== '') queryParams.append('iva', filters.iva)
  if (filters.orderNumber) queryParams.append('order_number', filters.orderNumber)
  if (filters.groupBy && filters.groupBy !== 'none') queryParams.append('group_by', filters.groupBy)

  return queryParams
}

export const salesHistoryService = {
  /**
   * Get sales history report (paginated rows + totals, optionally grouped)
   */
  getReport: async (filters: SalesHistoryFilters): Promise<SalesHistoryReport> => {
    const queryParams = buildSalesHistoryParams(filters)
    if (filters.pageNumber) queryParams.append('page[number]', filters.pageNumber.toString())
    if (filters.pageSize) queryParams.append('page[size]', filters.pageSize.toString())

    const url = `${REPORTS_BASE}/sales-history?${queryParams.toString()}`
    const response = await axiosClient.get(url)
    return transformSalesHistoryResponse(response.data)
  },

  /**
   * Export sales history with the same filters (blob download)
   */
  export: async (filters: SalesHistoryFilters, format: SalesHistoryExportFormat): Promise<Blob> => {
    const queryParams = buildSalesHistoryParams(filters)
    queryParams.append('format', format)

    const url = `${REPORTS_BASE}/sales-history/export?${queryParams.toString()}`
    const response = await axiosClient.get(url, { responseType: 'blob' })
    return response.data
  },
}

// ============================================================================
// REPORT EXPORT
// ============================================================================

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'excel'

export const reportExportService = {
  /**
   * Export any report to specified format
   */
  export: async (reportType: string, params: Record<string, string | number>, format: ExportFormat): Promise<Blob> => {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString())
    })
    queryParams.append('format', format)

    const response = await axiosClient.get(`${REPORTS_BASE}/${reportType}?${queryParams.toString()}`, {
      responseType: 'blob'
    })

    return response.data
  },

  /**
   * Download report file
   */
  download: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
