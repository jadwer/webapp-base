/**
 * Reports Module - Main Entry Point
 *
 * Centralized exports for the Reports module
 * Read-only reports generated dynamically from other modules
 */

// Types
export type {
  AccountLine,
  ReportPeriod,
  BalanceSheet,
  IncomeStatement,
  CashFlow,
  TrialBalance,
  AgingSummary,
  AgingCustomerLine,
  ARAgingReport,
  APAgingReport,
  SalesByCustomer,
  SalesByProduct,
  PurchaseBySupplier,
  PurchaseByProduct,
  BalanceSheetFilters,
  PeriodReportFilters,
  AgingReportFilters,
  ReportResponse,
} from './types'

// Services
export {
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
} from './services'

// Hooks
export {
  useBalanceSheet,
  useIncomeStatement,
  useCashFlow,
  useTrialBalance,
  useARAgingReport,
  useAPAgingReport,
  useSalesByCustomer,
  useSalesByProduct,
  usePurchaseBySupplier,
  usePurchaseByProduct,
} from './hooks'

// Transformers
export {
  transformJsonApiBalanceSheet,
  transformBalanceSheetResponse,
  transformJsonApiIncomeStatement,
  transformIncomeStatementResponse,
  transformJsonApiCashFlow,
  transformCashFlowResponse,
  transformJsonApiTrialBalance,
  transformTrialBalanceResponse,
  transformJsonApiARAgingReport,
  transformARAgingReportResponse,
  transformJsonApiAPAgingReport,
  transformAPAgingReportResponse,
  transformJsonApiSalesByCustomer,
  transformSalesByCustomerResponse,
  transformJsonApiSalesByProduct,
  transformSalesByProductResponse,
  transformJsonApiPurchaseBySupplier,
  transformPurchaseBySupplierResponse,
  transformJsonApiPurchaseByProduct,
  transformPurchaseByProductResponse,
} from './utils/transformers'

// Components
export {
  ReportsIndexPage,
  FinancialStatementsPage,
} from './components'
