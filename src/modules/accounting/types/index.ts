// Accounting Module Types - Synced with backend ACCOUNTING_FRONTEND_GUIDE.md

// Type aliases for enums
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type Nature = 'debit' | 'credit'
export type AccountStatus = 'active' | 'inactive' | 'archived'
export type JournalType = 'general' | 'sales' | 'purchases' | 'cash' | 'bank' | 'payroll'
export type JournalStatus = 'active' | 'inactive'
export type JournalEntryStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'reversed'
export type FiscalPeriodStatus = 'open' | 'closed' | 'locked'
export type ExchangeRateStatus = 'active' | 'inactive'
export type IdempotencyStatus = 'pending' | 'completed' | 'failed'

export interface Account {
  id: string
  code: string
  name: string
  accountType: AccountType
  nature: Nature
  level: number
  parentId: number | null
  currency: string
  isPostable: boolean
  isCashFlow: boolean
  status: AccountStatus
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// Journal (new entity from backend)
export interface Journal {
  id: string
  code: string
  name: string
  description: string | null
  prefix: string
  type: JournalType
  status: JournalStatus
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// JournalSequence (new entity from backend)
export interface JournalSequence {
  id: string
  journalId: number
  fiscalYear: number
  currentNumber: number
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  journalId: number
  fiscalPeriodId: number
  number: string
  date: string
  reference: string | null
  description: string
  totalDebit: number // Read-only, auto-calculated
  totalCredit: number // Read-only, auto-calculated
  status: JournalEntryStatus
  approvedAt: string | null
  approvedById: number | null
  postedAt: string | null
  postedById: number | null
  reversalOfId: number | null
  reversalReason: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  // Legacy frontend fields (not in backend guide but may be used)
  periodId?: string // Legacy alias for fiscalPeriodId
  currency?: string
  exchangeRate?: string
  sourceType?: string
  sourceId?: string
}

export interface JournalLine {
  id: string
  journalEntryId: number
  accountId: number
  contactId: number | null
  debit: number
  credit: number
  description: string | null
  reference: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  // Legacy frontend fields (not in backend guide but may be used)
  memo?: string // Legacy alias for description
  baseAmount?: string
  costCenterId?: string
  partnerId?: string
  currency?: string
  exchangeRate?: string
}

// FiscalPeriod (new entity from backend)
export interface FiscalPeriod {
  id: string
  name: string
  year: number
  month: number
  startDate: string
  endDate: string
  status: FiscalPeriodStatus
  closedAt: string | null
  closedById: number | null
  closingEntryId: number | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// ExchangeRate (new entity from backend)
export interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  effectiveDate: string
  source: string | null
  status: ExchangeRateStatus
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// ExchangeRatePolicy (new entity from backend)
export interface ExchangeRatePolicy {
  id: string
  currency: string
  source: string
  scope: string
  maxAgeDays: number
  tolerancePercentage: number
  requireApprovalOver: number
  isActive: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// AccountBalance (new entity from backend)
export interface AccountBalance {
  id: string
  accountId: number
  fiscalYear: number
  fiscalMonth: number
  openingBalance: number
  periodDebits: number
  periodCredits: number
  closingBalance: number
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// AccountMapping (new entity from backend)
export interface AccountMapping {
  id: string
  mappingType: string
  accountId: number
  version: number
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdById: number
  notes: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// AuditLog (new entity from backend)
export interface AuditLog {
  id: string
  modelType: string
  modelId: number
  action: string
  userId: number
  changes: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  sessionId: string | null
  payloadHash: string | null
  requiresRetention: boolean
  retentionUntil: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// IdempotencyKey (new entity from backend)
export interface IdempotencyKey {
  id: string
  userId: number
  endpoint: string
  idempotencyKey: string
  requestHash: string
  responseData: Record<string, unknown> | null
  status: IdempotencyStatus
  expiresAt: string
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// Form interfaces
export interface AccountFormData {
  code: string
  name: string
  accountType: AccountType
  nature: Nature
  level: number
  isPostable: boolean
  isCashFlow?: boolean
  status: AccountStatus
  parentId?: number | null
  currency?: string
  metadata?: Record<string, unknown>
}

export interface JournalEntryFormData {
  journalId?: number
  fiscalPeriodId?: number
  number?: string
  date: string
  description: string
  reference?: string | null
  status?: JournalEntryStatus
  // Legacy fields for backward compatibility
  currency?: string
  exchangeRate?: string
}

export interface JournalLineFormData {
  journalEntryId?: number
  accountId: number
  contactId?: number | null
  debit: number
  credit: number
  description?: string | null
  reference?: string | null
}

export interface JournalEntryWithLines extends JournalEntryFormData {
  lines: JournalLineFormData[] | JournalLineForm[]
}

// Legacy form interfaces for backward compatibility
export interface JournalLineForm {
  accountId: string
  debit: string
  credit: string
  memo?: string
  journalEntryId?: string
}

// API Response types - JSON:API v1.1 compliant
export interface AccountingAPIResponse<T> {
  jsonapi: { version: string };
  data: T[];
  meta?: {
    page?: {
      currentPage: number;  // ✅ Backend usa currentPage
      from: number;
      lastPage: number;     // ✅ Backend usa lastPage
      perPage: number;      // ✅ Backend usa perPage
      to: number;
      total: number;
    };
  };
  links?: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
    self?: string;
  };
}

export interface AccountingAPIError {
  jsonapi: { version: string };
  errors: Array<{
    status: string;     // ✅ "422", "401", etc.
    title: string;      // ✅ "Unprocessable Entity"
    detail: string;     // ✅ "El campo Code es obligatorio."
    source?: {
      pointer?: string; // ✅ "/data/attributes/code"
    };
  }>;
}

// Related entity types for includes
export interface AccountWithRelations extends Account {
  journalLines?: JournalLine[];
}

export interface JournalEntryWithRelations extends JournalEntry {
  journalLines?: JournalLineWithAccount[];
}

export interface JournalLineWithAccount extends JournalLine {
  account?: Account;
}