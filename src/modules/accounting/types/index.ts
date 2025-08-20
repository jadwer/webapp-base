// Accounting Module Types - Phase 1 - Updated según backend documentation

export interface Account {
  id: string;
  code: string;          // ✅ string, único, máx 255
  name: string;          // ✅ string, máx 255
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  level: number;         // ✅ integer, nivel jerárquico
  parentId: string | null;  // ✅ string ID for consistency
  currency: string;      // ✅ Optional en backend
  isPostable: boolean;   // ✅ boolean requerido
  status: 'active' | 'inactive';  // ✅ string requerido
  metadata?: Record<string, any>; // ✅ object opcional
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  journalId?: string;      // ✅ ID como string
  periodId?: string;       // ✅ ID como string
  number: string;
  date: string;            // ✅ formato YYYY-MM-DD
  currency: string;
  exchangeRate: string;    // ✅ Decimal como string
  reference?: string;
  description: string;
  status: 'draft' | 'posted';
  approvedById?: string;   // ✅ ID como string
  postedById?: string;     // ✅ ID como string
  postedAt?: string;
  reversalOfId?: string;   // ✅ ID como string
  sourceType?: string;
  sourceId?: string;       // ✅ ID como string
  totalDebit: string;      // ✅ Decimal como string
  totalCredit: string;     // ✅ Decimal como string
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;  // ✅ Consistente con IDs como string
  accountId: string;       // ✅ Consistente con IDs como string
  debit: string;           // ✅ Decimal como string para consistency
  credit: string;          // ✅ Decimal como string para consistency
  baseAmount?: string;     // ✅ Decimal como string
  costCenterId?: string;   // ✅ ID como string
  partnerId?: string;      // ✅ ID como string
  memo?: string;
  currency?: string;
  exchangeRate?: string;   // ✅ Decimal como string
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Form interfaces - Exact backend requirements
export interface AccountForm {
  code: string;          // ✅ REQUERIDO: string, único, máx 255
  name: string;          // ✅ REQUERIDO: string, máx 255
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'; // ✅ REQUERIDO
  level: number;         // ✅ REQUERIDO: integer, nivel jerárquico
  isPostable: boolean;   // ✅ REQUERIDO: boolean
  status: 'active' | 'inactive';  // ✅ REQUERIDO: string
  parentId?: string;     // ✅ OPCIONAL: string, ID cuenta padre
  currency?: string;     // ✅ OPCIONAL: string
  metadata?: Record<string, any>; // ✅ OPCIONAL: object
}

export interface JournalEntryForm {
  date: string;          // ✅ formato YYYY-MM-DD
  description: string;
  reference?: string;
  currency?: string;
  exchangeRate?: string; // ✅ Decimal como string
}

export interface JournalLineForm {
  accountId: string;     // ✅ ID como string
  debit: string;         // ✅ Decimal como string
  credit: string;        // ✅ Decimal como string
  memo?: string;
  journalEntryId?: string; // ✅ ID como string
}

export interface JournalEntryWithLines extends JournalEntryForm {
  lines: JournalLineForm[];
}

// API Response types - JSON:API v1.1 compliant
export interface AccountingAPIResponse<T> {
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

export interface AccountingAPIError {
  jsonapi: { version: string };
  errors: Array<{
    status: string;     // ✅ "422", "401", etc.
    title: string;      // ✅ "Unprocessable Entity"
    detail: string;     // ✅ "El campo Code es obligatorio."
    source?: {
      pointer?: string; // ✅ "/data/attributes/code"
    };
  }>;
}

// Related entity types for includes
export interface AccountWithRelations extends Account {
  journalLines?: JournalLine[];
}

export interface JournalEntryWithRelations extends JournalEntry {
  journalLines?: JournalLineWithAccount[];
}

export interface JournalLineWithAccount extends JournalLine {
  account?: Account;
}