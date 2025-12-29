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
  ARReceiptForm,
  PaymentApplication,
  PaymentApplicationForm,
  PaymentMethod,
  PaymentMethodForm,
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
    // Legacy fields for backward compatibility
    apInvoiceId: (attributes.apInvoiceId ?? attributes.ap_invoice_id ?? null) as number | null,
    paymentMethod: (attributes.paymentMethod || '') as string,
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
    paymentDate: (attributes.paymentDate || attributes.payment_date || attributes.receiptDate || attributes.receipt_date || '') as string,
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
    // Legacy fields for backward compatibility
    arInvoiceId: (attributes.arInvoiceId ?? attributes.ar_invoice_id ?? null) as number | null,
    receiptDate: (attributes.receiptDate || attributes.receipt_date || attributes.paymentDate || '') as string,
    paymentMethod: (attributes.paymentMethod || '') as string,
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
    currentBalance: Number(attributes.currentBalance || attributes.current_balance || 0),
    accountType: (attributes.accountType || attributes.account_type || '') as string,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Legacy fields for backward compatibility
    clabe: (attributes.clabe || '') as string,
    openingBalance: String(attributes.openingBalance || attributes.opening_balance || '0'),
    status: (attributes.status || (attributes.isActive ? 'active' : 'inactive')) as BankAccount['status'],
  }
}

// ===== FRONTEND TO JSON:API TRANSFORMERS =====

export const transformAPInvoiceToAPI = (formData: APInvoiceForm) => ({
  data: {
    type: 'a-p-invoices',
    attributes: {
      contact_id: formData.contactId,
      invoice_number: formData.invoiceNumber,
      invoice_date: formData.invoiceDate,
      due_date: formData.dueDate,
      purchase_order_id: formData.purchaseOrderId || null,
      currency: formData.currency || 'MXN',
      subtotal: formData.subtotal,
      tax_amount: formData.taxAmount,
      total_amount: formData.totalAmount,
      status: formData.status,
      notes: formData.notes || null,
      metadata: formData.metadata || {},
    },
  },
})

export const transformAPPaymentToAPI = (formData: APPaymentForm) => ({
  data: {
    type: 'a-p-payments',
    attributes: {
      contactId: formData.contactId,                                              // ✅ Updated field
      paymentDate: formData.paymentDate,                                          // ✅ YYYY-MM-DD format
      paymentMethod: formData.paymentMethod,                                      // ✅ Required field
      currency: formData.currency,                                                // ✅ Required field  
      amount: formData.amount,                                                    // ✅ Convert to number
      bankAccountId: formData.bankAccountId,                                       // ✅ Optional number
      status: formData.status,                                                    // ✅ Required field
    },
  },
})

export const transformARInvoiceToAPI = (formData: ARInvoiceForm) => ({
  data: {
    type: 'a-r-invoices',
    attributes: {
      contact_id: formData.contactId,
      invoice_number: formData.invoiceNumber,
      invoice_date: formData.invoiceDate,
      due_date: formData.dueDate,
      sales_order_id: formData.salesOrderId || null,
      currency: formData.currency || 'MXN',
      subtotal: formData.subtotal,
      tax_amount: formData.taxAmount,
      total_amount: formData.totalAmount,
      status: formData.status,
      notes: formData.notes || null,
      metadata: formData.metadata || {},
    },
  },
})

export const transformARReceiptToAPI = (formData: ARReceiptForm) => ({
  data: {
    type: 'a-r-receipts',
    attributes: {
      contactId: formData.contactId,                                              // ✅ Updated field
      receiptDate: formData.receiptDate,                                          // ✅ YYYY-MM-DD format
      paymentMethod: formData.paymentMethod,                                      // ✅ Required field
      currency: formData.currency,                                                // ✅ Required field
      amount: formData.amount,                                                    // ✅ Convert to number
      bankAccountId: formData.bankAccountId,                                       // ✅ Optional number
      status: formData.status,                                                    // ✅ Required field
    },
  },
})

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
      (item.type === 'ar-invoices' && item.id === String(attributes.arInvoiceId)) ||
      (item.type === 'ap-invoices' && item.id === String(attributes.apInvoiceId))
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
    apInvoiceId: attributes.apInvoiceId != null ? Number(attributes.apInvoiceId) : (attributes.ap_invoice_id != null ? Number(attributes.ap_invoice_id) : null),
    appliedAmount: Number(attributes.appliedAmount || attributes.applied_amount || 0),
    notes: (attributes.notes ?? null) as string | null,
    metadata: (attributes.metadata ?? null) as Record<string, unknown> | null,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Resolved from includes
    invoiceNumber,
    paymentNumber,
    // Legacy fields
    applicationDate: (attributes.applicationDate || attributes.application_date || attributes.createdAt || '') as string,
    amount: String(attributes.appliedAmount || attributes.applied_amount || 0),
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

export const transformPaymentApplicationToAPI = (data: PaymentApplicationForm) => {
  return {
    data: {
      type: 'payment-applications',
      attributes: {
        paymentId: data.paymentId,
        arInvoiceId: data.arInvoiceId || null,
        apInvoiceId: data.apInvoiceId || null,
        appliedAmount: data.appliedAmount,
        notes: data.notes || null,
        metadata: data.metadata || null,
      },
    },
  }
}

// ===== PAYMENT METHODS TRANSFORMERS =====

export const transformPaymentMethodFromAPI = (apiData: Record<string, unknown>): PaymentMethod => {
  const attributes = (apiData.attributes || {}) as Record<string, unknown>

  return {
    id: apiData.id as string,
    name: (attributes.name || '') as string,
    code: (attributes.code || '') as string,
    isActive: (attributes.isActive ?? attributes.is_active ?? true) as boolean,
    createdAt: (attributes.createdAt || attributes.created_at || '') as string,
    updatedAt: (attributes.updatedAt || attributes.updated_at || '') as string,
    // Legacy fields for backward compatibility
    description: (attributes.description || '') as string,
    requiresReference: (attributes.requiresReference ?? attributes.requires_reference ?? false) as boolean,
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
        isActive: data.isActive ?? true,
      },
    },
  }
}
