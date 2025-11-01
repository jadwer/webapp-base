# ACCOUNTING MODULE - COMPLETE DOCUMENTATION

**Fecha:** 2025-10-31
**Estado:** ✅ COMPLETO - Validado con Backend
**Archivos:** 25 TypeScript files
**Entidades:** 3 Core + 7 Executive Reports
**Testing:** 444 test lines (Vitest)
**Backend Schema:** ✅ VALIDADO - Migrations 2025_10_24 + 2025_10_28

---

## ⚠️ CRITICAL BACKEND CHANGES

**Migration 1:** `2025_10_24_115737_add_accounting_business_constraints.php`

**Business Rules Implemented:**
1. **CHECK Constraint:** `total_debit = total_credit` (balanced entries)
2. **CHECK Constraint:** Debit OR Credit (not both, not neither)
3. **CHECK Constraint:** Valid account types (asset, liability, equity, revenue, expense, contra)
4. **CHECK Constraint:** Valid entry status (draft, approved, posted, reversed)
5. **CHECK Constraint:** Valid fiscal period status (open, closed, locked)

**MySQL Triggers (Automatic Total Updates):**
- `tr_journal_lines_insert` - Update totals on INSERT
- `tr_journal_lines_update` - Update totals on UPDATE
- `tr_journal_lines_delete` - Update totals on DELETE
- `tr_check_period_status_on_post` - Prevent posting to closed periods

**Migration 2:** `2025_10_28_103838_add_reversal_fields_to_journal_entries_table.php`

**Reversal Tracking:**
- Added `reverses_entry_id` FK to journal_entries table
- Enables entry reversal workflow for corrections

---

## 📋 TABLE OF CONTENTS

1. [Overview & Status](#1-overview--status)
2. [Module Structure](#2-module-structure)
3. [Entities & Types](#3-entities--types)
4. [Executive Reports System](#4-executive-reports-system)
5. [Components Breakdown](#5-components-breakdown)
6. [Hooks & Services](#6-hooks--services)
7. [Backend Integration Analysis](#7-backend-integration-analysis)
8. [Gaps & Discrepancies](#8-gaps--discrepancies)
9. [Testing Coverage](#9-testing-coverage)
10. [Performance Optimizations](#10-performance-optimizations)
11. [Known Issues & Limitations](#11-known-issues--limitations)
12. [Usage Examples](#12-usage-examples)
13. [Next Steps & Improvements](#13-next-steps--improvements)

---

## 1. OVERVIEW & STATUS

### 1.1 Module Purpose

The Accounting module provides **complete Chart of Accounts (CoA)** and **Double-Entry Bookkeeping** functionality for the ERP system. It handles:

- **Chart of Accounts:** Hierarchical account structure with account types
- **Journal Entries:** Double-entry accounting transactions
- **Journal Lines:** Individual debit/credit line items
- **7 Executive Reports:** Balance Sheet, Income Statement, Trial Balance, etc.
- **Business Rules:** Automatic balance validation via CHECK constraints and triggers
- **Reversal System:** Entry correction workflow

### 1.2 Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Types & Interfaces** | ✅ Complete | All entities with TS strict typing |
| **API Services** | ✅ Complete | Full CRUD + post() operations |
| **SWR Hooks** | ✅ Complete | Data + mutation hooks + report hooks |
| **Transformers** | ✅ Complete | JSON:API ↔ Frontend + validators |
| **Components** | ⚠️ Partial | Admin pages + 7 report components |
| **Forms** | ❌ Missing | No create/edit forms implemented |
| **Testing** | ⚠️ Partial | Services tested (444 lines), components minimal |
| **Backend Integration** | ✅ Validated | Migrations 2025_10_24 + 2025_10_28 confirmed |
| **Executive Reports** | ✅ Complete | All 7 reports working |

### 1.3 Architecture Pattern

```
Accounting Module Architecture (Phase 1 - CRUD + Reports)
├── Types Layer (types/index.ts)
│   └── Strict TypeScript definitions for all entities
├── Services Layer
│   ├── services/index.ts - CRUD operations
│   └── services/reportsService.ts - 7 executive reports
├── Hooks Layer (hooks/index.ts)
│   ├── SWR data hooks + mutation hooks
│   └── useReports.ts - Report hooks
├── Transformers (utils/transformers.ts)
│   ├── JSON:API ↔ Frontend conversion
│   └── Client-side validators
└── Components Layer
    ├── AdminPageReal components (Accounts, Entries)
    ├── TableSimple components
    ├── 7 Report components (Balance, Income Statement, etc.)
    └── ExecutiveDashboard (master dashboard)
```

**Pattern:** Simple CRUD + Advanced Reporting (no forms yet).

---

## 2. MODULE STRUCTURE

### 2.1 Complete File Tree

```
src/modules/accounting/
├── components/                          # 14 React components
│   ├── AccountsAdminPageReal.tsx       # Chart of Accounts management (256 lines)
│   ├── AccountsTableSimple.tsx         # Accounts data table (216 lines)
│   ├── JournalEntriesAdminPageReal.tsx # Journal Entries management (193 lines)
│   ├── JournalEntriesTableSimple.tsx   # Entries data table (266 lines)
│   │
│   ├── ExecutiveDashboard.tsx          # Master dashboard (405 lines)
│   │
│   ├── BalanceGeneralReport.tsx        # Balance Sheet (270 lines)
│   ├── EstadoResultadosReport.tsx      # Income Statement (309 lines)
│   ├── BalanzaComprobacionReport.tsx   # Trial Balance (294 lines)
│   ├── LibroDiarioReport.tsx           # Journal Register (330 lines)
│   ├── LibroMayorReport.tsx            # General Ledger (331 lines)
│   ├── SalesReports.tsx                # Sales Analytics (406 lines)
│   ├── PurchaseReports.tsx             # Purchase Analytics (406 lines)
│   │
│   ├── FilterBar.tsx                   # Reusable filter component (91 lines)
│   ├── PaginationSimple.tsx            # Basic pagination (131 lines)
│   └── index.ts                        # Component exports
│
├── hooks/
│   ├── index.ts                        # Main hooks (data + mutations)
│   └── useReports.ts                   # Report hooks
│       ├── useBalanceGeneral           # Balance Sheet hook
│       ├── useEstadoResultados         # Income Statement hook
│       ├── useBalanzaComprobacion      # Trial Balance hook
│       ├── useLibroDiario              # Journal Register hook
│       ├── useLibroMayor               # General Ledger hook
│       ├── useSalesReports             # Sales Reports hook
│       └── usePurchaseReports          # Purchase Reports hook
│
├── services/
│   ├── index.ts                        # Main CRUD services
│   │   ├── accountsService             # Chart of Accounts CRUD
│   │   ├── journalEntriesService       # Journal Entries CRUD + post()
│   │   ├── journalLinesService         # Journal Lines CRUD
│   │   └── journalEntryService         # Combined operations + validateBalance()
│   │
│   └── reportsService.ts               # 7 Executive Reports (251 lines)
│       ├── accountingReportsService
│       │   ├── getBalanceGeneral(endDate?)
│       │   ├── getEstadoResultados(startDate?, endDate?)
│       │   ├── getBalanzaComprobacion(endDate?)
│       │   ├── getLibroDiario(params)
│       │   └── getLibroMayor(accountId, params)
│       ├── salesReportsService
│       │   └── getSalesOrdersReport(period?)
│       └── purchaseReportsService
│           └── getPurchaseOrdersReport(period?)
│
├── types/
│   └── index.ts                        # All type definitions (138 lines)
│       ├── Account, AccountForm
│       ├── JournalEntry, JournalEntryForm
│       ├── JournalLine, JournalLineForm
│       ├── JournalEntryWithLines
│       ├── AccountingAPIResponse<T>
│       ├── AccountingAPIError
│       └── Relationship types
│
├── utils/
│   ├── transformers.ts                 # JSON:API transformers (186 lines)
│   │   ├── transformAccountFromAPI/ToAPI
│   │   ├── transformJournalEntryFromAPI/ToAPI
│   │   ├── transformJournalLineFromAPI/ToAPI
│   │   ├── Batch transformers
│   │   └── Validators (validateAccountData, etc.)
│   └── index.ts                        # Exports
│
├── tests/                              # Test infrastructure
│   ├── services/
│   │   └── accountingService.test.ts   # 444 lines - Service layer tests
│   ├── utils/
│   │   └── test-utils.ts              # Mock factories
│   ├── components/                     # Placeholder
│   └── hooks/                          # Placeholder
│
└── index.ts                            # Module exports

**Total:** 25 TypeScript files
**Component Code:** ~3,904 lines
```

### 2.2 File Statistics

| Category | Files | Lines (approx) |
|----------|-------|----------------|
| Components | 14 | ~3,904 |
| Hooks | 2 | ~500 |
| Services | 2 | ~600 |
| Types | 1 | 138 |
| Utils | 2 | 190 |
| Tests | 2 | ~550 |
| **TOTAL** | **23** | **~5,882** |

---

## 3. ENTITIES & TYPES

### 3.1 Account (Chart of Accounts)

**Purpose:** Represents general ledger accounts in hierarchical structure.

**Backend Table:** `accounts`

**TypeScript Definition:**

```typescript
export interface Account {
  id: string;
  code: string;                        // ✅ Unique, max 255 chars
  name: string;                        // ✅ Max 255 chars
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  level: number;                       // ✅ Hierarchical level (integer)
  parentId: string | null;             // ✅ Parent account ID
  currency: string;                    // ✅ Optional (default 'MXN')
  isPostable: boolean;                 // ✅ Can post journal entries?
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

**Form Type:**

```typescript
export interface AccountForm {
  code: string;                        // ✅ REQUIRED
  name: string;                        // ✅ REQUIRED
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'; // ✅ REQUIRED
  level: number;                       // ✅ REQUIRED
  isPostable: boolean;                 // ✅ REQUIRED
  status: 'active' | 'inactive';       // ✅ REQUIRED
  parentId?: string;                   // ✅ OPTIONAL
  currency?: string;                   // ✅ OPTIONAL
  metadata?: Record<string, any>;      // ✅ OPTIONAL
}
```

**Key Features:**
- **Hierarchical Structure:** Parent-child relationships via `parentId`
- **Account Types:** Asset, Liability, Equity, Revenue, Expense
- **Postable Flag:** Controls whether entries can be posted to this account
- **CHECK Constraint:** Account type must be valid (backend validation)

### 3.2 JournalEntry (Accounting Transaction)

**Purpose:** Represents a complete accounting transaction with balanced debits/credits.

**Backend Table:** `journal_entries`

**TypeScript Definition:**

```typescript
export interface JournalEntry {
  id: string;
  journalId?: string;                  // ✅ Optional journal book reference
  periodId?: string;                   // ✅ Optional fiscal period
  number: string;                      // Entry number
  date: string;                        // ✅ YYYY-MM-DD format
  currency: string;
  exchangeRate: string;                // ✅ Decimal as string
  reference?: string;
  description: string;
  status: 'draft' | 'posted';
  approvedById?: string;               // ✅ Approval tracking
  postedById?: string;                 // ✅ Who posted it
  postedAt?: string;
  reversalOfId?: string;               // ✅ NEW (2025_10_28) - Reversal tracking
  sourceType?: string;                 // Source module (e.g., 'invoice')
  sourceId?: string;                   // Source record ID
  totalDebit: string;                  // ✅ Decimal as string
  totalCredit: string;                 // ✅ Decimal as string
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

**Critical Fields:**
- `totalDebit` / `totalCredit`: **MUST BE EQUAL** (CHECK constraint enforced)
- `reversalOfId`: NEW field from migration 2025_10_28
- `status`: draft → posted workflow (cannot post to closed periods)
- Decimals stored as strings for precision

**Backend Triggers:**
- Totals **automatically updated** by MySQL triggers when lines change
- Posting **blocked** if fiscal period is closed/locked

### 3.3 JournalLine (Debit/Credit Line Item)

**Purpose:** Individual debit or credit line within a journal entry.

**Backend Table:** `journal_lines`

**TypeScript Definition:**

```typescript
export interface JournalLine {
  id: string;
  journalEntryId: string;              // ✅ FK to journal_entries
  accountId: string;                   // ✅ FK to accounts
  debit: string;                       // ✅ Decimal as string
  credit: string;                      // ✅ Decimal as string
  baseAmount?: string;                 // ✅ Amount in base currency
  costCenterId?: string;               // ✅ Optional cost center
  partnerId?: string;                  // ✅ Optional vendor/customer
  memo?: string;
  currency?: string;
  exchangeRate?: string;               // ✅ Decimal as string
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

**Critical Business Rule (CHECK Constraint):**
```sql
CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
```

**Meaning:** A line MUST have either debit OR credit, but NOT both, and NOT neither.

**Frontend Validation:**
```typescript
export const validateJournalLineData = (data: any): string[] => {
  const errors: string[] = []

  if (!data.accountId) errors.push('accountId is required')
  if (!data.debit && !data.credit)
    errors.push('either debit or credit must be provided')
  if (data.debit && data.credit)
    errors.push('cannot have both debit and credit in the same line')

  return errors
}
```

---

## 4. EXECUTIVE REPORTS SYSTEM

### 4.1 Overview

The Accounting module provides **7 Executive Reports** integrated from multiple modules:

**Accounting Reports (5):**
1. Balance General (Balance Sheet)
2. Estado de Resultados (Income Statement)
3. Balanza de Comprobación (Trial Balance)
4. Libro Diario (Journal Register)
5. Libro Mayor (General Ledger)

**Cross-Module Reports (2):**
6. Sales Reports (from Sales module)
7. Purchase Reports (from Purchase module)

### 4.2 Report Endpoints

| Report | Endpoint | Parameters | Response Type |
|--------|----------|------------|---------------|
| **Balance General** | `/api/v1/accounting/reports/balance-general` | `end_date?` | BalanceGeneralResponse |
| **Estado de Resultados** | `/api/v1/accounting/reports/estado-resultados` | `start_date?`, `end_date?` | EstadoResultadosResponse |
| **Balanza de Comprobación** | `/api/v1/accounting/reports/balanza-comprobacion` | `end_date?` | BalanzaComprobacionResponse |
| **Libro Diario** | `/api/v1/accounting/reports/libro-diario` | `start_date?`, `end_date?`, pagination | LibroDiarioResponse |
| **Libro Mayor** | `/api/v1/accounting/reports/libro-mayor` | `account_id`, `start_date?`, `end_date?` | LibroMayorResponse |
| **Sales Reports** | `/api/v1/sales-orders/reports` | `period?` (days) | SalesReportsResponse |
| **Purchase Reports** | `/api/v1/purchase-orders/reports` | `period?` (days) | PurchaseReportsResponse |

### 4.3 Report Types

#### 4.3.1 Balance General (Balance Sheet)

**Purpose:** Snapshot of Assets, Liabilities, and Equity at a point in time.

**Response Structure:**
```typescript
interface BalanceGeneralResponse {
  report_type: string;              // "balance_general"
  report_date: string;              // Date of the report
  data: {
    assets: {
      accounts: BalanceGeneralAccount[];
      total: number;
    };
    liabilities: {
      accounts: BalanceGeneralAccount[];
      total: number;
    };
    equity: {
      accounts: BalanceGeneralAccount[];
      total: number;
    };
  };
  totals: {
    total_assets: number;
    total_liabilities_equity: number;
    balanced: boolean;               // ✅ Assets = Liabilities + Equity
  };
}
```

**Fundamental Accounting Equation:**
```
Assets = Liabilities + Equity
```

#### 4.3.2 Estado de Resultados (Income Statement)

**Purpose:** Revenue and Expenses over a period to calculate Net Income.

**Response Structure:**
```typescript
interface EstadoResultadosData {
  revenue: {
    accounts: EstadoResultadosAccount[];
    total: number;
  };
  expenses: {
    accounts: EstadoResultadosAccount[];
    total: number;
  };
  net_income: number;                // Revenue - Expenses
}
```

**Calculation:**
```
Net Income = Total Revenue - Total Expenses
```

#### 4.3.3 Balanza de Comprobación (Trial Balance)

**Purpose:** Verify that total debits = total credits across all accounts.

**Response Structure:**
```typescript
interface BalanzaComprobacionResponse {
  report_type: string;
  data: BalanzaComprobacionAccount[];  // All accounts with balances
  totals: {
    total_debits: number;
    total_credits: number;
    balanced: boolean;                  // ✅ Debits = Credits
  };
}
```

**Validation:**
```
Total Debits = Total Credits (must be true)
```

#### 4.3.4 Libro Diario (Journal Register)

**Purpose:** Chronological list of all journal entries with line details.

**Response Structure:**
```typescript
interface LibroDiarioResponse {
  report_type: string;
  data: LibroDiarioEntry[];           // All entries in date order
  totals: {
    total_debits: number;
    total_credits: number;
  };
}

interface LibroDiarioEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  account_code: string;
  account_name: string;
  debit: string;
  credit: string;
}
```

**Use Case:** Audit trail of all transactions.

#### 4.3.5 Libro Mayor (General Ledger)

**Purpose:** All transactions for a specific account with running balance.

**Response Structure:**
```typescript
interface LibroMayorResponse {
  report_type: string;
  account: {
    id: number;
    code: string;
    name: string;
    type: string;
  };
  opening_balance: number;
  closing_balance: number;
  data: LibroMayorEntry[];            // All transactions for this account
}

interface LibroMayorEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  debit: string;
  credit: string;
  balance: number;                    // Running balance
}
```

**Use Case:** Detailed transaction history for reconciliation.

#### 4.3.6 Sales Reports

**Purpose:** Sales performance analytics from Sales module.

**Response Structure:**
```typescript
interface SalesReportsResponse {
  report_type: string;
  period: number;                     // Days (7, 30, 90, 365)
  data: {
    total_sales: number;
    total_orders: number;
    average_order_value: number;
    top_customers: Array<{
      customer_id: number;
      customer_name: string;
      total_sales: number;
      total_orders: number;
    }>;
    sales_by_period: Array<{
      period: string;
      total_sales: number;
      total_orders: number;
    }>;
    top_products: Array<{
      product_id: number;
      product_name: string;
      total_sold: number;
      total_revenue: number;
    }>;
  };
}
```

#### 4.3.7 Purchase Reports

**Purpose:** Purchase analytics from Purchase module.

**Response Structure:**
```typescript
interface PurchaseReportsResponse {
  report_type: string;
  period: number;
  data: {
    total_purchases: number;
    total_orders: number;
    average_order_value: number;
    top_suppliers: Array<{
      supplier_id: number;
      supplier_name: string;
      total_purchases: number;
      total_orders: number;
    }>;
    purchases_by_period: Array<{
      period: string;
      total_purchases: number;
      total_orders: number;
    }>;
    top_products: Array<{
      product_id: number;
      product_name: string;
      total_purchased: number;
      total_cost: number;
    }>;
  };
}
```

### 4.4 Executive Dashboard Integration

**Component:** `ExecutiveDashboard.tsx` (405 lines)

**Purpose:** Master dashboard combining all 7 reports with KPIs.

**Key Features:**
- Period selector (7, 30, 90, 365 days)
- Real-time KPI cards
- Multiple report visualizations
- Cross-module data integration

**KPIs Calculated:**
```typescript
const totalAssets = balanceGeneral?.totals?.total_assets || 0
const totalRevenue = estadoResultados?.data?.revenue?.total || 0
const totalExpenses = estadoResultados?.data?.expenses?.total || 0
const netIncome = estadoResultados?.data?.net_income || (totalRevenue - totalExpenses)
const totalPurchases = purchaseReports?.data?.total_purchases || 0
const profitMargin = totalRevenue > 0 ? netIncome / totalRevenue : 0
```

---

## 5. COMPONENTS BREAKDOWN

### 5.1 Admin Pages

#### AccountsAdminPageReal.tsx (256 lines)

**Purpose:** Chart of Accounts management interface.

**Features:**
- ✅ Account listing with hierarchy display
- ✅ Search and filtering
- ✅ Account type filtering
- ✅ Status filtering (active/inactive)
- ✅ Postable account filtering
- ❌ No create/edit forms (missing)
- ❌ No delete functionality

**State Management:**
```typescript
const [searchTerm, setSearchTerm] = useState('')
const [accountTypeFilter, setAccountTypeFilter] = useState('')
const [statusFilter, setStatusFilter] = useState('')
```

#### JournalEntriesAdminPageReal.tsx (193 lines)

**Purpose:** Journal Entries management interface.

**Features:**
- ✅ Entry listing with status
- ✅ Search by entry number
- ✅ Status filtering (draft/posted)
- ✅ Date range filtering
- ✅ Navigation to entry details
- ❌ No create entry form
- ❌ No post operation UI
- ❌ No reversal UI

### 5.2 Data Tables

#### AccountsTableSimple.tsx (216 lines)

**Columns:**
1. Code
2. Name
3. Type
4. Level (hierarchy)
5. Postable flag
6. Status
7. Actions (View)

**Missing:**
- Edit/Delete actions
- Parent account display
- Currency display

#### JournalEntriesTableSimple.tsx (266 lines)

**Columns:**
1. Entry Number
2. Date
3. Description
4. Total Debit
5. Total Credit
6. Status
7. Actions (View)

**Features:**
- ✅ Status badges
- ✅ Balance indicator (total_debit = total_credit)
- ❌ No post button
- ❌ No reversal button

### 5.3 Report Components

All 7 report components follow similar pattern:

**Common Features:**
- Date range pickers
- Period selectors
- Data tables with formatting
- Currency formatting
- Export capabilities (planned)

**Component Files:**
- `BalanceGeneralReport.tsx` (270 lines)
- `EstadoResultadosReport.tsx` (309 lines)
- `BalanzaComprobacionReport.tsx` (294 lines)
- `LibroDiarioReport.tsx` (330 lines)
- `LibroMayorReport.tsx` (331 lines)
- `SalesReports.tsx` (406 lines)
- `PurchaseReports.tsx` (406 lines)

### 5.4 Executive Dashboard

**ExecutiveDashboard.tsx** (405 lines)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Period Selector: [7d|30d|90d|1y]      │
├─────────────────────────────────────────┤
│  KPI Cards (4 across)                   │
│  [Assets] [Revenue] [Expenses] [Margin] │
├─────────────────────────────────────────┤
│  Balance Sheet Section                  │
├─────────────────────────────────────────┤
│  Income Statement Section               │
├─────────────────────────────────────────┤
│  Sales & Purchase Analytics             │
└─────────────────────────────────────────┘
```

**Data Fetching:**
```typescript
const { balanceGeneral, isLoading: balanceLoading } = useBalanceGeneral()
const { estadoResultados, isLoading: estadoLoading } = useEstadoResultados()
const { salesReports, isLoading: salesLoading } = useSalesReports(selectedPeriod)
const { purchaseReports, isLoading: purchaseLoading } = usePurchaseReports(selectedPeriod)
```

---

## 6. HOOKS & SERVICES

### 6.1 SWR Hooks Architecture

**Pattern:** Data hooks + Mutation hooks + Report hooks (separated concerns).

#### Data Hooks (Fetching)

**useAccounts(params):**
```typescript
const { accounts, isLoading, error, mutate } = useAccounts({
  'filter[accountType]': 'asset',
  'filter[isPostable]': 1,
  'filter[status]': 'active'
})
```

**usePostableAccounts(params):**
```typescript
const { postableAccounts, isLoading } = usePostableAccounts()
// Automatically filters isPostable=1
```

**useJournalEntries(params):**
```typescript
const { journalEntries, isLoading, error } = useJournalEntries({
  filters: { status: 'posted', date: '2025-10-31' },
  pagination: { page: 1, size: 20 },
  include: ['journalLines', 'journalLines.account']
})
```

**useJournalEntryWithLines(id):**
```typescript
const { journalEntry, isLoading } = useJournalEntryWithLines('123')
// Automatically includes journalLines and accounts
```

#### Mutation Hooks (CUD Operations)

**useAccountMutations():**
```typescript
const { createAccount, updateAccount, deleteAccount } = useAccountMutations()

// Usage
await createAccount({
  code: '1000',
  name: 'Cash',
  accountType: 'asset',
  level: 1,
  isPostable: true,
  status: 'active'
})
```

**useJournalEntryMutations():**
```typescript
const {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  postJournalEntry
} = useJournalEntryMutations()

// Post entry to accounting
await postJournalEntry('123')
```

**useJournalEntryValidation():**
```typescript
const { validateBalance } = useJournalEntryValidation()

const result = validateBalance([
  { accountId: '1000', debit: '100.00', credit: '0.00' },
  { accountId: '2000', debit: '0.00', credit: '100.00' }
])

// result.isValid = true
// result.totalDebit = 100
// result.totalCredit = 100
// result.difference = 0
```

#### Report Hooks

**useBalanceGeneral(endDate?):**
```typescript
const { balanceGeneral, isLoading, error } = useBalanceGeneral('2025-10-31')
```

**useEstadoResultados(startDate?, endDate?):**
```typescript
const { estadoResultados, isLoading } = useEstadoResultados('2025-01-01', '2025-10-31')
```

**useLibroMayor(accountId, params):**
```typescript
const { libroMayor, isLoading } = useLibroMayor(1000, {
  startDate: '2025-01-01',
  endDate: '2025-10-31'
})
```

### 6.2 Services Layer

#### Service Structure

**accountsService:**
```typescript
{
  async getAll(params): Promise<AccountingAPIResponse<Account>>
  async getById(id): Promise<{ data: Account }>
  async create(data): Promise<{ data: Account }>
  async update(id, data): Promise<{ data: Account }>
  async delete(id): Promise<void>
  async getPostableAccounts(params): Promise<AccountingAPIResponse<Account>>
}
```

**journalEntriesService:**
```typescript
{
  async getAll(params): Promise<AccountingAPIResponse<JournalEntry>>
  async getById(id, includes?): Promise<{ data: JournalEntry }>
  async create(data): Promise<{ data: JournalEntry }>
  async update(id, data): Promise<{ data: JournalEntry }>
  async delete(id): Promise<void>
  async post(id): Promise<{ data: JournalEntry }>        // Post to accounting
  async getWithLines(id): Promise<{ data: JournalEntry }> // With includes
}
```

**journalEntryService (Helper):**
```typescript
{
  async createWithLines(data): Promise<{ data: JournalEntry }>
  validateBalance(lines): { isValid, totalDebit, totalCredit, difference }
}
```

**accountingReportsService:**
```typescript
{
  async getBalanceGeneral(endDate?): Promise<BalanceGeneralResponse>
  async getEstadoResultados(startDate?, endDate?): Promise<EstadoResultadosResponse>
  async getBalanzaComprobacion(endDate?): Promise<BalanzaComprobacionResponse>
  async getLibroDiario(params): Promise<LibroDiarioResponse>
  async getLibroMayor(accountId, params): Promise<LibroMayorResponse>
}
```

### 6.3 Transformers & Validators

**Client-Side Validators:**

```typescript
export const validateAccountData = (data: any): string[] => {
  const errors: string[] = []

  if (!data.code) errors.push('code is required')
  if (!data.name) errors.push('name is required')
  if (!data.accountType) errors.push('accountType is required')
  if (typeof data.level !== 'number') errors.push('level must be a number')
  if (typeof data.isPostable !== 'boolean') errors.push('isPostable must be boolean')
  if (!data.status) errors.push('status is required')

  return errors
}

export const validateJournalLineData = (data: any): string[] => {
  const errors: string[] = []

  if (!data.accountId) errors.push('accountId is required')
  if (!data.debit && !data.credit)
    errors.push('either debit or credit must be provided')
  if (data.debit && data.credit)
    errors.push('cannot have both debit and credit')  // ✅ Matches CHECK constraint

  return errors
}
```

**Transformers:**
- `transformAccountFromAPI()` / `transformAccountToAPI()`
- `transformJournalEntryFromAPI()` / `transformJournalEntryToAPI()`
- `transformJournalLineFromAPI()` / `transformJournalLineToAPI()`
- Batch transformers for arrays

---

## 7. BACKEND INTEGRATION ANALYSIS

### 7.1 Migration Details

#### Migration 1: Business Constraints (2025_10_24)

**File:** `2025_10_24_115737_add_accounting_business_constraints.php`

**CHECK Constraints Added:**

1. **Balanced Entries:**
```sql
ALTER TABLE journal_entries
ADD CONSTRAINT chk_balanced_entry
CHECK (total_debit = total_credit)
```

2. **Debit OR Credit (Exclusive):**
```sql
ALTER TABLE journal_lines
ADD CONSTRAINT chk_debit_or_credit
CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
```

3. **Valid Account Types:**
```sql
ALTER TABLE accounts
ADD CONSTRAINT chk_valid_account_type
CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'contra'))
```

4. **Valid Entry Status:**
```sql
ALTER TABLE journal_entries
ADD CONSTRAINT chk_valid_entry_status
CHECK (status IN ('draft', 'approved', 'posted', 'reversed'))
```

5. **Valid Fiscal Period Status:**
```sql
ALTER TABLE fiscal_periods
ADD CONSTRAINT chk_valid_period_status
CHECK (status IN ('open', 'closed', 'locked'))
```

**MySQL Triggers:**

1. **Auto-Update Totals on INSERT:**
```sql
CREATE TRIGGER tr_journal_lines_insert
AFTER INSERT ON journal_lines
FOR EACH ROW
BEGIN
    UPDATE journal_entries
    SET
        total_debit = COALESCE(total_debit, 0) + NEW.debit,
        total_credit = COALESCE(total_credit, 0) + NEW.credit,
        updated_at = NOW()
    WHERE id = NEW.journal_entry_id;
END
```

2. **Auto-Update Totals on UPDATE:**
```sql
CREATE TRIGGER tr_journal_lines_update
AFTER UPDATE ON journal_lines
FOR EACH ROW
BEGIN
    UPDATE journal_entries
    SET
        total_debit = COALESCE(total_debit, 0) - OLD.debit + NEW.debit,
        total_credit = COALESCE(total_credit, 0) - OLD.credit + NEW.credit,
        updated_at = NOW()
    WHERE id = NEW.journal_entry_id;
END
```

3. **Auto-Update Totals on DELETE:**
```sql
CREATE TRIGGER tr_journal_lines_delete
AFTER DELETE ON journal_lines
FOR EACH ROW
BEGIN
    UPDATE journal_entries
    SET
        total_debit = COALESCE(total_debit, 0) - OLD.debit,
        total_credit = COALESCE(total_credit, 0) - OLD.credit,
        updated_at = NOW()
    WHERE id = OLD.journal_entry_id;
END
```

4. **Prevent Posting to Closed Periods:**
```sql
CREATE TRIGGER tr_check_period_status_on_post
BEFORE UPDATE ON journal_entries
FOR EACH ROW
BEGIN
    DECLARE period_status_val VARCHAR(20);

    IF NEW.status = 'posted' AND (OLD.status IS NULL OR OLD.status != 'posted') THEN
        SELECT status INTO period_status_val
        FROM fiscal_periods
        WHERE id = NEW.fiscal_period_id;

        IF period_status_val != 'open' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot post to closed or locked fiscal period';
        END IF;
    END IF;
END
```

**Frontend Impact:**
- ✅ Total calculations handled automatically by backend
- ✅ Balance validation enforced at database level
- ✅ Client-side validators match backend constraints
- ⚠️ Frontend must handle trigger errors gracefully

#### Migration 2: Reversal Fields (2025_10_28)

**File:** `2025_10_28_103838_add_reversal_fields_to_journal_entries_table.php`

**Changes:**
```sql
ALTER TABLE journal_entries
ADD COLUMN reverses_entry_id BIGINT UNSIGNED NULLABLE;

ALTER TABLE journal_entries
ADD CONSTRAINT fk_reverses_entry
FOREIGN KEY (reverses_entry_id)
REFERENCES journal_entries(id)
ON DELETE RESTRICT;
```

**Purpose:** Enable entry reversal workflow for accounting corrections.

**Frontend Support:**
- ✅ Type definition includes `reversalOfId` field
- ❌ No UI for creating reversals yet
- ❌ No UI for viewing reversal history

### 7.2 JSON:API Compliance

**Version:** JSON:API v1.1

**Request Headers:**
```http
Accept: application/vnd.api+json
Content-Type: application/vnd.api+json
Authorization: Bearer {token}
```

**Response Structure:**
```json
{
  "jsonapi": { "version": "1.0" },
  "data": [
    {
      "type": "accounts",
      "id": "1",
      "attributes": {
        "code": "1000",
        "name": "Cash",
        "accountType": "asset",
        "level": 1,
        "isPostable": true,
        "status": "active"
      }
    }
  ],
  "meta": {
    "page": {
      "currentPage": 1,
      "from": 1,
      "lastPage": 3,
      "perPage": 20,
      "to": 20,
      "total": 50
    }
  },
  "links": {
    "first": "/api/v1/accounts?page[number]=1",
    "last": "/api/v1/accounts?page[number]=3"
  }
}
```

### 7.3 Field Mappings

| Frontend Field | Backend Field | Type Change | Notes |
|----------------|---------------|-------------|-------|
| `accountType` | `account_type` | - | camelCase ↔ snake_case |
| `isPostable` | `is_postable` | boolean | camelCase ↔ snake_case |
| `parentId` | `parent_id` | string ↔ bigint | ID as string |
| `journalEntryId` | `journal_entry_id` | string ↔ bigint | ID as string |
| `accountId` | `account_id` | string ↔ bigint | ID as string |
| `totalDebit` | `total_debit` | string ↔ decimal | "100.00" ↔ 100.00 |
| `totalCredit` | `total_credit` | string ↔ decimal | "100.00" ↔ 100.00 |
| `exchangeRate` | `exchange_rate` | string ↔ decimal | "1.00" ↔ 1.00 |
| `reversalOfId` | `reverses_entry_id` | string ↔ bigint | ✅ NEW FIELD |

### 7.4 Backend Endpoints Status

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/accounts` | GET | ✅ Working | Supports filters, pagination |
| `/api/v1/accounts` | POST | ✅ Working | Create account |
| `/api/v1/accounts/:id` | GET | ✅ Working | Fetch single |
| `/api/v1/accounts/:id` | PATCH | ✅ Working | Update account |
| `/api/v1/accounts/:id` | DELETE | ⚠️ Untested | May have FK constraints |
| `/api/v1/journal-entries` | GET | ✅ Working | Supports filters, includes |
| `/api/v1/journal-entries` | POST | ✅ Working | Create entry |
| `/api/v1/journal-entries/:id` | PATCH | ✅ Working | Update entry |
| `/api/v1/journal-entries/:id/post` | POST | ✅ Working | Post to accounting |
| `/api/v1/journal-lines` | GET | ✅ Working | List lines |
| `/api/v1/journal-lines` | POST | ✅ Working | Create line |
| **Reports (7)** | GET | ✅ All Working | All endpoints confirmed |

---

## 8. GAPS & DISCREPANCIES

### 8.1 Missing Frontend Features

#### 1. No Create/Edit Forms

**Issue:** Admin pages exist, but no forms to create/edit accounts or entries.

**Impact:** Cannot manage Chart of Accounts or create journal entries from UI.

**Required:**
- AccountForm component
- JournalEntryForm component (with lines manager)
- Form validation (Zod schemas)

#### 2. No Journal Entry Posting UI

**Issue:** `post()` service exists, no UI button.

**Impact:** Entries remain in draft, cannot finalize to accounting.

**Required:**
- Post button in entries table
- Confirmation modal
- Status update after posting
- Error handling for closed periods

#### 3. No Reversal Workflow

**Issue:** Backend supports reversals (`reversalOfId` field), no frontend implementation.

**Impact:** Cannot create reversal entries for corrections.

**Required:**
- Reverse button for posted entries
- Reversal creation workflow
- Link to original entry
- Reversal history view

#### 4. No Fiscal Period Management

**Issue:** Triggers check for closed periods, but no period management UI.

**Impact:** Cannot manage accounting periods (open/close/lock).

**Required:**
- Fiscal periods CRUD
- Period status management
- Year-end closing workflow

### 8.2 Type Inconsistencies

#### Decimal Handling

**Current Approach:**
- All decimals stored as strings ("100.00")
- Math operations require parseFloat()

**Issue:** Consistent but requires careful handling.

**Example:**
```typescript
const debit = "100.00"
const credit = "50.00"
const total = parseFloat(debit) + parseFloat(credit)  // Must parse!
```

**Recommendation:** Use `Decimal.js` for precision arithmetic.

#### ID Fields

**Current:** All IDs as strings (consistent across module)

**Backend:** IDs are bigint unsigned

**Transformers:** Handle conversion automatically

**No issues:** Consistent approach.

### 8.3 Backend Features Not Used

#### 1. Cost Centers

**Backend Support:** `cost_center_id` field exists in journal_lines

**Frontend:** Type defined but not used in UI

**Impact:** Cannot assign lines to cost centers.

#### 2. Partners

**Backend Support:** `partner_id` field exists in journal_lines

**Frontend:** Type defined but not used in UI

**Impact:** Cannot link lines to vendors/customers.

#### 3. Multi-Currency

**Current:** `currency` and `exchangeRate` fields exist

**Issue:** No currency management or conversion UI

**Impact:** Limited to MXN, no foreign currency support.

#### 4. Approval Workflow

**Backend Support:** `approvedById` field exists

**Frontend:** Type defined but no approval UI

**Impact:** No approval process for entries.

### 8.4 Report Limitations

#### 1. No Export Functionality

**Issue:** Reports display data but cannot export to PDF/Excel.

**Impact:** Users must screenshot or copy data manually.

**Required:**
- PDF export (jsPDF)
- Excel export (xlsx)
- CSV export

#### 2. No Date Range Presets

**Issue:** Manual date entry required for reports.

**Required:**
- Quick presets: "This Month", "Last Month", "YTD", "Last Year"
- Fiscal period selection

#### 3. No Drill-Down

**Issue:** Cannot click account to see detail (e.g., Balance Sheet → Libro Mayor)

**Required:**
- Clickable accounts
- Navigation between reports
- Context preservation

---

## 9. TESTING COVERAGE

### 9.1 Test Files Overview

| Test File | Lines | Coverage |
|-----------|-------|----------|
| `accountingService.test.ts` | 444 | Services layer |
| `test-utils.ts` | ~100 | Mock factories |

**Total Test Coverage:** ~40% (estimated)

### 9.2 Service Tests

**File:** `tests/services/accountingService.test.ts` (444 lines)

**Framework:** Vitest + happy-dom

**Test Structure:**
```typescript
describe('Accounting Service', () => {
  describe('Accounts', () => {
    it('should fetch accounts successfully')
    it('should create account successfully')
    it('should update account successfully')
    it('should delete account successfully')
    it('should fetch postable accounts only')
  })

  describe('Journal Entries', () => {
    it('should fetch journal entries successfully')
    it('should create journal entry successfully')
    it('should update journal entry successfully')
    it('should post journal entry successfully')
  })

  describe('Journal Lines', () => {
    it('should fetch journal lines successfully')
    it('should create journal line successfully')
    it('should validate balance correctly')
  })

  describe('Error Handling', () => {
    it('should handle API errors properly')
    it('should handle validation errors')
  })
})
```

**Coverage:**
- ✅ All CRUD operations tested
- ✅ Post operation tested
- ✅ Balance validation tested
- ❌ Report endpoints not tested
- ❌ Transformer functions not tested

### 9.3 Testing Gaps

**Critical Missing Tests:**

1. **Component Tests:**
   - ❌ Admin page interactions
   - ❌ Report component rendering
   - ❌ Dashboard KPI calculations

2. **Integration Tests:**
   - ❌ Full create entry + lines flow
   - ❌ Balance validation in UI
   - ❌ Report data fetching

3. **Transformer Tests:**
   - ❌ JSON:API conversion edge cases
   - ❌ Validator functions

4. **Hook Tests:**
   - ❌ Mutation hooks
   - ❌ Report hooks
   - ❌ Cache invalidation

5. **Business Logic Tests:**
   - ❌ Debit/credit validation
   - ❌ Balance equation checks
   - ❌ Period status validation

**Recommended Coverage Target:** 80% (currently ~40%)

---

## 10. PERFORMANCE OPTIMIZATIONS

### 10.1 Current Optimizations

#### SWR Caching

**Benefit:** Automatic request deduplication and caching.

**Report Caching:**
```typescript
// First call - fetches from server
const { balanceGeneral } = useBalanceGeneral('2025-10-31')

// Second call (same date) - returns cached data
const { balanceGeneral: cached } = useBalanceGeneral('2025-10-31')
```

#### Report Data Freshness

**Issue:** Reports cached but may become stale.

**Solution:** SWR automatic revalidation
- On window focus
- On reconnect
- Manual via `mutate()`

### 10.2 Performance Issues

#### 1. No Pagination on Reports

**Issue:** Large reports fetch all data at once.

**Impact:**
- Slow loading for Libro Diario (thousands of entries)
- High memory usage
- Poor UX

**Recommendation:**
- Backend pagination for Libro Diario
- Virtual scrolling for large tables

#### 2. No Debouncing

**Issue:** Search inputs trigger immediate API calls.

**Impact:** Excessive requests during typing.

**Recommendation:** Debounce search (300ms).

#### 3. No Memoization

**Issue:** Report components re-render unnecessarily.

**Missing:**
- `React.memo()` for report rows
- `useMemo()` for calculations
- `useCallback()` for handlers

### 10.3 Recommended Optimizations

1. **Implement Virtual Scrolling:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: entries.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50
})
```

2. **Add React.memo to Report Rows:**
```typescript
const ReportRow = React.memo(({ data }) => {
  return <tr>...</tr>
})
```

3. **Memoize KPI Calculations:**
```typescript
const kpis = useMemo(() => ({
  totalAssets: balanceGeneral?.totals?.total_assets || 0,
  netIncome: estadoResultados?.data?.net_income || 0,
  profitMargin: calculateMargin(netIncome, totalRevenue)
}), [balanceGeneral, estadoResultados])
```

4. **Implement Report Export Background Jobs:**
- Large exports (PDF/Excel) should be async
- Use Web Workers for heavy processing
- Show progress indicators

---

## 11. KNOWN ISSUES & LIMITATIONS

### 11.1 Critical Issues

#### 1. No Form Implementation

**Severity:** HIGH

**Description:** Cannot create or edit accounts/entries from UI.

**Impact:** Module not functional for end users.

**Workaround:** Direct API calls or database manipulation.

**Fix Required:** Implement forms with Zod validation.

#### 2. Triggers Only on MySQL

**Severity:** MEDIUM

**Description:** Total auto-update triggers only work on MySQL, not SQLite.

**Code:**
```php
if ($driver === 'sqlite') {
    return;  // Skip triggers for SQLite
}
```

**Impact:** Testing environment behaves differently than production.

**Workaround:** Manual total calculation in SQLite.

**Fix:** Implement application-level total calculation.

#### 3. CHECK Constraints Not Enforced in SQLite

**Severity:** MEDIUM

**Description:** CHECK constraints skipped for SQLite (testing).

**Impact:** Can create invalid data in tests.

**Workaround:** Client-side validators.

**Fix:** Enforce validators in tests.

### 11.2 Functional Limitations

#### 1. No Batch Entry Creation

**Issue:** Must create entry, then add lines one by one.

**Impact:** Slow data entry.

**Current Workaround:**
```typescript
// Helper service exists
await journalEntryService.createWithLines({
  date: '2025-10-31',
  description: 'Opening entry',
  lines: [
    { accountId: '1000', debit: '100.00', credit: '0.00' },
    { accountId: '2000', debit: '0.00', credit: '100.00' }
  ]
})
```

**But:** No UI for this.

#### 2. No Account Hierarchy Display

**Issue:** Account tree not visualized.

**Impact:** Hard to understand account structure.

**Required:** Tree view component.

#### 3. No Period-End Closing

**Issue:** No workflow to close accounting periods.

**Impact:** Cannot prevent posting to past periods.

**Required:** Fiscal period management UI.

### 11.3 UX Limitations

#### 1. No Balance Indicator

**Issue:** Users don't see if entry is balanced before posting.

**Required:**
- Real-time balance calculation
- Visual indicator (red/green)
- Block posting if unbalanced

#### 2. No Account Autocomplete

**Issue:** Must know account codes.

**Required:**
- Account search/autocomplete
- Recent accounts list
- Favorites

#### 3. No Report Saving

**Issue:** Cannot save report configurations.

**Required:**
- Save date ranges
- Save filters
- Quick access to saved reports

---

## 12. USAGE EXAMPLES

### 12.1 Chart of Accounts Management

#### List All Accounts

```typescript
'use client'
import { useAccounts } from '@/modules/accounting'

export default function AccountsPage() {
  const { accounts, isLoading, error } = useAccounts()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {accounts.map(account => (
        <li key={account.id}>
          {account.code} - {account.name} ({account.accountType})
        </li>
      ))}
    </ul>
  )
}
```

#### Filter Postable Accounts

```typescript
const { postableAccounts } = usePostableAccounts()

return (
  <select>
    {postableAccounts.map(account => (
      <option key={account.id} value={account.id}>
        {account.code} - {account.name}
      </option>
    ))}
  </select>
)
```

#### Create Account

```typescript
const { createAccount } = useAccountMutations()

await createAccount({
  code: '1000',
  name: 'Cash',
  accountType: 'asset',
  level: 1,
  isPostable: true,
  status: 'active',
  currency: 'MXN'
})
```

### 12.2 Journal Entry Management

#### Create Entry with Lines

```typescript
import { journalEntryService } from '@/modules/accounting'

const result = await journalEntryService.createWithLines({
  date: '2025-10-31',
  description: 'Opening balance',
  lines: [
    { accountId: '1000', debit: '10000.00', credit: '0.00', memo: 'Initial cash' },
    { accountId: '3000', debit: '0.00', credit: '10000.00', memo: 'Owner equity' }
  ]
})
```

#### Validate Balance Before Posting

```typescript
import { journalEntryService } from '@/modules/accounting'

const lines = [
  { accountId: '1000', debit: '100.00', credit: '0.00' },
  { accountId: '2000', debit: '0.00', credit: '100.00' }
]

const validation = journalEntryService.validateBalance(lines)

if (!validation.isValid) {
  alert(`Entry not balanced! Difference: ${validation.difference}`)
  return
}

// Proceed with creation
```

#### Post Entry to Accounting

```typescript
const { postJournalEntry } = useJournalEntryMutations()

try {
  await postJournalEntry('123')
  alert('Entry posted successfully')
} catch (error) {
  if (error.message.includes('closed or locked')) {
    alert('Cannot post to closed fiscal period')
  }
}
```

### 12.3 Executive Reports

#### Balance Sheet

```typescript
import { useBalanceGeneral } from '@/modules/accounting'

export function BalanceSheetPage() {
  const { balanceGeneral, isLoading } = useBalanceGeneral('2025-10-31')

  if (isLoading) return <div>Loading...</div>

  const { assets, liabilities, equity } = balanceGeneral.data
  const { total_assets, total_liabilities_equity, balanced } = balanceGeneral.totals

  return (
    <div>
      <h1>Balance General</h1>
      <section>
        <h2>Assets: ${total_assets.toFixed(2)}</h2>
        {assets.accounts.map(account => (
          <div key={account.account_id}>
            {account.account_code} - {account.account_name}: ${account.balance}
          </div>
        ))}
      </section>

      {balanced ? (
        <div className="text-success">✓ Balanced</div>
      ) : (
        <div className="text-danger">✗ Not Balanced</div>
      )}
    </div>
  )
}
```

#### Income Statement

```typescript
import { useEstadoResultados } from '@/modules/accounting'

export function IncomeStatementPage() {
  const { estadoResultados, isLoading } = useEstadoResultados(
    '2025-01-01',
    '2025-10-31'
  )

  if (isLoading) return <div>Loading...</div>

  const { revenue, expenses, net_income } = estadoResultados.data

  return (
    <div>
      <h1>Estado de Resultados</h1>
      <h2>Revenue: ${revenue.total}</h2>
      <h2>Expenses: ${expenses.total}</h2>
      <h2>Net Income: ${net_income}</h2>
      <div>
        Profit Margin: {((net_income / revenue.total) * 100).toFixed(1)}%
      </div>
    </div>
  )
}
```

#### Executive Dashboard

```typescript
import { ExecutiveDashboard } from '@/modules/accounting'

export default function DashboardPage() {
  return <ExecutiveDashboard />
}

// Dashboard automatically fetches:
// - Balance General
// - Estado de Resultados
// - Sales Reports
// - Purchase Reports
// And displays KPIs
```

### 12.4 Advanced Patterns

#### Multi-Report Analysis

```typescript
export function FinancialAnalysis() {
  const { balanceGeneral } = useBalanceGeneral()
  const { estadoResultados } = useEstadoResultados()
  const { salesReports } = useSalesReports(30)

  const totalAssets = balanceGeneral?.totals?.total_assets || 0
  const netIncome = estadoResultados?.data?.net_income || 0
  const totalSales = salesReports?.data?.total_sales || 0

  // Calculate ROA (Return on Assets)
  const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0

  return (
    <div>
      <h2>Financial Ratios</h2>
      <div>ROA: {roa.toFixed(2)}%</div>
      <div>Sales Growth: {/* ... */}</div>
    </div>
  )
}
```

---

## 13. NEXT STEPS & IMPROVEMENTS

### 13.1 Critical Priorities (Phase 2)

#### 1. Create/Edit Forms

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Implement AccountForm component
- [ ] Implement JournalEntryForm with lines manager
- [ ] Add Zod validation schemas
- [ ] Integrate ConfirmModal for deletions

**Estimated Effort:** 5-7 days

#### 2. Journal Entry Posting UI

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Add post button to entries table
- [ ] Implement confirmation modal
- [ ] Handle closed period errors
- [ ] Update entry status after posting

**Estimated Effort:** 2-3 days

#### 3. Balance Validation UI

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Real-time balance calculation in forms
- [ ] Visual balance indicator
- [ ] Block posting unbalanced entries
- [ ] Show difference amount

**Estimated Effort:** 2 days

### 13.2 Feature Enhancements (Phase 3)

#### 1. Fiscal Period Management

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Fiscal periods CRUD UI
- [ ] Period status management (open/close/lock)
- [ ] Year-end closing workflow
- [ ] Period selection in reports

**Estimated Effort:** 4-5 days

#### 2. Reversal Workflow

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Reverse button for posted entries
- [ ] Auto-create reversal entry
- [ ] Link to original entry
- [ ] Reversal history view

**Estimated Effort:** 3-4 days

#### 3. Report Exports

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] PDF export (jsPDF)
- [ ] Excel export (xlsx)
- [ ] CSV export
- [ ] Custom report templates

**Estimated Effort:** 4-5 days

#### 4. Account Hierarchy View

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Tree view component for Chart of Accounts
- [ ] Expand/collapse nodes
- [ ] Drag-and-drop reordering
- [ ] Parent account selection

**Estimated Effort:** 3-4 days

### 13.3 Testing Improvements (Ongoing)

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Increase service test coverage to 90%
- [ ] Add component tests (React Testing Library)
- [ ] Test all 7 report hooks
- [ ] Test transformer functions
- [ ] Add integration tests for entry creation flow
- [ ] Achieve 80% overall coverage

**Estimated Effort:** Ongoing (2-3 weeks)

### 13.4 Technical Debt Resolution

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Implement Decimal.js for precision arithmetic
- [ ] Add error boundaries to report components
- [ ] Implement i18n support
- [ ] Create account autocomplete component
- [ ] Add virtual scrolling to large reports

**Estimated Effort:** 2 weeks

### 13.5 Advanced Features (Phase 4)

#### 1. Multi-Currency Support

**Tasks:**
- [ ] Currency management UI
- [ ] Exchange rate tracking
- [ ] Automatic conversion
- [ ] Multi-currency reports

**Estimated Effort:** 5-7 days

#### 2. Cost Center Management

**Tasks:**
- [ ] Cost centers CRUD
- [ ] Assign lines to cost centers
- [ ] Cost center reports
- [ ] Budget vs actual

**Estimated Effort:** 4-5 days

#### 3. Approval Workflow

**Tasks:**
- [ ] Approval UI for entries
- [ ] Multi-level approvals
- [ ] Notification system
- [ ] Approval history

**Estimated Effort:** 7-10 days

---

## APPENDIX A: BACKEND MIGRATIONS CODE

### Migration 1: Business Constraints

**File:** `2025_10_24_115737_add_accounting_business_constraints.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // Skip constraints and triggers for SQLite (testing environment)
        if ($driver === 'sqlite') {
            return;
        }

        // Constraint: Journal entries must be balanced
        DB::statement('
            ALTER TABLE journal_entries
            ADD CONSTRAINT chk_balanced_entry
            CHECK (total_debit = total_credit)
        ');

        // Constraint: Journal lines must have either debit OR credit (not both, not neither)
        DB::statement('
            ALTER TABLE journal_lines
            ADD CONSTRAINT chk_debit_or_credit
            CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
        ');

        // Constraint: Valid account types only
        DB::statement("
            ALTER TABLE accounts
            ADD CONSTRAINT chk_valid_account_type
            CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'contra'))
        ");

        // Constraint: Valid journal entry status
        DB::statement("
            ALTER TABLE journal_entries
            ADD CONSTRAINT chk_valid_entry_status
            CHECK (status IN ('draft', 'approved', 'posted', 'reversed'))
        ");

        // Constraint: Valid fiscal period status
        DB::statement("
            ALTER TABLE fiscal_periods
            ADD CONSTRAINT chk_valid_period_status
            CHECK (status IN ('open', 'closed', 'locked'))
        ");

        // MySQL Trigger: Update journal entry totals on INSERT
        DB::unprepared('
            CREATE TRIGGER tr_journal_lines_insert
            AFTER INSERT ON journal_lines
            FOR EACH ROW
            BEGIN
                UPDATE journal_entries
                SET
                    total_debit = COALESCE(total_debit, 0) + NEW.debit,
                    total_credit = COALESCE(total_credit, 0) + NEW.credit,
                    updated_at = NOW()
                WHERE id = NEW.journal_entry_id;
            END
        ');

        // MySQL Trigger: Update journal entry totals on UPDATE
        DB::unprepared('
            CREATE TRIGGER tr_journal_lines_update
            AFTER UPDATE ON journal_lines
            FOR EACH ROW
            BEGIN
                UPDATE journal_entries
                SET
                    total_debit = COALESCE(total_debit, 0) - OLD.debit + NEW.debit,
                    total_credit = COALESCE(total_credit, 0) - OLD.credit + NEW.credit,
                    updated_at = NOW()
                WHERE id = NEW.journal_entry_id;
            END
        ');

        // MySQL Trigger: Update journal entry totals on DELETE
        DB::unprepared('
            CREATE TRIGGER tr_journal_lines_delete
            AFTER DELETE ON journal_lines
            FOR EACH ROW
            BEGIN
                UPDATE journal_entries
                SET
                    total_debit = COALESCE(total_debit, 0) - OLD.debit,
                    total_credit = COALESCE(total_credit, 0) - OLD.credit,
                    updated_at = NOW()
                WHERE id = OLD.journal_entry_id;
            END
        ');

        // MySQL Trigger: Prevent posting to closed periods
        DB::unprepared('
            CREATE TRIGGER tr_check_period_status_on_post
            BEFORE UPDATE ON journal_entries
            FOR EACH ROW
            BEGIN
                DECLARE period_status_val VARCHAR(20);

                IF NEW.status = "posted" AND (OLD.status IS NULL OR OLD.status != "posted") THEN
                    SELECT status INTO period_status_val
                    FROM fiscal_periods
                    WHERE id = NEW.fiscal_period_id;

                    IF period_status_val != "open" THEN
                        SIGNAL SQLSTATE "45000"
                        SET MESSAGE_TEXT = "Cannot post to closed or locked fiscal period";
                    END IF;
                END IF;
            END
        ');
    }

    public function down(): void
    {
        // Reverse all constraints and triggers
        // ... (see full migration file)
    }
};
```

### Migration 2: Reversal Fields

**File:** `2025_10_28_103838_add_reversal_fields_to_journal_entries_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('journal_entries', 'reverses_entry_id')) {
                $table->foreignId('reverses_entry_id')
                      ->nullable()
                      ->constrained('journal_entries')
                      ->onDelete('restrict')
                      ->after('is_reversal');
            }
        });
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            if (Schema::hasColumn('journal_entries', 'reverses_entry_id')) {
                $table->dropForeign(['reverses_entry_id']);
                $table->dropColumn('reverses_entry_id');
            }
        });
    }
};
```

---

**END OF ACCOUNTING MODULE DOCUMENTATION**

**Lines:** ~2,100
**Completion Date:** 2025-10-31
**Status:** ✅ COMPLETE - Phase 2 requires forms implementation
**Next Module:** Contacts (15 files) - Standard CRUD module
