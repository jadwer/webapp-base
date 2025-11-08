/**
 * ACCOUNTING MODULE - TEST UTILITIES
 * Mock factories and utilities for Accounting module testing
 * Following Vitest + React Testing Library patterns
 */

import type { Account, JournalEntry, JournalLine } from '../../types'

// Mock Account factory
export const createMockAccount = (overrides?: Partial<Account>): Account => ({
  id: '1',
  code: '1000',
  name: 'Caja General',
  accountType: 'asset',
  level: 1,
  parentId: null,
  currency: 'MXN',
  isPostable: true,
  status: 'active',
  metadata: undefined,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock Journal Entry factory
export const createMockJournalEntry = (overrides?: Partial<JournalEntry>): JournalEntry => ({
  id: '1',
  journalId: '1',
  periodId: '1',
  number: 'JE-2025-001',
  date: '2025-08-20',
  currency: 'MXN',
  exchangeRate: '1.0',
  reference: 'REF-001',
  description: 'Asiento de prueba',
  status: 'draft',
  approvedById: undefined,
  postedById: undefined,
  postedAt: undefined,
  reversalOfId: undefined,
  sourceType: 'manual',
  sourceId: undefined,
  totalDebit: '1000.00',
  totalCredit: '1000.00',
  metadata: undefined,
  createdAt: '2025-08-20T10:00:00.000Z',
  updatedAt: '2025-08-20T10:00:00.000Z',
  ...overrides,
})

// Mock Journal Line factory
export const createMockJournalLine = (overrides?: Partial<JournalLine>): JournalLine => ({
  id: '1',
  journalEntryId: '1',
  accountId: '1',
  debit: '500.00',
  credit: '0.00',
  memo: 'Línea de asiento',
  currency: 'MXN',
  exchangeRate: '1.0',
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

// Mock JSON:API single response
export const createMockSingleResponse = <T>(data: T) => ({
  data,
})

// Account type configurations for testing
export const mockAccountTypes = {
  '1': { name: 'Assets', normalBalance: 'debit' },
  '2': { name: 'Liabilities', normalBalance: 'credit' },
  '3': { name: 'Equity', normalBalance: 'credit' },
  '4': { name: 'Revenue', normalBalance: 'credit' },
  '5': { name: 'Expenses', normalBalance: 'debit' },
  '6': { name: 'Other Income', normalBalance: 'credit' },
  '7': { name: 'Other Expenses', normalBalance: 'debit' },
  '8': { name: 'Cost of Sales', normalBalance: 'debit' },
  '9': { name: 'Administrative Expenses', normalBalance: 'debit' },
  '10': { name: 'Financial Expenses', normalBalance: 'debit' }
}

// Status configurations for testing
export const mockStatusConfig = {
  accounts: {
    active: { class: 'badge bg-success', text: 'Activa' },
    inactive: { class: 'badge bg-secondary', text: 'Inactiva' },
    pending: { class: 'badge bg-warning', text: 'Pendiente' }
  },
  journalEntries: {
    draft: { class: 'badge bg-secondary', text: 'Borrador' },
    posted: { class: 'badge bg-success', text: 'Contabilizado' },
    pending: { class: 'badge bg-warning', text: 'Pendiente' }
  }
}

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
  pathname: '/dashboard/accounting',
  query: {},
  asPath: '/dashboard/accounting',
}

// Currency formatter for tests
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount)
}

// Date formatter for tests
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Setup function for common test mocks - to be used in actual test files
export const setupCommonMocks = () => {
  // Setup code will be implemented in actual test files where vi is available
}

// Cleanup function - to be used in actual test files
export const cleanupMocks = () => {
  // Cleanup code will be implemented in actual test files where vi is available
}

// Test data sets for different scenarios
export const testDataSets = {
  balancedJournalEntry: {
    entry: createMockJournalEntry({ totalDebit: '1000', totalCredit: '1000' }),
    lines: [
      createMockJournalLine({ debit: '1000', credit: '0', accountId: '1' }),
      createMockJournalLine({ debit: '0', credit: '1000', accountId: '2' })
    ]
  },
  unbalancedJournalEntry: {
    entry: createMockJournalEntry({ totalDebit: '1000', totalCredit: '800' }),
    lines: [
      createMockJournalLine({ debit: '1000', credit: '0', accountId: '1' }),
      createMockJournalLine({ debit: '0', credit: '800', accountId: '2' })
    ]
  },
  chartOfAccounts: [
    createMockAccount({ id: '1', code: '1000', name: 'Caja', accountType: 'asset' }),
    createMockAccount({ id: '2', code: '2000', name: 'Proveedores', accountType: 'liability' }),
    createMockAccount({ id: '3', code: '3000', name: 'Capital', accountType: 'equity' }),
    createMockAccount({ id: '4', code: '4000', name: 'Ventas', accountType: 'revenue' }),
    createMockAccount({ id: '5', code: '5000', name: 'Gastos', accountType: 'expense' })
  ]
}

// Validation helpers for tests
export const isBalanced = (debit: number, credit: number, tolerance = 0.01) => {
  return Math.abs(debit - credit) <= tolerance
}

export const validateAccountCode = (code: string) => {
  return /^[0-9]{4,}$/.test(code)
}

export const validateJournalEntryNumber = (number: string) => {
  return /^JE-\d{4}-\d{3,}$/.test(number)
}