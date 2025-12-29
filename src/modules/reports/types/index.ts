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
  accountType: string // Backend includes account_type
  balance: number // Backend uses balance
  amount?: number // Legacy frontend field
}

export interface CategoryGroup {
  category: string
  accounts: AccountLine[]
  subtotal: number
}

export interface ReportPeriod {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

export interface TrialBalanceAccount {
  code: string
  name: string
  type: string
  debit: number
  credit: number
}

// ============================================================================
// FINANCIAL STATEMENTS
// ============================================================================

export interface BalanceSheet {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string
  balanced: boolean

  // Backend structure (CategoryGroup[])
  assets: CategoryGroup[]
  totalAssets: number

  liabilities: CategoryGroup[]
  totalLiabilities: number

  equity: CategoryGroup[]
  totalEquity: number

  generatedAt: string // ISO 8601
}

export interface IncomeStatement {
  id: string
  // Backend uses startDate/endDate directly, not nested period
  startDate: string
  endDate: string
  period?: ReportPeriod // Legacy frontend field
  currency: string

  // Backend structure
  revenues: CategoryGroup[]
  totalRevenues: number

  expenses: CategoryGroup[]
  totalExpenses: number

  netIncome: number

  // Legacy frontend fields
  revenue?: AccountLine[]
  costOfGoodsSold?: number
  grossProfit?: number
  grossProfitMargin?: number
  operatingExpenses?: AccountLine[]
  operatingIncome?: number
  operatingMargin?: number
  otherIncomeExpenses?: AccountLine[]
  netProfitMargin?: number

  generatedAt: string // ISO 8601
}

export interface CashFlow {
  id: string
  // Backend uses startDate/endDate directly
  startDate: string
  endDate: string
  period?: ReportPeriod // Legacy frontend field
  currency: string

  // Backend structure (simpler, just totals)
  beginningCash: number
  operatingActivities: number
  investingActivities: number
  financingActivities: number
  netCashFlow: number
  endingCash: number

  // Legacy frontend fields (detailed lines)
  operatingActivitiesLines?: AccountLine[]
  netCashFromOperations?: number
  investingActivitiesLines?: AccountLine[]
  netCashFromInvesting?: number
  financingActivitiesLines?: AccountLine[]
  netCashFromFinancing?: number
  netCashChange?: number

  generatedAt: string // ISO 8601
}

export interface TrialBalance {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string

  // Backend structure
  accounts: TrialBalanceAccount[]
  totals: {
    debit: number
    credit: number
  }
  summaryByType: {
    type: string
    totalDebit: number
    totalCredit: number
    count: number
  }[]
  balanced: boolean

  // Legacy frontend fields
  totalDebit?: number
  totalCredit?: number

  generatedAt: string // ISO 8601
}

// ============================================================================
// AGING REPORTS
// ============================================================================

// Backend structure for aging totals
export interface AgingTotals {
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  daysOver90: number
  total: number
}

// Backend structure for aging bucket (per customer/supplier)
export interface AgingBucket {
  customerId: number | null
  customerName: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  daysOver90: number
  total: number
}

// Legacy frontend structures
export interface AgingSummary {
  current: number
  days30?: number // Legacy
  days60?: number // Legacy
  days90Plus?: number // Legacy
  days1To30?: number // Backend
  days31To60?: number // Backend
  days61To90?: number // Backend
  daysOver90?: number // Backend
  total: number
}

export interface AgingCustomerLine {
  contactId?: number // Legacy
  customerId?: number | null // Backend
  contactName?: string // Legacy
  customerName?: string // Backend
  current: number
  days30?: number
  days60?: number
  days90Plus?: number
  days1To30?: number
  days31To60?: number
  days61To90?: number
  daysOver90?: number
  total: number
}

export interface ARAgingReport {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string

  // Backend structure
  agingBuckets: AgingBucket[]
  totals: AgingTotals

  // Legacy frontend structure
  summary?: AgingSummary
  customers?: AgingCustomerLine[]

  generatedAt: string // ISO 8601
}

export interface APAgingReport {
  id: string
  asOfDate: string // YYYY-MM-DD
  currency: string

  // Backend structure (same as AR)
  agingBuckets: AgingBucket[]
  totals: AgingTotals

  // Legacy frontend structure
  summary?: AgingSummary
  suppliers?: AgingCustomerLine[]

  generatedAt: string // ISO 8601
}

// ============================================================================
// MANAGEMENT REPORTS
// ============================================================================

// Backend structure for customer sales
export interface CustomerSales {
  customerId: number | null
  customerName: string
  orderCount: number
  totalSales: number
}

// Backend structure for product sales
export interface ProductSales {
  productId: number
  productName: string
  quantitySold: number
  totalRevenue: number
}

export interface SalesByCustomer {
  id: string
  // Backend uses startDate/endDate directly
  startDate: string
  endDate: string
  period?: ReportPeriod // Legacy
  currency: string

  // Backend structure
  salesByCustomer: CustomerSales[]
  summary: {
    totalCustomers: number
    totalOrders: number
    totalSales: number
  }

  // Legacy frontend structure
  customers?: {
    contactId: number
    contactName: string
    orderCount: number
    totalSales: number
    averageOrderValue: number
  }[]
  totalSales?: number

  generatedAt: string // ISO 8601
}

export interface SalesByProduct {
  id: string
  startDate: string
  endDate: string
  period?: ReportPeriod // Legacy
  currency: string

  // Backend structure
  salesByProduct: ProductSales[]
  summary: {
    totalProducts: number
    totalQuantity: number
    totalRevenue: number
  }

  // Legacy frontend structure
  products?: {
    productId: number
    productName: string
    quantitySold: number
    totalRevenue: number
    averagePrice: number
  }[]
  totalRevenue?: number

  generatedAt: string // ISO 8601
}

export interface PurchaseBySupplier {
  id: string
  startDate: string
  endDate: string
  period?: ReportPeriod // Legacy
  currency: string

  // Backend structure (similar to SalesByCustomer)
  purchaseBySupplier: {
    supplierId: number | null
    supplierName: string
    orderCount: number
    totalPurchases: number
  }[]
  summary: {
    totalSuppliers: number
    totalOrders: number
    totalPurchases: number
  }

  // Legacy frontend structure
  suppliers?: {
    contactId: number
    contactName: string
    orderCount: number
    totalPurchases: number
    averageOrderValue: number
  }[]
  totalPurchases?: number

  generatedAt: string // ISO 8601
}

export interface PurchaseByProduct {
  id: string
  startDate: string
  endDate: string
  period?: ReportPeriod // Legacy
  currency: string

  // Backend structure (similar to SalesByProduct)
  purchaseByProduct: {
    productId: number
    productName: string
    quantityPurchased: number
    totalCost: number
  }[]
  summary: {
    totalProducts: number
    totalQuantity: number
    totalCost: number
  }

  // Legacy frontend structure
  products?: {
    productId: number
    productName: string
    quantityPurchased: number
    totalCost: number
    averagePrice: number
  }[]
  totalCost?: number

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
