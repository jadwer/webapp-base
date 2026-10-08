// Finance Module Types - Synced with FINANCE_FRONTEND_GUIDE.md 2025-12-28

// ===== TYPE ALIASES FOR ENUMS =====
// Espejo de Rule::in en ARInvoiceRequest/APInvoiceRequest. "Vencida" no es un
// estado: se calcula con dueDate (ver isInvoiceOverdue en utils).
export const INVOICE_STATUSES = ['draft', 'pending', 'posted', 'partial', 'paid', 'void', 'voided', 'cancelled'] as const;
export type InvoiceStatus = typeof INVOICE_STATUSES[number];

// Espejo de Rule::in en PaymentRequest.
export const PAYMENT_STATUSES = ['draft', 'unapplied', 'partial', 'applied', 'fully_applied', 'void', 'voided'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export type BankAccountStatus = 'active' | 'inactive' | 'closed';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  posted: 'Contabilizada',
  partial: 'Pago parcial',
  paid: 'Pagada',
  void: 'Anulada',
  voided: 'Anulada',
  cancelled: 'Cancelada',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  draft: 'Borrador',
  unapplied: 'Sin aplicar',
  partial: 'Aplicado parcial',
  applied: 'Aplicado',
  fully_applied: 'Aplicado total',
  void: 'Anulado',
  voided: 'Anulado',
};

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

// Pagos a proveedor y cobros a cliente viven en el mismo recurso `payments`.
export type APPayment = Payment;
export type ARReceipt = Payment;

// ===== PAYMENT APPLICATION =====
// El backend solo aplica pagos a facturas AR (no existe apInvoiceId).
export interface PaymentApplication {
  id: string;
  paymentId: number;
  arInvoiceId: number | null;
  amount: number;
  applicationDate: string | null;
  notes: string | null;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  // Resolved from includes
  invoiceNumber?: string;
  paymentNumber?: string;
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
  openingBalance: number;
  status: BankAccountStatus | string;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

// accountName y glAccountId son NOT NULL en la tabla bank_accounts.
export interface BankAccountForm {
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  glAccountId: number;
  openingBalance?: number;
  currentBalance?: number;
  status?: BankAccountStatus;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
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

// Alta de pago/cobro (POST /payments). La tabla exige paymentNumber,
// bankAccountId y paymentMethodId aunque el Request los marque nullable.
export interface APPaymentForm {
  // Opcional: el backend genera PAY-000001 cuando no viene
  paymentNumber?: string;
  paymentDate: string;
  contactId: number;
  bankAccountId: number;
  paymentMethodId: number;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
}

export type ARReceiptForm = APPaymentForm;

export interface PaymentApplicationForm {
  paymentId: number;
  arInvoiceId: number;
  amount: number;
  applicationDate?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// ===== AR INVOICE PAYMENT REGISTRATION =====
// POST /api/v1/ar-invoices/{id}/register-payment
export interface RegisterARPaymentForm {
  paymentDate: string;
  amount: number;
  formaPago: string;
  reference?: string;
  comments?: string;
}

// Respuesta mapeada a camelCase por arInvoicesService.registerPayment.
// El backend responde { message, payment: { id, payment_number },
// invoice: { id, total_amount, paid_amount, balance, status } }.
export interface RegisterARPaymentResponse {
  message: string;
  payment: {
    id: string;
    paymentNumber: string;
  } | null;
  invoice: {
    id: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    status: InvoiceStatus;
  };
}

// ===== SAT CATALOGS (used for payment method select) =====
export interface SatFormaPago {
  clave: string;
  descripcion: string;
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
  reconciledById?: number | null;
  reconciledAt?: string | null;
  reconciliationNotes?: string | null;
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