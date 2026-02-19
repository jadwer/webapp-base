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

  // FI-M002: Early Payment Discount fields
  discountPercent: number | null;
  discountDays: number | null;
  discountDate: string | null;
  discountAmount: number | null;
  discountApplied: boolean;
  discountAppliedAmount: number | null;
  discountAppliedDate: string | null;

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
  glAccountId: number | null;
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
  type: string;
  requiresReference: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Legacy fields for backward compatibility
  description?: string;
}

// ===== FORM INTERFACES =====

export interface BankAccountForm {
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  glAccountId?: number | null;
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
  // FI-M002: Early Payment Discount fields
  discountPercent?: number | null;
  discountDays?: number | null;
  discountDate?: string | null;
  discountAmount?: number | null;
  discountApplied?: boolean;
  discountAppliedAmount?: number | null;
  discountAppliedDate?: string | null;
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
  type?: string;
  requiresReference?: boolean;
  isActive?: boolean;
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

// ===== BANK TRANSACTION (v1.1) =====
export type BankTransactionType = 'debit' | 'credit';
export type ReconciliationStatus = 'unreconciled' | 'reconciled' | 'pending';

export interface BankTransaction {
  id: string;
  bankAccountId: number;
  transactionDate: string;
  amount: number;
  transactionType: BankTransactionType;
  reference: string | null;
  description: string | null;
  reconciliationStatus: ReconciliationStatus;
  reconciledById: number | null;
  reconciledAt: string | null;
  reconciliationNotes: string | null;
  statementNumber: string | null;
  runningBalance: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Resolved from includes
  bankAccountName?: string;
  reconciledByName?: string;
}

export interface ParsedBankTransaction extends BankTransaction {
  // UI-friendly computed properties
  amountDisplay: string;
  statusLabel: string;
  typeLabel: string;
}

export interface BankTransactionFormData {
  bankAccountId: number;
  transactionDate: string;
  amount: number;
  transactionType: BankTransactionType;
  reference?: string;
  description?: string;
  reconciliationStatus?: ReconciliationStatus;
  reconciledById?: number;
  reconciledAt?: string;
  reconciliationNotes?: string;
  statementNumber?: string;
  runningBalance?: number;
  isActive?: boolean;
}

export interface CreateBankTransactionRequest {
  bankAccountId: number;
  transactionDate: string;
  amount: number;
  transactionType: BankTransactionType;
  reference?: string;
  description?: string;
  reconciliationStatus?: ReconciliationStatus;
  statementNumber?: string;
  runningBalance?: number;
  isActive?: boolean;
}

export interface UpdateBankTransactionRequest {
  bankAccountId?: number;
  transactionDate?: string;
  amount?: number;
  transactionType?: BankTransactionType;
  reference?: string;
  description?: string;
  reconciliationStatus?: ReconciliationStatus;
  reconciledById?: number;
  reconciledAt?: string;
  reconciliationNotes?: string;
  statementNumber?: string;
  runningBalance?: number;
  isActive?: boolean;
}

export interface BankTransactionFilters {
  search?: string;
  bankAccountId?: number;
  transactionType?: BankTransactionType;
  reconciliationStatus?: ReconciliationStatus;
  statementNumber?: string;
  reference?: string;
  isActive?: boolean;
}

export interface BankTransactionSortOptions {
  field: 'transactionDate' | 'amount' | 'transactionType' | 'reconciliationStatus' | 'createdAt' | 'statementNumber';
  direction: 'asc' | 'desc';
}

// Hook result types
export interface UseBankTransactionsResult {
  bankTransactions: ParsedBankTransaction[];
  isLoading: boolean;
  error: Error | null;
  meta?: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  mutate: () => void;
}

export interface UseBankTransactionResult {
  bankTransaction?: ParsedBankTransaction;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

export interface UseBankTransactionMutationsResult {
  createBankTransaction: (data: CreateBankTransactionRequest) => Promise<ParsedBankTransaction>;
  updateBankTransaction: (id: string, data: UpdateBankTransactionRequest) => Promise<ParsedBankTransaction>;
  deleteBankTransaction: (id: string) => Promise<void>;
  reconcile: (id: string, notes?: string) => Promise<ParsedBankTransaction>;
  unreconcile: (id: string) => Promise<ParsedBankTransaction>;
  isLoading: boolean;
}

// UI Configuration
export interface BankTransactionTypeConfig {
  label: string;
  icon: string;
  badgeClass: string;
  description: string;
}

export interface ReconciliationStatusConfig {
  label: string;
  badgeClass: string;
  description: string;
}

// Constants for UI
export const BANK_TRANSACTION_TYPE_CONFIG: Record<BankTransactionType, BankTransactionTypeConfig> = {
  debit: {
    label: 'Debito',
    icon: 'bi-arrow-down-circle',
    badgeClass: 'bg-danger',
    description: 'Salida de dinero de la cuenta'
  },
  credit: {
    label: 'Credito',
    icon: 'bi-arrow-up-circle',
    badgeClass: 'bg-success',
    description: 'Entrada de dinero a la cuenta'
  }
};

export const RECONCILIATION_STATUS_CONFIG: Record<ReconciliationStatus, ReconciliationStatusConfig> = {
  unreconciled: {
    label: 'Sin Conciliar',
    badgeClass: 'bg-warning text-dark',
    description: 'Transaccion pendiente de conciliacion'
  },
  pending: {
    label: 'Pendiente',
    badgeClass: 'bg-info',
    description: 'Transaccion en proceso de conciliacion'
  },
  reconciled: {
    label: 'Conciliada',
    badgeClass: 'bg-success',
    description: 'Transaccion conciliada correctamente'
  }
};

export const BANK_TRANSACTION_TYPE_OPTIONS = [
  { value: 'debit', label: 'Debito (Salida)' },
  { value: 'credit', label: 'Credito (Entrada)' }
];

export const RECONCILIATION_STATUS_OPTIONS = [
  { value: 'unreconciled', label: 'Sin Conciliar' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'reconciled', label: 'Conciliada' }
];

// ===== EARLY PAYMENT DISCOUNT (FI-M002) =====

/**
 * Common payment term presets
 * Format: discount% / days Net fullDays
 * Example: 2/10 Net 30 = 2% discount if paid in 10 days, full amount due in 30 days
 */
export type EarlyPaymentTermPreset = '2/10 Net 30' | '1/15 Net 45' | '3/5 Net 30' | '2/15 Net 60';

export interface EarlyPaymentTermConfig {
  label: string;
  discountPercent: number;
  discountDays: number;
  description: string;
}

export const EARLY_PAYMENT_TERM_CONFIG: Record<EarlyPaymentTermPreset, EarlyPaymentTermConfig> = {
  '2/10 Net 30': {
    label: '2/10 Net 30',
    discountPercent: 2.0,
    discountDays: 10,
    description: '2% descuento si paga en 10 dias, vencimiento en 30 dias'
  },
  '1/15 Net 45': {
    label: '1/15 Net 45',
    discountPercent: 1.0,
    discountDays: 15,
    description: '1% descuento si paga en 15 dias, vencimiento en 45 dias'
  },
  '3/5 Net 30': {
    label: '3/5 Net 30',
    discountPercent: 3.0,
    discountDays: 5,
    description: '3% descuento si paga en 5 dias, vencimiento en 30 dias'
  },
  '2/15 Net 60': {
    label: '2/15 Net 60',
    discountPercent: 2.0,
    discountDays: 15,
    description: '2% descuento si paga en 15 dias, vencimiento en 60 dias'
  }
};

export const EARLY_PAYMENT_TERM_OPTIONS = [
  { value: '2/10 Net 30', label: '2/10 Net 30 (2% en 10 dias)' },
  { value: '1/15 Net 45', label: '1/15 Net 45 (1% en 15 dias)' },
  { value: '3/5 Net 30', label: '3/5 Net 30 (3% en 5 dias)' },
  { value: '2/15 Net 60', label: '2/15 Net 60 (2% en 15 dias)' }
];

export interface EarlyPaymentDiscountInfo {
  originalRemaining: number;
  discountAvailable: boolean;
  discountAmount: number;
  discountedRemaining: number;
  discountDeadline: string | null;
  daysUntilDeadline: number | null;
}

export interface EarlyPaymentAnalysis {
  worthTaking: boolean;
  annualizedRate: number;
  costOfCapital: number;
  savingsVsCost: number;
  discountAmount: number;
  reason: string;
}

export interface EarlyPaymentSavingsSummary {
  totalEligibleInvoices: number;
  totalInvoiceAmount: number;
  totalRemainingAmount: number;
  totalDiscountAvailable: number;
  potentialSavingsPercent: number;
  byContact: Record<string, {
    invoiceCount: number;
    totalDiscount: number;
    totalRemaining: number;
    earliestDeadline: string;
  }>;
}