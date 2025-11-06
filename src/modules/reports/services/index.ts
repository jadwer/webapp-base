/**
 * Reports Module - Services
 *
 * API layer for read-only reports
 * All reports are generated dynamically (no create/update/delete)
 */

import axiosClient from '@/lib/axiosClient'
import type {
  BalanceSheetFilters,
  PeriodReportFilters,
  AgingReportFilters,
} from '../types'

// ============================================================================
// FINANCIAL STATEMENTS
// ============================================================================

export const balanceSheetService = {
  get: async (filters?: BalanceSheetFilters) => {
    try {
      console.log('🚀 [Service] Fetching balance sheet with filters:', filters)

      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[asOfDate]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/balance-sheets?${queryString}`
        : '/api/v1/balance-sheets'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Balance sheet response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching balance sheet:', error)
      throw error
    }
  },
}

export const incomeStatementService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      console.log('🚀 [Service] Fetching income statement with filters:', filters)

      const queryParams = new URLSearchParams()
      queryParams.append('filter[startDate]', filters.startDate)
      queryParams.append('filter[endDate]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `/api/v1/income-statements?${queryParams.toString()}`

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Income statement response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching income statement:', error)
      throw error
    }
  },
}

export const cashFlowService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      console.log('🚀 [Service] Fetching cash flow with filters:', filters)

      const queryParams = new URLSearchParams()
      queryParams.append('filter[startDate]', filters.startDate)
      queryParams.append('filter[endDate]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `/api/v1/cash-flows?${queryParams.toString()}`

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Cash flow response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching cash flow:', error)
      throw error
    }
  },
}

export const trialBalanceService = {
  get: async (filters?: BalanceSheetFilters) => {
    try {
      console.log('🚀 [Service] Fetching trial balance with filters:', filters)

      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[asOfDate]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/trial-balances?${queryString}`
        : '/api/v1/trial-balances'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Trial balance response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching trial balance:', error)
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
      console.log('🚀 [Service] Fetching AR aging report with filters:', filters)

      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[asOfDate]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/ar-aging-reports?${queryString}`
        : '/api/v1/ar-aging-reports'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] AR aging report response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching AR aging report:', error)
      throw error
    }
  },
}

export const apAgingReportService = {
  get: async (filters?: AgingReportFilters) => {
    try {
      console.log('🚀 [Service] Fetching AP aging report with filters:', filters)

      const queryParams = new URLSearchParams()

      if (filters?.asOfDate) {
        queryParams.append('filter[asOfDate]', filters.asOfDate)
      }
      if (filters?.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/ap-aging-reports?${queryString}`
        : '/api/v1/ap-aging-reports'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] AP aging report response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching AP aging report:', error)
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
      console.log('🚀 [Service] Fetching sales by customer with filters:', filters)

      const queryParams = new URLSearchParams()
      queryParams.append('filter[startDate]', filters.startDate)
      queryParams.append('filter[endDate]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `/api/v1/sales-by-customer-reports?${queryParams.toString()}`

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Sales by customer response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching sales by customer:', error)
      throw error
    }
  },
}

export const salesByProductService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      console.log('🚀 [Service] Fetching sales by product with filters:', filters)

      const queryParams = new URLSearchParams()
      queryParams.append('filter[startDate]', filters.startDate)
      queryParams.append('filter[endDate]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `/api/v1/sales-by-product-reports?${queryParams.toString()}`

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Sales by product response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching sales by product:', error)
      throw error
    }
  },
}

export const purchaseBySupplierService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      console.log('🚀 [Service] Fetching purchase by supplier with filters:', filters)

      const queryParams = new URLSearchParams()
      queryParams.append('filter[startDate]', filters.startDate)
      queryParams.append('filter[endDate]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `/api/v1/purchase-by-supplier-reports?${queryParams.toString()}`

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Purchase by supplier response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching purchase by supplier:', error)
      throw error
    }
  },
}

export const purchaseByProductService = {
  get: async (filters: PeriodReportFilters) => {
    try {
      console.log('🚀 [Service] Fetching purchase by product with filters:', filters)

      const queryParams = new URLSearchParams()
      queryParams.append('filter[startDate]', filters.startDate)
      queryParams.append('filter[endDate]', filters.endDate)

      if (filters.currency) {
        queryParams.append('filter[currency]', filters.currency)
      }

      const url = `/api/v1/purchase-by-product-reports?${queryParams.toString()}`

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Purchase by product response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching purchase by product:', error)
      throw error
    }
  },
}
