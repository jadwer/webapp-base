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
} from '../../types';

// ============================================================================
// COMMON HELPERS
// ============================================================================

export const createMockAccountLine = (overrides?: Partial<AccountLine>): AccountLine => ({
  code: '1000',
  name: 'Test Account',
  amount: 1000,
  ...overrides,
});

export const createMockAgingSummary = (overrides?: Partial<AgingSummary>): AgingSummary => ({
  current: 1000,
  days30: 500,
  days60: 300,
  days90Plus: 200,
  total: 2000,
  ...overrides,
});

export const createMockAgingCustomerLine = (
  overrides?: Partial<AgingCustomerLine>
): AgingCustomerLine => ({
  contactId: 1,
  contactName: 'Test Customer',
  current: 500,
  days30: 250,
  days60: 150,
  days90Plus: 100,
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
  assets: {
    current: [createMockAccountLine({ code: '1100', name: 'Current Assets', amount: 5000 })],
    nonCurrent: [createMockAccountLine({ code: '1200', name: 'Fixed Assets', amount: 10000 })],
  },
  totalAssets: 15000,
  liabilities: {
    current: [createMockAccountLine({ code: '2100', name: 'Current Liabilities', amount: 3000 })],
    nonCurrent: [createMockAccountLine({ code: '2200', name: 'Long-term Debt', amount: 5000 })],
  },
  totalLiabilities: 8000,
  equity: [createMockAccountLine({ code: '3000', name: 'Equity', amount: 7000 })],
  totalEquity: 7000,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockIncomeStatement = (
  overrides?: Partial<IncomeStatement>
): IncomeStatement => ({
  id: '1',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  revenue: [createMockAccountLine({ code: '4000', name: 'Sales Revenue', amount: 100000 })],
  costOfGoodsSold: 60000,
  grossProfit: 40000,
  grossProfitMargin: 40,
  operatingExpenses: [createMockAccountLine({ code: '5000', name: 'Operating Expenses', amount: 20000 })],
  operatingIncome: 20000,
  operatingMargin: 20,
  otherIncomeExpenses: [createMockAccountLine({ code: '6000', name: 'Interest', amount: -2000 })],
  netIncome: 18000,
  netProfitMargin: 18,
  generatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCashFlow = (overrides?: Partial<CashFlow>): CashFlow => ({
  id: '1',
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
  operatingActivities: [createMockAccountLine({ code: 'OP1', name: 'Operations', amount: 5000 })],
  netCashFromOperations: 5000,
  investingActivities: [createMockAccountLine({ code: 'INV1', name: 'Investments', amount: -2000 })],
  netCashFromInvesting: -2000,
  financingActivities: [createMockAccountLine({ code: 'FIN1', name: 'Financing', amount: 1000 })],
  netCashFromFinancing: 1000,
  netCashChange: 4000,
  beginningCash: 10000,
  endingCash: 14000,
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
      debit: 10000,
      credit: 0,
    },
    {
      code: '2000',
      name: 'Accounts Payable',
      debit: 0,
      credit: 10000,
    },
  ],
  totalDebit: 10000,
  totalCredit: 10000,
  balanced: true,
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
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
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
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
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
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
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
  period: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  currency: 'MXN',
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
