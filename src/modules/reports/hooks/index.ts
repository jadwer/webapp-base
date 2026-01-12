/**
 * Reports Module - SWR Hooks
 *
 * Data fetching hooks for read-only reports
 * NO mutation hooks (reports are read-only)
 */

'use client'

import useSWR from 'swr'
import {
  balanceSheetService,
  incomeStatementService,
  cashFlowService,
  trialBalanceService,
  arAgingReportService,
  apAgingReportService,
  salesByCustomerService,
  salesByProductService,
  purchaseBySupplierService,
  purchaseByProductService,
} from '../services'
import {
  transformBalanceSheetResponse,
  transformIncomeStatementResponse,
  transformCashFlowResponse,
  transformTrialBalanceResponse,
  transformARAgingReportResponse,
  transformAPAgingReportResponse,
  transformSalesByCustomerResponse,
  transformSalesByProductResponse,
  transformPurchaseBySupplierResponse,
  transformPurchaseByProductResponse,
} from '../utils/transformers'
import type {
  BalanceSheetFilters,
  PeriodReportFilters,
  AgingReportFilters,
} from '../types'

// ============================================================================
// FINANCIAL STATEMENTS
// ============================================================================

export const useBalanceSheet = (filters?: BalanceSheetFilters) => {
  const key = filters
    ? ['balance-sheet', filters]
    : 'balance-sheet'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await balanceSheetService.get(filters)
      const transformed = transformBalanceSheetResponse(response)
      console.log('✅ [Hook] Transformed balance sheet:', transformed)
      return transformed
    }
  )

  return {
    balanceSheet: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useIncomeStatement = (filters: PeriodReportFilters) => {
  const key = ['income-statement', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await incomeStatementService.get(filters)
      const transformed = transformIncomeStatementResponse(response)
      console.log('✅ [Hook] Transformed income statement:', transformed)
      return transformed
    }
  )

  return {
    incomeStatement: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useCashFlow = (filters: PeriodReportFilters) => {
  const key = ['cash-flow', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await cashFlowService.get(filters)
      const transformed = transformCashFlowResponse(response)
      console.log('✅ [Hook] Transformed cash flow:', transformed)
      return transformed
    }
  )

  return {
    cashFlow: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useTrialBalance = (filters?: BalanceSheetFilters) => {
  const key = filters
    ? ['trial-balance', filters]
    : 'trial-balance'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await trialBalanceService.get(filters)
      const transformed = transformTrialBalanceResponse(response)
      console.log('✅ [Hook] Transformed trial balance:', transformed)
      return transformed
    }
  )

  return {
    trialBalance: data?.data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// AGING REPORTS
// ============================================================================

export const useARAgingReport = (filters?: AgingReportFilters) => {
  const key = filters
    ? ['ar-aging-report', filters]
    : 'ar-aging-report'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await arAgingReportService.get(filters)
      const transformed = transformARAgingReportResponse(response)
      console.log('✅ [Hook] Transformed AR aging report:', transformed)
      return transformed
    }
  )

  return {
    arAgingReport: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useAPAgingReport = (filters?: AgingReportFilters) => {
  const key = filters
    ? ['ap-aging-report', filters]
    : 'ap-aging-report'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await apAgingReportService.get(filters)
      const transformed = transformAPAgingReportResponse(response)
      console.log('✅ [Hook] Transformed AP aging report:', transformed)
      return transformed
    }
  )

  return {
    apAgingReport: data?.data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// MANAGEMENT REPORTS
// ============================================================================

export const useSalesByCustomer = (filters: PeriodReportFilters) => {
  const key = ['sales-by-customer', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await salesByCustomerService.get(filters)
      const transformed = transformSalesByCustomerResponse(response)
      console.log('✅ [Hook] Transformed sales by customer:', transformed)
      return transformed
    }
  )

  return {
    salesByCustomer: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useSalesByProduct = (filters: PeriodReportFilters) => {
  const key = ['sales-by-product', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await salesByProductService.get(filters)
      const transformed = transformSalesByProductResponse(response)
      console.log('✅ [Hook] Transformed sales by product:', transformed)
      return transformed
    }
  )

  return {
    salesByProduct: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const usePurchaseBySupplier = (filters: PeriodReportFilters) => {
  const key = ['purchase-by-supplier', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await purchaseBySupplierService.get(filters)
      const transformed = transformPurchaseBySupplierResponse(response)
      console.log('✅ [Hook] Transformed purchase by supplier:', transformed)
      return transformed
    }
  )

  return {
    purchaseBySupplier: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const usePurchaseByProduct = (filters: PeriodReportFilters) => {
  const key = ['purchase-by-product', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await purchaseByProductService.get(filters)
      const transformed = transformPurchaseByProductResponse(response)
      console.log('✅ [Hook] Transformed purchase by product:', transformed)
      return transformed
    }
  )

  return {
    purchaseByProduct: data?.data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// INVENTORY REPORTS
// ============================================================================

import {
  inventoryValuationService,
  stockLevelsService,
  salesSummaryService,
  analyticsService,
  reportExportService,
  type ExportFormat,
} from '../services'

export const useInventoryValuation = (filters?: {
  asOfDate?: string
  warehouseId?: number
  categoryId?: number
}) => {
  const key = filters
    ? ['inventory-valuation', filters]
    : 'inventory-valuation'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryValuationService.get(filters)
  )

  return {
    inventoryValuation: data,
    isLoading,
    error,
    mutate,
  }
}

export const useStockLevels = (filters?: { warehouseId?: number }) => {
  const key = filters
    ? ['stock-levels', filters]
    : 'stock-levels'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => stockLevelsService.get(filters)
  )

  return {
    stockLevels: data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// SALES REPORTS
// ============================================================================

export const useSalesSummary = (filters: { startDate: string; endDate: string }) => {
  const key = ['sales-summary', filters]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => salesSummaryService.get(filters)
  )

  return {
    salesSummary: data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export const useAnalyticsDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'analytics-dashboard',
    () => analyticsService.getDashboard()
  )

  return {
    dashboard: data,
    isLoading,
    error,
    mutate,
  }
}

export const useAnalyticsKpis = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'analytics-kpis',
    () => analyticsService.getKpis()
  )

  return {
    kpis: data,
    isLoading,
    error,
    mutate,
  }
}

export const useAnalyticsTrends = (params: {
  metric: string
  period?: 'daily' | 'weekly' | 'monthly'
  months?: number
}) => {
  const key = ['analytics-trends', params]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => analyticsService.getTrends(params)
  )

  return {
    trends: data,
    isLoading,
    error,
    mutate,
  }
}

export const useAnalyticsMetrics = (params: {
  metrics: string[]
  groupBy: 'day' | 'week' | 'month'
  startDate: string
  endDate: string
}) => {
  const key = ['analytics-metrics', params]

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => analyticsService.getMetrics(params)
  )

  return {
    metrics: data,
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// REPORT EXPORT
// ============================================================================

import { useState, useCallback } from 'react'

export const useReportExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const exportReport = useCallback(async (
    reportType: string,
    params: Record<string, string | number>,
    format: ExportFormat,
    filename: string
  ) => {
    setIsExporting(true)
    setError(null)
    try {
      const blob = await reportExportService.export(reportType, params, format)
      reportExportService.download(blob, filename)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Export failed'))
      throw err
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    exportReport,
    isExporting,
    error,
  }
}
