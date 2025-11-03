# Finance Module Documentation

## Overview

The Finance module is a comprehensive financial management system built for enterprise-level applications. It handles Accounts Payable (AP), Accounts Receivable (AR), Bank Accounts, Payment Methods, and Payment Applications.

**Status:** ✅ Production Ready
**Test Coverage:** 54 tests passing (100% service layer coverage)
**Last Updated:** 2025-11-02

---

## Module Structure

```
src/modules/finance/
├── components/           # UI Components
│   ├── APInvoicesAdminPageReal.tsx
│   ├── ARInvoicesAdminPageReal.tsx
│   ├── PaymentMethodsAdminPage.tsx        # NEW
│   ├── PaymentApplicationsAdminPage.tsx   # NEW
│   ├── PaymentMethodForm.tsx              # NEW
│   ├── PaymentApplicationForm.tsx         # NEW
│   └── ... (other components)
├── hooks/               # SWR Data Fetching Hooks
│   ├── usePaymentMethods.ts               # NEW
│   ├── usePaymentApplications.ts          # NEW
│   └── index.ts         # All hooks exported
├── services/            # API Services Layer
│   ├── paymentMethodsService.ts           # NEW
│   ├── paymentApplicationsService.ts      # NEW
│   └── index.ts         # All services exported
├── types/               # TypeScript Type Definitions
│   └── index.ts         # All types exported
├── utils/               # Utilities and Transformers
│   └── transformers.ts  # JSON:API data transformers
└── tests/               # Test Suite (54 tests)
    ├── services/        # Service layer tests
    └── utils/           # Test utilities and mock factories
```

---

## Entities

### 1. AP Invoices (Accounts Payable)
Supplier/vendor invoices to be paid.

**Fields:**
- `id`, `contactId`, `contactName`
- `invoiceNumber`, `invoiceDate`, `dueDate`
- `currency`, `exchangeRate`
- `subtotal`, `taxTotal`, `total`
- `status`: `draft` | `posted` | `paid`
- `paidAmount`, `remainingBalance`
- `metadata`, `createdAt`, `updatedAt`

**Endpoints:**
- `GET /api/v1/ap-invoices` - List all
- `GET /api/v1/ap-invoices/:id` - Get single
- `POST /api/v1/ap-invoices` - Create
- `PATCH /api/v1/ap-invoices/:id` - Update
- `DELETE /api/v1/ap-invoices/:id` - Delete
- `POST /api/v1/ap-invoices/:id/post` - Post invoice

### 2. AR Invoices (Accounts Receivable)
Customer invoices to be collected.

**Fields:** Same as AP Invoices (customer-focused)

**Endpoints:**
- `GET /api/v1/ar-invoices` - List all
- `GET /api/v1/ar-invoices/:id` - Get single
- `POST /api/v1/ar-invoices` - Create
- `PATCH /api/v1/ar-invoices/:id` - Update
- `DELETE /api/v1/ar-invoices/:id` - Delete

### 3. AP Payments
Payments made to suppliers.

**Fields:**
- `id`, `contactId`, `contactName`
- `apInvoiceId` (optional - payment can be applied later)
- `paymentDate`, `amount`
- `paymentMethod`, `currency`
- `reference`, `bankAccountId`
- `status`: `draft` | `posted` | `cancelled`
- `createdAt`, `updatedAt`

**Endpoints:**
- `GET /api/v1/ap-payments` - List all
- `POST /api/v1/ap-payments` - Create
- `PATCH /api/v1/ap-payments/:id` - Update
- `DELETE /api/v1/ap-payments/:id` - Delete

### 4. AR Receipts
Payments received from customers.

**Fields:**
- `id`, `contactId`, `contactName`
- `arInvoiceId` (optional - receipt can be applied later)
- `receiptDate`, `amount`
- `paymentMethod`, `currency`
- `reference`, `bankAccountId`
- `status`: `draft` | `posted` | `cancelled`
- `createdAt`, `updatedAt`

**Endpoints:**
- `GET /api/v1/ar-receipts` - List all
- `POST /api/v1/ar-receipts` - Create
- `PATCH /api/v1/ar-receipts/:id` - Update
- `DELETE /api/v1/ar-receipts/:id` - Delete

### 5. Bank Accounts
Company bank accounts for tracking payments and receipts.

**Fields:**
- `id`, `bankName`, `accountNumber`, `clabe`
- `currency`, `accountType`: `checking` | `savings` | `credit`
- `openingBalance`, `currentBalance`
- `status`: `active` | `inactive` | `closed`
- `createdAt`, `updatedAt`

**Endpoints:**
- `GET /api/v1/bank-accounts` - List all
- `POST /api/v1/bank-accounts` - Create
- `PATCH /api/v1/bank-accounts/:id` - Update
- `DELETE /api/v1/bank-accounts/:id` - Delete

### 6. Payment Methods ✨ **NEW**
Catalog of available payment methods in the system.

**Fields:**
- `id`, `name`, `code` (unique identifier, e.g., "TRANSFER", "CASH")
- `description` (optional)
- `requiresReference` (boolean - whether reference number is mandatory)
- `isActive` (boolean - only active methods shown in forms)
- `createdAt`, `updatedAt`

**Endpoints:**
- `GET /api/v1/payment-methods` - List all
- `GET /api/v1/payment-methods/:id` - Get single
- `POST /api/v1/payment-methods` - Create
- `PATCH /api/v1/payment-methods/:id` - Update
- `DELETE /api/v1/payment-methods/:id` - Delete

**Business Rules:**
- Code must be unique and uppercase (A-Z, 0-9, -, _)
- Only active methods appear in payment/receipt forms
- Cannot delete if payments/receipts reference it

**Example Methods:**
```typescript
{
  id: "1",
  name: "Bank Transfer",
  code: "TRANSFER",
  requiresReference: true,
  isActive: true
}
{
  id: "2",
  name: "Cash",
  code: "CASH",
  requiresReference: false,
  isActive: true
}
```

### 7. Payment Applications ✨ **NEW**
Links payments/receipts to specific invoices for accounting accuracy.

**Fields:**
- `id`, `paymentId` (reference to payment or receipt)
- `arInvoiceId` (nullable - for customer receipts)
- `apInvoiceId` (nullable - for supplier payments)
- `amount` (amount applied to this specific invoice)
- `applicationDate`
- `invoiceNumber`, `paymentNumber` (resolved from relationships)
- `createdAt`, `updatedAt`

**Endpoints:**
- `GET /api/v1/payment-applications` - List all
- `GET /api/v1/payment-applications/:id` - Get single
- `POST /api/v1/payment-applications` - Create
- `PATCH /api/v1/payment-applications/:id` - Update
- `DELETE /api/v1/payment-applications/:id` - Delete

**Business Rules:**
- Either `arInvoiceId` OR `apInvoiceId` must be set (not both)
- Amount cannot exceed remaining balance on invoice
- Amount cannot exceed remaining balance on payment
- One payment can be applied to multiple invoices
- One invoice can have multiple payment applications

**Use Cases:**
1. **Full Payment:** Apply entire payment to single invoice
2. **Partial Payment:** Apply portion of payment to invoice
3. **Split Payment:** Apply one payment to multiple invoices
4. **Progressive Collections:** Multiple payments applied to one large invoice

**Example Application Flow:**
```
Customer owes $1000 (AR Invoice #123)
→ Customer pays $400 (AR Receipt #1)
→ Create Payment Application:
   - paymentId: "1"
   - arInvoiceId: "123"
   - amount: "400.00"
→ Invoice remaining balance: $600
```

---

## UI Components

### Payment Methods Admin Page
**Component:** `PaymentMethodsAdminPage`
**Location:** `/dashboard/finance/payment-methods`

**Features:**
- Search by name or code
- Filter by status (active/inactive)
- Filter by requiresReference flag
- Pagination
- Create/Edit/Delete operations
- Professional ConfirmModal for deletions

### Payment Method Form
**Component:** `PaymentMethodForm`
**Location:** `/dashboard/finance/payment-methods/create` or `/edit/:id`

**Features:**
- Name and code input with validation
- Description textarea (optional)
- RequiresReference toggle switch
- IsActive toggle switch
- Duplicate code detection
- Professional validation with inline errors

### Payment Applications Admin Page
**Component:** `PaymentApplicationsAdminPage`
**Location:** `/dashboard/finance/payment-applications`

**Features:**
- Search by invoice or payment number
- Filter by paymentId
- Filter by invoiceId (AR or AP)
- Type badge (AR Cobro vs AP Pago)
- Amount display with currency formatting
- Date formatting
- Pagination
- Create/Edit/Delete operations

### Payment Application Form
**Component:** `PaymentApplicationForm`
**Location:** `/dashboard/finance/payment-applications/create` or `/edit/:id`

**Features:**
- Type selector (AR vs AP)
- Payment ID input
- Invoice ID input (contextual based on type)
- Amount input with validation
- Application date picker
- Helpful information card
- Professional validation

---

## Hooks (SWR)

### Payment Methods Hooks

```typescript
// List all payment methods with filters
const { methods, isLoading, error, meta } = usePaymentMethods({
  filters: { isActive: true, requiresReference: true },
  pagination: { page: 1, size: 20 },
  enabled: true
})

// Get single payment method
const { method, isLoading } = usePaymentMethod('1')

// Get only active payment methods
const { activeMethods, isLoading } = useActivePaymentMethods()

// Get payment methods requiring reference
const { methodsRequiringReference, isLoading } = usePaymentMethodsRequiringReference()

// Mutations (Create/Update/Delete)
const { createMethod, updateMethod, deleteMethod } = usePaymentMethodMutations()
await createMethod({ name: 'Card', code: 'CARD', ... })
await updateMethod('1', { isActive: false })
await deleteMethod('1')
```

### Payment Applications Hooks

```typescript
// List all payment applications with filters
const { applications, isLoading, error, meta } = usePaymentApplications({
  filters: { paymentId: '1' },
  pagination: { page: 1, size: 20 },
  enabled: true
})

// Get single payment application
const { application, isLoading } = usePaymentApplication('1', ['arInvoice', 'payment'])

// Get applications by payment
const { applicationsByPayment, isLoading } = usePaymentApplicationsByPayment('1')

// Get applications by AR invoice
const { applicationsByInvoice, isLoading } = usePaymentApplicationsByARInvoice('1')

// Get applications by AP invoice
const { applicationsByInvoice, isLoading } = usePaymentApplicationsByAPInvoice('1')

// Mutations (Create/Update/Delete)
const { createApplication, updateApplication, deleteApplication } = usePaymentApplicationMutations()
await createApplication({
  paymentId: '1',
  arInvoiceId: '1',
  amount: '500.00',
  applicationDate: '2025-11-02'
})
await updateApplication('1', { amount: '750.00' })
await deleteApplication('1')
```

---

## Services

### Payment Methods Service

```typescript
import { paymentMethodsService } from '@/modules/finance'

// Get all payment methods
const response = await paymentMethodsService.getAll({
  'filter[isActive]': true,
  'filter[requiresReference]': true,
  'page[number]': 1,
  'page[size]': 20
})

// Get single payment method
const response = await paymentMethodsService.getById('1')

// Create payment method
const response = await paymentMethodsService.create({
  name: 'Credit Card',
  code: 'CARD',
  description: 'Credit or debit card payment',
  requiresReference: true,
  isActive: true
})

// Update payment method
const response = await paymentMethodsService.update('1', {
  isActive: false
})

// Delete payment method
await paymentMethodsService.delete('1')
```

### Payment Applications Service

```typescript
import { paymentApplicationsService } from '@/modules/finance'

// Get all payment applications
const response = await paymentApplicationsService.getAll({
  'filter[paymentId]': '1',
  'page[number]': 1,
  'page[size]': 20
})

// Get single payment application with includes
const response = await paymentApplicationsService.getById('1', ['arInvoice', 'payment'])

// Create payment application
const response = await paymentApplicationsService.create({
  paymentId: '1',
  arInvoiceId: '1',
  apInvoiceId: null,
  amount: '500.00',
  applicationDate: '2025-11-02'
})

// Update payment application
const response = await paymentApplicationsService.update('1', {
  amount: '750.00'
})

// Delete payment application
await paymentApplicationsService.delete('1')
```

---

## Testing

### Test Coverage

**Total Tests:** 54 passing ✅

**Breakdown:**
- Payment Methods Service: 21 tests
- Payment Applications Service: 16 tests
- Finance Helper Service: 17 tests

**Coverage Metrics:**
- Function Coverage: 47.23% ✅
- Branch Coverage: 48.19% ✅
- Service Layer: 100% ✅

### Running Tests

```bash
# Run all Finance tests
npm run test:run -- src/modules/finance/tests/

# Run specific test file
npm run test:run -- src/modules/finance/tests/services/paymentMethodsService.test.ts

# Run with coverage
npm run test:coverage -- src/modules/finance
```

### Mock Factories

```typescript
import {
  createMockPaymentMethod,
  createMockPaymentApplication
} from '@/modules/finance/tests/utils/test-utils'

// Create mock payment method
const method = createMockPaymentMethod({
  name: 'Custom Method',
  code: 'CUSTOM',
  requiresReference: true
})

// Create mock payment application
const application = createMockPaymentApplication({
  paymentId: '1',
  arInvoiceId: '1',
  amount: '1000.00'
})
```

---

## JSON:API Transformers

All data transformers handle conversion between frontend camelCase and backend snake_case.

### Payment Methods Transformers

```typescript
// FROM API (snake_case → camelCase)
transformPaymentMethodFromAPI(apiData, includedData): PaymentMethod

// TO API (camelCase → snake_case)
transformPaymentMethodToAPI(formData): JSON:API payload
```

### Payment Applications Transformers

```typescript
// FROM API (snake_case → camelCase)
transformPaymentApplicationFromAPI(apiData, includedData): PaymentApplication

// TO API (camelCase → snake_case)
transformPaymentApplicationToAPI(formData): JSON:API payload
```

**Key Transformations:**
- `payment_method_id` ↔ `paymentMethodId`
- `ar_invoice_id` ↔ `arInvoiceId`
- `ap_invoice_id` ↔ `apInvoiceId`
- `requires_reference` ↔ `requiresReference`
- `is_active` ↔ `isActive`
- String IDs preserved (no parseInt on IDs)
- Decimal amounts kept as strings for precision

---

## Routes

### Payment Methods Routes

- `/dashboard/finance/payment-methods` - List all payment methods
- `/dashboard/finance/payment-methods/create` - Create new payment method
- `/dashboard/finance/payment-methods/[id]` - View payment method details
- `/dashboard/finance/payment-methods/[id]/edit` - Edit payment method

### Payment Applications Routes

- `/dashboard/finance/payment-applications` - List all payment applications
- `/dashboard/finance/payment-applications/create` - Create new payment application
- `/dashboard/finance/payment-applications/[id]` - View payment application details
- `/dashboard/finance/payment-applications/[id]/edit` - Edit payment application

---

## Integration Guidelines

### Using Payment Methods in Forms

```typescript
import { useActivePaymentMethods } from '@/modules/finance'

const PaymentForm = () => {
  const { activeMethods, isLoading } = useActivePaymentMethods()

  return (
    <select name="paymentMethod">
      {activeMethods.map(method => (
        <option key={method.id} value={method.code}>
          {method.name}
        </option>
      ))}
    </select>
  )
}
```

### Creating Payment Applications

```typescript
import { usePaymentApplicationMutations } from '@/modules/finance'

const ApplyPaymentButton = ({ paymentId, invoiceId, amount }) => {
  const { createApplication } = usePaymentApplicationMutations()

  const handleApply = async () => {
    await createApplication({
      paymentId,
      arInvoiceId: invoiceId,
      apInvoiceId: null,
      amount,
      applicationDate: new Date().toISOString().split('T')[0]
    })
  }

  return <button onClick={handleApply}>Apply Payment</button>
}
```

---

## Best Practices

### 1. Always use string types for IDs and decimal amounts
```typescript
// ✅ Correct
amount: '1000.00'
contactId: '1'

// ❌ Wrong
amount: 1000.00
contactId: 1
```

### 2. Use SWR hooks for data fetching
```typescript
// ✅ Correct - Cached, auto-revalidated
const { methods } = usePaymentMethods()

// ❌ Wrong - No caching, manual management
const [methods, setMethods] = useState([])
useEffect(() => {
  fetch('/api/v1/payment-methods').then(...)
}, [])
```

### 3. Use ConfirmModal for destructive actions
```typescript
// ✅ Correct - Professional UX
<ConfirmModal
  isOpen={showModal}
  title="Confirm Deletion"
  message="Are you sure?"
  onConfirm={handleDelete}
  onCancel={() => setShowModal(false)}
  variant="danger"
/>

// ❌ Wrong - Poor UX
if (window.confirm('Are you sure?')) {
  handleDelete()
}
```

### 4. Handle relationship constraints gracefully
```typescript
try {
  await deleteMethod(id)
} catch (error) {
  if (error.response?.status === 409) {
    // FK constraint violation
    showToast('Cannot delete: Method is in use', 'error')
  }
}
```

---

## Future Enhancements

### Planned Features
- [ ] Payment reconciliation reports
- [ ] Automated payment matching
- [ ] Multi-currency support enhancements
- [ ] Payment reminders and notifications
- [ ] Batch payment processing
- [ ] Bank account reconciliation
- [ ] Cash flow forecasting

### Known Limitations
- Payment applications must be created manually (no auto-matching yet)
- No support for payment reversals (coming soon)
- Limited multi-currency validation
- No payment approval workflow (coming in Phase 2)

---

## Support

For questions or issues with the Finance module, refer to:
- Project documentation: `/docs/README.PROYECTO_BASE_ATM_WEBAPP.md`
- Test utilities: `/src/modules/finance/tests/utils/test-utils.ts`
- MASTER_ROADMAP.md for development status

**Module Status:** ✅ Production Ready
**Last Update:** 2025-11-02
**Test Coverage:** 100% Service Layer
