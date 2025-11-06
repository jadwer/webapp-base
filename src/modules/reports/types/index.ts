/**
 * Reports Module - TypeScript Types
 *
 * Read-only reports generated dynamically from Accounting, Finance, Sales, and Purchase modules
 * All reports are virtual resources (no database tables)
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface AccountLine {
  code: string
  name: string
  amount: number
}

export interface ReportPeriod {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

// ============================================================================
// FINANCIAL STATEMENTS
// ============================================================================

export interface BalanceSheet {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string
  balanced: boolean

  assets: {
    current: AccountLine[]
    nonCurrent: AccountLine[]
  }
  totalAssets: number

  liabilities: {
    current: AccountLine[]
    nonCurrent: AccountLine[]
  }
  totalLiabilities: number

  equity: AccountLine[]
  totalEquity: number

  generatedAt: string // ISO 8601
}

export interface IncomeStatement {
  id: string
  period: ReportPeriod
  currency: string

  revenue: AccountLine[]
  costOfGoodsSold: number
  grossProfit: number
  grossProfitMargin: number // Percentage

  operatingExpenses: AccountLine[]
  operatingIncome: number
  operatingMargin: number // Percentage

  otherIncomeExpenses: AccountLine[]
  netIncome: number
  netProfitMargin: number // Percentage

  generatedAt: string // ISO 8601
}

export interface CashFlow {
  id: string
  period: ReportPeriod
  currency: string

  operatingActivities: AccountLine[]
  netCashFromOperations: number

  investingActivities: AccountLine[]
  netCashFromInvesting: number

  financingActivities: AccountLine[]
  netCashFromFinancing: number

  netCashChange: number
  beginningCash: number
  endingCash: number

  generatedAt: string // ISO 8601
}

export interface TrialBalance {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string

  accounts: {
    code: string
    name: string
    debit: number
    credit: number
  }[]

  totalDebit: number
  totalCredit: number
  balanced: boolean // totalDebit === totalCredit

  generatedAt: string // ISO 8601
}

// ============================================================================
// AGING REPORTS
// ============================================================================

export interface AgingSummary {
  current: number      // 0-30 days
  days30: number       // 31-60 days
  days60: number       // 61-90 days
  days90Plus: number   // 90+ days
  total: number
}

export interface AgingCustomerLine {
  contactId: number
  contactName: string
  current: number
  days30: number
  days60: number
  days90Plus: number
  total: number
}

export interface ARAgingReport {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string

  summary: AgingSummary
  customers: AgingCustomerLine[]

  generatedAt: string // ISO 8601
}

export interface APAgingReport {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string

  summary: AgingSummary
  suppliers: AgingCustomerLine[] // Same structure, different label

  generatedAt: string // ISO 8601
}

// ============================================================================
// MANAGEMENT REPORTS
// ============================================================================

export interface SalesByCustomer {
  id: string
  period: ReportPeriod
  currency: string

  customers: {
    contactId: number
    contactName: string
    orderCount: number
    totalSales: number
    averageOrderValue: number
  }[]

  totalSales: number
  generatedAt: string // ISO 8601
}

export interface SalesByProduct {
  id: string
  period: ReportPeriod
  currency: string

  products: {
    productId: number
    productName: string
    quantitySold: number
    totalRevenue: number
    averagePrice: number
  }[]

  totalRevenue: number
  generatedAt: string // ISO 8601
}

export interface PurchaseBySupplier {
  id: string
  period: ReportPeriod
  currency: string

  suppliers: {
    contactId: number
    contactName: string
    orderCount: number
    totalPurchases: number
    averageOrderValue: number
  }[]

  totalPurchases: number
  generatedAt: string // ISO 8601
}

export interface PurchaseByProduct {
  id: string
  period: ReportPeriod
  currency: string

  products: {
    productId: number
    productName: string
    quantityPurchased: number
    totalCost: number
    averagePrice: number
  }[]

  totalCost: number
  generatedAt: string // ISO 8601
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface BalanceSheetFilters {
  asOfDate?: string
  currency?: string
}

export interface PeriodReportFilters {
  startDate: string
  endDate: string
  currency?: string
}

export interface AgingReportFilters {
  asOfDate?: string
  currency?: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ReportResponse<T> {
  data: T
  meta?: Record<string, unknown>
}
