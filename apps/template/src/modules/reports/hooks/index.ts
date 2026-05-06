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
      return transformBalanceSheetResponse(response)
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
      return transformIncomeStatementResponse(response)
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
      return transformCashFlowResponse(response)
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
      return transformTrialBalanceResponse(response)
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
      return transformARAgingReportResponse(response)
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
      return transformAPAgingReportResponse(response)
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
      return transformSalesByCustomerResponse(response)
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
      return transformSalesByProductResponse(response)
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
      return transformPurchaseBySupplierResponse(response)
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
      return transformPurchaseByProductResponse(response)
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

// ============================================================================
// PHASE 13: ADVANCED SALES REPORTS
// ============================================================================

import {
  salesByEmployeeService,
  salesByBatchService,
  salesProfitabilityService,
  salesTrendService,
} from '../services'
import type {
  SalesByEmployeeFilters,
  SalesByBatchFilters,
  SalesTrendFilters,
  SalesByEmployee,
  SalesByBatch,
  SalesProfitability,
  SalesTrend,
} from '../types'

export const useSalesByEmployee = (filters: SalesByEmployeeFilters) => {
  const key = ['sales-by-employee', filters]

  const { data, error, isLoading, mutate } = useSWR<{ data: SalesByEmployee }>(
    key,
    () => salesByEmployeeService.get(filters)
  )

  return {
    salesByEmployee: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useSalesByBatch = (filters: SalesByBatchFilters) => {
  const key = ['sales-by-batch', filters]

  const { data, error, isLoading, mutate } = useSWR<{ data: SalesByBatch }>(
    key,
    () => salesByBatchService.get(filters)
  )

  return {
    salesByBatch: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useSalesProfitability = (filters: { startDate: string; endDate: string; categoryId?: number }) => {
  const key = ['sales-profitability', filters]

  const { data, error, isLoading, mutate } = useSWR<{ data: SalesProfitability }>(
    key,
    () => salesProfitabilityService.get(filters)
  )

  return {
    salesProfitability: data?.data,
    isLoading,
    error,
    mutate,
  }
}

export const useSalesTrend = (filters: SalesTrendFilters) => {
  const key = ['sales-trend', filters]

  const { data, error, isLoading, mutate } = useSWR<{ data: SalesTrend }>(
    key,
    () => salesTrendService.get(filters)
  )

  return {
    salesTrend: data?.data,
    isLoading,
    error,
    mutate,
  }
}
