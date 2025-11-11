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
    code: String(attributes.code),                    // ✅ string, unique, max 255
    name: String(attributes.name),                    // ✅ string, max 255
    accountType: attributes.accountType as Account['accountType'],      // ✅ Required enum
    level: attributes.level as number,                  // ✅ integer, hierarchical level
    parentId: attributes.parentId ? String(attributes.parentId) : null, // ✅ string ID or null
    currency: (attributes.currency as string | undefined) || 'MXN',   // ✅ Optional, default MXN
    isPostable: attributes.isPostable as boolean,        // ✅ boolean required
    status: attributes.status as Account['status'],                // ✅ required: active|inactive
    metadata: attributes.metadata as Record<string, unknown> | undefined,            // ✅ optional object
    createdAt: attributes.createdAt as string,
    updatedAt: attributes.updatedAt as string,
  }
}

export const transformJournalEntryFromAPI = (apiData: Record<string, unknown>): JournalEntry => {
  const attributes = (apiData.attributes as Record<string, unknown>) || {}
  
  return {
    id: String(apiData.id),
    journalId: attributes.journalId ? String(attributes.journalId) : undefined,
    periodId: attributes.periodId ? String(attributes.periodId) : undefined,
    number: String(attributes.number),
    date: String(attributes.date),                    // ✅ YYYY-MM-DD format
    currency: String(attributes.currency),
    exchangeRate: String(attributes.exchangeRate),    // ✅ decimal as string
    reference: String(attributes.reference),
    description: String(attributes.description),
    status: attributes.status as JournalEntry['status'],                // ✅ draft|posted
    approvedById: attributes.approvedById ? String(attributes.approvedById) : undefined,
    postedById: attributes.postedById ? String(attributes.postedById) : undefined,
    postedAt: attributes.postedAt as string | undefined,
    reversalOfId: attributes.reversalOfId ? String(attributes.reversalOfId) : undefined,
    sourceType: attributes.sourceType as JournalEntry['sourceType'],
    sourceId: attributes.sourceId ? String(attributes.sourceId) : undefined,
    totalDebit: String(attributes.totalDebit),        // ✅ decimal as string
    totalCredit: String(attributes.totalCredit),      // ✅ decimal as string
    metadata: attributes.metadata as Record<string, unknown> | undefined,
    createdAt: attributes.createdAt as string,
    updatedAt: attributes.updatedAt as string,
  }
}

export const transformJournalLineFromAPI = (apiData: Record<string, unknown>): JournalLine => {
  const attributes = (apiData.attributes as Record<string, unknown>) || {}
  
  return {
    id: String(apiData.id),
    journalEntryId: String(attributes.journalEntryId), // ✅ ID as string
    accountId: String(attributes.accountId),           // ✅ ID as string
    debit: String(attributes.debit),                           // ✅ decimal as string
    credit: String(attributes.credit),                         // ✅ decimal as string
    baseAmount: attributes.baseAmount as string | undefined,                 // ✅ decimal as string
    costCenterId: attributes.costCenterId ? String(attributes.costCenterId) : undefined,
    partnerId: attributes.partnerId ? String(attributes.partnerId) : undefined,
    memo: attributes.memo ? String(attributes.memo) : undefined,
    currency: String(attributes.currency),
    exchangeRate: String(attributes.exchangeRate),             // ✅ decimal as string
    metadata: attributes.metadata as Record<string, unknown> | undefined,
    createdAt: attributes.createdAt as string,
    updatedAt: attributes.updatedAt as string,
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