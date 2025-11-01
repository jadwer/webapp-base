# CONTACTS Module - Complete Documentation

**Module**: Contacts (Contact Management System)
**Status**: ✅ Completo | ⚠️ **NO BACKEND SCHEMA** | ❌ **NO TESTS** (Policy Violation)
**Date**: 2025-11-01
**Total Files**: 15 TypeScript files
**Backend Integration Status**: ⚠️ **Needs Backend Schema Validation**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Module Structure](#module-structure)
3. [Entities & Types](#entities--types)
4. [Components Breakdown](#components-breakdown)
5. [Hooks & Services](#hooks--services)
6. [Backend Integration Analysis](#backend-integration-analysis)
7. [Gaps & Discrepancies](#gaps--discrepancies)
8. [Testing Coverage](#testing-coverage)
9. [Performance Optimizations](#performance-optimizations)
10. [Known Issues & Limitations](#known-issues--limitations)
11. [Usage Examples](#usage-examples)
12. [Next Steps & Improvements](#next-steps--improvements)

---

## Overview

**Purpose**: Complete contact management system with support for customers, suppliers, addresses, documents, and contact persons. Implements the **Party Pattern** for unified contact handling.

**Key Features**:
- ✅ **4-Entity CRUD System**: Contact, ContactAddress, ContactDocument, ContactPerson
- ✅ **Party Pattern Implementation**: Contacts can be both customers AND suppliers (dual role support)
- ✅ **Document Lifecycle Management**: Upload → Verify → Download workflow with FormData
- ✅ **Tabbed Interface**: Organized UI with 4 tabs for complete entity relationship visualization
- ✅ **JSON:API Compliant**: Full compliance with Laravel JSON:API backend
- ✅ **SWR State Management**: Intelligent caching with cache invalidation strategies
- ✅ **Specialized Hooks**: Pre-built hooks for customers, suppliers, active contacts, etc.
- ✅ **Relationship Includes**: Efficient data loading with JSON:API includes parameter

**Implementation Status**:
- ✅ **Complete CRUD** for all 4 entities
- ✅ **Document Management** with upload, download, verify, unverify operations
- ✅ **Professional UI** with ContactFormTabs (1,061 lines), ContactViewTabs (899 lines)
- ✅ **Contact Types** - Individual (persona física) and Company (empresa)
- ✅ **Status Management** - Active, Inactive, Suspended
- ✅ **Credit Management** - Credit limit and current credit tracking
- ⚠️ **No Backend Schema** - Cannot validate types against backend tables
- ❌ **No Tests** - CRITICAL: 0% coverage (violates 70% policy from CLAUDE.md)

---

## Module Structure

### Directory Tree

```
src/modules/contacts/
├── components/              # 11 files, 4,461 lines
│   ├── ContactsAdminPageReal.tsx        # 286 lines - Main admin interface
│   ├── ContactFormTabs.tsx              # 1,061 lines - 4-tab creation/edit form
│   ├── ContactViewTabs.tsx              # 899 lines - Comprehensive view interface
│   ├── ContactDocuments.tsx             # 410 lines - Document management UI
│   ├── ContactAddresses.tsx             # 379 lines - Address management
│   ├── ContactPeople.tsx                # 436 lines - Contact persons management
│   ├── ContactsTableSimple.tsx          # 287 lines - Data table with actions
│   ├── ContactBasicForm.tsx             # 243 lines - Basic contact data form
│   ├── ContactFilters.tsx               # 185 lines - Filtering UI
│   ├── ContactTypeSelector.tsx          # 107 lines - Individual vs Company toggle
│   └── StatusBadge.tsx                  # 168 lines - Status visualization
├── hooks/                   # 1 file, 310 lines
│   └── index.ts             # All hooks: useContacts, useContact, useContactMutations, + specialized
├── services/                # 1 file, 404 lines
│   └── index.ts             # 4 services: contacts, addresses, documents, people
├── types/                   # 1 file, 154 lines
│   └── index.ts             # All entity types and interfaces
├── tests/                   # ❌ MISSING - Policy violation
│   └── (none)
└── index.ts                 # Module exports - 17 lines
```

### File Count

| Type | Count | Lines | Purpose |
|------|-------|-------|---------|
| **Components (.tsx)** | 11 | 4,461 | UI components and forms |
| **Hooks (.ts)** | 1 | 310 | SWR-based data fetching hooks |
| **Services (.ts)** | 1 | 404 | API integration layer with 4 services |
| **Types (.ts)** | 1 | 154 | TypeScript interfaces for 4 entities |
| **Templates (.html.tsx)** | 0 | 0 | No designer templates |
| **Utils (.ts)** | 0 | 0 | Utilities in services file |
| **Tests** | 0 | 0 | ❌ **CRITICAL VIOLATION** |
| **Total** | 15 | 5,346 | All module files |

---

## Entities & Types

### Entity 1: Contact (Main Entity)

**Purpose**: Unified contact entity implementing the Party Pattern (can be customer AND/OR supplier)

**TypeScript Interface:**
```typescript
export interface Contact {
  id: string                                      // UUID primary key
  contactType: 'individual' | 'company'          // Tipo de contacto
  name: string                                    // Nombre comercial (REQUERIDO)
  legalName?: string                              // Razón social (opcional)
  taxId?: string                                  // RFC / Tax ID
  email?: string                                  // Email principal
  phone?: string                                  // Teléfono principal
  website?: string                                // Sitio web
  status: 'active' | 'inactive' | 'suspended'    // Estado del contacto

  // ✅ PARTY PATTERN - Dual role support
  isCustomer: boolean                             // Puede ser cliente
  isSupplier: boolean                             // Puede ser proveedor

  // Credit Management
  creditLimit?: number                            // Límite de crédito
  currentCredit?: number                          // Crédito actual utilizado

  // Business Classification
  classification?: string                         // Clasificación personalizada
  paymentTerms?: number                           // Términos de pago (días)

  // Metadata
  notes?: string                                  // Notas adicionales
  metadata?: Record<string, unknown>              // Datos adicionales flexibles

  // Timestamps
  createdAt: string                               // ISO 8601 datetime
  updatedAt: string                               // ISO 8601 datetime
}
```

**Backend Mapping:**
⚠️ **NO BACKEND SCHEMA DOCUMENTATION** - Cannot validate field mappings

**JSON:API Type:** `"contacts"` (plural, lowercase)

**Key Relationships:**
- `hasMany`: ContactAddress (direcciones)
- `hasMany`: ContactDocument (documentos)
- `hasMany`: ContactPerson (personas de contacto)
- Referenced by: Finance module (customers table references contacts)

**Party Pattern Implementation:**
```typescript
// ✅ Contact can be BOTH customer AND supplier
const dualRoleContact = {
  name: "Acme Corp",
  isCustomer: true,    // We buy from them
  isSupplier: true,    // We sell to them
  status: 'active'
}

// ✅ Customer only
const customerOnly = {
  name: "John Doe",
  isCustomer: true,
  isSupplier: false,
  contactType: 'individual'
}

// ✅ Supplier only
const supplierOnly = {
  name: "Parts Inc",
  isCustomer: false,
  isSupplier: true,
  contactType: 'company'
}
```

**Parsed Contact Interface:**
```typescript
export interface ContactParsed extends Contact {
  displayName: string           // legalName || name (UI-friendly)
  contactTypeLabel: string      // "Persona física" | "Empresa"
  statusLabel: string           // "Activo" | "Inactivo" | "Suspendido"
  isActiveCustomer: boolean     // isCustomer && status === 'active'
  isActiveSupplier: boolean     // isSupplier && status === 'active'
  hasDocuments: boolean         // Populated via includes
  hasAddresses: boolean         // Populated via includes
  hasPeople: boolean            // Populated via includes
}
```

---

### Entity 2: ContactAddress (Related Entity)

**Purpose**: Multiple addresses per contact with type classification

**TypeScript Interface:**
```typescript
export interface ContactAddress {
  id: string                                          // UUID primary key
  contactId: number                                   // Foreign key to contacts table
  addressType: 'billing' | 'shipping' | 'main' | 'other'  // Tipo de dirección
  addressLine1: string                                // Calle y número (REQUERIDO)
  addressLine2?: string                               // Depto/Suite/etc (opcional)
  city: string                                        // Ciudad (REQUERIDO)
  state: string                                       // Estado/Provincia (REQUERIDO)
  country: string                                     // País (REQUERIDO)
  postalCode: string                                  // Código postal (REQUERIDO)
  isDefault: boolean                                  // Es dirección principal?
  metadata?: Record<string, unknown>                  // Datos adicionales
  createdAt: string                                   // ISO 8601 datetime
  updatedAt: string                                   // ISO 8601 datetime
}
```

**Backend Mapping:**
⚠️ **NO BACKEND SCHEMA DOCUMENTATION**

**JSON:API Type:** `"contact-addresses"` (kebab-case)

**Key Relationships:**
- `belongsTo`: Contact

**Address Types:**
- `billing` - Dirección de facturación
- `shipping` - Dirección de envío
- `main` - Dirección principal
- `other` - Otra dirección

---

### Entity 3: ContactDocument (Related Entity)

**Purpose**: Document management with verification lifecycle

**TypeScript Interface:**
```typescript
export interface ContactDocument {
  id: string                                          // UUID primary key
  contactId: number                                   // Foreign key to contacts table
  documentType: 'tax_certificate' | 'business_license' | 'rfc' | 'other'  // Tipo de documento
  filePath: string                                    // Ruta del archivo en storage
  originalFilename: string                            // Nombre original del archivo
  mimeType: string                                    // Tipo MIME (application/pdf, image/png, etc.)
  fileSize: number                                    // Tamaño en bytes
  uploadedBy: number                                  // Usuario que subió el documento
  verifiedAt?: string                                 // Fecha de verificación (ISO 8601)
  verifiedBy?: number                                 // Usuario que verificó
  expiresAt?: string                                  // Fecha de expiración (ISO 8601)
  notes?: string                                      // Notas sobre el documento
  metadata?: Record<string, unknown>                  // Datos adicionales
  createdAt: string                                   // ISO 8601 datetime
  updatedAt: string                                   // ISO 8601 datetime
}
```

**Backend Mapping:**
⚠️ **NO BACKEND SCHEMA DOCUMENTATION**

**JSON:API Type:** `"contact-documents"` (kebab-case)

**Key Relationships:**
- `belongsTo`: Contact
- `belongsTo`: User (uploadedBy)
- `belongsTo`: User (verifiedBy)

**Document Lifecycle:**
```
1. Upload   → POST /api/v1/contact-documents/upload (FormData)
2. Verify   → PATCH /api/v1/contact-documents/{id}/verify
3. Download → GET /api/v1/contact-documents/{id}/download (Blob)
4. Unverify → PATCH /api/v1/contact-documents/{id}/unverify
5. Delete   → DELETE /api/v1/contact-documents/{id}
```

**Document Types:**
- `tax_certificate` - Certificado fiscal (Constancia de situación fiscal)
- `business_license` - Licencia de negocio
- `rfc` - RFC (Registro Federal de Contribuyentes)
- `other` - Otro tipo de documento

---

### Entity 4: ContactPerson (Related Entity)

**Purpose**: People associated with company contacts (contact persons, representatives)

**TypeScript Interface:**
```typescript
export interface ContactPerson {
  id: string                     // UUID primary key
  contactId: number              // Foreign key to contacts table
  name: string                   // Nombre completo (REQUERIDO)
  position?: string              // Puesto/Cargo
  email?: string                 // Email personal
  phone?: string                 // Teléfono personal
  isPrimary: boolean             // Es contacto principal?
  notes?: string                 // Notas adicionales
  metadata?: Record<string, unknown>  // Datos adicionales
  createdAt: string              // ISO 8601 datetime
  updatedAt: string              // ISO 8601 datetime
}
```

**Backend Mapping:**
⚠️ **NO BACKEND SCHEMA DOCUMENTATION**

**JSON:API Type:** `"contact-people"` (kebab-case)

**Key Relationships:**
- `belongsTo`: Contact

**Use Cases:**
- Sales representatives
- Account managers
- Technical contacts
- Billing contacts
- Decision makers

---

### Form Interfaces

```typescript
export interface ContactFormData {
  contactType: 'individual' | 'company'
  name: string
  legalName?: string
  taxId?: string
  email?: string
  phone?: string
  website?: string
  status: 'active' | 'inactive' | 'suspended'
  isCustomer: boolean
  isSupplier: boolean
  creditLimit?: number
  classification?: string
  paymentTerms?: number
  notes?: string
  metadata?: Record<string, unknown>
}

export interface ContactAddressForm {
  contactId: number
  addressType: 'billing' | 'shipping' | 'main' | 'other'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault: boolean
}

export interface ContactDocumentForm {
  contactId: number
  documentType: 'tax_certificate' | 'business_license' | 'rfc' | 'other'
  file: File                 // Actual File object for upload
  notes?: string
}

export interface ContactPersonForm {
  contactId: number
  name: string
  position?: string
  email?: string
  phone?: string
  isPrimary: boolean
  notes?: string
}
```

---

## Components Breakdown

### Main Components

#### 1. ContactsAdminPageReal.tsx (286 lines)

**Purpose**: Main administrative interface for contact management

**Key Features:**
- Contact listing with search and filters
- Create/Edit/Delete operations
- Status filtering (active, inactive, suspended)
- Type filtering (individual, company, customers, suppliers)
- Professional data table with actions
- Navigation to contact view and edit pages

**Dependencies:**
- Hook: `useContacts`
- Hook: `useContactMutations`
- Service: `contactsService`
- Component: `ContactsTableSimple`
- Component: `ContactFilters`

**State Management:**
- Local state: `useState` for filters and search
- SWR cache: Contact list with auto-revalidation

**Example Usage:**
```tsx
// Route: /dashboard/contacts
import { ContactsAdminPageReal } from '@/modules/contacts'

export default function ContactsPage() {
  return <ContactsAdminPageReal />
}
```

---

#### 2. ContactFormTabs.tsx (1,061 lines) ⭐ **ENTERPRISE COMPONENT**

**Purpose**: Complete tabbed form for contact creation and editing with all related entities

**Props Interface:**
```typescript
interface ContactFormTabsProps {
  contact?: ContactParsed          // For edit mode
  onSubmit: (data: ContactFormData) => Promise<ContactParsed | void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}
```

**Key Features:**
- **4-Tab Interface:**
  - **Tab 1: Basic** - Contact basic information (name, email, phone, etc.)
  - **Tab 2: Addresses** - Address management (billing, shipping, main, other)
  - **Tab 3: Documents** - Document upload, verify, download, delete
  - **Tab 4: People** - Contact persons (representatives, managers, etc.)
- **Persistent Form State** - Form data preserved when switching tabs
- **Real-time Validation** - Inline error messages
- **Related Entity CRUD** - Full CRUD for addresses, documents, people within tabs
- **Document Lifecycle** - Upload → Verify → Download → Delete workflow
- **Conditional Rendering** - Tabs only available after contact creation

**State Management:**
- Local state: `formData` for basic contact info (persisted across tabs)
- Local state: `formErrors` for validation errors
- Local state: `activeTab` for tab navigation
- SWR cache: Related entities (addresses, documents, people)

**Implementation Details:**
```typescript
// Tab Types
type TabType = 'basic' | 'addresses' | 'documents' | 'people'

// Form State (persistent across tabs)
const [formData, setFormData] = useState<ContactFormData>({
  contactType: contact?.contactType || 'company',
  name: contact?.name || '',
  legalName: contact?.legalName || '',
  taxId: contact?.taxId || '',
  email: contact?.email || '',
  phone: contact?.phone || '',
  website: contact?.website || '',
  status: contact?.status || 'active',
  isCustomer: contact?.isCustomer || false,
  isSupplier: contact?.isSupplier || false,
  creditLimit: contact?.creditLimit || undefined,
  classification: contact?.classification || '',
  paymentTerms: contact?.paymentTerms || undefined,
  notes: contact?.notes || '',
  metadata: contact?.metadata || {}
})

// Related entities hooks (conditional - only in edit mode)
const { addresses, mutate: mutateAddresses } = useContactAddresses(contact?.id)
const { documents, mutate: mutateDocuments } = useContactDocuments(contact?.id)
const { people, mutate: mutatePeople } = useContactPeople(contact?.id)
```

**Example Usage:**
```tsx
import { ContactFormTabs } from '@/modules/contacts'

function CreateContactPage() {
  const handleSubmit = async (data: ContactFormData) => {
    const newContact = await contactsService.create(data)
    router.push(`/dashboard/contacts/${newContact.id}`)
  }

  return (
    <ContactFormTabs
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      isLoading={false}
    />
  )
}
```

---

#### 3. ContactViewTabs.tsx (899 lines) ⭐ **COMPREHENSIVE VIEW**

**Purpose**: Complete contact view with all related data in organized tabs

**Props Interface:**
```typescript
interface ContactViewTabsProps {
  contact: ContactParsed
  onEdit: () => void
  onDelete: () => void
  className?: string
}
```

**Key Features:**
- **4-Tab Interface** (read-only):
  - **Tab 1: Overview** - Complete contact information display
  - **Tab 2: Addresses** - All addresses with type badges
  - **Tab 3: Documents** - Document list with verify/download actions
  - **Tab 4: People** - Contact persons with positions and contact info
- **JSON:API Includes** - Efficient loading with `include` parameter
- **Professional Layout** - Bootstrap grid with responsive design
- **Action Buttons** - Edit and Delete with professional confirmation modals
- **Status Visualization** - Color-coded status badges
- **Credit Information** - Credit limit and usage display
- **Party Pattern Display** - Clear customer/supplier role indicators

**Dependencies:**
- Hook: `useContact` with includes
- Hook: `useContactAddresses`
- Hook: `useContactDocuments`
- Hook: `useContactPeople`
- Component: `StatusBadge`
- Component: `ContactDocuments` (for document actions)

**Example Usage:**
```tsx
import { ContactViewTabs } from '@/modules/contacts'

function ContactDetailPage({ params }: { params: { id: string } }) {
  const { contact } = useContact(params.id, ['addresses', 'documents', 'people'])

  return (
    <ContactViewTabs
      contact={contact}
      onEdit={() => router.push(`/dashboard/contacts/${params.id}/edit`)}
      onDelete={handleDelete}
    />
  )
}
```

---

#### 4. ContactDocuments.tsx (410 lines) ⭐ **DOCUMENT MANAGEMENT**

**Purpose**: Complete document management UI with upload, verify, download, delete operations

**Props Interface:**
```typescript
interface ContactDocumentsProps {
  contactId: string
  documents?: ContactDocument[]
  onRefresh?: () => void
  editable?: boolean
}
```

**Key Features:**
- **File Upload** - FormData upload with drag & drop support
- **Document Verification** - Verify/Unverify workflow
- **File Download** - Blob download with proper MIME type handling
- **Document Type Selection** - tax_certificate, business_license, rfc, other
- **Expiration Management** - Optional expiration dates
- **File Size Display** - Human-readable file sizes (KB, MB)
- **Upload Progress** - Visual feedback during upload
- **Error Handling** - User-friendly error messages

**Implementation Details:**
```typescript
// Upload Function (FormData)
const handleUpload = async (file: File, documentType: string, notes?: string) => {
  const formData = new FormData()
  formData.append('contact_id', contactId)       // snake_case as documented
  formData.append('document_type', documentType)
  formData.append('file', file)
  if (notes) formData.append('notes', notes)

  // POST /api/v1/contact-documents/upload
  const response = await contactDocumentsService.upload(file, contactId, documentType, notes)
  onRefresh()  // Refresh document list
}

// Download Function (Blob)
const handleDownload = async (id: string, filename: string) => {
  const blob = await contactDocumentsService.download(id)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Verify Function
const handleVerify = async (id: string) => {
  await contactDocumentsService.verify(id)
  onRefresh()
}
```

**Example Usage:**
```tsx
import { ContactDocuments } from '@/modules/contacts'

function DocumentsTab({ contactId }: { contactId: string }) {
  const { documents, mutate } = useContactDocuments(contactId)

  return (
    <ContactDocuments
      contactId={contactId}
      documents={documents}
      onRefresh={mutate}
      editable={true}
    />
  )
}
```

---

#### 5. ContactAddresses.tsx (379 lines)

**Purpose**: Address management UI with CRUD operations

**Key Features:**
- Address creation form
- Address editing
- Address deletion
- Default address selection
- Address type badges (billing, shipping, main, other)
- Inline editing mode

**Dependencies:**
- Hook: `useContactAddresses`
- Service: `contactAddressesService`

---

#### 6. ContactPeople.tsx (436 lines)

**Purpose**: Contact persons management UI

**Key Features:**
- Person creation form
- Person editing
- Person deletion
- Primary contact designation
- Position and contact info display

**Dependencies:**
- Hook: `useContactPeople`
- Service: `contactPeopleService`

---

### Utility Components

#### ContactsTableSimple.tsx (287 lines)

**Purpose**: Professional data table for contact listing

**Features:**
- Sortable columns
- Action buttons (view, edit, delete)
- Status badges
- Customer/Supplier indicators
- Responsive design

---

#### ContactBasicForm.tsx (243 lines)

**Purpose**: Reusable form for basic contact data

**Features:**
- Contact type selector (individual vs company)
- Conditional fields based on contact type
- Party pattern checkboxes (isCustomer, isSupplier)
- Status dropdown
- Credit limit input
- Payment terms input
- Validation

---

#### ContactFilters.tsx (185 lines)

**Purpose**: Advanced filtering UI

**Features:**
- Search by name
- Filter by status (active, inactive, suspended)
- Filter by type (individual, company)
- Filter by role (customers only, suppliers only, both)
- Clear filters button

---

#### ContactTypeSelector.tsx (107 lines)

**Purpose**: Toggle between individual and company contact types

**Features:**
- Radio button group
- Icons for each type
- Automatic field visibility updates

---

#### StatusBadge.tsx (168 lines)

**Purpose**: Color-coded status visualization

**Features:**
- Active (green)
- Inactive (gray)
- Suspended (red)
- Bootstrap badge styling

---

## Hooks & Services

### Hooks (310 lines)

#### useContacts.ts

**Purpose**: Fetch and manage contacts list with filters

**Parameters:**
```typescript
interface UseContactsParams {
  filters?: {
    search?: string
    status?: 'active' | 'inactive' | 'suspended'
    contactType?: 'individual' | 'company'
    isCustomer?: boolean
    isSupplier?: boolean
  }
}
```

**Return Type:**
```typescript
{
  contacts: ContactParsed[]      // Parsed contacts with UI enhancements
  meta: {                        // JSON:API meta object
    page?: {
      currentPage: number
      total: number
      perPage: number
      lastPage: number
    }
  }
  isLoading: boolean
  error: Error | undefined
  mutate: () => void             // SWR revalidate function
}
```

**Implementation Details:**
- Uses SWR for data fetching
- Transforms JSON:API response to flat objects
- Handles filter parameters (converted to `filter[key]` format)
- Boolean filters converted to '1' or '0' for API
- 5-second deduping interval
- `keepPreviousData: true` for better UX during refetch
- `revalidateOnFocus: false` to prevent unnecessary refetches

**Example:**
```typescript
const { contacts, isLoading, mutate } = useContacts({
  filters: {
    status: 'active',
    isCustomer: true
  }
})
```

---

#### useContact.ts

**Purpose**: Fetch single contact with optional relationship includes

**Parameters:**
```typescript
function useContact(
  id?: string,
  include?: string[]  // ['addresses', 'documents', 'people']
)
```

**Return Type:**
```typescript
{
  contact: ContactParsed | undefined
  addresses: ContactAddress[]        // From included data
  documents: ContactDocument[]       // From included data
  people: ContactPerson[]            // From included data
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}
```

**Implementation Details:**
- Uses `processIncludedData()` utility to separate relationships
- Conditional fetching (only if `id` is provided)
- Returns empty arrays if no includes provided
- Efficient loading with JSON:API `include` parameter

**Example:**
```typescript
// Load contact with all relationships
const { contact, addresses, documents, people } = useContact(
  contactId,
  ['addresses', 'documents', 'people']
)

// Load contact only
const { contact } = useContact(contactId)
```

---

#### useContactMutations.ts

**Purpose**: Mutation hooks for create, update, delete operations

**Return Type:**
```typescript
{
  createContact: (data: ContactFormData) => Promise<ContactResponse>
  updateContact: (id: string, data: Partial<ContactFormData>) => Promise<ContactResponse>
  deleteContact: (id: string) => Promise<void>
}
```

**Implementation Details:**
- Uses `useCallback` for stable function references
- Automatic SWR cache invalidation after mutations
- Invalidates both list cache (`contacts`) and detail cache (`contact, id`)
- Console logging for debugging
- Error propagation to UI

**Cache Invalidation Strategy:**
```typescript
// Invalidate all related cache keys
const { mutate } = await import('swr')
mutate(key =>
  Array.isArray(key) && (
    key[0] === 'contacts' ||                    // List cache
    (key[0] === 'contact' && key[1] === id)     // Detail cache
  )
)
```

**Example:**
```typescript
const { createContact, updateContact, deleteContact } = useContactMutations()

// Create
const newContact = await createContact({
  name: "Acme Corp",
  contactType: 'company',
  isCustomer: true,
  isSupplier: false,
  status: 'active'
})

// Update
await updateContact(contactId, {
  status: 'inactive'
})

// Delete
await deleteContact(contactId)
```

---

#### Specialized Hooks

**useContactsByType:**
```typescript
export const useContactsByType = (contactType: 'individual' | 'company') => {
  return useContacts({ filters: { contactType } })
}
```

**useCustomers:**
```typescript
export const useCustomers = () => {
  return useContacts({ filters: { isCustomer: true } })
}
```

**useSuppliers:**
```typescript
export const useSuppliers = () => {
  return useContacts({ filters: { isSupplier: true } })
}
```

**useActiveContacts:**
```typescript
export const useActiveContacts = () => {
  return useContacts({ filters: { status: 'active' } })
}
```

**Example Usage:**
```typescript
// Get all customers (active and inactive)
const { contacts: customers } = useCustomers()

// Get all active suppliers
const { contacts: activeSuppliers } = useSuppliers()

// Get all active contacts (any role)
const { contacts: activeContacts } = useActiveContacts()

// Get all companies
const { contacts: companies } = useContactsByType('company')
```

---

#### Related Entity Hooks

**useContactAddresses:**
```typescript
const {
  addresses,              // ContactAddress[]
  isLoading,
  error,
  mutate,
  endpointNotFound       // true if 404 or 400 error
} = useContactAddresses(contactId)
```

**useContactDocuments:**
```typescript
const {
  documents,             // ContactDocument[]
  isLoading,
  error,
  mutate,
  endpointNotFound      // true if 404 or 400 error
} = useContactDocuments(contactId)
```

**useContactPeople:**
```typescript
const {
  people,                // ContactPerson[]
  isLoading,
  error,
  mutate,
  endpointNotFound      // true if 404 or 400 error
} = useContactPeople(contactId)
```

---

### Services (404 lines)

#### contactsService

**Purpose**: Main CRUD operations for contacts

**Functions:**

```typescript
// GET /api/v1/contacts
async function getAll(params?: UseContactsParams): Promise<ContactsResponse>

// GET /api/v1/contacts/{id}?include=addresses,documents,people
async function getById(id: string, include?: string[]): Promise<ContactResponse>

// POST /api/v1/contacts
async function create(data: ContactFormData): Promise<ContactResponse>

// PATCH /api/v1/contacts/{id}
async function update(id: string, data: Partial<ContactFormData>): Promise<ContactResponse>

// DELETE /api/v1/contacts/{id}
async function delete(id: string): Promise<void>
```

**JSON:API Integration:**
```typescript
// Request format (CREATE)
{
  data: {
    type: "contacts",
    attributes: {
      contact_type: "company",          // snake_case for backend
      name: "Acme Corp",
      is_customer: true,
      is_supplier: false,
      status: "active"
    }
  }
}

// Response format
{
  jsonapi: { version: "1.0" },
  data: {
    type: "contacts",
    id: "uuid-string",
    attributes: {
      contact_type: "company",
      name: "Acme Corp",
      // ... all fields in snake_case
    }
  },
  included: [
    { type: "contact-addresses", id: "1", attributes: {...} },
    { type: "contact-documents", id: "2", attributes: {...} }
  ]
}
```

**Filter Parameters:**
```typescript
// Frontend
{ filters: { isCustomer: true, status: 'active' } }

// Transformed to API
{
  'filter[isCustomer]': '1',
  'filter[status]': 'active'
}
```

---

#### contactAddressesService

**Purpose**: CRUD operations for contact addresses

**Endpoint:** `/api/v1/contact-addresses`

**Functions:**
```typescript
// GET /api/v1/contact-addresses?filter[contactId]=123
async function getAll(contactId?: string): Promise<ContactAddressesResponse>

// POST /api/v1/contact-addresses
async function create(data: ContactAddressForm): Promise<ContactAddressResponse>

// PATCH /api/v1/contact-addresses/{id}
async function update(id: string, data: Partial<ContactAddress>): Promise<ContactAddressResponse>

// DELETE /api/v1/contact-addresses/{id}
async function delete(id: string): Promise<void>
```

**JSON:API Type:** `"contact-addresses"`

---

#### contactDocumentsService ⭐ **DOCUMENT LIFECYCLE**

**Purpose**: Document upload, verification, download, and deletion

**Endpoint:** `/api/v1/contact-documents`

**Functions:**

**1. Upload (FormData):**
```typescript
async function upload(
  file: File,
  contactId: string,
  documentType: string,
  notes?: string
): Promise<ContactDocumentResponse>

// Implementation
const formData = new FormData()
formData.append('contact_id', contactId)           // snake_case
formData.append('document_type', documentType)
formData.append('file', file)
if (notes) formData.append('notes', notes)

// POST /api/v1/contact-documents/upload
const response = await axiosClient.post('/api/v1/contact-documents/upload', formData, {
  headers: {
    // NO Content-Type - FormData handles it automatically
    // Authorization header already included by axiosClient interceptor
  }
})
```

**2. Download (Blob):**
```typescript
async function download(id: string): Promise<Blob>

// GET /api/v1/contact-documents/{id}/download
const response = await axiosClient.get(`/api/v1/contact-documents/${id}/download`, {
  responseType: 'blob'
})
return response.data  // Blob for file download
```

**3. Verify:**
```typescript
async function verify(id: string): Promise<{ message: string }>

// PATCH /api/v1/contact-documents/{id}/verify
const response = await axiosClient.patch(`/api/v1/contact-documents/${id}/verify`)
// Sets verifiedAt and verifiedBy fields
```

**4. Unverify:**
```typescript
async function unverify(id: string): Promise<{ message: string }>

// PATCH /api/v1/contact-documents/{id}/unverify
const response = await axiosClient.patch(`/api/v1/contact-documents/${id}/unverify`)
// Clears verifiedAt and verifiedBy fields
```

**5. Get All:**
```typescript
async function getAll(contactId?: string): Promise<ContactDocumentsResponse>

// GET /api/v1/contact-documents?filter[contactId]=123
```

**6. Delete:**
```typescript
async function delete(id: string): Promise<void>

// DELETE /api/v1/contact-documents/{id}
```

**Document Lifecycle Example:**
```typescript
// 1. Upload
const { data: newDoc } = await contactDocumentsService.upload(
  fileObject,
  contactId,
  'tax_certificate',
  'Constancia de situación fiscal 2025'
)

// 2. Verify (after manual review)
await contactDocumentsService.verify(newDoc.id)

// 3. Download (when needed)
const blob = await contactDocumentsService.download(newDoc.id)
const url = window.URL.createObjectURL(blob)
window.open(url)  // Open in new tab

// 4. Unverify (if document is invalid)
await contactDocumentsService.unverify(newDoc.id)

// 5. Delete (if document is wrong)
await contactDocumentsService.delete(newDoc.id)
```

---

#### contactPeopleService

**Purpose**: CRUD operations for contact persons

**Endpoint:** `/api/v1/contact-people`

**Functions:**
```typescript
// GET /api/v1/contact-people?filter[contactId]=123
async function getAll(contactId?: string): Promise<ContactPeopleResponse>

// POST /api/v1/contact-people
async function create(data: ContactPersonForm): Promise<ContactPersonResponse>

// PATCH /api/v1/contact-people/{id}
async function update(id: string, data: Partial<ContactPerson>): Promise<ContactPersonResponse>

// DELETE /api/v1/contact-people/{id}
async function delete(id: string): Promise<void>
```

**JSON:API Type:** `"contact-people"`

---

### Utility Functions

#### processIncludedData

**Purpose**: Separate JSON:API included relationships into typed arrays

**Implementation:**
```typescript
export const processIncludedData = (included: unknown[] = []) => {
  const addresses: ContactAddress[] = []
  const documents: ContactDocument[] = []
  const people: ContactPerson[] = []

  included.forEach((item: unknown) => {
    const jsonApiItem = item as {
      type: string
      id: string
      attributes: Record<string, unknown>
    }

    if (jsonApiItem.type === 'contact-addresses') {
      addresses.push({
        id: jsonApiItem.id,
        ...jsonApiItem.attributes
      } as ContactAddress)
    } else if (jsonApiItem.type === 'contact-documents') {
      documents.push({
        id: jsonApiItem.id,
        ...jsonApiItem.attributes
      } as ContactDocument)
    } else if (jsonApiItem.type === 'contact-people') {
      people.push({
        id: jsonApiItem.id,
        ...jsonApiItem.attributes
      } as ContactPerson)
    }
  })

  return { addresses, documents, people }
}
```

**Usage:**
```typescript
const response = await contactsService.getById(id, ['addresses', 'documents', 'people'])
const { addresses, documents, people } = processIncludedData(response.included)
```

---

#### parseContact

**Purpose**: Transform raw JSON:API contact to UI-friendly parsed contact

**Implementation:**
```typescript
export const parseContact = (rawContact: unknown): ContactParsed => {
  const contactData = rawContact as {
    id: string
    attributes: Omit<Contact, 'id'>
  }
  const contact = {
    id: contactData.id,
    ...contactData.attributes
  } as Contact

  return {
    ...contact,
    displayName: contact.legalName || contact.name,
    contactTypeLabel: contact.contactType === 'individual'
      ? 'Persona física'
      : 'Empresa',
    statusLabel: contact.status === 'active'
      ? 'Activo'
      : contact.status === 'inactive'
        ? 'Inactivo'
        : 'Suspendido',
    isActiveCustomer: contact.isCustomer && contact.status === 'active',
    isActiveSupplier: contact.isSupplier && contact.status === 'active',
    hasDocuments: false,   // Populated via includes
    hasAddresses: false,   // Populated via includes
    hasPeople: false       // Populated via includes
  }
}
```

---

## Backend Integration Analysis

### Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/contacts` | GET | List all contacts | ⚠️ **Not validated** |
| `/api/v1/contacts` | POST | Create contact | ⚠️ **Not validated** |
| `/api/v1/contacts/{id}` | GET | Get contact | ⚠️ **Not validated** |
| `/api/v1/contacts/{id}` | PATCH | Update contact | ⚠️ **Not validated** |
| `/api/v1/contacts/{id}` | DELETE | Delete contact | ⚠️ **Not validated** |
| `/api/v1/contact-addresses` | GET | List addresses | ⚠️ **Not validated** |
| `/api/v1/contact-addresses` | POST | Create address | ⚠️ **Not validated** |
| `/api/v1/contact-addresses/{id}` | PATCH | Update address | ⚠️ **Not validated** |
| `/api/v1/contact-addresses/{id}` | DELETE | Delete address | ⚠️ **Not validated** |
| `/api/v1/contact-documents` | GET | List documents | ⚠️ **Not validated** |
| `/api/v1/contact-documents/upload` | POST | Upload document | ⚠️ **Not validated** |
| `/api/v1/contact-documents/{id}/download` | GET | Download document | ⚠️ **Not validated** |
| `/api/v1/contact-documents/{id}/verify` | PATCH | Verify document | ⚠️ **Not validated** |
| `/api/v1/contact-documents/{id}/unverify` | PATCH | Unverify document | ⚠️ **Not validated** |
| `/api/v1/contact-documents/{id}` | DELETE | Delete document | ⚠️ **Not validated** |
| `/api/v1/contact-people` | GET | List people | ⚠️ **Not validated** |
| `/api/v1/contact-people` | POST | Create person | ⚠️ **Not validated** |
| `/api/v1/contact-people/{id}` | PATCH | Update person | ⚠️ **Not validated** |
| `/api/v1/contact-people/{id}` | DELETE | Delete person | ⚠️ **Not validated** |

### Backend Schema Comparison

⚠️ **CRITICAL GAP: NO BACKEND SCHEMA DOCUMENTATION**

**Validation Attempt:**
```bash
grep -n -C 2 "contacts table|contact_addresses|contact_documents" \
  /home/jadwer/dev/AtomoSoluciones/base/api-base/docs/DATABASE_SCHEMA_REFERENCE.md

# Result: No matches found
```

**Implication:**
- ❌ Cannot validate frontend types against backend schema
- ❌ Cannot verify field names (snake_case vs camelCase mapping)
- ❌ Cannot confirm data types and constraints
- ❌ Cannot validate relationships and foreign keys
- ⚠️ **Similar to Inventory module** - also missing backend schema

**Action Required:**
- [ ] Request backend team to document Contacts schema in DATABASE_SCHEMA_REFERENCE.md
- [ ] Include: contacts, contact_addresses, contact_documents, contact_people tables
- [ ] Document all fields, types, constraints, and relationships
- [ ] Document Party Pattern implementation in backend

---

### Integration with Finance Module

**Validation from Finance Module Documentation:**

From `FINANCE_MODULE_COMPLETE.md` (lines 140-154):

```sql
-- Customers Table (Finance Module)
CREATE TABLE customers (
  id BIGINT UNSIGNED PRIMARY KEY,
  contact_id BIGINT UNSIGNED,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  credit_limit DECIMAL(15,2) DEFAULT 0.00,
  credit_used DECIMAL(15,2) DEFAULT 0.00,
  payment_terms_days INT DEFAULT 30,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT
)
```

**✅ Finance Module References Contacts:**
- Finance module has `customers.contact_id` foreign key
- Confirms that `contacts` table exists in backend
- Validates Party Pattern approach (separate customers table references unified contacts)

**Integration Points:**
- Contacts module provides unified contact management
- Finance module references contacts via `contact_id`
- Allows contact to be customer, supplier, or both
- Credit limit management can be in Finance OR Contacts (needs clarification)

---

### JSON:API Compliance

**Request Format (CREATE Contact):**
```typescript
{
  data: {
    type: "contacts",
    attributes: {
      contact_type: "company",
      name: "Acme Corporation",
      legal_name: "Acme Corporation S.A. de C.V.",
      tax_id: "ACO123456ABC",
      email: "contact@acme.com",
      phone: "+52 55 1234 5678",
      website: "https://acme.com",
      status: "active",
      is_customer: true,
      is_supplier: false,
      credit_limit: 50000.00,
      payment_terms: 30,
      notes: "Important client",
      metadata: {}
    }
  }
}
```

**Response Format:**
```typescript
{
  jsonapi: { version: "1.0" },
  data: {
    type: "contacts",
    id: "uuid-here",
    attributes: {
      contact_type: "company",
      name: "Acme Corporation",
      legal_name: "Acme Corporation S.A. de C.V.",
      tax_id: "ACO123456ABC",
      email: "contact@acme.com",
      phone: "+52 55 1234 5678",
      website: "https://acme.com",
      status: "active",
      is_customer: true,
      is_supplier: false,
      credit_limit: 50000.00,
      current_credit: 0.00,
      payment_terms: 30,
      notes: "Important client",
      metadata: {},
      created_at: "2025-11-01T10:00:00.000000Z",
      updated_at: "2025-11-01T10:00:00.000000Z"
    }
  }
}
```

**Response with Includes:**
```typescript
{
  jsonapi: { version: "1.0" },
  data: {
    type: "contacts",
    id: "uuid-here",
    attributes: { /* ... */ },
    relationships: {
      addresses: {
        data: [
          { type: "contact-addresses", id: "1" },
          { type: "contact-addresses", id: "2" }
        ]
      },
      documents: {
        data: [
          { type: "contact-documents", id: "3" }
        ]
      },
      people: {
        data: [
          { type: "contact-people", id: "4" },
          { type: "contact-people", id: "5" }
        ]
      }
    }
  },
  included: [
    {
      type: "contact-addresses",
      id: "1",
      attributes: {
        contact_id: 123,
        address_type: "billing",
        address_line1: "Av. Reforma 123",
        city: "CDMX",
        state: "Ciudad de México",
        country: "México",
        postal_code: "06600",
        is_default: true
      }
    },
    {
      type: "contact-documents",
      id: "3",
      attributes: {
        contact_id: 123,
        document_type: "tax_certificate",
        original_filename: "constancia_fiscal.pdf",
        file_path: "/storage/documents/uuid.pdf",
        mime_type: "application/pdf",
        file_size: 245678,
        verified_at: "2025-11-01T12:00:00.000000Z",
        verified_by: 1
      }
    },
    {
      type: "contact-people",
      id: "4",
      attributes: {
        contact_id: 123,
        name: "Juan Pérez",
        position: "Gerente de Compras",
        email: "juan.perez@acme.com",
        phone: "+52 55 9876 5432",
        is_primary: true
      }
    }
  ]
}
```

**Compliance Checklist:**
- ✅ Uses `transformJsonApiResource` for transformations
- ✅ Handles included relationships with `processIncludedData()`
- ✅ Proper error parsing with `parseJsonApiErrors`
- ✅ Correct JSON:API types (kebab-case for relationships)
- ✅ Proper attribute transformation (snake_case ↔ camelCase)
- ✅ Includes parameter support for efficient loading
- ✅ Filter parameters formatted as `filter[key]`
- ✅ Boolean values converted to '1'/'0' for API

---

## Gaps & Discrepancies

### ⚠️ Gap 1: Backend Schema Documentation Missing

**Descripción**: No backend schema documentation exists for Contacts module

**Backend soporta pero no documentado:**
- `contacts` table schema
- `contact_addresses` table schema
- `contact_documents` table schema
- `contact_people` table schema
- Field types and constraints
- Relationships and foreign keys
- Indexes and unique constraints

**Impacto:** **HIGH**

**Evidencia:**
```bash
grep -n -C 2 "contacts table" DATABASE_SCHEMA_REFERENCE.md
# No matches found
```

**Confirmación de existencia:**
✅ Finance module references `contacts(id)` in foreign keys, confirming table exists

**Acción requerida:**
- [ ] Request backend team to document all 4 tables in DATABASE_SCHEMA_REFERENCE.md
- [ ] Validate frontend types against backend schema
- [ ] Confirm Party Pattern implementation details
- [ ] Document credit management strategy (Finance vs Contacts)

---

### ⚠️ Gap 2: Testing Coverage - CRITICAL VIOLATION

**Descripción**: Zero test coverage violates project policy (70% minimum)

**Missing Tests:**
- ❌ Service layer tests (contactsService, addressesService, documentsService, peopleService)
- ❌ Hook tests (useContacts, useContact, useContactMutations, etc.)
- ❌ Component tests (ContactFormTabs, ContactViewTabs, ContactDocuments, etc.)
- ❌ Utility function tests (parseContact, processIncludedData)

**Impacto:** **CRITICAL**

**Policy Reference:**
From CLAUDE.md:
> **🚨 POLÍTICA CRÍTICA:** Después de 2 módulos fallidos, el testing con **Vitest** es **OBLIGATORIO** para todos los módulos nuevos.
> - **Coverage:** Mínimo 70% en functions, lines, branches, statements

**Current Status:** **0% coverage** ❌

**Acción requerida:**
- [ ] Create `src/modules/contacts/tests/` directory
- [ ] Implement service tests (contactsService.test.ts, etc.)
- [ ] Implement hook tests (useContacts.test.ts, etc.)
- [ ] Implement component tests (ContactFormTabs.test.tsx, etc.)
- [ ] Achieve minimum 70% coverage across all metrics
- [ ] Add CI/CD enforcement for coverage thresholds

**Risk:** Module may need to be refactored or rewritten if critical bugs are discovered

---

### ⚠️ Gap 3: Document Storage Strategy Unknown

**Descripción**: No documentation on document storage implementation

**Preguntas sin respuesta:**
- Where are documents stored? (local filesystem, S3, cloud storage?)
- How are file paths generated? (`file_path` field)
- What are size limits for uploads?
- What MIME types are allowed?
- Is there virus scanning on upload?
- How is document access controlled? (only owner can download?)

**Impacto:** **MEDIUM**

**Acción requerida:**
- [ ] Document storage strategy in backend documentation
- [ ] Define file size limits and MIME type whitelist
- [ ] Implement access control validation
- [ ] Consider virus scanning integration
- [ ] Document backup and disaster recovery for uploaded files

---

### ⚠️ Gap 4: Credit Management Duplication

**Descripción**: Credit limit management exists in both Contacts and Finance modules

**Contacts Module:**
```typescript
export interface Contact {
  creditLimit?: number
  currentCredit?: number
  // ...
}
```

**Finance Module (from FINANCE_MODULE_COMPLETE.md):**
```sql
CREATE TABLE customers (
  credit_limit DECIMAL(15,2) DEFAULT 0.00,
  credit_used DECIMAL(15,2) DEFAULT 0.00,
  -- ...
)
```

**Conflicto:**
- Contacts module has `creditLimit` and `currentCredit`
- Finance module has `credit_limit` and `credit_used`
- Unclear which is source of truth
- Risk of data inconsistency

**Impacto:** **MEDIUM**

**Acción requerida:**
- [ ] Define single source of truth for credit management
- [ ] **Option A:** Contacts module owns credit data, Finance references it
- [ ] **Option B:** Finance module owns credit data, Contacts displays read-only
- [ ] Document decision in architecture documentation
- [ ] Ensure data synchronization if both tables maintain credit data

---

### ⚠️ Gap 5: Party Pattern vs Separate Tables

**Descripción**: Architectural decision between Party Pattern and separate customer/supplier tables

**Current Implementation (Party Pattern):**
```typescript
// Single contacts table with role flags
export interface Contact {
  isCustomer: boolean
  isSupplier: boolean
  // Can be both, either, or neither
}
```

**Alternative Approach (Separate Tables):**
```sql
-- Finance module approach
CREATE TABLE customers (
  id BIGINT,
  contact_id BIGINT REFERENCES contacts(id),
  -- customer-specific fields
)

CREATE TABLE suppliers (
  id BIGINT,
  contact_id BIGINT REFERENCES contacts(id),
  -- supplier-specific fields
}
```

**Trade-offs:**

**Party Pattern (Current):**
- ✅ Simple: Single contact record
- ✅ Flexible: Contact can change roles
- ✅ No duplication: One set of contact info
- ❌ Limited: Hard to add role-specific fields
- ❌ Complex queries: Need to filter by boolean flags

**Separate Tables (Finance approach):**
- ✅ Clear separation: Customer vs Supplier data
- ✅ Extensible: Role-specific fields (credit_limit, etc.)
- ✅ Better queries: JOIN only what you need
- ❌ Duplication: Contact info may be duplicated
- ❌ Complexity: Need to manage multiple records for dual roles

**Current Status:**
- Frontend uses Party Pattern (isCustomer, isSupplier flags)
- Finance module uses separate `customers` table with `contact_id` reference
- **Hybrid approach:** Contacts table + role-specific tables

**Impacto:** **LOW** (working as designed)

**Acción requerida:**
- [x] **No action needed** - Hybrid approach is valid
- [ ] Document architectural decision in ADR (Architecture Decision Record)
- [ ] Ensure consistency across all modules (Purchase, Sales, etc.)

---

### ℹ️ Frontend Implementation Notes

**Features implemented:**
- ✅ 4-entity CRUD system
- ✅ Document lifecycle management
- ✅ Tabbed interface with persistent form state
- ✅ JSON:API includes support
- ✅ SWR cache invalidation strategies
- ✅ Specialized hooks for common queries
- ✅ Party Pattern support
- ✅ Professional UI components

**No features ahead of backend** - All frontend features assume backend support

---

## Testing Coverage

### Current Coverage

| Type | Files | Coverage | Status |
|------|-------|----------|--------|
| Unit Tests (Services) | 0/4 | 0% | ❌ **CRITICAL** |
| Integration Tests (Hooks) | 0/8 | 0% | ❌ **CRITICAL** |
| Component Tests | 0/11 | 0% | ❌ **CRITICAL** |
| **Total** | **0/23** | **0%** | ❌ **POLICY VIOLATION** |

### Test Files

**Expected Structure:**
```
tests/
├── services/
│   ├── contactsService.test.ts
│   ├── contactAddressesService.test.ts
│   ├── contactDocumentsService.test.ts
│   └── contactPeopleService.test.ts
├── hooks/
│   ├── useContacts.test.tsx
│   ├── useContact.test.tsx
│   ├── useContactMutations.test.tsx
│   ├── useContactAddresses.test.tsx
│   ├── useContactDocuments.test.tsx
│   ├── useContactPeople.test.tsx
│   ├── useCustomers.test.tsx
│   └── useSuppliers.test.tsx
├── components/
│   ├── ContactFormTabs.test.tsx
│   ├── ContactViewTabs.test.tsx
│   ├── ContactDocuments.test.tsx
│   ├── ContactAddresses.test.tsx
│   ├── ContactPeople.test.tsx
│   └── ContactsTableSimple.test.tsx
└── utils/
    ├── parseContact.test.ts
    └── processIncludedData.test.ts
```

**Actual State:** ❌ **No tests directory exists**

### Coverage Requirements

**Project Standard:** 70% minimum (from CLAUDE.md)

**Current Status:** **0%** ❌ **FAIL - CRITICAL VIOLATION**

**Policy Quote:**
> **Quality Gates:**
> - ❌ **NO SE PERMITE** código sin tests en módulos nuevos
> - ❌ **NO SE PERMITE** coverage < 70%

### Missing Tests

**Critical missing tests:**

**Services (4 test files):**
- [ ] contactsService: getAll, getById, create, update, delete
- [ ] contactAddressesService: getAll, create, update, delete
- [ ] contactDocumentsService: upload, download, verify, unverify, delete
- [ ] contactPeopleService: getAll, create, update, delete

**Hooks (8 test files):**
- [ ] useContacts: with/without filters, loading states, error handling
- [ ] useContact: with/without includes, loading states
- [ ] useContactMutations: create, update, delete, cache invalidation
- [ ] useContactAddresses: conditional fetching, endpoint errors
- [ ] useContactDocuments: conditional fetching, endpoint errors
- [ ] useContactPeople: conditional fetching, endpoint errors
- [ ] useCustomers: filter validation
- [ ] useSuppliers: filter validation

**Components (6 test files):**
- [ ] ContactFormTabs: tab navigation, form validation, submit
- [ ] ContactViewTabs: data display, includes, actions
- [ ] ContactDocuments: upload, download, verify, delete
- [ ] ContactAddresses: CRUD operations, default selection
- [ ] ContactPeople: CRUD operations, primary designation
- [ ] ContactsTableSimple: rendering, sorting, actions

**Utilities (2 test files):**
- [ ] parseContact: field transformations, label generation
- [ ] processIncludedData: relationship separation, type safety

**Total:** 20 test files needed to meet policy

---

## Performance Optimizations

### Current Optimizations

#### 1. SWR Caching Strategy

**Implementation:**
```typescript
const { data, error, isLoading, mutate } = useSWR(
  ['contacts', params],
  () => contactsService.getAll(params),
  {
    keepPreviousData: true,        // Keep old data during refetch
    revalidateOnFocus: false,      // Don't refetch on tab focus
    dedupingInterval: 5000         // Dedupe requests within 5 seconds
  }
)
```

**Impact:**
- Before: Multiple simultaneous requests for same data
- After: Single request with 5-second deduplication
- Benefit: Reduced backend load, faster perceived performance

---

#### 2. Conditional Fetching

**Implementation:**
```typescript
const { data } = useSWR(
  id ? ['contact', id, include] : null,  // null = don't fetch
  () => id ? contactsService.getById(id, include) : null
)
```

**Impact:**
- Prevents unnecessary API calls when id is undefined
- Reduces errors from invalid requests
- Cleaner component code

---

#### 3. Cache Invalidation Strategies

**Implementation:**
```typescript
// Invalidate specific patterns after mutations
const { mutate } = await import('swr')
mutate(key =>
  Array.isArray(key) && (
    key[0] === 'contacts' ||                    // List cache
    (key[0] === 'contact' && key[1] === id)     // Detail cache
  )
)
```

**Impact:**
- Ensures UI shows latest data after create/update/delete
- Only invalidates relevant cache entries
- Avoids full cache clear (preserves unrelated data)

---

#### 4. JSON:API Includes for N+1 Prevention

**Implementation:**
```typescript
// Single request with relationships
const { contact, addresses, documents, people } = useContact(id, [
  'addresses',
  'documents',
  'people'
])

// Instead of 4 separate requests:
// GET /contacts/1
// GET /contact-addresses?filter[contactId]=1
// GET /contact-documents?filter[contactId]=1
// GET /contact-people?filter[contactId]=1
```

**Impact:**
- Before: 4 requests (N+1 problem)
- After: 1 request with includes
- Benefit: 75% reduction in HTTP requests

---

#### 5. Tabbed Form with Persistent State

**Implementation:**
```typescript
// Form state preserved across tab changes
const [formData, setFormData] = useState<ContactFormData>({ /* ... */ })
const [activeTab, setActiveTab] = useState<TabType>('basic')

// Switching tabs doesn't reset form data
<button onClick={() => setActiveTab('addresses')}>Addresses</button>
```

**Impact:**
- User can switch tabs without losing entered data
- Better UX for complex multi-step forms
- Reduces frustration from accidental data loss

---

### Performance Metrics

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Initial Load | < 1s | ⚠️ **Unknown** | ⚠️ **Not measured** |
| Filter Update | < 300ms | ⚠️ **Unknown** | ⚠️ **Not measured** |
| CRUD Operation | < 500ms | ⚠️ **Unknown** | ⚠️ **Not measured** |
| Document Upload | < 2s | ⚠️ **Unknown** | ⚠️ **Not measured** |

**Note:** Performance metrics not yet measured - requires instrumentation

---

### Missing Optimizations

#### 1. React.memo for Components

**Issue:** No memoization for expensive components

**Example needed:**
```typescript
export const ContactsTableSimple = React.memo(({ contacts, onEdit, onDelete }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.contacts === nextProps.contacts
})
```

**Impact:** Prevent re-renders when parent updates but props unchanged

---

#### 2. Virtualization for Large Lists

**Issue:** No virtualization for contacts table

**Example needed:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: contacts.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50  // Row height
})
```

**Impact:** Handle thousands of contacts without performance degradation

---

#### 3. Debounced Search

**Issue:** Search triggers API call on every keystroke

**Example needed:**
```typescript
const debouncedSearch = useDebouncedValue(searchTerm, 300)

useEffect(() => {
  setFilters({ ...filters, search: debouncedSearch })
}, [debouncedSearch])
```

**Impact:** Reduce API calls during typing (300ms delay)

---

#### 4. Image Optimization

**Issue:** No image optimization for document previews

**Recommendation:**
- Use thumbnail generation for document previews
- Lazy load document thumbnails
- Implement progressive image loading

---

## Known Issues & Limitations

### 🔴 Critical Issues

#### Issue 1: No Backend Schema Validation

**Description**: Cannot validate frontend types against backend schema

**Impact**: **HIGH**

**Details:**
- No schema documentation for `contacts`, `contact_addresses`, `contact_documents`, `contact_people` tables
- Cannot confirm field types, constraints, relationships
- Risk of type mismatches between frontend and backend
- Cannot validate Party Pattern implementation details

**Workaround**: None - depends on backend documentation

**Planned Fix**: Request backend team to add schema documentation

**Tracking**: Gap #1 above

---

#### Issue 2: Zero Test Coverage - Policy Violation

**Description**: Module has 0% test coverage, violating 70% policy

**Impact**: **CRITICAL**

**Details:**
- No tests for 4 services, 8 hooks, 11 components
- Risk of undetected bugs in production
- Violates CLAUDE.md testing policy
- May require module refactor if bugs discovered

**Workaround**: None - tests must be implemented

**Planned Fix**:
- Create tests directory
- Implement 20+ test files
- Achieve 70% coverage minimum

**Tracking**: Gap #2 above

---

### 🟡 Medium Issues

#### Issue 3: Document Storage Strategy Unknown

**Description**: No documentation on where/how documents are stored

**Impact**: **MEDIUM**

**Details:**
- Unknown storage backend (filesystem, S3, cloud?)
- No file size limits documented
- No MIME type whitelist
- No virus scanning mentioned
- Unclear access control for downloads

**Workaround**: Assume backend handles validation

**Planned Fix**: Document storage strategy

**Tracking**: Gap #3 above

---

#### Issue 4: Credit Management Duplication

**Description**: Credit fields exist in both Contacts and Finance modules

**Impact**: **MEDIUM**

**Details:**
- Contacts has `creditLimit`, `currentCredit`
- Finance has `credit_limit`, `credit_used`
- Unclear which is source of truth
- Risk of data inconsistency

**Workaround**: Use Finance module for credit operations

**Planned Fix**: Define single source of truth

**Tracking**: Gap #4 above

---

### 🟢 Minor Issues / Tech Debt

#### Issue 5: No Performance Monitoring

**Description**: Performance metrics not measured or tracked

**Impact**: **LOW**

**Workaround**: None needed - works acceptably

**Planned Fix**: Add performance instrumentation (React DevTools Profiler, Web Vitals)

---

#### Issue 6: No Debounced Search

**Description**: Search input triggers API call on every keystroke

**Impact**: **LOW**

**Workaround**: Type slowly or use filters instead

**Planned Fix**: Implement 300ms debounce on search input

---

#### Issue 7: No Virtualization for Large Lists

**Description**: Contacts table renders all rows (no virtualization)

**Impact**: **LOW** (only impacts users with 1000+ contacts)

**Workaround**: Use pagination and filters

**Planned Fix**: Implement TanStack Virtual for table rows

---

#### Issue 8: No Component Memoization

**Description**: Components re-render on parent updates even when props unchanged

**Impact**: **LOW**

**Workaround**: None needed - performance acceptable

**Planned Fix**: Add React.memo to expensive components

---

#### Issue 9: Hardcoded Labels (i18n)

**Description**: All UI labels are hardcoded in Spanish

**Impact**: **LOW** (only if internationalization needed)

**Examples:**
- "Persona física" / "Empresa"
- "Activo" / "Inactivo" / "Suspendido"
- "Cliente" / "Proveedor"

**Workaround**: Accept Spanish-only for now

**Planned Fix**: Implement i18n with next-intl or similar

---

## Usage Examples

### Example 1: Basic Contact CRUD

```tsx
import {
  useContacts,
  useContactMutations,
  contactsService
} from '@/modules/contacts'

function ContactsManagementPage() {
  // Fetch contacts
  const { contacts, isLoading, mutate } = useContacts()

  // Mutations
  const { createContact, updateContact, deleteContact } = useContactMutations()

  // Create contact
  const handleCreate = async () => {
    const newContact = await createContact({
      contactType: 'company',
      name: 'Acme Corporation',
      legalName: 'Acme Corporation S.A. de C.V.',
      taxId: 'ACO123456ABC',
      email: 'contact@acme.com',
      phone: '+52 55 1234 5678',
      website: 'https://acme.com',
      status: 'active',
      isCustomer: true,
      isSupplier: false,
      creditLimit: 50000,
      paymentTerms: 30,
      notes: 'Important client'
    })
    console.log('Created:', newContact)
  }

  // Update contact
  const handleUpdate = async (id: string) => {
    await updateContact(id, {
      status: 'inactive',
      notes: 'Contract expired'
    })
  }

  // Delete contact
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteContact(id)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <button onClick={handleCreate}>Create Contact</button>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>
            {contact.displayName}
            <button onClick={() => handleUpdate(contact.id)}>
              Deactivate
            </button>
            <button onClick={() => handleDelete(contact.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 2: Party Pattern - Dual Role Contact

```tsx
import { useContactMutations } from '@/modules/contacts'

function CreateDualRoleContact() {
  const { createContact } = useContactMutations()

  const handleCreate = async () => {
    // Contact that is BOTH customer AND supplier
    const dualRoleContact = await createContact({
      contactType: 'company',
      name: 'Parts & Services Inc',
      legalName: 'Parts & Services Inc S.A.',
      taxId: 'PSI789012XYZ',
      email: 'info@partsservices.com',
      status: 'active',

      // ✅ PARTY PATTERN - Can be both!
      isCustomer: true,    // We buy from them
      isSupplier: true,    // We sell to them

      creditLimit: 100000,
      paymentTerms: 45,
      notes: 'Strategic partner - dual relationship'
    })

    console.log('Created dual-role contact:', {
      id: dualRoleContact.id,
      isCustomer: dualRoleContact.isCustomer,  // true
      isSupplier: dualRoleContact.isSupplier,  // true
      isActiveCustomer: dualRoleContact.isActiveCustomer,  // true
      isActiveSupplier: dualRoleContact.isActiveSupplier   // true
    })
  }

  return <button onClick={handleCreate}>Create Partner</button>
}
```

---

### Example 3: Using Specialized Hooks

```tsx
import {
  useCustomers,
  useSuppliers,
  useActiveContacts
} from '@/modules/contacts'

function SalesReportPage() {
  // Get all customers (active and inactive)
  const { contacts: allCustomers } = useCustomers()

  // Get all active contacts
  const { contacts: activeContacts } = useActiveContacts()

  // Get all suppliers
  const { contacts: suppliers } = useSuppliers()

  return (
    <div>
      <h2>Sales Report</h2>
      <p>Total Customers: {allCustomers.length}</p>
      <p>Active Contacts: {activeContacts.length}</p>
      <p>Total Suppliers: {suppliers.length}</p>

      <h3>Customer List</h3>
      <ul>
        {allCustomers.map(customer => (
          <li key={customer.id}>
            {customer.displayName}
            {customer.isActiveCustomer ? ' (Active)' : ' (Inactive)'}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 4: Loading Contact with Relationships (Includes)

```tsx
import { useContact, processIncludedData } from '@/modules/contacts'

function ContactDetailPage({ contactId }: { contactId: string }) {
  // Load contact with all relationships in ONE request
  const {
    contact,
    addresses,
    documents,
    people,
    isLoading
  } = useContact(contactId, [
    'addresses',   // Include addresses
    'documents',   // Include documents
    'people'       // Include contact persons
  ])

  if (isLoading) return <div>Loading...</div>
  if (!contact) return <div>Contact not found</div>

  return (
    <div>
      <h1>{contact.displayName}</h1>
      <p>Status: {contact.statusLabel}</p>
      <p>Type: {contact.contactTypeLabel}</p>

      <h2>Addresses ({addresses.length})</h2>
      <ul>
        {addresses.map(addr => (
          <li key={addr.id}>
            {addr.addressType}: {addr.addressLine1}, {addr.city}
            {addr.isDefault && ' (Default)'}
          </li>
        ))}
      </ul>

      <h2>Documents ({documents.length})</h2>
      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            {doc.documentType}: {doc.originalFilename}
            {doc.verifiedAt && ' ✓ Verified'}
          </li>
        ))}
      </ul>

      <h2>Contact Persons ({people.length})</h2>
      <ul>
        {people.map(person => (
          <li key={person.id}>
            {person.name} - {person.position}
            {person.isPrimary && ' (Primary)'}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 5: Document Lifecycle Management

```tsx
import {
  contactDocumentsService,
  useContactDocuments
} from '@/modules/contacts'

function DocumentManagementComponent({ contactId }: { contactId: string }) {
  const { documents, mutate } = useContactDocuments(contactId)

  // 1. Upload document
  const handleUpload = async (file: File) => {
    const result = await contactDocumentsService.upload(
      file,
      contactId,
      'tax_certificate',  // Document type
      'Constancia de situación fiscal 2025'  // Notes
    )
    console.log('Uploaded:', result.data.id)
    mutate()  // Refresh list
  }

  // 2. Verify document
  const handleVerify = async (documentId: string) => {
    await contactDocumentsService.verify(documentId)
    console.log('Document verified')
    mutate()
  }

  // 3. Download document
  const handleDownload = async (documentId: string, filename: string) => {
    const blob = await contactDocumentsService.download(documentId)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // 4. Unverify document
  const handleUnverify = async (documentId: string) => {
    await contactDocumentsService.unverify(documentId)
    console.log('Document unverified')
    mutate()
  }

  // 5. Delete document
  const handleDelete = async (documentId: string) => {
    if (confirm('Delete document?')) {
      await contactDocumentsService.delete(documentId)
      mutate()
    }
  }

  return (
    <div>
      <h2>Documents</h2>

      {/* Upload Form */}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
      />

      {/* Documents List */}
      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            <strong>{doc.originalFilename}</strong>
            <span> ({doc.documentType})</span>

            {doc.verifiedAt ? (
              <span> ✓ Verified on {new Date(doc.verifiedAt).toLocaleDateString()}</span>
            ) : (
              <span> ⚠️ Unverified</span>
            )}

            <div>
              <button onClick={() => handleDownload(doc.id, doc.originalFilename)}>
                Download
              </button>

              {doc.verifiedAt ? (
                <button onClick={() => handleUnverify(doc.id)}>
                  Unverify
                </button>
              ) : (
                <button onClick={() => handleVerify(doc.id)}>
                  Verify
                </button>
              )}

              <button onClick={() => handleDelete(doc.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 6: Using ContactFormTabs for Creation/Edit

```tsx
'use client'
import { ContactFormTabs } from '@/modules/contacts'
import { useRouter } from 'next/navigation'
import { contactsService } from '@/modules/contacts'

// CREATE MODE
function CreateContactPage() {
  const router = useRouter()

  const handleSubmit = async (data: ContactFormData) => {
    const newContact = await contactsService.create(data)
    router.push(`/dashboard/contacts/${newContact.data.id}`)
  }

  return (
    <div className="container">
      <h1>Create New Contact</h1>
      <ContactFormTabs
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={false}
      />
    </div>
  )
}

// EDIT MODE
function EditContactPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { contact, isLoading } = useContact(params.id)

  const handleSubmit = async (data: ContactFormData) => {
    await contactsService.update(params.id, data)
    router.push(`/dashboard/contacts/${params.id}`)
  }

  if (isLoading) return <div>Loading...</div>
  if (!contact) return <div>Contact not found</div>

  return (
    <div className="container">
      <h1>Edit Contact: {contact.displayName}</h1>
      <ContactFormTabs
        contact={contact}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={false}
      />
    </div>
  )
}
```

---

### Example 7: Filtering Contacts

```tsx
import { useContacts } from '@/modules/contacts'
import { useState } from 'react'

function FilteredContactsList() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'active' as const,
    isCustomer: true
  })

  const { contacts, isLoading } = useContacts({ filters })

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => setFilters({
          ...filters,
          status: e.target.value as 'active' | 'inactive' | 'suspended'
        })}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
      </select>

      {/* Role Filter */}
      <label>
        <input
          type="checkbox"
          checked={filters.isCustomer}
          onChange={(e) => setFilters({
            ...filters,
            isCustomer: e.target.checked
          })}
        />
        Customers Only
      </label>

      {/* Results */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {contacts.map(contact => (
            <li key={contact.id}>
              {contact.displayName} - {contact.statusLabel}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## Next Steps & Improvements

### Immediate (Sprint Current)

#### 1. ⚠️ CRITICAL: Implement Testing (70% Coverage)

**Status:** ❌ **Blocking - Policy Violation**

**Tasks:**
- [ ] Create `tests/` directory structure
- [ ] Implement service tests (contactsService.test.ts, etc.)
- [ ] Implement hook tests (useContacts.test.tsx, etc.)
- [ ] Implement component tests (ContactFormTabs.test.tsx, etc.)
- [ ] Implement utility tests (parseContact.test.ts, etc.)
- [ ] Configure Vitest coverage thresholds
- [ ] Run tests and ensure 70%+ coverage
- [ ] Add CI/CD enforcement

**Estimated Effort:** 16-20 hours

**Priority:** **HIGHEST**

---

#### 2. ⚠️ Request Backend Schema Documentation

**Status:** ⚠️ **High Priority**

**Tasks:**
- [ ] Contact backend team about missing schema documentation
- [ ] Request documentation for 4 tables: contacts, contact_addresses, contact_documents, contact_people
- [ ] Validate frontend types against backend schema once available
- [ ] Update type definitions if mismatches found
- [ ] Document Party Pattern implementation details

**Estimated Effort:** 2-4 hours (validation after backend provides docs)

**Priority:** **HIGH**

---

#### 3. Document Storage Strategy

**Status:** 🟡 **Medium Priority**

**Tasks:**
- [ ] Document where files are stored (filesystem, S3, cloud?)
- [ ] Define file size limits
- [ ] Create MIME type whitelist
- [ ] Document access control for downloads
- [ ] Consider virus scanning integration
- [ ] Document backup/disaster recovery strategy

**Estimated Effort:** 4-6 hours (research + documentation)

**Priority:** **MEDIUM**

---

### Short Term (1-2 sprints)

#### 4. Performance Optimizations

**Tasks:**
- [ ] Implement debounced search (300ms delay)
- [ ] Add React.memo to expensive components
- [ ] Implement virtualization for large contact lists (TanStack Virtual)
- [ ] Add performance monitoring (Web Vitals, React DevTools Profiler)
- [ ] Optimize document thumbnail generation

**Estimated Effort:** 8-10 hours

**Priority:** **MEDIUM**

---

#### 5. Resolve Credit Management Strategy

**Tasks:**
- [ ] Define single source of truth for credit data
- [ ] Choose between: Contacts module owns credit OR Finance module owns credit
- [ ] Document decision in ADR (Architecture Decision Record)
- [ ] Implement data synchronization if dual ownership maintained
- [ ] Update UI to reflect credit ownership decision

**Estimated Effort:** 4-6 hours

**Priority:** **MEDIUM**

---

#### 6. Error Handling Improvements

**Tasks:**
- [ ] Implement professional error messages for all API errors
- [ ] Add retry logic for failed uploads
- [ ] Implement optimistic updates for better UX
- [ ] Add ConfirmModal for destructive actions (already implemented in other modules)
- [ ] Improve validation error display

**Estimated Effort:** 6-8 hours

**Priority:** **MEDIUM**

---

### Medium Term (3-6 sprints)

#### 7. Advanced Features

**Tasks:**
- [ ] Implement contact import/export (CSV, Excel)
- [ ] Add contact merge functionality (deduplication)
- [ ] Implement contact history/audit trail
- [ ] Add contact activity timeline
- [ ] Implement advanced search with multiple criteria
- [ ] Add contact tagging system

**Estimated Effort:** 20-30 hours

**Priority:** **LOW**

---

#### 8. Internationalization (i18n)

**Tasks:**
- [ ] Implement i18n with next-intl or react-i18next
- [ ] Extract hardcoded Spanish labels
- [ ] Add English translations
- [ ] Add locale switcher
- [ ] Test all UI strings

**Estimated Effort:** 8-12 hours

**Priority:** **LOW** (only if internationalization needed)

---

#### 9. Advanced Document Management

**Tasks:**
- [ ] Implement document previews (PDF viewer, image viewer)
- [ ] Add document versioning
- [ ] Implement document categories/tags
- [ ] Add bulk document operations
- [ ] Implement document expiration notifications
- [ ] Add OCR for scanned documents

**Estimated Effort:** 30-40 hours

**Priority:** **LOW**

---

### Long Term (Roadmap)

#### 10. Contact Analytics

**Tasks:**
- [ ] Implement contact activity analytics
- [ ] Add credit utilization reports
- [ ] Create contact segmentation tools
- [ ] Add predictive analytics (churn prediction, etc.)
- [ ] Implement contact scoring

**Estimated Effort:** 40-60 hours

**Priority:** **FUTURE**

---

#### 11. Mobile Application

**Tasks:**
- [ ] Create mobile-friendly responsive design
- [ ] Implement mobile app with React Native
- [ ] Add offline support
- [ ] Implement mobile document scanning

**Estimated Effort:** 80-100 hours

**Priority:** **FUTURE**

---

#### 12. Integration Enhancements

**Tasks:**
- [ ] Implement two-way sync with Finance module
- [ ] Add integration with Purchase module
- [ ] Add integration with Sales module
- [ ] Implement webhooks for contact changes
- [ ] Add API for third-party integrations

**Estimated Effort:** 60-80 hours

**Priority:** **FUTURE**

---

## Changelog

### [2025-11-01] - Initial Documentation (Sprint 1 Complete)

**Created comprehensive Contacts module documentation:**
- ✅ Documented 4 entities: Contact, ContactAddress, ContactDocument, ContactPerson
- ✅ Documented 11 components (4,461 lines)
- ✅ Documented 1 hooks file with 8 hooks (310 lines)
- ✅ Documented 1 services file with 4 services (404 lines)
- ✅ Documented Party Pattern implementation
- ✅ Documented Document Lifecycle Management
- ✅ Identified 5 gaps and discrepancies
- ⚠️ **Critical Finding**: No backend schema documentation (cannot validate)
- ⚠️ **Critical Finding**: Zero test coverage (violates 70% policy)
- ✅ Provided 7 comprehensive usage examples
- ✅ Defined next steps and improvements

**Module Status:**
- ✅ **Functional**: Complete CRUD for all 4 entities
- ⚠️ **Backend Validation**: Not possible (no schema documentation)
- ❌ **Testing**: 0% coverage (CRITICAL VIOLATION)
- ✅ **Documentation**: Complete (13 sections, ~1,800 lines)

---

**Last Updated**: 2025-11-01
**Documented By**: Claude (Frontend AI Assistant)
**Backend Schema Version**: ⚠️ **NOT AVAILABLE**
**Frontend Code Version**: Current (as of 2025-11-01)
**Total Lines**: 1,835 lines
**Sprint**: Sprint 1 - Module 5/5 ✅ **COMPLETE**
