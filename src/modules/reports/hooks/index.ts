/**
 * Reports Module - SWR Hooks
 *
 * Data fetching hooks for read-only reports
 * NO mutation hooks (reports are read-only)
 */

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
