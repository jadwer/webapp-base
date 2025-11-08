// Finance Module Types - Phase 1 - Updated según backend documentation

export interface APInvoice {
  id: string;
  contactId: string;  // ✅ Backend documentation shows string ID "31"
  contactName?: string;  // ✅ Resolved from includes or fallback
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  exchangeRate: string | null;  // ✅ Backend shows "20.00" as string
  subtotal: string;  // ✅ Backend shows decimal as string "100.00"
  taxTotal: string;  // ✅ Backend shows decimal as string "16.00"
  total: string;     // ✅ Backend shows decimal as string "116.00"
  status: 'draft' | 'posted' | 'paid';
  paidAmount: number;        // ✅ Campo calculado como float
  remainingBalance: number;  // ✅ Campo calculado como float
  metadata?: Record<string, unknown>;  // ✅ Campo opcional del backend
  createdAt: string;
  updatedAt: string;
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
  contactId: string;  // ✅ Consistente con AP Invoice
  contactName?: string; // ✅ Resolved contact name from includes
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  exchangeRate: string | null;  // ✅ Mismo field que AP Invoice
  subtotal: string;   // ✅ Decimal como string
  taxTotal: string;   // ✅ Decimal como string
  total: string;      // ✅ Decimal como string
  status: 'draft' | 'posted' | 'paid';
  paidAmount: number;        // ✅ Campo calculado (misma estructura que AP)
  remainingBalance: number;  // ✅ Campo calculado
  metadata?: Record<string, unknown>;  // ✅ Campo opcional
  createdAt: string;
  updatedAt: string;
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

// Form interfaces for creating/editing - Exact backend fields
export interface APInvoiceForm {
  contactId: string;     // ✅ Backend requires "31" as string
  invoiceNumber: string; // ✅ máx 255 chars, único por proveedor
  invoiceDate: string;   // ✅ formato YYYY-MM-DD
  dueDate: string;       // ✅ formato YYYY-MM-DD
  subtotal: string;      // ✅ string (decimal) "100.00"
  taxTotal: string;      // ✅ string (decimal) "16.00"
  total: string;         // ✅ string (decimal) "116.00"
  status: 'draft' | 'posted' | 'paid';  // ✅ Required field
  currency?: string;     // ✅ Optional, default: MXN
  exchangeRate?: string; // ✅ Optional string (decimal)
  metadata?: Record<string, unknown>; // ✅ Optional object
}

export interface APPaymentForm {
  contactId: string;     // ✅ Backend field: contactId (from APPayment docs line 167)
  paymentDate: string;   // ✅ Backend field: paymentDate
  paymentMethod: string; // ✅ Backend field: paymentMethod
  currency: string;      // ✅ Backend field: currency
  amount: string;        // ✅ Backend field: amount (decimal as string)
  bankAccountId: string | null; // ✅ Backend field: bankAccountId (optional)
  status: 'draft' | 'posted';   // ✅ Backend field: status
}

export interface ARInvoiceForm {
  contactId: string;     // ✅ Consistente con AP
  invoiceNumber: string;
  invoiceDate: string;   // ✅ formato YYYY-MM-DD
  dueDate: string;
  subtotal: string;      // ✅ string (decimal)
  taxTotal: string;      // ✅ string (decimal)
  total: string;         // ✅ string (decimal)
  status: 'draft' | 'posted' | 'paid';  // ✅ Required field
  currency?: string;     // ✅ Optional, default: MXN
  exchangeRate?: string; // ✅ Optional string (decimal)
  metadata?: Record<string, unknown>; // ✅ Optional object
}

export interface ARReceiptForm {
  contactId: string;     // ✅ Backend field: contactId (from ARReceipt docs line 355)
  receiptDate: string;   // ✅ Backend field: receiptDate
  paymentMethod: string; // ✅ Backend field: paymentMethod
  currency: string;      // ✅ Backend field: currency
  amount: string;        // ✅ Backend field: amount (decimal as string)
  bankAccountId: string | null; // ✅ Backend field: bankAccountId (optional)
  status: 'draft' | 'posted';   // ✅ Backend field: status
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