// Finance Module Test Utilities
// Mock factories and utilities for testing Finance module
// Synced with FINANCE_FRONTEND_GUIDE.md 2025-12-28

import type { APInvoice, APPayment, ARInvoice, ARReceipt, BankAccount, PaymentApplication, PaymentMethod, Payment, BankTransaction, ParsedBankTransaction } from '../../types'

// Mock AP Invoice factory
export const createMockAPInvoice = (overrides?: Partial<APInvoice>): APInvoice => ({
  id: '1',
  contactId: 1,
  contactName: 'Test Supplier',
  invoiceNumber: 'FACT-001',
  invoiceDate: '2025-08-20',
  dueDate: '2025-09-20',
  purchaseOrderId: null,
  currency: 'MXN',
  subtotal: 1000.00,
  taxAmount: 160.00,
  totalAmount: 1160.00,
  status: 'draft',
  paidAmount: 0.00,
  paidDate: null,
  journalEntryId: null,
  fiscalPeriodId: null,
  isRefund: false,
  refundOfInvoiceId: null,
  voidedAt: null,
  voidedById: null,
  voidReason: null,
  notes: null,
  metadata: null,
  isActive: true,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock AR Invoice factory
export const createMockARInvoice = (overrides?: Partial<ARInvoice>): ARInvoice => ({
  id: '1',
  contactId: 10,
  contactName: 'Test Customer',
  invoiceNumber: 'INV-001',
  invoiceDate: '2025-08-20',
  dueDate: '2025-09-20',
  salesOrderId: null,
  currency: 'MXN',
  subtotal: 2000.00,
  taxAmount: 320.00,
  totalAmount: 2320.00,
  status: 'sent',
  paidAmount: 500.00,
  paidDate: null,
  journalEntryId: null,
  fiscalPeriodId: null,
  isRefund: false,
  refundOfInvoiceId: null,
  voidedAt: null,
  voidedById: null,
  voidReason: null,
  // FI-M002: Early Payment Discount fields
  discountPercent: null,
  discountDays: null,
  discountDate: null,
  discountAmount: null,
  discountApplied: false,
  discountAppliedAmount: null,
  discountAppliedDate: null,
  notes: null,
  metadata: null,
  isActive: true,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock Payment factory (unified for AR/AP per backend)
export const createMockPayment = (overrides?: Partial<Payment>): Payment => ({
  id: '1',
  paymentNumber: 'PAY-001',
  paymentDate: '2025-08-20',
  contactId: 1,
  bankAccountId: 1,
  paymentMethodId: 1,
  amount: 1160.00,
  currency: 'MXN',
  appliedAmount: 0,
  unappliedAmount: 1160.00,
  status: 'pending',
  journalEntryId: null,
  reference: 'TXN-12345',
  notes: null,
  metadata: null,
  isActive: true,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Legacy: Mock AP Payment factory (alias for Payment with AP-specific fields)
export const createMockAPPayment = (overrides?: Partial<APPayment>): APPayment => ({
  ...createMockPayment(),
  apInvoiceId: 1,
  paymentMethod: 'transfer',
  ...overrides,
})

// Legacy: Mock AR Receipt factory (alias for Payment with AR-specific fields)
export const createMockARReceipt = (overrides?: Partial<ARReceipt>): ARReceipt => ({
  ...createMockPayment(),
  arInvoiceId: 1,
  receiptDate: '2025-08-20',
  paymentMethod: 'transfer',
  ...overrides,
})

// Mock Bank Account factory
export const createMockBankAccount = (overrides?: Partial<BankAccount>): BankAccount => ({
  id: '1',
  accountName: 'Main Operations Account',
  accountNumber: '012345678901',
  bankName: 'BBVA',
  currency: 'MXN',
  glAccountId: null,
  currentBalance: 50000.00,
  accountType: 'checking',
  isActive: true,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  // Legacy fields
  clabe: '012180001234567890',
  openingBalance: '50000.00',
  status: 'active',
  ...overrides,
})

// Mock Payment Application factory
export const createMockPaymentApplication = (overrides?: Partial<PaymentApplication>): PaymentApplication => ({
  id: '1',
  paymentId: 1,
  arInvoiceId: 1,
  apInvoiceId: null,
  appliedAmount: 500.00,
  notes: null,
  metadata: null,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  invoiceNumber: 'INV-001',
  paymentNumber: 'PAY-001',
  // Legacy fields
  applicationDate: '2025-08-20',
  amount: '500.00',
  ...overrides,
})

// Mock Payment Method factory
export const createMockPaymentMethod = (overrides?: Partial<PaymentMethod>): PaymentMethod => ({
  id: '1',
  name: 'Bank Transfer',
  code: 'TRANSFER',
  type: 'electronic',
  requiresReference: true,
  isActive: true,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  // Legacy fields
  description: 'Electronic bank transfer',
  ...overrides,
})

// Mock Bank Transaction factory
export const createMockBankTransaction = (overrides?: Partial<BankTransaction>): BankTransaction => ({
  id: '1',
  bankAccountId: 1,
  transactionDate: '2025-08-20',
  amount: 5000.00,
  transactionType: 'credit',
  reference: 'DEP-001',
  description: 'Customer deposit',
  reconciliationStatus: 'unreconciled',
  reconciledById: null,
  reconciledAt: null,
  reconciliationNotes: null,
  statementNumber: '2025-08',
  runningBalance: 55000.00,
  isActive: true,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  bankAccountName: 'Main Operations Account',
  reconciledByName: undefined,
  ...overrides,
})

// Mock Parsed Bank Transaction factory
export const createMockParsedBankTransaction = (overrides?: Partial<ParsedBankTransaction>): ParsedBankTransaction => ({
  ...createMockBankTransaction(),
  amountDisplay: '$5,000.00',
  statusLabel: 'Sin Conciliar',
  typeLabel: 'Credito',
  ...overrides,
})

// Mock API response factory
export const createMockAPIResponse = <T>(data: T[], meta?: any) => ({
  data,
  meta: meta || {
    pagination: {
      total: data.length,
      count: data.length,
      per_page: 20,
      current_page: 1,
      total_pages: 1,
    },
  },
})

// Mock axios client - vi will be available in test files
export const mockAxiosClient = {
  get: () => {},
  post: () => {},
  patch: () => {},
  delete: () => {},
}

// Test helpers
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockSWRResponse = <T>(data: T, isLoading = false, error?: Error) => ({
  data,
  error,
  isLoading,
  mutate: () => {},
})

// Mock Next.js router
export const mockRouter = {
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  pathname: '/dashboard/finance',
  query: {},
  asPath: '/dashboard/finance',
}

// Setup function for common test mocks - to be used in actual test files
export const setupCommonMocks = () => {
  // Setup code will be implemented in actual test files where vi is available
}

// Cleanup function - to be used in actual test files
export const cleanupMocks = () => {
  // Cleanup code will be implemented in actual test files where vi is available
}

// FI-M002: Mock AR Invoice with Early Payment Discount
export const createMockARInvoiceWithDiscount = (overrides?: Partial<ARInvoice>): ARInvoice => {
  const invoiceDate = '2025-08-20'
  const discountDays = 10
  const discountDate = new Date(invoiceDate)
  discountDate.setDate(discountDate.getDate() + discountDays)

  return createMockARInvoice({
    discountPercent: 2.0,
    discountDays: 10,
    discountDate: discountDate.toISOString().split('T')[0],
    discountAmount: 46.40, // 2% of 2320
    discountApplied: false,
    discountAppliedAmount: null,
    discountAppliedDate: null,
    ...overrides,
  })
}