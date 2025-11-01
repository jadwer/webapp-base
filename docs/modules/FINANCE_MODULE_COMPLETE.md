# FINANCE MODULE - COMPLETE DOCUMENTATION

**Fecha:** 2025-10-31
**Estado:** ✅ COMPLETO - Validado con Backend
**Archivos:** 25 TypeScript files
**Entidades:** 5 (APInvoice, APPayment, ARInvoice, ARReceipt, BankAccount)
**Testing:** 3 test files (Vitest)
**Backend Schema:** ✅ VALIDADO - Migration 2025_10_27 aplicada

---

## ⚠️ CRITICAL BACKEND CHANGES

**Migration:** `2025_10_27_100000_fix_finance_contact_references.php`

**Breaking Changes Applied:**
1. `ar_invoices.customer_id` → `contact_id` (Party Pattern)
2. `ar_invoices` + `sales_order_id` column (FK to sales_orders)
3. `ap_invoices.supplier_id` → `contact_id` (Party Pattern)
4. `ap_invoices` + `purchase_order_id` column (FK to purchase_orders)
5. `payments.customer_id` → `contact_id` (Party Pattern)

**Impact:** All invoice and payment entities now use unified `contact_id` referencing the `contacts` table with role flags (`isSupplier`, `isCustomer`).

---

## 📋 TABLE OF CONTENTS

1. [Overview & Status](#1-overview--status)
2. [Module Structure](#2-module-structure)
3. [Entities & Types](#3-entities--types)
4. [Components Breakdown](#4-components-breakdown)
5. [Hooks & Services](#5-hooks--services)
6. [Backend Integration Analysis](#6-backend-integration-analysis)
7. [Gaps & Discrepancies](#7-gaps--discrepancies)
8. [Testing Coverage](#8-testing-coverage)
9. [Performance Optimizations](#9-performance-optimizations)
10. [Known Issues & Limitations](#10-known-issues--limitations)
11. [Usage Examples](#11-usage-examples)
12. [Next Steps & Improvements](#12-next-steps--improvements)

---

## 1. OVERVIEW & STATUS

### 1.1 Module Purpose

The Finance module provides comprehensive **Accounts Payable (AP)** and **Accounts Receivable (AR)** management for the ERP system. It handles:

- **AP Invoices:** Supplier invoices (bills to pay)
- **AP Payments:** Payments made to suppliers
- **AR Invoices:** Customer invoices (sales invoices)
- **AR Receipts:** Payments received from customers
- **Bank Accounts:** Banking entity management

### 1.2 Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Types & Interfaces** | ✅ Complete | All entities with TS strict typing |
| **API Services** | ✅ Complete | Full CRUD + post() operations |
| **SWR Hooks** | ✅ Complete | Data + mutation hooks for all entities |
| **Transformers** | ✅ Complete | JSON:API ↔ Frontend conversion |
| **Components** | ⚠️ Partial | Admin pages for AP/AR Invoices only |
| **Forms** | ⚠️ Partial | Basic forms, no validation |
| **Testing** | ⚠️ Partial | Services tested (70%), components minimal |
| **Backend Integration** | ✅ Validated | Migration 2025_10_27 confirmed |

### 1.3 Architecture Pattern

```
Finance Module Architecture (Phase 1 - Simple CRUD)
├── Types Layer (types/index.ts)
│   └── Strict TypeScript definitions for all entities
├── Services Layer (services/index.ts)
│   └── Axios-based API calls with transformers
├── Hooks Layer (hooks/index.ts)
│   └── SWR data hooks + mutation hooks
├── Transformers (utils/transformers.ts)
│   └── JSON:API ↔ Frontend data conversion
└── Components Layer
    ├── AdminPageReal components (AP/AR Invoices)
    ├── TableSimple components
    └── Form components (basic)
```

**Pattern:** Simple CRUD following AdminPageReal pattern (no enterprise features like Products module).

---

## 2. MODULE STRUCTURE

### 2.1 Complete File Tree

```
src/modules/finance/
├── components/                          # 10 React components
│   ├── APInvoiceForm.tsx               # AP Invoice creation/edit form
│   ├── APInvoicesAdminPageReal.tsx     # AP Invoices management page
│   ├── APInvoicesTableSimple.tsx       # AP Invoices data table
│   ├── APPaymentForm.tsx               # AP Payment creation form
│   ├── ARInvoiceForm.tsx               # AR Invoice creation/edit form
│   ├── ARInvoicesAdminPageReal.tsx     # AR Invoices management page
│   ├── ARInvoicesTableSimple.tsx       # AR Invoices data table
│   ├── ARReceiptForm.tsx               # AR Receipt creation form
│   ├── FilterBar.tsx                   # Reusable filter component
│   └── PaginationSimple.tsx            # Basic pagination component
│
├── hooks/
│   └── index.ts                        # 444 lines - All SWR hooks
│       ├── useAPInvoices               # List AP Invoices
│       ├── useAPInvoice                # Single AP Invoice
│       ├── useAPInvoiceMutations       # Create/Update/Delete/Post
│       ├── useAPPayments               # List AP Payments
│       ├── useAPPayment                # Single AP Payment
│       ├── useAPPaymentMutations       # Create/Update/Delete/Post
│       ├── useARInvoices               # List AR Invoices
│       ├── useARInvoice                # Single AR Invoice
│       ├── useARInvoiceMutations       # Create/Update/Delete/Post
│       ├── useARReceipts               # List AR Receipts
│       ├── useARReceipt                # Single AR Receipt
│       ├── useARReceiptMutations       # Create/Update/Delete/Post
│       ├── useBankAccounts             # List Bank Accounts
│       ├── useBankAccount              # Single Bank Account
│       └── useBankAccountMutations     # Create/Update/Delete
│
├── services/
│   └── index.ts                        # 433 lines - API layer
│       ├── apInvoicesService           # CRUD + post()
│       ├── apPaymentsService           # CRUD + post()
│       ├── arInvoicesService           # CRUD + post()
│       ├── arReceiptsService           # CRUD + post()
│       ├── bankAccountsService         # CRUD
│       └── Individual exports (compatibility)
│
├── types/
│   └── index.ts                        # 180 lines - All type definitions
│       ├── APInvoice, APInvoiceForm
│       ├── APPayment, APPaymentForm
│       ├── ARInvoice, ARInvoiceForm
│       ├── ARReceipt, ARReceiptForm
│       ├── BankAccount
│       └── FinanceAPIResponse<T>
│
├── utils/
│   ├── transformers.ts                 # 348 lines - JSON:API transformers
│   └── index.ts                        # Exports
│
├── tests/                              # 3 test files
│   ├── components/
│   │   └── APInvoicesTableSimple.test.tsx
│   ├── hooks/
│   │   └── useAPInvoices.test.tsx
│   ├── services/
│   │   └── financeService.test.ts    # 361 lines - Service layer tests
│   └── utils/
│       └── test-utils.ts              # Mock factories
│
└── index.ts                            # Module exports

**Total:** 25 TypeScript files
```

### 2.2 File Statistics

| Category | Files | Lines (approx) |
|----------|-------|----------------|
| Components | 10 | ~1,500 |
| Hooks | 1 | 444 |
| Services | 1 | 433 |
| Types | 1 | 180 |
| Utils | 2 | 350 |
| Tests | 4 | ~600 |
| **TOTAL** | **19** | **~3,507** |

---

## 3. ENTITIES & TYPES

### 3.1 APInvoice (Accounts Payable Invoice)

**Purpose:** Represents supplier invoices (bills to pay).

**Backend Table:** `ap_invoices`

**TypeScript Definition:**

```typescript
export interface APInvoice {
  id: string;
  contactId: string;              // ✅ CHANGED from supplier_id
  contactName?: string;            // Resolved from included
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  exchangeRate: number;
  subtotal: string;               // ✅ Backend returns decimal as string
  taxTotal: string;
  total: string;
  paidAmount: string;
  remainingBalance: number;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  purchaseOrderId?: number;       // ✅ NEW FIELD (2025_10_27)
  createdAt: string;
  updatedAt: string;
}
```

**Form Type:**

```typescript
export interface APInvoiceForm {
  contactId: string;              // Required
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  exchangeRate: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  notes?: string;
  purchaseOrderId?: number;
}
```

**Key Fields:**
- `contactId`: References `contacts` table (Party Pattern)
- `subtotal`, `taxTotal`, `total`: Stored as strings "100.00" (backend decimal)
- `purchaseOrderId`: Links to purchase_orders (added in migration)

### 3.2 APPayment (Accounts Payable Payment)

**Purpose:** Payments made to suppliers against AP Invoices.

**Backend Table:** `a_p_payments`

**TypeScript Definition:**

```typescript
export interface APPayment {
  id: string;
  contactId: number;              // ✅ CORRECTED - number per backend
  apInvoiceId: number | null;     // ✅ ADDED - confirmed by backend
  bankAccountId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  status: 'draft' | 'posted' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

**Critical Note:** `contactId` is **number** in APPayment (inconsistent with APInvoice which uses string).

### 3.3 ARInvoice (Accounts Receivable Invoice)

**Purpose:** Customer sales invoices (to collect payment).

**Backend Table:** `ar_invoices`

**TypeScript Definition:**

```typescript
export interface ARInvoice {
  id: string;
  contactId: string;              // ✅ CHANGED from customer_id
  contactName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  exchangeRate: number;
  subtotal: string;
  taxTotal: string;
  total: string;
  paidAmount: string;
  remainingBalance: number;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  salesOrderId?: number;          // ✅ NEW FIELD (2025_10_27)
  createdAt: string;
  updatedAt: string;
}
```

**Similarities with APInvoice:**
- Same structure (mirror for receivables)
- Uses `contactId` (Party Pattern)
- `salesOrderId` links to sales_orders

### 3.4 ARReceipt (Accounts Receivable Receipt)

**Purpose:** Payments received from customers.

**Backend Table:** `a_r_receipts`

**TypeScript Definition:**

```typescript
export interface ARReceipt {
  id: string;
  contactId: number;              // ✅ CORRECTED - number per backend
  arInvoiceId: number | null;     // ✅ CORRECTED - confirmed field
  bankAccountId: number;
  receiptDate: string;            // ✅ NOT paymentDate - specific for receipts
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  status: 'draft' | 'posted' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

**Critical Difference:** Uses `receiptDate` (not `paymentDate`).

### 3.5 BankAccount

**Purpose:** Bank account management for payments/receipts.

**Backend Table:** `bank_accounts`

**TypeScript Definition:**

```typescript
export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  clabe?: string;                 // Mexican interbank code
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  accountType: 'checking' | 'savings' | 'credit';
  currentBalance: number;
  openingBalance: number;
  status: 'active' | 'inactive' | 'closed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. COMPONENTS BREAKDOWN

### 4.1 Admin Pages

#### APInvoicesAdminPageReal.tsx (167 lines)

**Purpose:** Main AP Invoices management interface.

**Features:**
- ✅ Search and status filtering
- ✅ Stats summary cards (Total, Drafts, Pending, Paid)
- ✅ Pagination (20 items/page)
- ✅ JSON:API includes for contact resolution
- ✅ Navigation progress integration

**State Management:**
```typescript
const [searchTerm, setSearchTerm] = useState('')
const [statusFilter, setStatusFilter] = useState('')
const [currentPage, setCurrentPage] = useState(1)
```

**SWR Integration:**
```typescript
const { apInvoices, isLoading, error } = useAPInvoices({
  filters: { search: searchTerm, status: statusFilter },
  pagination: { page: currentPage, size: 20 },
  include: ['contact']
})
```

**Stats Calculation:**
- Total: `apInvoices?.length`
- Drafts: `filter(inv => inv.status === 'draft')`
- Pending: `filter(inv => inv.status === 'posted' && inv.remainingBalance > 0)`
- Paid: `filter(inv => inv.status === 'paid')`

**Missing:**
- ❌ Delete functionality
- ❌ Bulk operations
- ❌ Export capabilities
- ❌ Post operation UI

#### ARInvoicesAdminPageReal.tsx

**Purpose:** Main AR Invoices management interface.

**Features:** Same as APInvoicesAdminPageReal (mirror for receivables).

### 4.2 Tables

#### APInvoicesTableSimple.tsx / ARInvoicesTableSimple.tsx

**Purpose:** Display invoice data in tabular format.

**Columns:**
1. Invoice Number
2. Contact Name (from include)
3. Invoice Date
4. Due Date
5. Total
6. Status
7. Payment Status
8. Actions (View, Edit)

**Features:**
- ✅ Loading state skeleton
- ✅ Empty state message
- ✅ Status badges with color coding
- ⚠️ No sorting
- ⚠️ No column filtering

### 4.3 Forms

#### APInvoiceForm.tsx / ARInvoiceForm.tsx

**Purpose:** Create/edit invoice forms.

**Fields:**
- Contact selection (dropdown)
- Invoice number (text)
- Dates (invoice, due)
- Currency selection
- Exchange rate
- Amounts (subtotal, tax, total)
- Status
- Notes

**Missing:**
- ❌ Validation (no Zod/Yup)
- ❌ Contact autocomplete
- ❌ Automatic total calculation
- ❌ Invoice items (line items)

#### APPaymentForm.tsx / ARReceiptForm.tsx

**Purpose:** Record payments/receipts.

**Critical Fields:**
- `apInvoiceId` / `arInvoiceId` (link to invoice)
- `bankAccountId` (destination account)
- `paymentDate` / `receiptDate`
- Amount
- Payment method
- Reference

### 4.4 Utilities

#### FilterBar.tsx

**Purpose:** Reusable filter component.

**Props:**
- `searchTerm`, `onSearchChange`
- `statusFilter`, `onStatusFilterChange`
- `statusOptions` (array)
- `placeholder`

#### PaginationSimple.tsx

**Purpose:** Basic pagination controls.

**Features:**
- Previous/Next buttons
- Current page indicator
- Total pages display

**Missing:**
- ❌ Page number buttons
- ❌ "Go to page" input
- ❌ Items per page selector

---

## 5. HOOKS & SERVICES

### 5.1 SWR Hooks Architecture

**Pattern:** Data hooks + Mutation hooks (separated concerns).

#### Data Hooks (Fetching)

**useAPInvoices(params):**
```typescript
const { apInvoices, isLoading, error, mutate } = useAPInvoices({
  filters: { search: 'FACT-001', status: 'posted' },
  pagination: { page: 1, size: 20 },
  include: ['contact'],
  sort: ['-invoiceDate']
})
```

**SWR Key Strategy:**
```typescript
const key = ['/api/v1/a-p-invoices', formattedParams]
```

**Parameter Formatting:**
```typescript
// filters.search → filter[search]
// pagination.page → page[number]
// include array → include=contact,payments (comma-separated)
// sort array → sort=-invoiceDate,contactId
```

#### Mutation Hooks (CUD Operations)

**useAPInvoiceMutations():**
```typescript
const {
  createAPInvoice,
  updateAPInvoice,
  deleteAPInvoice,
  postAPInvoice
} = useAPInvoiceMutations()

// Usage
await createAPInvoice(formData)
await postAPInvoice('123') // Post to accounting
```

**SWR Cache Invalidation:**
```typescript
const createAPInvoice = async (data: APInvoiceForm) => {
  const result = await apInvoicesService.create(data)
  mutate('/api/v1/a-p-invoices')  // Refresh list cache
  return result
}

const updateAPInvoice = async (id: string, data: Partial<APInvoiceForm>) => {
  const result = await apInvoicesService.update(id, data)
  mutate(`/api/v1/a-p-invoices/${id}`)  // Refresh detail cache
  mutate('/api/v1/a-p-invoices')         // Refresh list cache
  return result
}
```

**Cross-Entity Invalidation (Payments):**
```typescript
const createAPPayment = async (data: APPaymentForm) => {
  const result = await apPaymentsService.create(data)
  mutate('/api/v1/a-p-payments')   // Refresh payments
  mutate('/api/v1/a-p-invoices')   // Refresh invoices (status changes!)
  return result
}
```

### 5.2 Services Layer

#### Service Structure Pattern

**All services follow same structure:**

```typescript
export const apInvoicesService = {
  async getAll(params): Promise<FinanceAPIResponse<APInvoice>>
  async getById(id, includes): Promise<{ data: APInvoice }>
  async create(data): Promise<{ data: APInvoice }>
  async update(id, data): Promise<{ data: APInvoice }>
  async delete(id): Promise<void>
  async post(id): Promise<{ data: APInvoice }>  // Post to accounting
}
```

#### API Endpoints

| Entity | Endpoint | Methods |
|--------|----------|---------|
| AP Invoices | `/api/v1/a-p-invoices` | GET, POST |
| AP Invoices (detail) | `/api/v1/a-p-invoices/:id` | GET, PATCH, DELETE |
| AP Invoices (post) | `/api/v1/a-p-invoices/:id/post` | POST |
| AP Payments | `/api/v1/a-p-payments` | GET, POST |
| AP Payments (detail) | `/api/v1/a-p-payments/:id` | GET, PATCH, DELETE |
| AP Payments (post) | `/api/v1/a-p-payments/:id/post` | POST |
| AR Invoices | `/api/v1/a-r-invoices` | GET, POST |
| AR Invoices (detail) | `/api/v1/a-r-invoices/:id` | GET, PATCH, DELETE |
| AR Invoices (post) | `/api/v1/a-r-invoices/:id/post` | POST |
| AR Receipts | `/api/v1/a-r-receipts` | GET, POST |
| AR Receipts (detail) | `/api/v1/a-r-receipts/:id` | GET, PATCH, DELETE |
| AR Receipts (post) | `/api/v1/a-r-receipts/:id/post` | POST |
| Bank Accounts | `/api/v1/bank-accounts` | GET, POST |
| Bank Accounts (detail) | `/api/v1/bank-accounts/:id` | GET, PATCH, DELETE |

#### JSON:API Request Format

**Create Example:**
```typescript
// Frontend data
const invoiceForm: APInvoiceForm = {
  contactId: "31",
  invoiceNumber: "FACT-001",
  subtotal: "100.00",
  taxTotal: "16.00",
  total: "116.00",
  // ...
}

// Transformed to JSON:API
{
  data: {
    type: 'a-p-invoices',
    attributes: {
      contactId: 31,          // ✅ Converted to number
      invoiceNumber: "FACT-001",
      subtotal: 100.00,       // ✅ Converted to number
      taxTotal: 16.00,
      total: 116.00,
      // ...
    }
  }
}
```

### 5.3 Transformers (utils/transformers.ts)

**Purpose:** Convert between JSON:API format and frontend format.

#### Frontend ← Backend (From API)

**transformAPInvoiceFromAPI:**
```typescript
export const transformAPInvoiceFromAPI = (
  apiData: any,
  includedData?: any[]
): APInvoice => {
  const attributes = apiData.attributes

  // Resolve contact name from included array
  let contactName = undefined
  if (includedData) {
    const contact = includedData.find(
      item => item.type === 'contacts' && item.id === String(attributes.contactId)
    )
    if (contact) {
      contactName = contact.attributes.name
    }
  }

  return {
    id: apiData.id,
    contactId: String(attributes.contactId),  // ✅ Backend "31" → string
    contactName,                               // ✅ From includes
    invoiceNumber: attributes.invoiceNumber,
    subtotal: attributes.subtotal,             // ✅ Keep as string "100.00"
    taxTotal: attributes.taxTotal,
    total: attributes.total,
    // ... other fields
  }
}
```

**Key Conversions:**
- `contactId`: Backend number → Frontend string (for invoices)
- Decimals: Keep as strings "100.00" (display purposes)
- Includes: Resolve relationship names from included array

#### Frontend → Backend (To API)

**transformAPInvoiceToAPI:**
```typescript
export const transformAPInvoiceToAPI = (formData: APInvoiceForm) => ({
  data: {
    type: 'a-p-invoices',
    attributes: {
      contactId: parseInt(formData.contactId),      // ✅ Convert to number
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      currency: formData.currency,
      exchangeRate: parseFloat(formData.exchangeRate),  // ✅ Convert to number
      subtotal: parseFloat(formData.subtotal),      // ✅ Convert to number
      taxTotal: parseFloat(formData.taxTotal),
      total: parseFloat(formData.total),
      status: formData.status,
      notes: formData.notes,
      purchaseOrderId: formData.purchaseOrderId,
    },
  },
})
```

**Key Conversions:**
- String IDs → Numbers (parseInt)
- String amounts → Numbers (parseFloat)
- Proper JSON:API envelope structure

---

## 6. BACKEND INTEGRATION ANALYSIS

### 6.1 Migration Details (2025_10_27_100000)

**File:** `2025_10_27_100000_fix_finance_contact_references.php`

**Executed Changes:**

#### 1. AR Invoices Table

```php
// BEFORE
ar_invoices.customer_id → BIGINT UNSIGNED NOT NULL (FK to contacts)

// AFTER (Migration)
ar_invoices.contact_id → BIGINT UNSIGNED NOT NULL (FK to contacts)
ar_invoices.sales_order_id → BIGINT UNSIGNED NULLABLE (FK to sales_orders)
```

**Index:** Added index on `sales_order_id`

#### 2. AP Invoices Table

```php
// BEFORE
ap_invoices.supplier_id → BIGINT UNSIGNED NOT NULL (FK to contacts)

// AFTER (Migration)
ap_invoices.contact_id → BIGINT UNSIGNED NOT NULL (FK to contacts)
ap_invoices.purchase_order_id → BIGINT UNSIGNED NULLABLE (FK to purchase_orders)
```

**Index:** Added index on `purchase_order_id`

#### 3. Payments Table

```php
// BEFORE
payments.customer_id → BIGINT UNSIGNED NOT NULL (FK to contacts)

// AFTER (Migration)
payments.contact_id → BIGINT UNSIGNED NOT NULL (FK to contacts)
```

**Rollback Support:** Migration includes `down()` method to reverse all changes.

### 6.2 Party Pattern Implementation

**Concept:** Unified contacts table with role flags instead of separate customers/suppliers.

**contacts Table Structure (from backend):**
```sql
contacts (
  id BIGINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  isCustomer BOOLEAN DEFAULT 0,    -- Can be customer
  isSupplier BOOLEAN DEFAULT 0,    -- Can be supplier
  isEmployee BOOLEAN DEFAULT 0,    -- Can be employee
  // ... other fields
)
```

**Benefits:**
- ✅ Single source of truth for all parties
- ✅ Contacts can be both customer AND supplier
- ✅ Consistent relationship handling
- ✅ Simplified queries and includes

**Frontend Impact:**
- All `contactId` fields now reference same table
- Contact resolution via JSON:API includes
- Contact pickers must filter by role (`isSupplier`, `isCustomer`)

### 6.3 JSON:API Compliance

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
      "type": "a-p-invoices",
      "id": "1",
      "attributes": {
        "contactId": 31,
        "invoiceNumber": "FACT-001",
        "subtotal": "100.00",
        "taxTotal": "16.00",
        "total": "116.00",
        "status": "posted"
      }
    }
  ],
  "included": [
    {
      "type": "contacts",
      "id": "31",
      "attributes": {
        "name": "Proveedor ABC",
        "isSupplier": true
      }
    }
  ],
  "meta": {
    "page": { "currentPage": 1, "total": 50 }
  },
  "links": {
    "first": "/api/v1/a-p-invoices?page[number]=1",
    "last": "/api/v1/a-p-invoices?page[number]=3"
  }
}
```

**Includes Strategy:**
```typescript
// Request
GET /api/v1/a-p-invoices?include=contact

// Resolves contact names client-side from included array
const contactName = included.find(
  item => item.type === 'contacts' && item.id === invoice.contactId
)?.attributes.name
```

### 6.4 Field Mappings (Frontend ↔ Backend)

| Frontend Field | Backend Field | Type Change | Notes |
|----------------|---------------|-------------|-------|
| `contactId` | `contact_id` | string ↔ number | Invoices use string, payments use number |
| `invoiceNumber` | `invoice_number` | - | camelCase ↔ snake_case |
| `invoiceDate` | `invoice_date` | - | camelCase ↔ snake_case |
| `dueDate` | `due_date` | - | camelCase ↔ snake_case |
| `subtotal` | `subtotal` | string ↔ decimal | "100.00" ↔ 100.00 |
| `taxTotal` | `tax_total` | string ↔ decimal | "16.00" ↔ 16.00 |
| `total` | `total` | string ↔ decimal | "116.00" ↔ 116.00 |
| `paidAmount` | `paid_amount` | string ↔ decimal | "50.00" ↔ 50.00 |
| `remainingBalance` | `remaining_balance` | number ↔ decimal | No conversion needed |
| `paymentStatus` | `payment_status` | - | camelCase ↔ snake_case |
| `purchaseOrderId` | `purchase_order_id` | number | ✅ NEW FIELD |
| `salesOrderId` | `sales_order_id` | number | ✅ NEW FIELD |
| `apInvoiceId` | `a_p_invoice_id` | number | ✅ NEW FIELD (payments) |
| `arInvoiceId` | `a_r_invoice_id` | number | ✅ NEW FIELD (receipts) |

### 6.5 Backend Endpoints Status

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/a-p-invoices` | GET | ✅ Working | Supports filters, pagination, includes |
| `/api/v1/a-p-invoices` | POST | ✅ Working | Create invoice |
| `/api/v1/a-p-invoices/:id` | GET | ✅ Working | Fetch single with includes |
| `/api/v1/a-p-invoices/:id` | PATCH | ✅ Working | Update invoice |
| `/api/v1/a-p-invoices/:id` | DELETE | ⚠️ Untested | May have FK constraints |
| `/api/v1/a-p-invoices/:id/post` | POST | ✅ Working | Post to accounting |
| `/api/v1/a-p-payments` | GET | ✅ Working | List payments |
| `/api/v1/a-p-payments` | POST | ✅ Working | Create payment |
| `/api/v1/a-p-payments/:id/post` | POST | ✅ Working | Post payment |
| `/api/v1/a-r-invoices` | GET | ✅ Working | List AR invoices |
| `/api/v1/a-r-invoices` | POST | ✅ Working | Create AR invoice |
| `/api/v1/a-r-invoices/:id/post` | POST | ✅ Working | Post to accounting |
| `/api/v1/a-r-receipts` | GET | ✅ Working | List receipts |
| `/api/v1/a-r-receipts` | POST | ✅ Working | Create receipt |
| `/api/v1/a-r-receipts/:id/post` | POST | ✅ Working | Post receipt |
| `/api/v1/bank-accounts` | GET | ✅ Working | List bank accounts |
| `/api/v1/bank-accounts` | POST | ✅ Working | Create account |

---

## 7. GAPS & DISCREPANCIES

### 7.1 Type Inconsistencies

#### contactId Type Mismatch

**Issue:** `contactId` type differs between entities.

| Entity | contactId Type | Backend Type |
|--------|----------------|--------------|
| APInvoice | `string` | `number` (but returned as "31") |
| APPayment | `number` | `number` |
| ARInvoice | `string` | `number` (but returned as "31") |
| ARReceipt | `number` | `number` |

**Root Cause:** Inconsistent transformer logic.

**Impact:** Type confusion in forms and validation.

**Recommendation:** Standardize to `string` for all (simpler form handling).

#### Decimal Handling

**Current Approach:**
- Invoices: Store as strings "100.00"
- Payments/Receipts: Store as numbers 100.00

**Issue:** Inconsistent across entities.

**Recommendation:** Use strings throughout for precision (decimals).

### 7.2 Missing Backend Features

#### Invoice Items (Line Items)

**Status:** ❌ Not implemented in frontend

**Backend Tables:**
- `a_p_invoice_items` (exists)
- `a_r_invoice_items` (exists)

**Frontend Gap:**
- No components for managing invoice items
- No hooks for invoice items CRUD
- No types defined for items

**Impact:** Cannot create detailed invoices with multiple products/services.

#### Tax Management

**Status:** ❌ No tax calculation system

**Current:** Manual `taxTotal` entry

**Missing:**
- Tax rate configuration
- Automatic tax calculation
- Multiple tax support (IVA, ISR, etc.)
- Tax codes/categories

#### Payment Terms

**Status:** ❌ Not implemented

**Backend Support:** Unknown

**Gap:** No payment terms like "Net 30", "2/10 Net 30", etc.

#### Multi-Currency Exchange

**Status:** ⚠️ Partial

**Current:**
- `currency` field exists
- `exchangeRate` field exists
- Manual entry only

**Missing:**
- Automatic exchange rate fetching
- Historical rate tracking
- Multi-currency reporting

#### Attachments/Documents

**Status:** ❌ Not implemented

**Common Requirement:**
- Attach PDF invoices
- Attach receipts
- Attach contracts

**Gap:** No document upload system for finance module.

### 7.3 Missing Frontend Features

#### Dashboard/Reports

**Status:** ❌ No finance dashboard

**Missing:**
- Aging reports (AP/AR)
- Cash flow projections
- Payment trends
- Overdue invoices list
- Revenue/expense charts

#### Bulk Operations

**Status:** ❌ No bulk actions

**Missing:**
- Bulk post invoices
- Bulk payment application
- Bulk delete
- Bulk export

#### Approval Workflows

**Status:** ❌ No workflow system

**Common Requirements:**
- Invoice approval before posting
- Payment approval thresholds
- Multi-level approvals

#### Reconciliation

**Status:** ❌ No bank reconciliation

**Missing:**
- Bank statement import
- Transaction matching
- Reconciliation reports

#### Invoice Numbering

**Status:** ⚠️ Manual entry

**Missing:**
- Automatic invoice number generation
- Customizable numbering formats
- Sequence management

---

## 8. TESTING COVERAGE

### 8.1 Test Files Overview

| Test File | Lines | Entities Covered | Coverage |
|-----------|-------|------------------|----------|
| `financeService.test.ts` | 361 | All 5 services | ~70% |
| `useAPInvoices.test.tsx` | ~100 | AP Invoice hooks | ~50% |
| `APInvoicesTableSimple.test.tsx` | ~80 | Table component | ~40% |
| `test-utils.ts` | ~120 | Mock factories | N/A |

**Total Test Coverage:** ~35% (estimated)

### 8.2 Service Tests (financeService.test.ts)

**Framework:** Vitest + happy-dom

**Test Structure:**
```typescript
describe('Finance Service', () => {
  beforeEach(() => {
    cleanupMocks()
    setupCommonMocks()
  })

  describe('AP Invoices', () => {
    it('should fetch AP invoices successfully')
    it('should fetch single AP invoice successfully')
    it('should create AP invoice successfully')
    it('should update AP invoice successfully')
    it('should delete AP invoice successfully')
  })

  describe('AR Invoices', () => {
    it('should fetch AR invoices successfully')
    it('should create AR invoice with correct data transformation')
  })

  describe('AP Payments', () => {
    it('should fetch AP payments successfully')
    it('should create AP payment with proper validation')
  })

  describe('AR Receipts', () => {
    it('should fetch AR receipts successfully')
    it('should create AR receipt with receiptDate field')  // ✅ Validates field name
  })

  describe('Bank Accounts', () => {
    it('should fetch bank accounts successfully')
    it('should create bank account with all required fields')
  })

  describe('Error Handling', () => {
    it('should handle API errors properly')
    it('should handle network errors')
  })

  describe('Query Parameters', () => {
    it('should handle filters and pagination correctly')
    it('should handle includes parameter')
  })
})
```

**Coverage:**
- ✅ All CRUD operations tested
- ✅ Error handling verified
- ✅ Query parameter formatting validated
- ✅ Data transformation confirmed
- ❌ Post operations not tested

### 8.3 Mock Factories (test-utils.ts)

**Purpose:** Generate consistent test data.

**Factories Available:**
```typescript
createMockAPInvoice(overrides?: Partial<APInvoice>): APInvoice
createMockAPPayment(overrides?: Partial<APPayment>): APPayment
createMockARInvoice(overrides?: Partial<ARInvoice>): ARInvoice
createMockARReceipt(overrides?: Partial<ARReceipt>): ARReceipt
createMockBankAccount(overrides?: Partial<BankAccount>): BankAccount
createMockAPIResponse<T>(data: T[]): FinanceAPIResponse<T>
```

**Usage Example:**
```typescript
const invoice = createMockAPInvoice({
  contactId: "31",
  invoiceNumber: "FACT-TEST",
  total: "1160.00"
})
```

### 8.4 Testing Gaps

**Critical Missing Tests:**

1. **Component Tests:**
   - ❌ Admin page interactions
   - ❌ Form validation
   - ❌ Filter behavior
   - ❌ Pagination logic

2. **Integration Tests:**
   - ❌ Full create/edit flow
   - ❌ SWR cache invalidation
   - ❌ Cross-entity updates (payment → invoice status)

3. **Transformer Tests:**
   - ❌ JSON:API → Frontend conversion edge cases
   - ❌ Frontend → JSON:API conversion validation
   - ❌ Include resolution logic

4. **Hook Tests:**
   - ⚠️ Only useAPInvoices tested
   - ❌ Mutation hooks untested
   - ❌ Cache invalidation untested

5. **E2E Tests:**
   - ❌ No E2E tests exist
   - ❌ No user flow testing

**Recommended Coverage Target:** 80% (currently ~35%)

---

## 9. PERFORMANCE OPTIMIZATIONS

### 9.1 Current Optimizations

#### SWR Caching

**Benefit:** Automatic request deduplication and caching.

**Example:**
```typescript
// First call - fetches from server
const { apInvoices } = useAPInvoices({ filters: { status: 'posted' } })

// Second call (same params) - returns cached data
const { apInvoices: cached } = useAPInvoices({ filters: { status: 'posted' } })
```

**Cache Invalidation:**
- Manual via `mutate()`
- Automatic on window focus (revalidateOnFocus)
- Automatic on reconnect (revalidateOnReconnect)

#### JSON:API Includes

**Optimization:** Fetch related data in single request.

**Without Includes:**
```typescript
// 2 requests
const invoices = await getAPInvoices()
for (const invoice of invoices) {
  const contact = await getContact(invoice.contactId)  // N+1 problem!
}
```

**With Includes:**
```typescript
// 1 request
const { apInvoices } = useAPInvoices({
  include: ['contact']  // Included in single response
})
```

**Savings:** N+1 → 1 request (massive performance gain).

### 9.2 Performance Issues

#### Pagination Limitation

**Issue:** Frontend pagination only (not backend).

**Current:**
```typescript
pagination: { page: currentPage, size: 20 }
// Backend may not support page[number], page[size]
```

**Impact:**
- All records fetched from backend
- Client-side slicing inefficient
- Slow with 1000+ invoices

**Recommendation:** Verify backend pagination support.

#### No Virtualization

**Issue:** Rendering 1000+ rows without virtualization.

**Impact:**
- Slow rendering
- High memory usage
- Poor scrolling performance

**Recommendation:** Use TanStack Virtual (like Products module).

#### No Debouncing

**Issue:** Search triggers immediate API calls.

**Current:**
```typescript
<input onChange={(e) => setSearchTerm(e.target.value)} />
// Every keystroke = API call
```

**Impact:** Excessive API requests during typing.

**Recommendation:** Debounce search input (300ms).

#### No Memoization

**Issue:** Components re-render on every state change.

**Missing:**
- `React.memo()` for table rows
- `useMemo()` for filtered/sorted data
- `useCallback()` for handlers

**Impact:** Unnecessary re-renders.

### 9.3 Recommended Optimizations

1. **Implement Debounced Search:**
```typescript
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

const { apInvoices } = useAPInvoices({
  filters: { search: debouncedSearch }
})
```

2. **Add React.memo to Table Rows:**
```typescript
const InvoiceRow = React.memo(({ invoice, onView, onEdit }) => {
  return <tr>...</tr>
})
```

3. **Use TanStack Virtual for Large Lists:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: apInvoices.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50
})
```

4. **Implement Backend Pagination:**
- Verify backend supports `page[number]`, `page[size]`
- Update services to handle pagination properly
- Add total count to meta response

---

## 10. KNOWN ISSUES & LIMITATIONS

### 10.1 Critical Issues

#### 1. Type Inconsistency (contactId)

**Severity:** High

**Description:** `contactId` is `string` in invoices, `number` in payments.

**Impact:** Type errors in forms, validation issues.

**Workaround:** Explicit type conversions in transformers.

**Fix Required:** Standardize to `string` throughout.

#### 2. No Form Validation

**Severity:** High

**Description:** Forms have no validation (Zod, Yup, etc.).

**Impact:**
- Invalid data can be submitted
- Poor UX (no field-level errors)
- Backend errors not user-friendly

**Example Issue:**
```typescript
// User can submit empty invoice number
<input name="invoiceNumber" value={""} />
// No client-side validation!
```

**Fix Required:** Implement Zod schemas and error handling.

#### 3. Decimal Precision Issues

**Severity:** Medium

**Description:** Storing decimals as strings can cause calculation errors.

**Example:**
```typescript
const subtotal = "100.00"
const taxTotal = "16.00"
const total = subtotal + taxTotal  // "100.0016.00" (string concatenation!)
```

**Impact:** Incorrect totals if calculations done client-side.

**Workaround:** Always use `parseFloat()` before math operations.

**Fix Required:** Use `Decimal.js` library for precision.

### 10.2 Functional Limitations

#### 1. No Invoice Items (Line Items)

**Impact:** Cannot create detailed invoices.

**Use Case Blocked:**
```
Invoice #001
  - Product A: 10 units @ $50 = $500
  - Product B: 5 units @ $100 = $500
  Subtotal: $1000
  Tax: $160
  Total: $1160
```

**Current:** Only total amounts (no breakdown).

#### 2. No Post Operation UI

**Description:** `post()` operation exists but no UI.

**Impact:** Users cannot post invoices to accounting.

**Required:**
- Post button in admin page
- Confirmation modal
- Status update after posting

#### 3. No Delete Functionality

**Description:** Delete service exists, no UI button.

**Impact:** Cannot delete invoices from UI.

**Risk:** Implementing delete may trigger FK constraint errors.

#### 4. No Payment Application

**Description:** Payments exist but not linked to invoices properly.

**Impact:**
- Cannot see which payments applied to which invoices
- No partial payment tracking
- `remainingBalance` calculation unclear

**Required:**
- Payment application UI
- Invoice payment history
- Automatic balance calculation

### 10.3 UX Limitations

#### 1. No Contact Autocomplete

**Current:** Dropdown selection only.

**Issue:** Slow with 1000+ contacts.

**Required:** Autocomplete with search (like products module).

#### 2. No Amount Calculations

**Current:** Manual entry for subtotal, tax, total.

**Issue:** Error-prone, requires calculator.

**Required:**
- Auto-calculate tax from subtotal
- Auto-calculate total
- Currency formatting

#### 3. No Status Badges Consistency

**Issue:** Status badges exist but colors hardcoded.

**Required:** Centralized status badge component with consistent styling.

#### 4. No Empty States

**Issue:** Empty tables show generic message.

**Required:**
- Illustrated empty states
- Call-to-action buttons
- Helpful messaging

### 10.4 Technical Debt

#### 1. Transformer Duplication

**Issue:** Similar transformer logic repeated for each entity.

**Example:**
- `transformAPInvoiceFromAPI` (50 lines)
- `transformARInvoiceFromAPI` (50 lines)
- 90% identical code

**Fix Required:** Generic transformer factory.

#### 2. No Error Boundaries

**Issue:** Component errors crash entire app.

**Fix Required:** Wrap admin pages in ErrorBoundary.

#### 3. No Loading States

**Issue:** Some components lack loading skeletons.

**Fix Required:** Consistent loading UI across all components.

#### 4. Hardcoded Strings

**Issue:** No i18n support, Spanish hardcoded.

**Example:** "Facturas de Proveedores" (hardcoded)

**Fix Required:** i18n implementation (next-i18next).

---

## 11. USAGE EXAMPLES

### 11.1 Basic Invoice Management

#### Display AP Invoices List

```typescript
'use client'
import { useAPInvoices } from '@/modules/finance'

export default function APInvoicesPage() {
  const { apInvoices, isLoading, error } = useAPInvoices({
    include: ['contact'],
    sort: ['-invoiceDate']
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>AP Invoices</h1>
      <ul>
        {apInvoices.map(invoice => (
          <li key={invoice.id}>
            {invoice.invoiceNumber} - {invoice.contactName} - ${invoice.total}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### Create AP Invoice

```typescript
'use client'
import { useAPInvoiceMutations } from '@/modules/finance'
import { useState } from 'react'

export default function CreateAPInvoice() {
  const { createAPInvoice } = useAPInvoiceMutations()
  const [formData, setFormData] = useState({
    contactId: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    currency: 'MXN',
    exchangeRate: '1.0',
    subtotal: '0.00',
    taxTotal: '0.00',
    total: '0.00',
    status: 'draft'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createAPInvoice(formData)
      console.log('Invoice created:', result)
      // Navigate to invoice detail or list
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Invoice Number"
        value={formData.invoiceNumber}
        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
      />
      {/* ... other fields */}
      <button type="submit">Create Invoice</button>
    </form>
  )
}
```

#### Update Invoice Status

```typescript
import { useAPInvoiceMutations } from '@/modules/finance'

export default function PostInvoiceButton({ invoiceId }) {
  const { postAPInvoice } = useAPInvoiceMutations()

  const handlePost = async () => {
    try {
      await postAPInvoice(invoiceId)
      alert('Invoice posted successfully')
    } catch (error) {
      alert('Error posting invoice')
    }
  }

  return <button onClick={handlePost}>Post to Accounting</button>
}
```

### 11.2 Filtering and Searching

#### Search by Invoice Number

```typescript
const [searchTerm, setSearchTerm] = useState('')

const { apInvoices } = useAPInvoices({
  filters: { search: searchTerm },
  include: ['contact']
})

return (
  <>
    <input
      type="text"
      placeholder="Search invoices..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {/* Display filtered invoices */}
  </>
)
```

#### Filter by Status

```typescript
const [status, setStatus] = useState('posted')

const { apInvoices } = useAPInvoices({
  filters: { status },
  include: ['contact']
})

return (
  <>
    <select value={status} onChange={(e) => setStatus(e.target.value)}>
      <option value="">All</option>
      <option value="draft">Draft</option>
      <option value="posted">Posted</option>
      <option value="paid">Paid</option>
    </select>
    {/* Display filtered invoices */}
  </>
)
```

#### Combined Filters

```typescript
const { apInvoices } = useAPInvoices({
  filters: {
    search: searchTerm,
    status: statusFilter,
    contactId: selectedContactId
  },
  pagination: { page: currentPage, size: 20 },
  include: ['contact'],
  sort: ['-invoiceDate', 'invoiceNumber']
})
```

### 11.3 Payment Management

#### Create Payment Against Invoice

```typescript
import { useAPPaymentMutations } from '@/modules/finance'

export default function CreatePayment({ invoiceId }) {
  const { createAPPayment } = useAPPaymentMutations()

  const handlePayment = async () => {
    try {
      await createAPPayment({
        apInvoiceId: parseInt(invoiceId),
        bankAccountId: 1,
        paymentDate: '2025-10-31',
        amount: 500.00,
        paymentMethod: 'transfer',
        reference: 'TRANS-001',
        status: 'posted'
      })
      alert('Payment created')
      // SWR automatically refreshes invoices list (status may change)
    } catch (error) {
      alert('Error creating payment')
    }
  }

  return <button onClick={handlePayment}>Record Payment</button>
}
```

#### List Payments for Invoice

```typescript
const { apPayments } = useAPPayments({
  filters: { apInvoiceId: invoiceId },
  sort: ['-paymentDate']
})

return (
  <div>
    <h3>Payments</h3>
    {apPayments.map(payment => (
      <div key={payment.id}>
        {payment.paymentDate} - ${payment.amount} ({payment.paymentMethod})
      </div>
    ))}
  </div>
)
```

### 11.4 Bank Account Management

#### List Bank Accounts

```typescript
import { useBankAccounts } from '@/modules/finance'

export default function BankAccountsList() {
  const { bankAccounts, isLoading } = useBankAccounts({
    filters: { status: 'active' }
  })

  return (
    <ul>
      {bankAccounts.map(account => (
        <li key={account.id}>
          {account.bankName} - {account.accountNumber} ({account.currency})
          Balance: ${account.currentBalance}
        </li>
      ))}
    </ul>
  )
}
```

#### Create Bank Account

```typescript
const { createBankAccount } = useBankAccountMutations()

await createBankAccount({
  bankName: 'BBVA',
  accountNumber: '0123456789',
  clabe: '012180001234567890',
  currency: 'MXN',
  accountType: 'checking',
  openingBalance: 10000.00,
  status: 'active'
})
```

### 11.5 Advanced Patterns

#### Cross-Entity Data (Invoice + Payments)

```typescript
export default function InvoiceDetail({ id }) {
  // Fetch invoice
  const { apInvoice } = useAPInvoice(id, ['contact'])

  // Fetch related payments
  const { apPayments } = useAPPayments({
    filters: { apInvoiceId: id }
  })

  const totalPaid = apPayments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = parseFloat(apInvoice?.total || '0') - totalPaid

  return (
    <div>
      <h2>Invoice {apInvoice?.invoiceNumber}</h2>
      <p>Total: ${apInvoice?.total}</p>
      <p>Paid: ${totalPaid}</p>
      <p>Remaining: ${remaining}</p>

      <h3>Payments</h3>
      {apPayments.map(payment => (
        <div key={payment.id}>...</div>
      ))}
    </div>
  )
}
```

#### Optimistic Updates

```typescript
const { updateAPInvoice } = useAPInvoiceMutations()
const { apInvoice, mutate } = useAPInvoice(id)

const handleStatusChange = async (newStatus) => {
  // Optimistic update
  mutate(
    { ...apInvoice, status: newStatus },
    { revalidate: false }
  )

  try {
    await updateAPInvoice(id, { status: newStatus })
    // Will revalidate on success
  } catch (error) {
    // Rollback on error
    mutate()
    alert('Error updating status')
  }
}
```

---

## 12. NEXT STEPS & IMPROVEMENTS

### 12.1 Critical Priorities (Phase 2)

#### 1. Form Validation System

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Implement Zod schemas for all entities
- [ ] Add field-level validation
- [ ] Create reusable `FormField` component with error display
- [ ] Implement form error handling

**Estimated Effort:** 2-3 days

#### 2. Invoice Items (Line Items)

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Create `InvoiceItem` types
- [ ] Implement invoice items CRUD services
- [ ] Create `InvoiceItemsManager` component (like Products)
- [ ] Integrate with invoice forms

**Estimated Effort:** 3-5 days

#### 3. Payment Application System

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Implement payment → invoice linking
- [ ] Create payment application UI
- [ ] Add invoice payment history view
- [ ] Implement automatic balance calculation

**Estimated Effort:** 2-3 days

#### 4. Delete & Post Operations UI

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Add delete buttons to admin pages
- [ ] Implement ConfirmModal for deletions
- [ ] Add FK constraint error handling
- [ ] Add post buttons and workflows

**Estimated Effort:** 1-2 days

### 12.2 Performance Improvements (Phase 3)

#### 1. Backend Pagination

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Verify backend pagination support
- [ ] Update services to use proper pagination
- [ ] Update hooks to handle meta.total
- [ ] Implement PaginationPro component

**Estimated Effort:** 1 day

#### 2. Search Debouncing

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Create `useDebounce` hook
- [ ] Apply to all search inputs
- [ ] Add loading indicators

**Estimated Effort:** 4 hours

#### 3. Virtualization

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Implement TanStack Virtual for tables
- [ ] Test with 10,000+ invoices
- [ ] Optimize row rendering

**Estimated Effort:** 2 days

### 12.3 Feature Enhancements (Phase 4)

#### 1. Dashboard & Reports

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Create finance dashboard page
- [ ] Implement aging reports (AP/AR)
- [ ] Add charts (revenue, expenses, cash flow)
- [ ] Create overdue invoices view

**Estimated Effort:** 5-7 days

#### 2. Tax Management

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Implement tax rate configuration
- [ ] Add automatic tax calculation
- [ ] Support multiple taxes (IVA, ISR)
- [ ] Create tax reports

**Estimated Effort:** 3-5 days

#### 3. Approval Workflows

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Implement approval system backend
- [ ] Create approval UI components
- [ ] Add notification system
- [ ] Implement approval history

**Estimated Effort:** 5-7 days

#### 4. Multi-Currency Support

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Integrate exchange rate API
- [ ] Implement automatic rate updates
- [ ] Add currency conversion UI
- [ ] Create multi-currency reports

**Estimated Effort:** 3-4 days

### 12.4 Testing Improvements (Ongoing)

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Increase service test coverage to 90%
- [ ] Add component tests (React Testing Library)
- [ ] Implement integration tests
- [ ] Add E2E tests (Playwright)
- [ ] Achieve 80% overall coverage

**Estimated Effort:** Ongoing (2-3 weeks)

### 12.5 Technical Debt Resolution

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Refactor transformers (generic factory)
- [ ] Implement error boundaries
- [ ] Add i18n support
- [ ] Create design system components (StatusBadge, EmptyState)
- [ ] Standardize `contactId` type to string

**Estimated Effort:** 1-2 weeks

### 12.6 UX Improvements

**Priority:** 🟢 MEDIUM

**Tasks:**
- [ ] Implement contact autocomplete
- [ ] Add automatic amount calculations
- [ ] Create illustrated empty states
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo for forms

**Estimated Effort:** 1 week

---

## APPENDIX A: BACKEND MIGRATION CODE

**File:** `2025_10_27_100000_fix_finance_contact_references.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // 1. AR Invoices: customer_id → contact_id + sales_order_id
        if (Schema::hasTable('ar_invoices') && Schema::hasColumn('ar_invoices', 'customer_id')) {
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE ar_invoices CHANGE COLUMN customer_id contact_id BIGINT UNSIGNED NOT NULL');
            } elseif ($driver === 'sqlite') {
                Schema::table('ar_invoices', function (Blueprint $table) {
                    $table->renameColumn('customer_id', 'contact_id');
                });
            }

            if (!Schema::hasColumn('ar_invoices', 'sales_order_id')) {
                Schema::table('ar_invoices', function (Blueprint $table) {
                    $table->unsignedBigInteger('sales_order_id')->nullable()->after('contact_id');
                    $table->index('sales_order_id');
                    $table->foreign('sales_order_id')->references('id')->on('sales_orders')->onDelete('restrict');
                });
            }
        }

        // 2. AP Invoices: supplier_id → contact_id + purchase_order_id
        if (Schema::hasTable('ap_invoices') && Schema::hasColumn('ap_invoices', 'supplier_id')) {
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE ap_invoices CHANGE COLUMN supplier_id contact_id BIGINT UNSIGNED NOT NULL');
            } elseif ($driver === 'sqlite') {
                Schema::table('ap_invoices', function (Blueprint $table) {
                    $table->renameColumn('supplier_id', 'contact_id');
                });
            }

            if (!Schema::hasColumn('ap_invoices', 'purchase_order_id')) {
                Schema::table('ap_invoices', function (Blueprint $table) {
                    $table->unsignedBigInteger('purchase_order_id')->nullable()->after('contact_id');
                    $table->index('purchase_order_id');
                    $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('restrict');
                });
            }
        }

        // 3. Payments: customer_id → contact_id
        if (Schema::hasTable('payments') && Schema::hasColumn('payments', 'customer_id')) {
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE payments CHANGE COLUMN customer_id contact_id BIGINT UNSIGNED NOT NULL');
            } elseif ($driver === 'sqlite') {
                Schema::table('payments', function (Blueprint $table) {
                    $table->renameColumn('customer_id', 'contact_id');
                });
            }
        }
    }

    public function down(): void
    {
        // Rollback logic (reverses all changes)
        // ... (see full migration file)
    }
};
```

---

## APPENDIX B: TYPE DEFINITIONS REFERENCE

**File:** `src/modules/finance/types/index.ts` (180 lines)

```typescript
// Complete type definitions for reference
export interface APInvoice {
  id: string;
  contactId: string;
  contactName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  exchangeRate: number;
  subtotal: string;
  taxTotal: string;
  total: string;
  paidAmount: string;
  remainingBalance: number;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  purchaseOrderId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface APPayment {
  id: string;
  contactId: number;
  apInvoiceId: number | null;
  bankAccountId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  status: 'draft' | 'posted' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ARInvoice {
  id: string;
  contactId: string;
  contactName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  exchangeRate: number;
  subtotal: string;
  taxTotal: string;
  total: string;
  paidAmount: string;
  remainingBalance: number;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  salesOrderId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ARReceipt {
  id: string;
  contactId: number;
  arInvoiceId: number | null;
  bankAccountId: number;
  receiptDate: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  status: 'draft' | 'posted' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  clabe?: string;
  currency: 'MXN' | 'USD' | 'CAD' | 'EUR';
  accountType: 'checking' | 'savings' | 'credit';
  currentBalance: number;
  openingBalance: number;
  status: 'active' | 'inactive' | 'closed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceAPIResponse<T> {
  jsonapi: { version: string };
  data: T[];
  meta?: any;
  links?: any;
}
```

---

**END OF FINANCE MODULE DOCUMENTATION**

**Lines:** ~1,800
**Completion Date:** 2025-10-31
**Status:** ✅ COMPLETE - Ready for Phase 2 implementation
**Next Module:** Accounting (25 files) - ⚠️ CRÍTICO - "cambió mucho"
