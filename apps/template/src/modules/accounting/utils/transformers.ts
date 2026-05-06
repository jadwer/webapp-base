// Accounting Data Transformers
// JSON:API to Frontend and vice versa transformations

import type {
  Account,
  AccountFormData,
  JournalEntry,
  JournalLine,
  JournalEntryFormData,
  JournalLineForm,
} from '../types'

// ===== JSON:API TO FRONTEND TRANSFORMERS =====

export const transformAccountFromAPI = (apiData: Record<string, unknown>): Account => {
  const attributes = (apiData.attributes as Record<string, unknown>) || {}

  return {
    id: String(apiData.id),
    code: String(attributes.code),
    name: String(attributes.name),
    accountType: (attributes.accountType || attributes.account_type) as Account['accountType'],
    nature: (attributes.nature || 'debit') as Account['nature'],
    level: (attributes.level as number) || 1,
    parentId: attributes.parentId != null ? Number(attributes.parentId) : (attributes.parent_id != null ? Number(attributes.parent_id) : null),
    currency: (attributes.currency as string | undefined) || 'MXN',
    isPostable: (attributes.isPostable ?? attributes.is_postable ?? true) as boolean,
    isCashFlow: (attributes.isCashFlow ?? attributes.is_cash_flow ?? false) as boolean,
    status: (attributes.status || 'active') as Account['status'],
    metadata: (attributes.metadata as Record<string, unknown>) || null,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
  }
}

export const transformJournalEntryFromAPI = (apiData: Record<string, unknown>): JournalEntry => {
  const attributes = (apiData.attributes as Record<string, unknown>) || {}

  return {
    id: String(apiData.id),
    journalId: Number(attributes.journalId || attributes.journal_id || 0),
    fiscalPeriodId: Number(attributes.fiscalPeriodId || attributes.fiscal_period_id || 0),
    number: String(attributes.number || ''),
    date: String(attributes.date || ''),
    reference: (attributes.reference ?? null) as string | null,
    description: String(attributes.description || ''),
    totalDebit: Number(attributes.totalDebit || attributes.total_debit || 0),
    totalCredit: Number(attributes.totalCredit || attributes.total_credit || 0),
    status: (attributes.status || 'draft') as JournalEntry['status'],
    approvedAt: (attributes.approvedAt ?? attributes.approved_at ?? null) as string | null,
    approvedById: (attributes.approvedById ?? attributes.approved_by_id ?? null) as number | null,
    postedAt: (attributes.postedAt ?? attributes.posted_at ?? null) as string | null,
    postedById: (attributes.postedById ?? attributes.posted_by_id ?? null) as number | null,
    reversalOfId: (attributes.reversalOfId ?? attributes.reversal_of_id ?? null) as number | null,
    reversalReason: (attributes.reversalReason ?? attributes.reversal_reason ?? null) as string | null,
    metadata: (attributes.metadata as Record<string, unknown>) || null,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Legacy fields
    periodId: attributes.periodId ? String(attributes.periodId) : (attributes.fiscalPeriodId ? String(attributes.fiscalPeriodId) : undefined),
    currency: (attributes.currency as string) || undefined,
    exchangeRate: (attributes.exchangeRate as string) || undefined,
    sourceType: (attributes.sourceType as string) || undefined,
    sourceId: attributes.sourceId ? String(attributes.sourceId) : undefined,
  }
}

export const transformJournalLineFromAPI = (apiData: Record<string, unknown>): JournalLine => {
  const attributes = (apiData.attributes as Record<string, unknown>) || {}

  return {
    id: String(apiData.id),
    journalEntryId: Number(attributes.journalEntryId || attributes.journal_entry_id || 0),
    accountId: Number(attributes.accountId || attributes.account_id || 0),
    contactId: (attributes.contactId ?? attributes.contact_id ?? null) as number | null,
    debit: Number(attributes.debit || 0),
    credit: Number(attributes.credit || 0),
    description: (attributes.description ?? null) as string | null,
    reference: (attributes.reference ?? null) as string | null,
    metadata: (attributes.metadata as Record<string, unknown>) || null,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Legacy fields
    memo: (attributes.memo || attributes.description) as string | undefined,
    baseAmount: attributes.baseAmount as string | undefined,
    costCenterId: attributes.costCenterId ? String(attributes.costCenterId) : undefined,
    partnerId: attributes.partnerId ? String(attributes.partnerId) : undefined,
    currency: (attributes.currency as string) || undefined,
    exchangeRate: (attributes.exchangeRate as string) || undefined,
  }
}

// ===== FRONTEND TO JSON:API TRANSFORMERS =====

export const transformAccountToAPI = (formData: AccountFormData) => ({
  data: {
    type: 'accounts',
    attributes: {
      code: formData.code,                    // ✅ Required: string, unique, max 255
      name: formData.name,                    // ✅ Required: string, max 255
      accountType: formData.accountType,      // ✅ Required: asset|liability|equity|revenue|expense
      level: formData.level,                  // ✅ Required: integer, hierarchical level
      isPostable: formData.isPostable,        // ✅ Required: boolean
      status: formData.status,                // ✅ Required: string
      parentId: formData.parentId,            // ✅ Optional: string, ID parent account
      currency: formData.currency || 'MXN',   // ✅ Optional: string
      metadata: formData.metadata || {},      // ✅ Optional: object
    },
  },
})

export const transformJournalEntryToAPI = (formData: JournalEntryFormData) => ({
  data: {
    type: 'journal-entries',
    attributes: {
      date: formData.date,                    // ✅ YYYY-MM-DD format
      description: formData.description,      // ✅ Required
      reference: formData.reference,          // ✅ Optional
      currency: formData.currency || 'MXN',   // ✅ Optional
      exchangeRate: formData.exchangeRate,    // ✅ Optional decimal as string
    },
  },
})

export const transformJournalLineToAPI = (formData: JournalLineForm) => ({
  data: {
    type: 'journal-lines',
    attributes: {
      accountId: formData.accountId,          // ✅ Required: string ID
      debit: formData.debit,                  // ✅ Required: decimal as string
      credit: formData.credit,                // ✅ Required: decimal as string
      memo: formData.memo,                    // ✅ Optional
      journalEntryId: formData.journalEntryId, // ✅ Optional: string ID
    },
  },
})

// ===== BATCH TRANSFORMERS =====

export const transformAccountsFromAPI = (apiResponse: Record<string, unknown>): Account[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  return apiResponse.data.map(transformAccountFromAPI)
}

export const transformJournalEntriesFromAPI = (apiResponse: Record<string, unknown>): JournalEntry[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  return apiResponse.data.map(transformJournalEntryFromAPI)
}

export const transformJournalLinesFromAPI = (apiResponse: Record<string, unknown>): JournalLine[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  return apiResponse.data.map(transformJournalLineFromAPI)
}

// ===== VALIDATION HELPERS =====

export const validateAccountData = (data: Record<string, unknown>): string[] => {
  const errors: string[] = []

  if (!data.code) errors.push('code is required')
  if (!data.name) errors.push('name is required')
  if (!data.accountType) errors.push('accountType is required')
  if (typeof data.level !== 'number') errors.push('level is required and must be a number')
  if (typeof data.isPostable !== 'boolean') errors.push('isPostable is required and must be boolean')
  if (!data.status) errors.push('status is required')

  return errors
}

export const validateJournalEntryData = (data: Record<string, unknown>): string[] => {
  const errors: string[] = []

  if (!data.date) errors.push('date is required')
  if (!data.description) errors.push('description is required')

  return errors
}

export const validateJournalLineData = (data: Record<string, unknown>): string[] => {
  const errors: string[] = []

  if (!data.accountId) errors.push('accountId is required')
  if (!data.debit && !data.credit) errors.push('either debit or credit must be provided')
  if (data.debit && data.credit) errors.push('cannot have both debit and credit in the same line')

  return errors
}