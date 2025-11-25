// Finance Module Types - Updated 2025-11-11 según backend documentation

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'void';

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

export interface APPayment {
  id: string;
  contactId: number;           // ✅ CORREGIDO - es number según backend
  contactName?: string;        // ✅ Resolved from includes
  apInvoiceId: number | null;  // ✅ AGREGADO - campo confirmado por backend
  paymentDate: string;         // ✅ ISO date
  amount: string;              // ✅ Decimal como string para consistency
  paymentMethod: string;
  currency: string;            // ✅ Currency field from backend
  reference?: string;          // ✅ Puede ser opcional
  bankAccountId: number;       // ✅ CORREGIDO - es number según backend
  status: string;              // ✅ Ampliado - puede tener más valores
  createdAt: string;
  updatedAt: string;
}

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

export interface ARReceipt {
  id: string;
  contactId: number;           // ✅ CORREGIDO - es number según backend
  contactName?: string;        // ✅ Resolved from includes
  arInvoiceId: number | null;  // ✅ CORREGIDO - campo confirmado por backend
  receiptDate: string;         // ✅ NO paymentDate - específico para receipts
  amount: string;              // ✅ Decimal como string para consistency
  paymentMethod: string;
  currency: string;            // ✅ Currency field from backend
  reference?: string;          // ✅ Puede ser opcional
  bankAccountId: number;       // ✅ CORREGIDO - es number según backend
  status: string;              // ✅ Ampliado - puede tener más valores
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  clabe: string;
  currency: string;
  accountType: string;
  openingBalance: string;  // ✅ Decimal como string para consistency
  status: 'active' | 'inactive' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountForm {
  bankName: string;        // ✅ Backend field: bankName
  accountNumber: string;   // ✅ Backend field: accountNumber
  clabe: string;          // ✅ Backend field: clabe (not routingNumber)
  currency: string;       // ✅ Backend field: currency
  accountType: string;    // ✅ Backend field: accountType
  openingBalance: string; // ✅ Backend field: openingBalance
  status: 'active' | 'inactive' | 'closed'; // ✅ Backend field: status
}

// Form interfaces for creating/editing
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

export interface APPaymentForm {
  contactId: number;
  apInvoiceId?: number | null;
  paymentDate: string;
  paymentMethod: string;
  currency: string;
  amount: number;
  bankAccountId?: number | null;
  reference?: string;
  status: string;
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

export interface ARReceiptForm {
  contactId: number;
  arInvoiceId?: number | null;
  receiptDate: string;
  paymentMethod: string;
  currency: string;
  amount: number;
  bankAccountId?: number | null;
  reference?: string;
  status: string;
}

// API Response types - JSON:API v1.1 compliant
export interface FinanceAPIResponse<T> {
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

export interface FinanceAPIError {
  jsonapi: { version: string };
  errors: Array<{
    status: string;     // ✅ "422", "401", etc.
    title: string;      // ✅ "Unprocessable Entity"
    detail: string;     // ✅ "El campo Invoice number es obligatorio."
    source?: {
      pointer?: string; // ✅ "/data/attributes/invoiceNumber"
    };
  }>;
}

// Payment Application - Unifies payments with invoices (AR/AP)
export interface PaymentApplication {
  id: string;
  paymentId: string;            // FK to payments
  arInvoiceId: string | null;   // FK to ar_invoices (nullable if AP)
  apInvoiceId: string | null;   // FK to ap_invoices (nullable if AR)
  amount: string;               // Decimal as string for precision
  applicationDate: string;      // ISO date
  invoiceNumber?: string;       // Resolved from invoice relationship
  paymentNumber?: string;       // Resolved from payment relationship
  createdAt: string;
  updatedAt: string;
}

export interface PaymentApplicationForm {
  paymentId: string;            // Required
  arInvoiceId?: string | null;  // Either arInvoiceId OR apInvoiceId required
  apInvoiceId?: string | null;  // Either arInvoiceId OR apInvoiceId required
  amount: string;               // Required - decimal as string
  applicationDate: string;      // Required - ISO date format
}

// Payment Method - Defines available payment methods (cash, transfer, card, etc.)
export interface PaymentMethod {
  id: string;
  name: string;                 // e.g., "Cash", "Bank Transfer", "Credit Card"
  code: string;                 // e.g., "CASH", "TRANSFER", "CARD"
  description?: string;         // Optional description
  requiresReference: boolean;   // Whether this method requires a reference number
  isActive: boolean;            // Active status
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodForm {
  name: string;                 // Required
  code: string;                 // Required - unique identifier
  description?: string;         // Optional
  requiresReference: boolean;   // Default: false
  isActive: boolean;            // Default: true
}