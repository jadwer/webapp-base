// Finance Data Transformers
// JSON:API to Frontend and vice versa transformations

import type {
  APInvoice,
  APPayment,
  ARInvoice,
  ARReceipt,
  BankAccount,
  APInvoiceForm,
  APPaymentForm,
  ARInvoiceForm,
  BankAccountForm,
  PaymentApplication,
  PaymentApplicationForm,
  PaymentMethod,
  PaymentMethodForm,
  BankTransaction,
  ParsedBankTransaction,
  CreateBankTransactionRequest,
  UpdateBankTransactionRequest,
} from '../types'

import {
  BANK_TRANSACTION_TYPE_CONFIG,
  RECONCILIATION_STATUS_CONFIG,
} from '../types'

// ===== JSON:API TO FRONTEND TRANSFORMERS =====

export const transformAPInvoiceFromAPI = (apiData: Record<string, unknown>, includedData?: Record<string, unknown>[]): APInvoice => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  // Find contact information from included data
  let contactName = `Proveedor ID: ${attributes.contactId || attributes.contact_id}`
  const contactIdValue = (attributes.contactId || attributes.contact_id) as number
  if (includedData && contactIdValue) {
    const contact = includedData.find((item: Record<string, unknown>) =>
      item.type === 'contacts' && item.id === String(contactIdValue)
    )
    if (contact && contact.attributes) {
      const contactAttrs = contact.attributes as Record<string, unknown>
      contactName = (contactAttrs.name || contactAttrs.companyName || contactName) as string
    }
  }

  return {
    id: apiData.id as string,
    invoiceNumber: (attributes.invoiceNumber || attributes.invoice_number) as string,
    invoiceDate: (attributes.invoiceDate || attributes.invoice_date) as string,
    dueDate: (attributes.dueDate || attributes.due_date) as string,
    contactId: contactIdValue,
    purchaseOrderId: (attributes.purchaseOrderId || attributes.purchase_order_id) as number | null,
    currency: (attributes.currency as string) || 'MXN',
    subtotal: (attributes.subtotal as number) || 0,
    taxAmount: (attributes.taxAmount || attributes.tax_amount) as number || 0,
    totalAmount: (attributes.totalAmount || attributes.total_amount) as number || 0,
    paidAmount: (attributes.paidAmount || attributes.paid_amount) as number || 0,
    paidDate: (attributes.paidDate || attributes.paid_date) as string | null,
    status: (attributes.status as APInvoice['status']) || 'draft',
    journalEntryId: (attributes.journalEntryId || attributes.journal_entry_id) as number | null,
    fiscalPeriodId: (attributes.fiscalPeriodId || attributes.fiscal_period_id) as number | null,
    isRefund: (attributes.isRefund || attributes.is_refund) as boolean || false,
    refundOfInvoiceId: (attributes.refundOfInvoiceId || attributes.refund_of_invoice_id) as number | null,
    voidedAt: (attributes.voidedAt || attributes.voided_at) as string | null,
    voidedById: (attributes.voidedById || attributes.voided_by_id) as number | null,
    voidReason: (attributes.voidReason || attributes.void_reason) as string | null,
    notes: (attributes.notes) as string | null,
    metadata: (attributes.metadata) as Record<string, unknown> | null,
    isActive: (attributes.isActive || attributes.is_active) as boolean ?? true,
    createdAt: (attributes.createdAt || attributes.created_at) as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at) as string,
    contactName,
  }
}

// Nombres de cuenta bancaria y metodo de pago desde `included`.
const resolvePaymentIncludes = (
  attributes: Record<string, unknown>,
  includedData?: Record<string, unknown>[]
): { bankAccountName?: string; paymentMethodName?: string } => {
  if (!includedData) return {}
  const find = (type: string, id: unknown) =>
    id != null ? includedData.find((item) => item.type === type && item.id === String(id)) : undefined
  const bank = find('bank-accounts', attributes.bankAccountId ?? attributes.bank_account_id)
  const method = find('payment-methods', attributes.paymentMethodId ?? attributes.payment_method_id)
  const bankAttrs = (bank?.attributes || {}) as Record<string, unknown>
  const methodAttrs = (method?.attributes || {}) as Record<string, unknown>
  return {
    bankAccountName: (bankAttrs.accountName || bankAttrs.bankName) as string | undefined,
    paymentMethodName: methodAttrs.name as string | undefined,
  }
}

export const transformAPPaymentFromAPI = (apiData: Record<string, unknown>, includedData?: Record<string, unknown>[]): APPayment => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  // Find contact information from included data
  let contactName = `Proveedor ID: ${attributes.contactId || attributes.contact_id}`
  const contactIdValue = (attributes.contactId || attributes.contact_id) as number
  if (includedData && contactIdValue) {
    const contact = includedData.find((item: Record<string, unknown>) =>
      item.type === 'contacts' && item.id === String(contactIdValue)
    )
    if (contact && contact.attributes) {
      const contactAttrs = contact.attributes as Record<string, unknown>
      contactName = (contactAttrs.name || contactAttrs.companyName || contactName) as string
    }
  }

  return {
    id: apiData.id as string,
    paymentNumber: (attributes.paymentNumber || attributes.payment_number || '') as string,
    paymentDate: (attributes.paymentDate || attributes.payment_date || '') as string,
    contactId: contactIdValue,
    bankAccountId: Number(attributes.bankAccountId || attributes.bank_account_id || 0),
    paymentMethodId: Number(attributes.paymentMethodId || attributes.payment_method_id || 0),
    amount: Number(attributes.amount || 0),
    currency: (attributes.currency || 'MXN') as string,
    appliedAmount: Number(attributes.appliedAmount || attributes.applied_amount || 0),
    unappliedAmount: Number(attributes.unappliedAmount || attributes.unapplied_amount || 0),
    status: (attributes.status || 'draft') as APPayment['status'],
    journalEntryId: (attributes.journalEntryId ?? attributes.journal_entry_id ?? null) as number | null,
    reference: (attributes.reference ?? null) as string | null,
    notes: (attributes.notes ?? null) as string | null,
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    contactName,
    ...resolvePaymentIncludes(attributes, includedData),
  }
}

export const transformARInvoiceFromAPI = (apiData: Record<string, unknown>, includedData?: Record<string, unknown>[]): ARInvoice => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  // Find contact information from included data
  let contactName = `Cliente ID: ${attributes.contactId || attributes.contact_id}`
  const contactIdValue = (attributes.contactId || attributes.contact_id) as number
  if (includedData && contactIdValue) {
    const contact = includedData.find((item: Record<string, unknown>) =>
      item.type === 'contacts' && item.id === String(contactIdValue)
    )
    if (contact && contact.attributes) {
      const contactAttrs = contact.attributes as Record<string, unknown>
      contactName = (contactAttrs.name || contactAttrs.companyName || contactName) as string
    }
  }

  return {
    id: apiData.id as string,
    invoiceNumber: (attributes.invoiceNumber || attributes.invoice_number) as string,
    invoiceDate: (attributes.invoiceDate || attributes.invoice_date) as string,
    dueDate: (attributes.dueDate || attributes.due_date) as string,
    contactId: contactIdValue,
    salesOrderId: (attributes.salesOrderId || attributes.sales_order_id) as number | null,
    currency: (attributes.currency as string) || 'MXN',
    subtotal: (attributes.subtotal as number) || 0,
    taxAmount: (attributes.taxAmount || attributes.tax_amount) as number || 0,
    totalAmount: (attributes.totalAmount || attributes.total_amount) as number || 0,
    paidAmount: (attributes.paidAmount || attributes.paid_amount) as number || 0,
    paidDate: (attributes.paidDate || attributes.paid_date) as string | null,
    status: (attributes.status as ARInvoice['status']) || 'draft',
    journalEntryId: (attributes.journalEntryId || attributes.journal_entry_id) as number | null,
    fiscalPeriodId: (attributes.fiscalPeriodId || attributes.fiscal_period_id) as number | null,
    isRefund: (attributes.isRefund || attributes.is_refund) as boolean || false,
    refundOfInvoiceId: (attributes.refundOfInvoiceId || attributes.refund_of_invoice_id) as number | null,
    voidedAt: (attributes.voidedAt || attributes.voided_at) as string | null,
    voidedById: (attributes.voidedById || attributes.voided_by_id) as number | null,
    voidReason: (attributes.voidReason || attributes.void_reason) as string | null,
    // FI-M002: Early Payment Discount fields
    discountPercent: (attributes.discountPercent ?? attributes.discount_percent ?? null) as number | null,
    discountDays: (attributes.discountDays ?? attributes.discount_days ?? null) as number | null,
    discountDate: (attributes.discountDate ?? attributes.discount_date ?? null) as string | null,
    discountAmount: (attributes.discountAmount ?? attributes.discount_amount ?? null) as number | null,
    discountApplied: (attributes.discountApplied ?? attributes.discount_applied ?? false) as boolean,
    discountAppliedAmount: (attributes.discountAppliedAmount ?? attributes.discount_applied_amount ?? null) as number | null,
    discountAppliedDate: (attributes.discountAppliedDate ?? attributes.discount_applied_date ?? null) as string | null,
    notes: (attributes.notes) as string | null,
    metadata: (attributes.metadata) as Record<string, unknown> | null,
    isActive: (attributes.isActive || attributes.is_active) as boolean ?? true,
    createdAt: (attributes.createdAt || attributes.created_at) as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at) as string,
    contactName,
  }
}

export const transformARReceiptFromAPI = (apiData: Record<string, unknown>, includedData?: Record<string, unknown>[]): ARReceipt => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  // Find contact information from included data
  let contactName = `Cliente ID: ${attributes.contactId || attributes.contact_id}`
  const contactIdValue = (attributes.contactId || attributes.contact_id) as number
  if (includedData && contactIdValue) {
    const contact = includedData.find((item: Record<string, unknown>) =>
      item.type === 'contacts' && item.id === String(contactIdValue)
    )
    if (contact && contact.attributes) {
      const contactAttrs = contact.attributes as Record<string, unknown>
      contactName = (contactAttrs.name || contactAttrs.companyName || contactName) as string
    }
  }

  return {
    id: apiData.id as string,
    paymentNumber: (attributes.paymentNumber || attributes.payment_number || '') as string,
    paymentDate: (attributes.paymentDate || attributes.payment_date || '') as string,
    contactId: contactIdValue,
    bankAccountId: Number(attributes.bankAccountId || attributes.bank_account_id || 0),
    paymentMethodId: Number(attributes.paymentMethodId || attributes.payment_method_id || 0),
    amount: Number(attributes.amount || 0),
    currency: (attributes.currency || 'MXN') as string,
    appliedAmount: Number(attributes.appliedAmount || attributes.applied_amount || 0),
    unappliedAmount: Number(attributes.unappliedAmount || attributes.unapplied_amount || 0),
    status: (attributes.status || 'draft') as ARReceipt['status'],
    journalEntryId: (attributes.journalEntryId ?? attributes.journal_entry_id ?? null) as number | null,
    reference: (attributes.reference ?? null) as string | null,
    notes: (attributes.notes ?? null) as string | null,
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    contactName,
    ...resolvePaymentIncludes(attributes, includedData),
  }
}

export const transformBankAccountFromAPI = (apiData: Record<string, unknown>): BankAccount => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  return {
    id: apiData.id as string,
    accountName: (attributes.accountName || attributes.account_name || '') as string,
    accountNumber: (attributes.accountNumber || attributes.account_number || '') as string,
    bankName: (attributes.bankName || attributes.bank_name || '') as string,
    currency: (attributes.currency || 'MXN') as string,
    glAccountId: (attributes.glAccountId ?? attributes.gl_account_id ?? null) as number | null,
    currentBalance: Number(attributes.currentBalance || attributes.current_balance || 0),
    openingBalance: Number(attributes.openingBalance || attributes.opening_balance || 0),
    status: (attributes.status || 'active') as BankAccount['status'],
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
  }
}

// ===== FRONTEND TO JSON:API TRANSFORMERS =====

// Copia solo las llaves que el Schema declara como atributo escribible;
// las numericas se convierten a number (un input HTML entrega string).
const pickAttributes = (
  data: Record<string, unknown>,
  keys: readonly string[],
  numericKeys: readonly string[] = []
): Record<string, unknown> => {
  const attributes: Record<string, unknown> = {}
  for (const key of keys) {
    if (data[key] === undefined) continue
    const value = data[key]
    if (numericKeys.includes(key)) {
      attributes[key] = value === null || value === '' ? null : Number(value)
    } else {
      attributes[key] = value
    }
  }
  return attributes
}

// Atributos escribibles segun APInvoiceSchema/APInvoiceRequest.
const AP_INVOICE_KEYS = [
  'invoiceNumber', 'invoiceDate', 'dueDate', 'contactId', 'purchaseOrderId', 'currency',
  'subtotal', 'taxAmount', 'totalAmount', 'paidAmount', 'status', 'journalEntryId',
  'notes', 'metadata', 'isActive',
] as const
const AP_INVOICE_NUMERIC = ['contactId', 'purchaseOrderId', 'subtotal', 'taxAmount', 'totalAmount', 'paidAmount', 'journalEntryId']

// Atributos escribibles segun ARInvoiceSchema/ARInvoiceRequest.
const AR_INVOICE_KEYS = [
  'invoiceNumber', 'invoiceDate', 'dueDate', 'contactId', 'salesOrderId', 'currency',
  'subtotal', 'taxAmount', 'totalAmount', 'paidAmount', 'status', 'journalEntryId',
  'notes', 'metadata', 'isActive',
  'discountPercent', 'discountDays', 'discountDate', 'discountAmount',
  'discountApplied', 'discountAppliedAmount', 'discountAppliedDate',
] as const
const AR_INVOICE_NUMERIC = [
  'contactId', 'salesOrderId', 'subtotal', 'taxAmount', 'totalAmount', 'paidAmount', 'journalEntryId',
  'discountPercent', 'discountDays', 'discountAmount', 'discountAppliedAmount',
]

// Atributos escribibles segun PaymentSchema/PaymentRequest.
const PAYMENT_KEYS = [
  'paymentNumber', 'paymentDate', 'contactId', 'bankAccountId', 'paymentMethodId', 'amount',
  'currency', 'appliedAmount', 'unappliedAmount', 'status', 'journalEntryId', 'reference',
  'notes', 'metadata', 'isActive',
] as const
const PAYMENT_NUMERIC = ['contactId', 'bankAccountId', 'paymentMethodId', 'amount', 'appliedAmount', 'unappliedAmount', 'journalEntryId']

// Atributos escribibles segun BankAccountSchema/BankAccountRequest.
const BANK_ACCOUNT_KEYS = [
  'accountNumber', 'accountName', 'bankName', 'currency', 'glAccountId', 'currentBalance',
  'openingBalance', 'status', 'metadata', 'isActive',
] as const
const BANK_ACCOUNT_NUMERIC = ['glAccountId', 'currentBalance', 'openingBalance']

// Atributos escribibles segun PaymentApplicationSchema/PaymentApplicationRequest.
const PAYMENT_APPLICATION_KEYS = ['paymentId', 'arInvoiceId', 'amount', 'applicationDate', 'notes', 'isActive', 'metadata'] as const
const PAYMENT_APPLICATION_NUMERIC = ['paymentId', 'arInvoiceId', 'amount']

const toResource = (type: string, attributes: Record<string, unknown>, id?: string) => ({
  data: {
    type,
    ...(id ? { id } : {}),
    attributes,
  },
})

export const transformAPInvoiceToAPI = (formData: APInvoiceForm) =>
  toResource('ap-invoices', pickAttributes(
    { currency: 'MXN', purchaseOrderId: null, ...formData } as Record<string, unknown>,
    AP_INVOICE_KEYS,
    AP_INVOICE_NUMERIC
  ))

export const transformAPInvoiceUpdateToAPI = (id: string, data: Partial<APInvoiceForm>) =>
  toResource('ap-invoices', pickAttributes(data as Record<string, unknown>, AP_INVOICE_KEYS, AP_INVOICE_NUMERIC), id)

export const transformARInvoiceToAPI = (formData: ARInvoiceForm) =>
  toResource('ar-invoices', pickAttributes(
    { currency: 'MXN', salesOrderId: null, ...formData } as Record<string, unknown>,
    AR_INVOICE_KEYS,
    AR_INVOICE_NUMERIC
  ))

export const transformARInvoiceUpdateToAPI = (id: string, data: Partial<ARInvoiceForm>) =>
  toResource('ar-invoices', pickAttributes(data as Record<string, unknown>, AR_INVOICE_KEYS, AR_INVOICE_NUMERIC), id)

// Pagos a proveedor y cobros a cliente: mismo recurso `payments`. Un pago
// nuevo nace sin aplicar: todo su monto queda en unappliedAmount.
export const transformPaymentToAPI = (formData: APPaymentForm) => {
  const amount = Number(formData.amount)
  // Folio opcional: si viene vacio el backend genera PAY-000001
  const paymentNumber = formData.paymentNumber?.trim() || undefined
  return toResource('payments', pickAttributes(
    {
      currency: 'MXN',
      status: 'unapplied',
      appliedAmount: 0,
      unappliedAmount: amount,
      ...formData,
      paymentNumber,
      amount,
    } as Record<string, unknown>,
    PAYMENT_KEYS,
    PAYMENT_NUMERIC
  ))
}

export const transformPaymentUpdateToAPI = (id: string, data: Partial<APPaymentForm>) =>
  toResource('payments', pickAttributes(data as Record<string, unknown>, PAYMENT_KEYS, PAYMENT_NUMERIC), id)

export const transformAPPaymentToAPI = transformPaymentToAPI
export const transformARReceiptToAPI = transformPaymentToAPI

export const transformBankAccountToAPI = (formData: BankAccountForm) =>
  toResource('bank-accounts', pickAttributes(
    { openingBalance: 0, ...formData } as Record<string, unknown>,
    BANK_ACCOUNT_KEYS,
    BANK_ACCOUNT_NUMERIC
  ))

export const transformBankAccountUpdateToAPI = (id: string, data: Partial<BankAccountForm>) =>
  toResource('bank-accounts', pickAttributes(data as Record<string, unknown>, BANK_ACCOUNT_KEYS, BANK_ACCOUNT_NUMERIC), id)

// ===== BATCH TRANSFORMERS =====

export const transformAPInvoicesFromAPI = (apiResponse: Record<string, unknown>): APInvoice[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: Record<string, unknown>) => transformAPInvoiceFromAPI(item, includedData as Record<string, unknown>[]))
}

export const transformAPPaymentsFromAPI = (apiResponse: Record<string, unknown>): APPayment[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: Record<string, unknown>) => transformAPPaymentFromAPI(item, includedData as Record<string, unknown>[]))
}

export const transformARInvoicesFromAPI = (apiResponse: Record<string, unknown>): ARInvoice[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: Record<string, unknown>) => transformARInvoiceFromAPI(item, includedData as Record<string, unknown>[]))
}

export const transformARReceiptsFromAPI = (apiResponse: Record<string, unknown>): ARReceipt[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: Record<string, unknown>) => transformARReceiptFromAPI(item, includedData as Record<string, unknown>[]))
}

export const transformBankAccountsFromAPI = (apiResponse: Record<string, unknown>): BankAccount[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  return (apiResponse.data as Record<string, unknown>[]).map(transformBankAccountFromAPI)
}

// ===== RELATIONSHIP EXTRACTORS =====

export const extractContactFromInvoice = (apiData: Record<string, unknown>) => {
  const relationships = (apiData.relationships || {}) as Record<string, unknown>
  const contactRel = relationships.contact as Record<string, unknown> | undefined
  const contact = contactRel?.data as Record<string, unknown> | undefined

  if (!contact) return null

  return {
    id: contact.id as string,
    type: contact.type as string,
  }
}

export const extractBankAccountFromPayment = (apiData: Record<string, unknown>) => {
  const relationships = (apiData.relationships || {}) as Record<string, unknown>
  const bankAccountRel = relationships.bankAccount as Record<string, unknown> | undefined
  const bankAccount = bankAccountRel?.data as Record<string, unknown> | undefined

  if (!bankAccount) return null

  return {
    id: bankAccount.id as string,
    type: bankAccount.type as string,
  }
}

// ===== VALIDATION HELPERS =====

export const validateAPInvoiceData = (data: Record<string, unknown>): string[] => {
  const errors: string[] = []

  if (!data.contactId) errors.push('contactId is required')
  if (!data.invoiceNumber) errors.push('invoiceNumber is required')
  if (!data.invoiceDate) errors.push('invoiceDate is required')
  if (!data.dueDate) errors.push('dueDate is required')
  if (!data.totalAmount || (data.totalAmount as number) <= 0) errors.push('totalAmount must be greater than 0')

  return errors
}

export const validateARInvoiceData = (data: Record<string, unknown>): string[] => {
  const errors: string[] = []

  if (!data.contactId) errors.push('contactId is required')
  if (!data.invoiceNumber) errors.push('invoiceNumber is required')
  if (!data.invoiceDate) errors.push('invoiceDate is required')
  if (!data.dueDate) errors.push('dueDate is required')
  if (!data.totalAmount || (data.totalAmount as number) <= 0) errors.push('totalAmount must be greater than 0')

  return errors
}

export const validatePaymentData = (data: Record<string, unknown>, maxAmount: number): string[] => {
  const errors: string[] = []

  if (!data.bankAccountId) errors.push('bankAccountId is required')
  if (!data.amount || (data.amount as number) <= 0) errors.push('amount must be greater than 0')
  if ((data.amount as number) > maxAmount) errors.push(`amount cannot exceed ${maxAmount}`)
  if (!data.reference) errors.push('reference is required')

  return errors
}
// ===== PAYMENT APPLICATIONS TRANSFORMERS =====

export const transformPaymentApplicationFromAPI = (apiData: Record<string, unknown>, includedData?: Record<string, unknown>[]): PaymentApplication => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  // Resolve invoice number from included data
  let invoiceNumber: string | undefined
  if (includedData) {
    const invoice = includedData.find((item: Record<string, unknown>) =>
      item.type === 'ar-invoices' && item.id === String(attributes.arInvoiceId)
    )
    if (invoice && invoice.attributes) {
      const invoiceAttrs = invoice.attributes as Record<string, unknown>
      invoiceNumber = (invoiceAttrs.invoiceNumber || invoiceAttrs.invoice_number) as string
    }
  }

  // Resolve payment number from included data
  let paymentNumber: string | undefined
  if (includedData) {
    const payment = includedData.find((item: Record<string, unknown>) =>
      item.type === 'payments' && item.id === String(attributes.paymentId)
    )
    if (payment && payment.attributes) {
      const paymentAttrs = payment.attributes as Record<string, unknown>
      paymentNumber = (paymentAttrs.paymentNumber || paymentAttrs.payment_number) as string || `Payment #${attributes.paymentId}`
    }
  }

  return {
    id: apiData.id as string,
    paymentId: Number(attributes.paymentId || attributes.payment_id || 0),
    arInvoiceId: attributes.arInvoiceId != null ? Number(attributes.arInvoiceId) : (attributes.ar_invoice_id != null ? Number(attributes.ar_invoice_id) : null),
    amount: Number(attributes.amount || 0),
    applicationDate: (attributes.applicationDate || attributes.application_date || null) as string | null,
    notes: (attributes.notes ?? null) as string | null,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Resolved from includes
    invoiceNumber,
    paymentNumber,
  }
}

export const transformPaymentApplicationsFromAPI = (apiResponse: Record<string, unknown>): PaymentApplication[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: Record<string, unknown>) =>
    transformPaymentApplicationFromAPI(item, includedData as Record<string, unknown>[])
  )
}

export const transformPaymentApplicationToAPI = (data: PaymentApplicationForm) =>
  toResource('payment-applications', pickAttributes(
    data as unknown as Record<string, unknown>,
    PAYMENT_APPLICATION_KEYS,
    PAYMENT_APPLICATION_NUMERIC
  ))

export const transformPaymentApplicationUpdateToAPI = (id: string, data: Partial<PaymentApplicationForm>) =>
  toResource('payment-applications', pickAttributes(
    data as Record<string, unknown>,
    PAYMENT_APPLICATION_KEYS,
    PAYMENT_APPLICATION_NUMERIC
  ), id)

// ===== PAYMENT METHODS TRANSFORMERS =====

export const transformPaymentMethodFromAPI = (apiData: Record<string, unknown>): PaymentMethod => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  return {
    id: apiData.id as string,
    name: (attributes.name || '') as string,
    code: (attributes.code || '') as string,
    type: (attributes.type || '') as string,
    requiresReference: (attributes.requiresReference ?? attributes.requires_reference ?? false) as boolean,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Legacy fields for backward compatibility
    description: (attributes.description || '') as string,
  }
}

export const transformPaymentMethodsFromAPI = (apiResponse: Record<string, unknown>): PaymentMethod[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  return apiResponse.data.map((item: Record<string, unknown>) =>
    transformPaymentMethodFromAPI(item)
  )
}

export const transformPaymentMethodToAPI = (data: PaymentMethodForm) => {
  return {
    data: {
      type: 'payment-methods',
      attributes: {
        name: data.name,
        code: data.code,
        type: data.type || null,
        requiresReference: data.requiresReference ?? false,
        isActive: data.isActive ?? true,
      },
    },
  }
}

// ===== BANK TRANSACTIONS TRANSFORMERS (v1.1) =====

export const transformBankTransactionFromAPI = (
  apiData: Record<string, unknown>,
  includedData?: Record<string, unknown>[]
): BankTransaction => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  // Resolve bank account name from included data
  let bankAccountName: string | undefined
  const bankAccountId = Number(attributes.bankAccountId || attributes.bank_account_id || 0)
  if (includedData && bankAccountId) {
    const bankAccount = includedData.find(
      (item: Record<string, unknown>) =>
        item.type === 'bank-accounts' && item.id === String(bankAccountId)
    )
    if (bankAccount && bankAccount.attributes) {
      const bankAttrs = bankAccount.attributes as Record<string, unknown>
      bankAccountName = (bankAttrs.accountName || bankAttrs.account_name) as string
    }
  }

  // Resolve reconciled by user name from included data
  let reconciledByName: string | undefined
  const reconciledById = attributes.reconciledById || attributes.reconciled_by_id
  if (includedData && reconciledById) {
    const user = includedData.find(
      (item: Record<string, unknown>) =>
        item.type === 'users' && item.id === String(reconciledById)
    )
    if (user && user.attributes) {
      const userAttrs = user.attributes as Record<string, unknown>
      reconciledByName = (userAttrs.name || userAttrs.email) as string
    }
  }

  return {
    id: apiData.id as string,
    bankAccountId,
    transactionDate: (attributes.transactionDate || attributes.transaction_date || '') as string,
    amount: Number(attributes.amount || 0),
    transactionType: (attributes.transactionType || attributes.transaction_type || 'debit') as BankTransaction['transactionType'],
    reference: (attributes.reference ?? null) as string | null,
    description: (attributes.description ?? null) as string | null,
    reconciliationStatus: (attributes.reconciliationStatus || attributes.reconciliation_status || 'unreconciled') as BankTransaction['reconciliationStatus'],
    reconciledById: reconciledById ? Number(reconciledById) : null,
    reconciledAt: (attributes.reconciledAt || attributes.reconciled_at || null) as string | null,
    reconciliationNotes: (attributes.reconciliationNotes || attributes.reconciliation_notes || null) as string | null,
    statementNumber: (attributes.statementNumber || attributes.statement_number || null) as string | null,
    runningBalance: attributes.runningBalance != null ? Number(attributes.runningBalance) : (attributes.running_balance != null ? Number(attributes.running_balance) : null),
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    bankAccountName,
    reconciledByName,
  }
}

export const transformBankTransactionToParsed = (transaction: BankTransaction): ParsedBankTransaction => {
  const typeConfig = BANK_TRANSACTION_TYPE_CONFIG[transaction.transactionType]
  const statusConfig = RECONCILIATION_STATUS_CONFIG[transaction.reconciliationStatus]

  // Format amount display
  const sign = transaction.transactionType === 'credit' ? '+' : '-'
  const amountDisplay = `${sign}$${Math.abs(transaction.amount).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  return {
    ...transaction,
    amountDisplay,
    statusLabel: statusConfig?.label || transaction.reconciliationStatus,
    typeLabel: typeConfig?.label || transaction.transactionType,
  }
}

export const transformBankTransactionsFromAPI = (
  apiResponse: Record<string, unknown>
): ParsedBankTransaction[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  const includedData = (apiResponse.included || []) as Record<string, unknown>[]
  return apiResponse.data.map((item: Record<string, unknown>) => {
    const transaction = transformBankTransactionFromAPI(item, includedData)
    return transformBankTransactionToParsed(transaction)
  })
}

export const transformBankTransactionToAPI = (data: CreateBankTransactionRequest) => {
  return {
    data: {
      type: 'bank-transactions',
      attributes: {
        bankAccountId: Number(data.bankAccountId),
        transactionDate: data.transactionDate,
        amount: Number(data.amount),
        transactionType: data.transactionType,
        reference: data.reference || null,
        description: data.description || null,
        reconciliationStatus: data.reconciliationStatus || 'unreconciled',
        statementNumber: data.statementNumber || null,
        runningBalance: data.runningBalance != null ? Number(data.runningBalance) : null,
        isActive: data.isActive ?? true,
      },
    },
  }
}

export const transformBankTransactionUpdateToAPI = (id: string, data: UpdateBankTransactionRequest) => {
  const attributes: Record<string, unknown> = {}

  if (data.bankAccountId !== undefined) attributes.bankAccountId = Number(data.bankAccountId)
  if (data.transactionDate !== undefined) attributes.transactionDate = data.transactionDate
  if (data.amount !== undefined) attributes.amount = Number(data.amount)
  if (data.transactionType !== undefined) attributes.transactionType = data.transactionType
  if (data.reference !== undefined) attributes.reference = data.reference
  if (data.description !== undefined) attributes.description = data.description
  if (data.reconciliationStatus !== undefined) attributes.reconciliationStatus = data.reconciliationStatus
  if (data.reconciledById !== undefined) attributes.reconciledById = data.reconciledById
  if (data.reconciledAt !== undefined) attributes.reconciledAt = data.reconciledAt
  if (data.reconciliationNotes !== undefined) attributes.reconciliationNotes = data.reconciliationNotes
  if (data.statementNumber !== undefined) attributes.statementNumber = data.statementNumber
  if (data.runningBalance !== undefined) attributes.runningBalance = data.runningBalance
  if (data.isActive !== undefined) attributes.isActive = data.isActive

  return {
    data: {
      type: 'bank-transactions',
      id,
      attributes,
    },
  }
}

// ===== EARLY PAYMENT DISCOUNT UTILITIES (FI-M002) =====

import type {
  EarlyPaymentDiscountInfo,
  EarlyPaymentTermPreset,
} from '../types'

import { EARLY_PAYMENT_TERM_CONFIG } from '../types'
import { addDaysDateOnly, compareDateOnly, dateToInput, diffDaysDateOnly } from '@lwm/ui'

/**
 * Calculate discount amount based on total and percentage
 */
export const calculateDiscountAmount = (totalAmount: number, discountPercent: number): number => {
  return Math.round(totalAmount * (discountPercent / 100) * 100) / 100
}

/**
 * Calculate the discount date based on invoice date and discount days
 */
export const calculateDiscountDate = (invoiceDate: string, discountDays: number): string => {
  // Fechas sin hora: se suma sobre el dia de calendario, sin zona
  return addDaysDateOnly(invoiceDate, discountDays)
}

/**
 * Apply a preset term to get discount percent and days
 */
export const getPresetTermValues = (preset: EarlyPaymentTermPreset): { discountPercent: number; discountDays: number } => {
  const config = EARLY_PAYMENT_TERM_CONFIG[preset]
  return {
    discountPercent: config.discountPercent,
    discountDays: config.discountDays,
  }
}

/**
 * Check if payment qualifies for early payment discount
 */
export const qualifiesForDiscount = (
  discountDate: string | null,
  discountApplied: boolean,
  asOfDate?: Date
): boolean => {
  if (!discountDate || discountApplied) {
    return false
  }

  // Vale hasta el final del dia de discountDate (fecha local de checkDate)
  const checkDate = asOfDate || new Date()
  return compareDateOnly(dateToInput(checkDate), discountDate) <= 0
}

/**
 * Get effective amount due considering early payment discount
 */
export const getEffectiveAmountDue = (invoice: ARInvoice, asOfDate?: Date): EarlyPaymentDiscountInfo => {
  const checkDate = asOfDate || new Date()
  const remaining = invoice.totalAmount - (invoice.paidAmount || 0)

  if (qualifiesForDiscount(invoice.discountDate, invoice.discountApplied, checkDate) && invoice.discountAmount) {
    const discountedRemaining = remaining - invoice.discountAmount
    const daysUntilDeadline = diffDaysDateOnly(dateToInput(checkDate), invoice.discountDate)

    return {
      originalRemaining: remaining,
      discountAvailable: true,
      discountAmount: invoice.discountAmount,
      discountedRemaining: Math.max(0, discountedRemaining),
      discountDeadline: invoice.discountDate,
      daysUntilDeadline,
    }
  }

  return {
    originalRemaining: remaining,
    discountAvailable: false,
    discountAmount: 0,
    discountedRemaining: remaining,
    discountDeadline: invoice.discountDate,
    daysUntilDeadline: invoice.discountDate
      ? diffDaysDateOnly(dateToInput(checkDate), invoice.discountDate)
      : null,
  }
}

/**
 * Calculate annualized savings rate from taking early payment discount
 * Formula: APR = (Discount % / (100 - Discount %)) x (365 / (Full Days - Discount Days))
 */
export const calculateAnnualizedRate = (
  discountPercent: number,
  discountDays: number,
  fullTermDays: number
): number => {
  if (fullTermDays <= discountDays) {
    return 0
  }

  const daysGained = fullTermDays - discountDays
  const effectiveRate = (discountPercent / (100 - discountPercent)) * (365 / daysGained) * 100

  return Math.round(effectiveRate * 100) / 100
}

/**
 * Format discount terms for display (e.g., "2/10 Net 30")
 */
export const formatDiscountTerms = (
  discountPercent: number | null,
  discountDays: number | null,
  dueDate: string,
  invoiceDate: string
): string => {
  if (!discountPercent || !discountDays) {
    return 'Sin descuento'
  }

  const fullTermDays = diffDaysDateOnly(invoiceDate, dueDate) ?? 0

  return `${discountPercent}/${discountDays} Net ${fullTermDays}`
}
