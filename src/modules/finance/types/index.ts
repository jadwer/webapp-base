// Finance Module Types - Synced with FINANCE_FRONTEND_GUIDE.md 2025-12-28

// ===== TYPE ALIASES FOR ENUMS =====
export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'void';
export type PaymentStatus = 'draft' | 'pending' | 'completed' | 'cancelled' | 'void'
  | 'posted';  // Legacy frontend value (backend uses 'completed')
export type BankAccountStatus = 'active' | 'inactive' | 'closed';  // Legacy, backend only uses isActive

// ===== ARINVOICE (Accounts Receivable) =====
export interface ARInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  contactId: number;
  salesOrderId: number | null;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  // Payment tracking (writable fields)
  paidAmount: number;
  paidDate: string | null;

  status: InvoiceStatus;
  journalEntryId: number | null;
  fiscalPeriodId: number | null;

  // Refund/void handling
  isRefund: boolean;
  refundOfInvoiceId: number | null;
  voidedAt: string | null;
  voidedById: number | null;
  voidReason: string | null;

  notes: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Resolved from includes
  contactName?: string;
}

// ===== APINVOICE (Accounts Payable) =====
export interface APInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  contactId: number;
  purchaseOrderId: number | null;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  // Payment tracking (writable fields)
  paidAmount: number;
  paidDate: string | null;

  status: InvoiceStatus;
  journalEntryId: number | null;
  fiscalPeriodId: number | null;

  // Refund/void handling
  isRefund: boolean;
  refundOfInvoiceId: number | null;
  voidedAt: string | null;
  voidedById: number | null;
  voidReason: string | null;

  notes: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Resolved from includes
  contactName?: string;
}

// ===== PAYMENT (Unified for AR/AP) =====
// Backend uses unified Payment entity, NOT separate APPayment/ARReceipt
export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  contactId: number;
  bankAccountId: number;
  paymentMethodId: number;
  amount: number;
  currency: string;

  // Payment application tracking
  appliedAmount: number;
  unappliedAmount: number;

  status: PaymentStatus;
  journalEntryId: number | null;
  reference: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Resolved from includes
  contactName?: string;
  bankAccountName?: string;
  paymentMethodName?: string;
}

// Legacy aliases for backward compatibility
export type APPayment = Payment & {
  apInvoiceId?: number | null;  // Legacy field
  paymentMethod?: string;       // Legacy field (now use paymentMethodId)
};

export type ARReceipt = Payment & {
  arInvoiceId?: number | null;  // Legacy field
  receiptDate?: string;         // Legacy alias for paymentDate
  paymentMethod?: string;       // Legacy field (now use paymentMethodId)
};

// ===== PAYMENT APPLICATION =====
export interface PaymentApplication {
  id: string;
  paymentId: number;
  arInvoiceId: number | null;
  apInvoiceId: number | null;
  appliedAmount: number;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  // Resolved from includes
  invoiceNumber?: string;
  paymentNumber?: string;
  // Legacy field
  applicationDate?: string;
  amount?: string;  // Legacy alias for appliedAmount as string
}

// ===== BANK ACCOUNT =====
export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  currentBalance: number;
  accountType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Legacy fields for backward compatibility
  clabe?: string;
  openingBalance?: string;
  status?: BankAccountStatus;
}

// ===== PAYMENT METHOD =====
export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Legacy fields for backward compatibility
  description?: string;
  requiresReference?: boolean;
}

// ===== FORM INTERFACES =====

export interface BankAccountForm {
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  currentBalance?: number;
  accountType: string;
  isActive?: boolean;
  // Legacy fields
  clabe?: string;
  openingBalance?: string;
  status?: BankAccountStatus;
}

export interface ARInvoiceForm {
  contactId: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  salesOrderId?: number | null;
  currency?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface APInvoiceForm {
  contactId: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  purchaseOrderId?: number | null;
  currency?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentForm {
  paymentNumber: string;
  paymentDate: string;
  contactId: number;
  bankAccountId: number;
  paymentMethodId: number;
  amount: number;
  currency: string;
  appliedAmount?: number;
  unappliedAmount?: number;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// Legacy form interfaces for backward compatibility
export interface APPaymentForm {
  contactId: number;
  apInvoiceId?: number | null;
  paymentDate: string;
  paymentMethod?: string;  // Legacy, use paymentMethodId
  paymentMethodId?: number;
  currency: string;
  amount: number;
  bankAccountId?: number | null;
  reference?: string;
  status: string;
}

export interface ARReceiptForm {
  contactId: number;
  arInvoiceId?: number | null;
  receiptDate: string;  // Legacy alias for paymentDate
  paymentMethod?: string;  // Legacy, use paymentMethodId
  paymentMethodId?: number;
  currency: string;
  amount: number;
  bankAccountId?: number | null;
  reference?: string;
  status: string;
}

export interface PaymentApplicationForm {
  paymentId: number;
  arInvoiceId?: number | null;
  apInvoiceId?: number | null;
  appliedAmount: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethodForm {
  name: string;
  code: string;
  isActive?: boolean;
  // Legacy fields
  description?: string;
  requiresReference?: boolean;
}

// ===== API RESPONSE TYPES =====

export interface FinanceAPIResponse<T> {
  jsonapi: { version: string };
  data: T[];
  meta?: {
    page?: {
      currentPage: number;
      from: number;
      lastPage: number;
      perPage: number;
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

export interface FinanceAPIError {
  jsonapi: { version: string };
  errors: Array<{
    status: string;
    title: string;
    detail: string;
    source?: {
      pointer?: string;
    };
  }>;
}