/**
 * Reports Module - JSON:API Transformers
 *
 * Transforms JSON:API responses to TypeScript types
 * NOTE: Reports are read-only, so no toJsonApi transformers needed
 */

import type {
  BalanceSheet,
  IncomeStatement,
  CashFlow,
  TrialBalance,
  ARAgingReport,
  APAgingReport,
  SalesByCustomer,
  SalesByProduct,
  PurchaseBySupplier,
  PurchaseByProduct,
  ReportResponse,
} from '../types'

// ============================================================================
// BALANCE SHEET
// ============================================================================

export function transformJsonApiBalanceSheet(resource: Record<string, unknown>): BalanceSheet {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    asOfDate: (attributes.as_of_date || attributes.asOfDate) as string,
    currency: attributes.currency as string,
    balanced: attributes.balanced as boolean,

    assets: attributes.assets as BalanceSheet['assets'],
    totalAssets: (attributes.total_assets || attributes.totalAssets) as number,

    liabilities: attributes.liabilities as BalanceSheet['liabilities'],
    totalLiabilities: (attributes.total_liabilities || attributes.totalLiabilities) as number,

    equity: attributes.equity as BalanceSheet['equity'],
    totalEquity: (attributes.total_equity || attributes.totalEquity) as number,

    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformBalanceSheetResponse(response: Record<string, unknown>): ReportResponse<BalanceSheet> {
  if (!response?.data) {
    throw new Error('Invalid balance sheet response')
  }

  return {
    data: transformJsonApiBalanceSheet(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// INCOME STATEMENT
// ============================================================================

export function transformJsonApiIncomeStatement(resource: Record<string, unknown>): IncomeStatement {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    period: {
      startDate: (attributes.start_date || attributes.startDate) as string,
      endDate: (attributes.end_date || attributes.endDate) as string,
    },
    currency: attributes.currency as string,

    revenue: attributes.revenue as IncomeStatement['revenue'],
    costOfGoodsSold: (attributes.cost_of_goods_sold || attributes.costOfGoodsSold) as number,
    grossProfit: (attributes.gross_profit || attributes.grossProfit) as number,
    grossProfitMargin: (attributes.gross_profit_margin || attributes.grossProfitMargin) as number,

    operatingExpenses: (attributes.operating_expenses || attributes.operatingExpenses) as IncomeStatement['operatingExpenses'],
    operatingIncome: (attributes.operating_income || attributes.operatingIncome) as number,
    operatingMargin: (attributes.operating_margin || attributes.operatingMargin) as number,

    otherIncomeExpenses: (attributes.other_income_expenses || attributes.otherIncomeExpenses) as IncomeStatement['otherIncomeExpenses'],
    netIncome: (attributes.net_income || attributes.netIncome) as number,
    netProfitMargin: (attributes.net_profit_margin || attributes.netProfitMargin) as number,

    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformIncomeStatementResponse(response: Record<string, unknown>): ReportResponse<IncomeStatement> {
  if (!response?.data) {
    throw new Error('Invalid income statement response')
  }

  return {
    data: transformJsonApiIncomeStatement(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// CASH FLOW
// ============================================================================

export function transformJsonApiCashFlow(resource: Record<string, unknown>): CashFlow {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    period: {
      startDate: (attributes.start_date || attributes.startDate) as string,
      endDate: (attributes.end_date || attributes.endDate) as string,
    },
    currency: attributes.currency as string,

    operatingActivities: (attributes.operating_activities || attributes.operatingActivities) as CashFlow['operatingActivities'],
    netCashFromOperations: (attributes.net_cash_from_operations || attributes.netCashFromOperations) as number,

    investingActivities: (attributes.investing_activities || attributes.investingActivities) as CashFlow['investingActivities'],
    netCashFromInvesting: (attributes.net_cash_from_investing || attributes.netCashFromInvesting) as number,

    financingActivities: (attributes.financing_activities || attributes.financingActivities) as CashFlow['financingActivities'],
    netCashFromFinancing: (attributes.net_cash_from_financing || attributes.netCashFromFinancing) as number,

    netCashChange: (attributes.net_cash_change || attributes.netCashChange) as number,
    beginningCash: (attributes.beginning_cash || attributes.beginningCash) as number,
    endingCash: (attributes.ending_cash || attributes.endingCash) as number,

    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformCashFlowResponse(response: Record<string, unknown>): ReportResponse<CashFlow> {
  if (!response?.data) {
    throw new Error('Invalid cash flow response')
  }

  return {
    data: transformJsonApiCashFlow(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// TRIAL BALANCE
// ============================================================================

export function transformJsonApiTrialBalance(resource: Record<string, unknown>): TrialBalance {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    asOfDate: (attributes.as_of_date || attributes.asOfDate) as string,
    currency: attributes.currency as string,

    accounts: attributes.accounts as TrialBalance['accounts'],

    totalDebit: (attributes.total_debit || attributes.totalDebit) as number,
    totalCredit: (attributes.total_credit || attributes.totalCredit) as number,
    balanced: attributes.balanced as boolean,

    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformTrialBalanceResponse(response: Record<string, unknown>): ReportResponse<TrialBalance> {
  if (!response?.data) {
    throw new Error('Invalid trial balance response')
  }

  return {
    data: transformJsonApiTrialBalance(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// AR AGING REPORT
// ============================================================================

export function transformJsonApiARAgingReport(resource: Record<string, unknown>): ARAgingReport {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    asOfDate: (attributes.as_of_date || attributes.asOfDate) as string,
    currency: attributes.currency as string,

    summary: {
      current: (attributes.summary as Record<string, unknown>).current as number,
      days30: (attributes.summary as Record<string, unknown>).days30 as number,
      days60: (attributes.summary as Record<string, unknown>).days60 as number,
      days90Plus: (attributes.summary as Record<string, unknown>).days90Plus as number,
      total: (attributes.summary as Record<string, unknown>).total as number,
    },

    customers: attributes.customers as ARAgingReport['customers'],

    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformARAgingReportResponse(response: Record<string, unknown>): ReportResponse<ARAgingReport> {
  if (!response?.data) {
    throw new Error('Invalid AR aging report response')
  }

  return {
    data: transformJsonApiARAgingReport(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// AP AGING REPORT
// ============================================================================

export function transformJsonApiAPAgingReport(resource: Record<string, unknown>): APAgingReport {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    asOfDate: (attributes.as_of_date || attributes.asOfDate) as string,
    currency: attributes.currency as string,

    summary: {
      current: (attributes.summary as Record<string, unknown>).current as number,
      days30: (attributes.summary as Record<string, unknown>).days30 as number,
      days60: (attributes.summary as Record<string, unknown>).days60 as number,
      days90Plus: (attributes.summary as Record<string, unknown>).days90Plus as number,
      total: (attributes.summary as Record<string, unknown>).total as number,
    },

    suppliers: attributes.suppliers as APAgingReport['suppliers'],

    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformAPAgingReportResponse(response: Record<string, unknown>): ReportResponse<APAgingReport> {
  if (!response?.data) {
    throw new Error('Invalid AP aging report response')
  }

  return {
    data: transformJsonApiAPAgingReport(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// SALES BY CUSTOMER
// ============================================================================

export function transformJsonApiSalesByCustomer(resource: Record<string, unknown>): SalesByCustomer {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    period: {
      startDate: (attributes.start_date || attributes.startDate) as string,
      endDate: (attributes.end_date || attributes.endDate) as string,
    },
    currency: attributes.currency as string,

    customers: attributes.customers as SalesByCustomer['customers'],

    totalSales: (attributes.total_sales || attributes.totalSales) as number,
    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformSalesByCustomerResponse(response: Record<string, unknown>): ReportResponse<SalesByCustomer> {
  if (!response?.data) {
    throw new Error('Invalid sales by customer response')
  }

  return {
    data: transformJsonApiSalesByCustomer(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// SALES BY PRODUCT
// ============================================================================

export function transformJsonApiSalesByProduct(resource: Record<string, unknown>): SalesByProduct {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    period: {
      startDate: (attributes.start_date || attributes.startDate) as string,
      endDate: (attributes.end_date || attributes.endDate) as string,
    },
    currency: attributes.currency as string,

    products: attributes.products as SalesByProduct['products'],

    totalRevenue: (attributes.total_revenue || attributes.totalRevenue) as number,
    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformSalesByProductResponse(response: Record<string, unknown>): ReportResponse<SalesByProduct> {
  if (!response?.data) {
    throw new Error('Invalid sales by product response')
  }

  return {
    data: transformJsonApiSalesByProduct(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// PURCHASE BY SUPPLIER
// ============================================================================

export function transformJsonApiPurchaseBySupplier(resource: Record<string, unknown>): PurchaseBySupplier {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    period: {
      startDate: (attributes.start_date || attributes.startDate) as string,
      endDate: (attributes.end_date || attributes.endDate) as string,
    },
    currency: attributes.currency as string,

    suppliers: attributes.suppliers as PurchaseBySupplier['suppliers'],

    totalPurchases: (attributes.total_purchases || attributes.totalPurchases) as number,
    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformPurchaseBySupplierResponse(response: Record<string, unknown>): ReportResponse<PurchaseBySupplier> {
  if (!response?.data) {
    throw new Error('Invalid purchase by supplier response')
  }

  return {
    data: transformJsonApiPurchaseBySupplier(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}

// ============================================================================
// PURCHASE BY PRODUCT
// ============================================================================

export function transformJsonApiPurchaseByProduct(resource: Record<string, unknown>): PurchaseByProduct {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: resource.id as string,
    period: {
      startDate: (attributes.start_date || attributes.startDate) as string,
      endDate: (attributes.end_date || attributes.endDate) as string,
    },
    currency: attributes.currency as string,

    products: attributes.products as PurchaseByProduct['products'],

    totalCost: (attributes.total_cost || attributes.totalCost) as number,
    generatedAt: (attributes.generated_at || attributes.generatedAt) as string,
  }
}

export function transformPurchaseByProductResponse(response: Record<string, unknown>): ReportResponse<PurchaseByProduct> {
  if (!response?.data) {
    throw new Error('Invalid purchase by product response')
  }

  return {
    data: transformJsonApiPurchaseByProduct(response.data as Record<string, unknown>),
    meta: response.meta as Record<string, unknown> | undefined,
  }
}
