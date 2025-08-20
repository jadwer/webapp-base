// Finance Module Test Utilities
// Mock factories and utilities for testing Finance module

import type { APInvoice, APPayment, ARInvoice, ARReceipt, BankAccount } from '../../types'

// Mock AP Invoice factory
export const createMockAPInvoice = (overrides?: Partial<APInvoice>): APInvoice => ({
  id: '1',
  contactId: 1,
  invoiceNumber: 'FACT-001',
  invoiceDate: '2025-08-20',
  dueDate: '2025-09-20',
  currency: 'MXN',
  exchangeRate: 1.0,
  subtotal: 1000.00,
  taxTotal: 160.00,
  total: 1160.00,
  status: 'draft',
  paidAmount: 0.00,
  remainingBalance: 1160.00,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock AP Payment factory
export const createMockAPPayment = (overrides?: Partial<APPayment>): APPayment => ({
  id: '1',
  aPInvoiceId: 1,
  bankAccountId: 1,
  paymentDate: '2025-08-20',
  amount: 1160.00,
  paymentMethod: 'transfer',
  reference: 'TXN-12345',
  status: 'draft',
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock AR Invoice factory
export const createMockARInvoice = (overrides?: Partial<ARInvoice>): ARInvoice => ({
  id: '1',
  contactId: 10,
  invoiceNumber: 'INV-001',
  invoiceDate: '2025-08-20',
  dueDate: '2025-09-20',
  currency: 'MXN',
  subtotal: 2000.00,
  taxTotal: 320.00,
  total: 2320.00,
  status: 'posted',
  collectedAmount: 500.00,
  remainingBalance: 1820.00,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock AR Receipt factory
export const createMockARReceipt = (overrides?: Partial<ARReceipt>): ARReceipt => ({
  id: '1',
  aRInvoiceId: 1,
  bankAccountId: 1,
  receiptDate: '2025-08-20',
  amount: 500.00,
  paymentMethod: 'transfer',
  reference: 'DEP-67890',
  status: 'posted',
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock Bank Account factory
export const createMockBankAccount = (overrides?: Partial<BankAccount>): BankAccount => ({
  id: '1',
  bankName: 'BBVA',
  accountNumber: '012345678901',
  clabe: '012180001234567890',
  currency: 'MXN',
  accountType: 'checking',
  openingBalance: 50000.00,
  status: 'active',
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
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