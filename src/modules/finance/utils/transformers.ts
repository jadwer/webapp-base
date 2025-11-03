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

export const transformAPInvoiceFromAPI = (apiData: any, includedData?: any[]): APInvoice => {
  const attributes = apiData.attributes || {}
  
  // Find contact information from included data
  let contactName = `Proveedor ID: ${attributes.contactId}`
  if (includedData && attributes.contactId) {
    const contact = includedData.find((item: any) => 
      item.type === 'contacts' && item.id === String(attributes.contactId)
    )
    if (contact && contact.attributes) {
      contactName = contact.attributes.name || contact.attributes.companyName || contactName
    }
  }
  
  return {
    id: apiData.id,
    contactId: String(attributes.contactId),  // ✅ Backend shows "31" as string
    contactName,                              // ✅ Resolved contact name
    invoiceNumber: attributes.invoiceNumber,
    invoiceDate: attributes.invoiceDate,
    dueDate: attributes.dueDate,
    currency: attributes.currency || 'MXN',   // ✅ Default MXN
    exchangeRate: attributes.exchangeRate,    // ✅ Keep as string "20.00" or null
    subtotal: attributes.subtotal,            // ✅ Keep as string "100.00"
    taxTotal: attributes.taxTotal,            // ✅ Keep as string "16.00"
    total: attributes.total,                  // ✅ Keep as string "116.00"
    status: attributes.status,
    paidAmount: attributes.paidAmount || 0,   // ✅ Float calculated field
    remainingBalance: attributes.remainingBalance || 0, // ✅ Float calculated field
    metadata: attributes.metadata,            // ✅ Include optional metadata
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

export const transformAPPaymentFromAPI = (apiData: any, includedData?: any[]): APPayment => {
  const attributes = apiData.attributes || {}
  
  // Find contact information from included data
  let contactName = `Proveedor ID: ${attributes.contactId}`
  if (includedData && attributes.contactId) {
    const contact = includedData.find((item: any) => 
      item.type === 'contacts' && item.id === String(attributes.contactId)
    )
    if (contact && contact.attributes) {
      contactName = contact.attributes.name || contact.attributes.companyName || contactName
    }
  }
  
  return {
    id: apiData.id,
    contactId: attributes.contactId,              // ✅ CORREGIDO - mantener como number
    contactName,                                  // ✅ Resolved contact name  
    apInvoiceId: attributes.apInvoiceId || null,  // ✅ AGREGADO - nuevo campo
    paymentDate: attributes.paymentDate,
    amount: String(attributes.amount || 0),       // ✅ Ensure string format
    paymentMethod: attributes.paymentMethod || '',
    currency: attributes.currency || 'MXN',
    reference: attributes.reference || '',
    bankAccountId: attributes.bankAccountId,      // ✅ CORREGIDO - mantener como number
    status: attributes.status || 'draft',
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

export const transformARInvoiceFromAPI = (apiData: any, includedData?: any[]): ARInvoice => {
  const attributes = apiData.attributes || {}
  
  // Find contact information from included data
  let contactName = `Cliente ID: ${attributes.contactId}`
  if (includedData && attributes.contactId) {
    const contact = includedData.find((item: any) => 
      item.type === 'contacts' && item.id === String(attributes.contactId)
    )
    if (contact && contact.attributes) {
      contactName = contact.attributes.name || contact.attributes.companyName || contactName
    }
  }
  
  return {
    id: apiData.id,
    contactId: String(attributes.contactId),  // ✅ Consistent with AP Invoice
    contactName,                              // ✅ Resolved contact name
    invoiceNumber: attributes.invoiceNumber,
    invoiceDate: attributes.invoiceDate,
    dueDate: attributes.dueDate,
    currency: attributes.currency || 'MXN',   // ✅ Default MXN
    exchangeRate: attributes.exchangeRate,    // ✅ Same as AP Invoice
    subtotal: attributes.subtotal,            // ✅ Keep as string
    taxTotal: attributes.taxTotal,            // ✅ Keep as string
    total: attributes.total,                  // ✅ Keep as string
    status: attributes.status,
    paidAmount: attributes.paidAmount || 0,   // ✅ Backend uses same field name as AP
    remainingBalance: attributes.remainingBalance || 0, // ✅ Same structure
    metadata: attributes.metadata,            // ✅ Include optional metadata
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

export const transformARReceiptFromAPI = (apiData: any, includedData?: any[]): ARReceipt => {
  const attributes = apiData.attributes || {}
  
  // Find contact information from included data
  let contactName = `Cliente ID: ${attributes.contactId}`
  if (includedData && attributes.contactId) {
    const contact = includedData.find((item: any) => 
      item.type === 'contacts' && item.id === String(attributes.contactId)
    )
    if (contact && contact.attributes) {
      contactName = contact.attributes.name || contact.attributes.companyName || contactName
    }
  }
  
  return {
    id: apiData.id,
    contactId: attributes.contactId,              // ✅ CORREGIDO - mantener como number
    contactName,                                  // ✅ Resolved contact name
    arInvoiceId: attributes.arInvoiceId || null,  // ✅ CORREGIDO - campo confirmado
    receiptDate: attributes.receiptDate,          // ✅ Key difference from paymentDate
    amount: String(attributes.amount || 0),       // ✅ Keep as string decimal
    paymentMethod: attributes.paymentMethod || '',
    currency: attributes.currency || 'MXN',       // ✅ AGREGADO - campo del backend
    reference: attributes.reference || '',
    bankAccountId: attributes.bankAccountId,      // ✅ CORREGIDO - mantener como number
    status: attributes.status || 'draft',
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

export const transformBankAccountFromAPI = (apiData: any): BankAccount => {
  const attributes = apiData.attributes || {}
  
  return {
    id: apiData.id,
    bankName: attributes.bankName,
    accountNumber: attributes.accountNumber,
    clabe: attributes.clabe,
    currency: attributes.currency,
    accountType: attributes.accountType,
    openingBalance: attributes.openingBalance, // ✅ Keep as string decimal
    status: attributes.status,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

// ===== FRONTEND TO JSON:API TRANSFORMERS =====

export const transformAPInvoiceToAPI = (formData: APInvoiceForm) => ({
  data: {
    type: 'a-p-invoices',
    attributes: {
      contactId: parseInt(formData.contactId),    // ✅ Convert to number as per backend docs
      invoiceNumber: formData.invoiceNumber,      // ✅ Required, max 255, unique per supplier
      invoiceDate: formData.invoiceDate,          // ✅ YYYY-MM-DD format
      dueDate: formData.dueDate,                  // ✅ YYYY-MM-DD format
      subtotal: parseFloat(formData.subtotal),    // ✅ Convert to number as per backend docs
      taxTotal: parseFloat(formData.taxTotal),    // ✅ Convert to number as per backend docs
      total: parseFloat(formData.total),          // ✅ Convert to number as per backend docs
      status: formData.status,                    // ✅ Required: draft|posted|paid
      currency: formData.currency || 'MXN',       // ✅ Optional, default MXN
      exchangeRate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : null, // ✅ Convert to number
      metadata: formData.metadata || {},          // ✅ Optional object
    },
  },
})

export const transformAPPaymentToAPI = (formData: APPaymentForm) => ({
  data: {
    type: 'a-p-payments',
    attributes: {
      contactId: parseInt(formData.contactId),                                    // ✅ Updated field
      paymentDate: formData.paymentDate,                                          // ✅ YYYY-MM-DD format
      paymentMethod: formData.paymentMethod,                                      // ✅ Required field
      currency: formData.currency,                                                // ✅ Required field  
      amount: parseFloat(formData.amount),                                        // ✅ Convert to number
      bankAccountId: formData.bankAccountId ? parseInt(formData.bankAccountId) : null, // ✅ Optional number
      status: formData.status,                                                    // ✅ Required field
    },
  },
})

export const transformARInvoiceToAPI = (formData: ARInvoiceForm) => ({
  data: {
    type: 'a-r-invoices',
    attributes: {
      contactId: parseInt(formData.contactId),    // ✅ Convert to number as per backend docs
      invoiceNumber: formData.invoiceNumber,      // ✅ Required, max 255
      invoiceDate: formData.invoiceDate,          // ✅ YYYY-MM-DD format
      dueDate: formData.dueDate,                  // ✅ YYYY-MM-DD format
      subtotal: parseFloat(formData.subtotal),    // ✅ Convert to number as per backend docs
      taxTotal: parseFloat(formData.taxTotal),    // ✅ Convert to number as per backend docs
      total: parseFloat(formData.total),          // ✅ Convert to number as per backend docs
      status: formData.status,                    // ✅ Required: draft|posted|paid
      currency: formData.currency || 'MXN',       // ✅ Optional, default MXN
      exchangeRate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : null, // ✅ Convert to number
      metadata: formData.metadata || {},          // ✅ Optional object
    },
  },
})

export const transformARReceiptToAPI = (formData: ARReceiptForm) => ({
  data: {
    type: 'a-r-receipts',
    attributes: {
      contactId: parseInt(formData.contactId),                                    // ✅ Updated field
      receiptDate: formData.receiptDate,                                          // ✅ YYYY-MM-DD format
      paymentMethod: formData.paymentMethod,                                      // ✅ Required field
      currency: formData.currency,                                                // ✅ Required field
      amount: parseFloat(formData.amount),                                        // ✅ Convert to number
      bankAccountId: formData.bankAccountId ? parseInt(formData.bankAccountId) : null, // ✅ Optional number
      status: formData.status,                                                    // ✅ Required field
    },
  },
})

// ===== BATCH TRANSFORMERS =====

export const transformAPInvoicesFromAPI = (apiResponse: any): APInvoice[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }
  
  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: any) => transformAPInvoiceFromAPI(item, includedData))
}

export const transformAPPaymentsFromAPI = (apiResponse: any): APPayment[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }
  
  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: any) => transformAPPaymentFromAPI(item, includedData))
}

export const transformARInvoicesFromAPI = (apiResponse: any): ARInvoice[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }
  
  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: any) => transformARInvoiceFromAPI(item, includedData))
}

export const transformARReceiptsFromAPI = (apiResponse: any): ARReceipt[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }
  
  // Pass included data to each transformer
  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: any) => transformARReceiptFromAPI(item, includedData))
}

export const transformBankAccountsFromAPI = (apiResponse: any): BankAccount[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }
  
  return apiResponse.data.map(transformBankAccountFromAPI)
}

// ===== RELATIONSHIP EXTRACTORS =====

export const extractContactFromInvoice = (apiData: any) => {
  const relationships = apiData.relationships || {}
  const contact = relationships.contact?.data
  
  if (!contact) return null
  
  return {
    id: contact.id,
    type: contact.type,
  }
}

export const extractBankAccountFromPayment = (apiData: any) => {
  const relationships = apiData.relationships || {}
  const bankAccount = relationships.bankAccount?.data
  
  if (!bankAccount) return null
  
  return {
    id: bankAccount.id,
    type: bankAccount.type,
  }
}

// ===== VALIDATION HELPERS =====

export const validateAPInvoiceData = (data: any): string[] => {
  const errors: string[] = []
  
  if (!data.contactId) errors.push('contactId is required')
  if (!data.invoiceNumber) errors.push('invoiceNumber is required')
  if (!data.invoiceDate) errors.push('invoiceDate is required')
  if (!data.dueDate) errors.push('dueDate is required')
  if (!data.total || data.total <= 0) errors.push('total must be greater than 0')
  
  return errors
}

export const validateARInvoiceData = (data: any): string[] => {
  const errors: string[] = []
  
  if (!data.contactId) errors.push('contactId is required')
  if (!data.invoiceNumber) errors.push('invoiceNumber is required')
  if (!data.invoiceDate) errors.push('invoiceDate is required')
  if (!data.dueDate) errors.push('dueDate is required')
  if (!data.total || data.total <= 0) errors.push('total must be greater than 0')
  
  return errors
}

export const validatePaymentData = (data: any, maxAmount: number): string[] => {
  const errors: string[] = []
  
  if (!data.bankAccountId) errors.push('bankAccountId is required')
  if (!data.amount || data.amount <= 0) errors.push('amount must be greater than 0')
  if (data.amount > maxAmount) errors.push(`amount cannot exceed ${maxAmount}`)
  if (!data.reference) errors.push('reference is required')
  
  return errors
}
// ===== PAYMENT APPLICATIONS TRANSFORMERS =====

export const transformPaymentApplicationFromAPI = (apiData: any, includedData?: any[]): PaymentApplication => {
  const attributes = apiData.attributes || {}

  // Resolve invoice number from included data
  let invoiceNumber: string | undefined
  if (includedData) {
    const invoice = includedData.find((item: any) =>
      (item.type === 'ar-invoices' && item.id === String(attributes.arInvoiceId)) ||
      (item.type === 'ap-invoices' && item.id === String(attributes.apInvoiceId))
    )
    if (invoice && invoice.attributes) {
      invoiceNumber = invoice.attributes.invoiceNumber
    }
  }

  // Resolve payment number from included data
  let paymentNumber: string | undefined
  if (includedData) {
    const payment = includedData.find((item: any) =>
      item.type === 'payments' && item.id === String(attributes.paymentId)
    )
    if (payment && payment.attributes) {
      paymentNumber = payment.attributes.paymentNumber || `Payment #${attributes.paymentId}`
    }
  }

  return {
    id: apiData.id,
    paymentId: String(attributes.paymentId),
    arInvoiceId: attributes.arInvoiceId ? String(attributes.arInvoiceId) : null,
    apInvoiceId: attributes.apInvoiceId ? String(attributes.apInvoiceId) : null,
    amount: String(attributes.amount || 0),
    applicationDate: attributes.applicationDate,
    invoiceNumber,
    paymentNumber,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

export const transformPaymentApplicationsFromAPI = (apiResponse: any): PaymentApplication[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  const includedData = apiResponse.included || []
  return apiResponse.data.map((item: any) =>
    transformPaymentApplicationFromAPI(item, includedData)
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
        amount: data.amount,
        applicationDate: data.applicationDate,
      },
    },
  }
}

// ===== PAYMENT METHODS TRANSFORMERS =====

export const transformPaymentMethodFromAPI = (apiData: any): PaymentMethod => {
  const attributes = apiData.attributes || {}

  return {
    id: apiData.id,
    name: attributes.name,
    code: attributes.code,
    description: attributes.description || '',
    requiresReference: attributes.requiresReference ?? false,
    isActive: attributes.isActive ?? true,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  }
}

export const transformPaymentMethodsFromAPI = (apiResponse: any): PaymentMethod[] => {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return []
  }

  return apiResponse.data.map((item: any) =>
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
        description: data.description || '',
        requiresReference: data.requiresReference ?? false,
        isActive: data.isActive ?? true,
      },
    },
  }
}
