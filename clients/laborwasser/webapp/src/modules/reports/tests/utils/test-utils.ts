/**
 * Reports Module - Test Utilities
 * Mock factories for report entities
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
  AccountLine,
  AgingCustomerLine,
  AgingSummary,
  CategoryGroup,
  AgingTotals,
  AgingBucket,
  TrialBalanceAccount,
} from '../../types';

// ============================================================================
// COMMON HELPERS
// ============================================================================

export const createMockAccountLine = (overrides?: Partial<AccountLine>): AccountLine => ({
  code: '1000',
  name: 'Test Account',
  accountType: 'asset',
  balance: 1000,
  amount: 1000,
  ...overrides,
});

export const createMockCategoryGroup = (overrides?: Partial<CategoryGroup>): CategoryGroup => ({
  category: 'Test Category',
  accounts: [createMockAccountLine()],
  subtotal: 1000,
  ...overrides,
});

export const createMockTrialBalanceAccount = (overrides?: Partial<TrialBalanceAccount>): TrialBalanceAccount => ({
  code: '1000',
  name: 'Test Account',
  type: 'asset',
  debit: 1000,
  credit: 0,
  ...overrides,
});

export const createMockAgingTotals = (overrides?: Partial<AgingTotals>): AgingTotals => ({
  current: 1000,
  days1To30: 500,
  days31To60: 300,
  days61To90: 200,
  daysOver90: 100,
  total: 2100,
  ...overrides,
});

export const createMockAgingBucket = (overrides?: Partial<AgingBucket>): AgingBucket => ({
  customerId: 1,
  customerName: 'Test Customer',
  current: 500,
  days1To30: 250,
  days31To60: 150,
  days61To90: 100,
  daysOver90: 50,
  total: 1050,
  ...overrides,
});

// Legacy helpers (kept for backward compatibility)
export const createMockAgingSummary = (overrides?: Partial<AgingSummary>): AgingSummary => ({
  current: 1000,
  days30: 500,
  days60: 300,
  days90Plus: 200,
  days1To30: 500,
  days31To60: 300,
  days61To90: 200,
  daysOver90: 100,
  total: 2000,
  ...overrides,
});

export const createMockAgingCustomerLine = (
  overrides?: Partial<AgingCustomerLine>
): AgingCustomerLine => ({
  contactId: 1,
  customerId: 1,
  contactName: 'Test Customer',
  customerName: 'Test Customer',
  current: 500,
  days30: 250,
  days60: 150,
  days90Plus: 100,
  days1To30: 250,
  days31To60: 150,
  days61To90: 100,
  daysOver90: 50,
  total: 1000,
  ...overrides,
});

// ============================================================================
// FINANCIAL STATEMENTS MOCKS
// ============================================================================

export const createMockBalanceSheet = (
  overrides?: Partial<BalanceSheet>
): BalanceSheet => ({
  id: '1',
  asOfDate: '2025-01-01',
  currency: 'MXN',
  balanced: true,
  assets: [
    createMockCategoryGroup({ category: 'Current Assets', subtotal: 5000 }),
    createMockCategoryGroup({ category: 'Fixed Assets', subtotal: 10000 }),
  ],
  totalAssets: 15000,
  liabilities: [
    createMockCategoryGroup({ category: 'Current Liabilities', subtotal: 3000 }),
    createMockCategoryGroup({ category: 'Long-term Debt', subtotal: 5000 }),
  ],
  totalLiabilities: 8000,
  equity: [createMockCategoryGroup({ category: 'Equity', subtotal: 7000 })],
  totalEquity: 7000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockIncomeStatement = (
  overrides?: Partial<IncomeStatement>
): IncomeStatement => ({
  id: '1',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  revenues: [createMockCategoryGroup({ category: 'Sales Revenue', subtotal: 100000 })],
  totalRevenues: 100000,
  expenses: [createMockCategoryGroup({ category: 'Operating Expenses', subtotal: 80000 })],
  totalExpenses: 80000,
  netIncome: 20000,
  // Legacy fields
  revenue: [createMockAccountLine({ code: '4000', name: 'Sales Revenue', balance: 100000 })],
  costOfGoodsSold: 60000,
  grossProfit: 40000,
  grossProfitMargin: 40,
  operatingExpenses: [createMockAccountLine({ code: '5000', name: 'Operating Expenses', balance: 20000 })],
  operatingIncome: 20000,
  operatingMargin: 20,
  otherIncomeExpenses: [createMockAccountLine({ code: '6000', name: 'Interest', balance: -2000 })],
  netProfitMargin: 18,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCashFlow = (overrides?: Partial<CashFlow>): CashFlow => ({
  id: '1',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  // Backend structure
  beginningCash: 10000,
  operatingActivities: 5000,
  investingActivities: -2000,
  financingActivities: 1000,
  netCashFlow: 4000,
  endingCash: 14000,
  // Legacy fields
  operatingActivitiesLines: [createMockAccountLine({ code: 'OP1', name: 'Operations', balance: 5000 })],
  netCashFromOperations: 5000,
  investingActivitiesLines: [createMockAccountLine({ code: 'INV1', name: 'Investments', balance: -2000 })],
  netCashFromInvesting: -2000,
  financingActivitiesLines: [createMockAccountLine({ code: 'FIN1', name: 'Financing', balance: 1000 })],
  netCashFromFinancing: 1000,
  netCashChange: 4000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTrialBalance = (
  overrides?: Partial<TrialBalance>
): TrialBalance => ({
  id: '1',
  asOfDate: '2025-01-01',
  currency: 'MXN',
  accounts: [
    {
      code: '1000',
      name: 'Cash',
      type: 'asset',
      debit: 10000,
      credit: 0,
    },
    {
      code: '2000',
      name: 'Accounts Payable',
      type: 'liability',
      debit: 0,
      credit: 10000,
    },
  ],
  // Backend structure
  totals: {
    debit: 10000,
    credit: 10000,
  },
  summaryByType: [
    { type: 'asset', totalDebit: 10000, totalCredit: 0, count: 1 },
    { type: 'liability', totalDebit: 0, totalCredit: 10000, count: 1 },
  ],
  balanced: true,
  // Legacy fields
  totalDebit: 10000,
  totalCredit: 10000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

// ============================================================================
// AGING REPORTS MOCKS
// ============================================================================

export const createMockARAgingReport = (
  overrides?: Partial<ARAgingReport>
): ARAgingReport => ({
  id: '1',
  asOfDate: '2025-01-01',
  currency: 'MXN',
  // Backend structure
  agingBuckets: [
    createMockAgingBucket({ customerId: 1, customerName: 'Customer A' }),
    createMockAgingBucket({ customerId: 2, customerName: 'Customer B' }),
  ],
  totals: createMockAgingTotals(),
  // Legacy frontend structure
  summary: createMockAgingSummary(),
  customers: [
    createMockAgingCustomerLine({ contactId: 1, contactName: 'Customer A' }),
    createMockAgingCustomerLine({ contactId: 2, contactName: 'Customer B' }),
  ],
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockAPAgingReport = (
  overrides?: Partial<APAgingReport>
): APAgingReport => ({
  id: '1',
  asOfDate: '2025-01-01',
  currency: 'MXN',
  // Backend structure
  agingBuckets: [
    createMockAgingBucket({ customerId: 1, customerName: 'Supplier A' }),
    createMockAgingBucket({ customerId: 2, customerName: 'Supplier B' }),
  ],
  totals: createMockAgingTotals(),
  // Legacy frontend structure
  summary: createMockAgingSummary(),
  suppliers: [
    createMockAgingCustomerLine({ contactId: 1, contactName: 'Supplier A' }),
    createMockAgingCustomerLine({ contactId: 2, contactName: 'Supplier B' }),
  ],
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

// ============================================================================
// MANAGEMENT REPORTS MOCKS
// ============================================================================

export const createMockSalesByCustomer = (
  overrides?: Partial<SalesByCustomer>
): SalesByCustomer => ({
  id: '1',
  // Backend uses startDate/endDate directly
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  // Backend structure
  salesByCustomer: [
    { customerId: 1, customerName: 'Customer A', orderCount: 10, totalSales: 50000 },
    { customerId: 2, customerName: 'Customer B', orderCount: 5, totalSales: 25000 },
  ],
  summary: {
    totalCustomers: 2,
    totalOrders: 15,
    totalSales: 75000,
  },
  // Legacy frontend structure
  customers: [
    {
      contactId: 1,
      contactName: 'Customer A',
      orderCount: 10,
      totalSales: 50000,
      averageOrderValue: 5000,
    },
    {
      contactId: 2,
      contactName: 'Customer B',
      orderCount: 5,
      totalSales: 25000,
      averageOrderValue: 5000,
    },
  ],
  totalSales: 75000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockSalesByProduct = (
  overrides?: Partial<SalesByProduct>
): SalesByProduct => ({
  id: '1',
  // Backend uses startDate/endDate directly
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  // Backend structure
  salesByProduct: [
    { productId: 1, productName: 'Product A', quantitySold: 100, totalRevenue: 50000 },
    { productId: 2, productName: 'Product B', quantitySold: 50, totalRevenue: 25000 },
  ],
  summary: {
    totalProducts: 2,
    totalQuantity: 150,
    totalRevenue: 75000,
  },
  // Legacy frontend structure
  products: [
    {
      productId: 1,
      productName: 'Product A',
      quantitySold: 100,
      totalRevenue: 50000,
      averagePrice: 500,
    },
    {
      productId: 2,
      productName: 'Product B',
      quantitySold: 50,
      totalRevenue: 25000,
      averagePrice: 500,
    },
  ],
  totalRevenue: 75000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPurchaseBySupplier = (
  overrides?: Partial<PurchaseBySupplier>
): PurchaseBySupplier => ({
  id: '1',
  // Backend uses startDate/endDate directly
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  // Backend structure
  purchaseBySupplier: [
    { supplierId: 1, supplierName: 'Supplier A', orderCount: 10, totalPurchases: 30000 },
    { supplierId: 2, supplierName: 'Supplier B', orderCount: 5, totalPurchases: 15000 },
  ],
  summary: {
    totalSuppliers: 2,
    totalOrders: 15,
    totalPurchases: 45000,
  },
  // Legacy frontend structure
  suppliers: [
    {
      contactId: 1,
      contactName: 'Supplier A',
      orderCount: 10,
      totalPurchases: 30000,
      averageOrderValue: 3000,
    },
    {
      contactId: 2,
      contactName: 'Supplier B',
      orderCount: 5,
      totalPurchases: 15000,
      averageOrderValue: 3000,
    },
  ],
  totalPurchases: 45000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPurchaseByProduct = (
  overrides?: Partial<PurchaseByProduct>
): PurchaseByProduct => ({
  id: '1',
  // Backend uses startDate/endDate directly
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  // Backend structure
  purchaseByProduct: [
    { productId: 1, productName: 'Product A', quantityPurchased: 100, totalCost: 30000 },
    { productId: 2, productName: 'Product B', quantityPurchased: 50, totalCost: 15000 },
  ],
  summary: {
    totalProducts: 2,
    totalQuantity: 150,
    totalCost: 45000,
  },
  // Legacy frontend structure
  products: [
    {
      productId: 1,
      productName: 'Product A',
      quantityPurchased: 100,
      totalCost: 30000,
      averagePrice: 300,
    },
    {
      productId: 2,
      productName: 'Product B',
      quantityPurchased: 50,
      totalCost: 15000,
      averagePrice: 300,
    },
  ],
  totalCost: 45000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

export const createMockReportResponse = <T>(data: T) => ({
  data,
});

export const createMockAxiosError = (status: number, message: string) => {
  const error = new Error(message) as Error & { response?: { status: number; data: unknown } };
  error.response = {
    status,
    data: { message },
  };
  return error;
};
