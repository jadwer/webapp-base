# PAGE-BUILDER-PRO Module - Complete Documentation

**Module**: Page-Builder-Pro (Visual Page Builder with GrapeJS)
**Status**: ✅ Completo | ⚠️ **NO BACKEND SCHEMA** | ❌ **NO TESTS** (Policy Violation)
**Date**: 2025-11-01
**Total Files**: 35 TypeScript/JS files (8,006 lines of code)
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

**Purpose**: Complete visual page builder system using GrapeJS for creating, editing, and managing web pages with drag-and-drop functionality.

**Key Features**:
- ✅ **GrapeJS Integration**: Professional drag-and-drop visual page editor
- ✅ **50+ Professional Blocks**: LaborWasser (25 blocks), Hero Revolution (26 blocks), Public Catalog (3 blocks)
- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete, Duplicate pages
- ✅ **Soft Delete Pattern**: Delete with recovery capability and intelligent slug management
- ✅ **Slug Management**: Automatic unique slug generation with conflict resolution
- ✅ **Status System**: Draft → Published → Archived → Deleted lifecycle
- ✅ **Bootstrap 5 Integration**: Full Bootstrap CSS and components support
- ✅ **7 Custom Hooks**: SWR-based data management with cache invalidation
- ✅ **13 Service Methods**: Comprehensive API layer including soft delete operations
- ✅ **Client-Side Pagination**: Frontend-managed filtering, sorting, and pagination
- ✅ **LocalStorage Fallback**: Temporary page storage for newly created pages

**Implementation Status**:
- ✅ **Visual Editor** (PageEditorTemplate) - 493 lines, complete GrapeJS implementation
- ✅ **Admin Interface** (PagesAdminTemplate) - 237 lines, professional table with actions
- ✅ **50+ Blocks** - 2,289 lines total across 3 block categories
- ✅ **Form System** - PageForm with validation and slug checking
- ✅ **Soft Delete** - Full recovery system with slug transformation
- ✅ **Duplication** - Clone pages with automatic slug generation
- ⚠️ **No Backend Schema** - Cannot validate types against backend tables
- ❌ **No Tests** - CRITICAL: 0% coverage (violates 70% policy from CLAUDE.md)

---

## Module Structure

### Directory Tree

```
src/modules/page-builder-pro/
├── blocks/                  # 3 files, 2,289 lines (29% of module)
│   ├── laborwasser-blocks.ts              # 123 lines - 25 LaborWasser blocks
│   ├── hero-revolution-blocks.ts          # 1,083 lines - 26 Hero blocks
│   └── public-catalog-blocks.ts           # 1,083 lines - 3 Catalog blocks
├── components/              # 12 files, 1,313 lines (17% of module)
│   ├── PageForm.tsx                       # 284 lines - Form with validation
│   ├── PagesTable.tsx                     # 193 lines - Data table component
│   ├── PagesTableDS.tsx                   # 130 lines - Design system table
│   ├── PagesFilters.tsx                   # 146 lines - Search and filters UI
│   ├── StatusBadge.tsx                    # 50 lines - Status visualization
│   ├── PaginationControls.tsx             # 104 lines - Pagination UI
│   ├── ToastNotifier.tsx                  # 122 lines - Toast notifications
│   ├── ToastNotifierDS.tsx                # 106 lines - DS toast component
│   ├── DeletedPagesPanel.tsx              # 119 lines - Soft delete management
│   ├── SliderEditorComponent.tsx          # 33 lines - Slider component
│   └── (2 more utility components)
├── hooks/                   # 1 file, 398 lines (5% of module)
│   └── usePages.ts                        # 398 lines - 7 SWR hooks
├── plugins/                 # 7 files, 696 lines (9% of module)
│   ├── grapesjs-bloks-forms-extended.ts  # 157 lines
│   ├── grapesjs-blocks-ui-bootstrap.ts   # 127 lines
│   ├── grapesjs-ui-editor-plus.ts        # 101 lines
│   ├── grapesjs-storage-local.ts         # 195 lines
│   ├── grapesjs-organize-default-blocks.ts # 96 lines
│   └── slider-editor-plugin.ts           # 20 lines
├── services/                # 1 file, 564 lines (7% of module)
│   ├── pagesService.ts                    # 509 lines - API layer with 13 methods
│   └── fetchPage.ts                       # 55 lines - SSR page fetching
├── templates/               # 2 files, 1,813 lines (23% of module)
│   ├── PageEditorTemplate.tsx             # 493 lines - Visual editor interface
│   └── PagesAdminTemplate.tsx             # 237 lines - Admin panel
├── types/                   # 2 files, 88 lines (1% of module)
│   ├── page.ts                            # 80 lines - Page entity types
│   └── ToastType.ts                       # 8 lines - Toast type definition
├── utils/                   # 2 files, 45 lines (1% of module)
│   ├── htmlCleaner.ts                     # 23 lines - HTML cleanup utility
│   └── slugify.ts                         # 22 lines - Slug generation
├── styles/                  # 1 file
│   └── grapesjs-custom.scss               # 120 lines - Custom GrapeJS styles
├── globalInit.ts            # 193 lines - Global dependencies initialization
├── config.ts                # 23 lines - Module configuration
└── index.ts                 # 169 lines - Module exports + GrapeJS init
```

### File Count

| Type | Count | Lines | Purpose |
|------|-------|-------|---------|
| **Blocks (.ts)** | 3 | 2,289 | Professional block libraries for GrapeJS |
| **Templates (.tsx)** | 2 | 1,813 | Main UI templates (Editor, Admin) |
| **Components (.tsx)** | 12 | 1,313 | React components for forms, tables, UI |
| **Plugins (.ts)** | 7 | 696 | GrapeJS plugins and extensions |
| **Services (.ts)** | 2 | 564 | API integration layer |
| **Hooks (.ts)** | 1 | 398 | SWR-based data hooks (7 hooks total) |
| **Supporting (.ts/.scss)** | 8 | 933 | Utils, types, config, global init, styles |
| **Tests** | 0 | 0 | ❌ **CRITICAL VIOLATION** |
| **Total** | 35 | 8,006 | All module files |

---

## Entities & Types

### Entity 1: Page (Main Entity)

**Purpose**: Represents a single web page with HTML, CSS, and GrapeJS JSON data

**TypeScript Interface:**
```typescript
export interface Page extends Record<string, unknown> {
  id: string                                          // UUID primary key
  title: string                                       // Page title (REQUERIDO)
  slug: string                                        // URL-friendly identifier (UNIQUE)
  html: string                                        // Rendered HTML content
  css?: string                                        // Custom CSS styles
  json?: object                                       // GrapeJS editor data (components tree)

  // ✅ STATUS SYSTEM - Lifecycle management
  status: 'draft' | 'published' | 'archived' | 'deleted'

  publishedAt: string | null                          // First publish timestamp (legacy compatibility)
  createdAt: string                                   // ISO 8601 datetime
  updatedAt: string                                   // ISO 8601 datetime

  // Relationship
  user?: {
    id: string
    name: string
    email: string
  }
}
```

**Backend Mapping:**
⚠️ **NO BACKEND SCHEMA DOCUMENTATION** - Cannot validate field mappings

**JSON:API Type:** `"pages"` (plural, lowercase)

**Key Relationships:**
- `belongsTo`: User (creator/owner)

**Status Lifecycle:**
```
1. DRAFT      → Initial creation, not visible to public
2. PUBLISHED  → Live on website, visible to public
3. ARCHIVED   → Temporarily hidden, can be republished
4. DELETED    → Soft deleted, can be restored (with slug transformation)
```

**Soft Delete Pattern:**
```typescript
// Normal page slug
slug: "my-awesome-page"

// After soft delete (automatic transformation)
slug: "my-awesome-page-deleted-1641234567890"
status: "deleted"

// After restore (slug conflict resolution)
slug: "my-awesome-page-1"  // or original if available
status: "draft"
```

---

### Form Interfaces

**CreatePageData:**
```typescript
export interface CreatePageData {
  title: string                                       // REQUERIDO
  slug: string                                        // REQUERIDO (must be unique)
  html: string                                        // REQUERIDO
  css?: string                                        // Optional
  json?: object                                       // GrapeJS data (optional)
  status: 'draft' | 'published' | 'archived' | 'deleted'
  publishedAt?: string | null                         // Auto-managed
  userId?: string                                     // For relationships
}
```

**UpdatePageData:**
```typescript
export interface UpdatePageData extends Partial<CreatePageData> {
  id?: string
}
```

**PageFilters:**
```typescript
export interface PageFilters {
  search?: string                                     // Search in title/slug
  status?: string                                     // Filter by status
  sortBy?: 'created_at' | 'updated_at' | 'title'
  sortOrder?: 'asc' | 'desc'
}
```

**PaginatedPages:**
```typescript
export interface PaginatedPages {
  data: Page[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}
```

---

### Slug Management Types

**SlugCheckResult:**
```typescript
export interface SlugCheckResult {
  exists: boolean                                     // Does slug exist?
  suggestions?: string[]                              // Alternative slugs (if exists)
}
```

**SlugGenerationOptions:**
```typescript
export interface SlugGenerationOptions {
  baseSlug: string                                    // Base slug to start from
  excludeId?: string                                  // Exclude specific page (for edits)
  includeDeleted?: boolean                            // Include deleted pages in check
}
```

**SoftDeleteResult:**
```typescript
export interface SoftDeleteResult {
  page: Page                                          // Updated page
  originalSlug: string                                // Original slug before deletion
  deletedSlug: string                                 // New slug with -deleted-timestamp
}
```

**RestorePageOptions:**
```typescript
export interface RestorePageOptions {
  newSlug?: string                                    // Custom slug for restored page
  newTitle?: string                                   // Custom title for restored page
}
```

---

## Components Breakdown

### Main Templates

#### 1. PageEditorTemplate.tsx (493 lines) ⭐ **ENTERPRISE COMPONENT**

**Purpose**: Complete visual page editor with GrapeJS integration

**Props Interface:**
```typescript
interface PageEditorTemplateProps {
  pageId?: string | null | undefined    // For edit mode
  onSave?: (pageId: string) => void     // Callback after save
  onCancel?: () => void                 // Cancel handler
  className?: string
}
```

**Key Features:**
- **GrapeJS Integration** - Full drag-and-drop editor
- **50+ Blocks** - LaborWasser, Hero Revolution, Public Catalog
- **Bootstrap Injection** - Automatic CSS/Icons loading in canvas
- **Auto-save Prevention** - Disable localStorage auto-load for editing
- **Loading States** - Professional loading UI while editor initializes
- **Content Loading** - Load existing page content into editor
- **Race Condition Protection** - useRef to prevent double initialization
- **Proper Cleanup** - Editor destruction on unmount
- **LocalStorage Fallback** - Temporary storage for newly created pages
- **Toast Notifications** - Success/error feedback

**State Management:**
```typescript
const editorRef = useRef<HTMLDivElement>(null)                  // Container ref
const toastRef = useRef<ToastNotifierHandle>(null)              // Toast system
const [grapesjsEditor, setGrapesjsEditor] = useState<Editor | null>(null)
const initializingRef = useRef(false)                           // Prevent double init
const cleanupRef = useRef<(() => void) | null>(null)            // Cleanup function

const { user } = useAuth()
const { page, isLoading: pageLoading } = usePage(pageId)
const { createPage, updatePage, isLoading: actionLoading } = usePageActions()
```

**GrapeJS Initialization:**
```typescript
// Initialize with custom configuration
const editor = await initPageBuilder(editorRef.current!, notify, {
  disableAutoLoad: Boolean(pageId)  // Disable for edit mode
})

// Inject Bootstrap CSS into canvas
const canvasDoc = editor.Canvas.getDocument()
const link = canvasDoc.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
canvasDoc.head.appendChild(link)

// Load page content (if editing)
if (page && page.html) {
  editor.setComponents(page.html)
  editor.setStyle(page.css || '')
  if (page.json) {
    editor.loadData(page.json)
  }
}
```

**Save Flow:**
```typescript
const handleSave = async () => {
  if (!grapesjsEditor) return

  // Extract content from editor
  const html = getCleanHtmlFromEditor(grapesjsEditor)  // Clean HTML
  const css = grapesjsEditor.getCss()
  const json = grapesjsEditor.getProjectData()

  // Save to backend
  if (isEditing) {
    await updatePage(pageId, { html, css, json, ...formData })
  } else {
    const newPage = await createPage({ html, css, json, ...formData })

    // LocalStorage fallback for immediate navigation
    if (newPage) {
      localStorage.setItem(`temp-page-${newPage.id}`, JSON.stringify({
        ...newPage,
        timestamp: Date.now()
      }))
    }
  }
}
```

**Example Usage:**
```tsx
// Route: /dashboard/page-builder/[id]
import { PageEditorTemplate } from '@/modules/page-builder-pro'

export default function EditPageRoute({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <PageEditorTemplate
      pageId={params.id}
      onSave={(id) => router.push('/dashboard/pages')}
      onCancel={() => router.back()}
    />
  )
}
```

---

#### 2. PagesAdminTemplate.tsx (237 lines)

**Purpose**: Administrative interface for managing all pages

**Key Features:**
- **Pages Table** with sortable columns
- **Search & Filters** (status, title, slug)
- **Pagination Controls** (client-side)
- **Action Buttons**: View, Edit, Delete, Duplicate
- **Soft Delete Support** - Show deleted pages panel
- **Responsive Design** - Mobile-friendly layout
- **Toast Notifications** - Operation feedback

**State Management:**
```typescript
const [filters, setFilters] = useState<PageFilters>({
  search: '',
  status: '',
  sortBy: 'created_at',
  sortOrder: 'desc'
})
const [currentPage, setCurrentPage] = useState(1)
const [perPage, setPerPage] = useState(15)

const { pages, meta, isLoading } = usePages(filters, currentPage, perPage)
const { deletePage, duplicatePage } = usePageActions()
const { softDeletePage } = useSoftDeleteActions()
const { deletedPages } = useDeletedPages()
```

**Example Usage:**
```tsx
// Route: /dashboard/pages
import { PagesAdminTemplate } from '@/modules/page-builder-pro'

export default function PagesAdminRoute() {
  return <PagesAdminTemplate />
}
```

---

### Components

#### 3. PageForm.tsx (284 lines)

**Purpose**: Reusable form for page metadata (title, slug, status)

**Props Interface:**
```typescript
interface PageFormProps {
  initialData?: Partial<CreatePageData>
  onSubmit: (data: CreatePageData) => void
  onCancel: () => void
  isEditing?: boolean
  className?: string
}
```

**Key Features:**
- **Title Input** with validation
- **Slug Generation** from title with auto-slugify
- **Slug Availability Check** with debounced validation (300ms)
- **Slug Suggestions** if conflict detected
- **Status Dropdown** (draft, published, archived)
- **Form Validation** - Required fields enforcement
- **Real-time Feedback** - Green checkmark (✓) or red X (✗) for slug

**Slug Validation Hook:**
```typescript
const {
  slug,
  updateSlug,
  slugResult,
  isChecking,
  generateUniqueSlug,
  isAvailable,
  suggestions
} = useSlugValidation(initialData?.slug || '', initialData?.id)

// Auto-generate from title
const handleTitleChange = (e) => {
  const title = e.target.value
  setFormData({ ...formData, title })

  // Generate slug from title
  const autoSlug = slugify(title)
  updateSlug(autoSlug)
}

// Manual slug edit
const handleSlugChange = (e) => {
  updateSlug(e.target.value)
}
```

**Example Usage:**
```tsx
<PageForm
  initialData={page}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isEditing={Boolean(pageId)}
/>
```

---

#### 4. PagesTable.tsx (193 lines)

**Purpose**: Data table for displaying pages with actions

**Key Features:**
- Sortable columns (Title, Slug, Status, Created, Updated)
- Status badges with color coding
- Action buttons (View, Edit, Delete, Duplicate)
- Responsive design with horizontal scroll
- Empty state messaging

---

#### 5. PagesFilters.tsx (146 lines)

**Purpose**: Search and filter UI

**Key Features:**
- Search input (title/slug)
- Status filter dropdown (all, draft, published, archived, deleted)
- Sort by dropdown (created, updated, title)
- Sort order toggle (asc/desc)
- Clear filters button

---

#### 6. DeletedPagesPanel.tsx (119 lines)

**Purpose**: Management panel for soft-deleted pages

**Key Features:**
- List deleted pages
- Restore action with slug conflict resolution
- Permanent delete action (hard delete)
- Confirmation modals
- Empty state when no deleted pages

**Example Usage:**
```tsx
<DeletedPagesPanel
  deletedPages={deletedPages}
  onRestore={(id) => restorePage(id)}
  onPermanentDelete={(id) => permanentlyDeletePage(id)}
/>
```

---

#### 7. StatusBadge.tsx (50 lines)

**Purpose**: Visual status indicator with color coding

**Status Colors:**
- **Draft** - Gray (`badge-secondary`)
- **Published** - Green (`badge-success`)
- **Archived** - Orange (`badge-warning`)
- **Deleted** - Red (`badge-danger`)

---

#### 8. PaginationControls.tsx (104 lines)

**Purpose**: Client-side pagination UI

**Key Features:**
- First/Last page buttons
- Previous/Next buttons
- Page number buttons with ellipsis for many pages
- Items per page selector (10, 15, 25, 50)
- Total count display

---

#### 9. ToastNotifier.tsx & ToastNotifierDS.tsx (228 lines combined)

**Purpose**: Toast notification system

**Key Features:**
- Success, Error, Info toast types
- Auto-dismiss after 3 seconds
- Manual dismiss button
- Professional animations
- Imperative API via ref

**Example:**
```tsx
const toastRef = useRef<ToastNotifierHandle>(null)

const showToast = () => {
  toastRef.current?.show('Page saved successfully!', 'success')
}

return <ToastNotifierDS ref={toastRef} />
```

---

## Hooks & Services

### Hooks (398 lines - 7 hooks total)

#### 1. usePages

**Purpose**: Fetch paginated pages list with filters

**Signature:**
```typescript
function usePages(
  filters: PageFilters = {},
  page = 1,
  perPage = 15
): {
  pages: Page[]
  meta: PaginatedPages['meta']
  links: PaginatedPages['links']
  isLoading: boolean
  error: Error | undefined
  refreshPages: () => void
}
```

**Implementation Details:**
- Uses SWR with cache key based on filters + pagination
- 30-second deduping interval
- `revalidateOnFocus: false` to prevent unnecessary refetches
- Client-side filtering and pagination (backend doesn't support these params yet)

**Example:**
```typescript
const { pages, meta, isLoading, refreshPages } = usePages(
  { status: 'published', search: 'home' },
  1,
  15
)
```

---

#### 2. usePage

**Purpose**: Fetch single page by ID with localStorage fallback

**Signature:**
```typescript
function usePage(id: string | null | undefined): {
  page: Page | null
  isLoading: boolean
  error: Error | undefined
}
```

**Implementation Details:**
- Conditional fetching (only if `id` is provided)
- **LocalStorage Fallback** - Checks localStorage if API fails (for newly created pages)
- Automatic cleanup of temporary localStorage data after 10 minutes
- Retry strategy: 5 attempts with 2-second interval

**LocalStorage Fallback Strategy:**
```typescript
try {
  // Try API first
  return await PagesService.getPage(id)
} catch (apiError) {
  // Fallback to localStorage
  const tempPageKey = `temp-page-${id}`
  const tempPageData = localStorage.getItem(tempPageKey)

  if (tempPageData) {
    const pageData = JSON.parse(tempPageData)

    // Check freshness (< 10 minutes old)
    const now = Date.now()
    const isRecent = now - pageData.timestamp < 10 * 60 * 1000

    if (isRecent) {
      // Cleanup after using
      setTimeout(() => localStorage.removeItem(tempPageKey), 2000)
      return pageData
    }
  }

  throw apiError
}
```

**Example:**
```typescript
const { page, isLoading, error } = usePage(pageId)
```

---

#### 3. usePageActions

**Purpose**: Mutation hooks for CRUD operations

**Signature:**
```typescript
function usePageActions(): {
  createPage: (data: CreatePageData) => Promise<Page | null>
  updatePage: (id: string, data: UpdatePageData) => Promise<Page | null>
  deletePage: (id: string) => Promise<boolean>
  duplicatePage: (id: string, newTitle?: string) => Promise<Page | null>
  isLoading: boolean
  error: string | null
}
```

**Cache Invalidation:**
```typescript
// After create/update/delete
await mutate((key: string) => key.startsWith('pages-'))
await mutate((key: string) => key.startsWith('page-'))
await mutate(`page-${id}`)
```

**Example:**
```typescript
const { createPage, updatePage, deletePage, duplicatePage } = usePageActions()

// Create
const newPage = await createPage({
  title: 'About Us',
  slug: 'about-us',
  html: '<h1>About</h1>',
  status: 'draft'
})

// Update
await updatePage(pageId, { status: 'published' })

// Delete (hard delete)
await deletePage(pageId)

// Duplicate
const copy = await duplicatePage(pageId, 'About Us (Copy)')
```

---

#### 4. useSoftDeleteActions ⭐ **ADVANCED PATTERN**

**Purpose**: Soft delete operations with slug management

**Signature:**
```typescript
function useSoftDeleteActions(): {
  softDeletePage: (id: string) => Promise<SoftDeleteResult | null>
  restorePage: (id: string, options: RestorePageOptions) => Promise<Page | null>
  permanentlyDeletePage: (id: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}
```

**Soft Delete Flow:**
```typescript
// 1. Soft delete (transform slug)
const result = await softDeletePage(pageId)
// result.originalSlug: "my-page"
// result.deletedSlug: "my-page-deleted-1641234567890"
// result.page.status: "deleted"

// 2. Restore (with slug conflict resolution)
const restoredPage = await restorePage(pageId, {
  newSlug: 'my-page-restored'  // Optional custom slug
})
// restoredPage.slug: "my-page" or "my-page-1" (if conflict)
// restoredPage.status: "draft"

// 3. Permanent delete (cannot be undone)
await permanentlyDeletePage(pageId)
```

**Example:**
```typescript
const { softDeletePage, restorePage, permanentlyDeletePage } = useSoftDeleteActions()

// Soft delete
const result = await softDeletePage(pageId)
console.log(`Deleted: ${result.originalSlug} → ${result.deletedSlug}`)

// Restore
await restorePage(pageId)

// Permanent delete (only works if already soft deleted)
await permanentlyDeletePage(pageId)
```

---

#### 5. useDeletedPages

**Purpose**: Fetch all soft-deleted pages

**Signature:**
```typescript
function useDeletedPages(): {
  deletedPages: Page[]
  isLoading: boolean
  error: Error | undefined
  refreshDeletedPages: () => void
}
```

**Implementation:**
```typescript
const { deletedPages, refreshDeletedPages } = useDeletedPages()

// Show in UI
deletedPages.map(page => (
  <li key={page.id}>
    {page.title} (deleted: {new Date(page.updatedAt).toLocaleDateString()})
  </li>
))
```

---

#### 6. useSlugValidation ⭐ **SMART VALIDATION**

**Purpose**: Real-time slug validation with debouncing and suggestions

**Signature:**
```typescript
function useSlugValidation(
  initialSlug = '',
  excludeId?: string
): {
  slug: string
  updateSlug: (newSlug: string) => void
  slugResult: SlugCheckResult
  isChecking: boolean
  generateUniqueSlug: (baseSlug: string) => Promise<string>
  isAvailable: boolean
  suggestions: string[]
}
```

**Implementation Details:**
- 300ms debounce on slug checking
- Exclude current page when editing (prevents false conflicts)
- Generate up to 5 suggestions if slug exists
- useRef-based timer to prevent infinite loops

**Example:**
```typescript
const {
  slug,
  updateSlug,
  slugResult,
  isChecking,
  isAvailable,
  suggestions
} = useSlugValidation('my-page', excludePageId)

// Real-time feedback
{isChecking ? (
  <span>Checking...</span>
) : isAvailable ? (
  <span>✓ Available</span>
) : (
  <div>
    <span>✗ Unavailable</span>
    <div>Suggestions: {suggestions.join(', ')}</div>
  </div>
)}
```

---

#### 7. usePublishedPagesForNavigation

**Purpose**: Get published pages for site navigation

**Signature:**
```typescript
function usePublishedPagesForNavigation(): {
  navigationPages: Array<{ id: string; title: string; slug: string }>
  isLoading: boolean
  error: Error | undefined
}
```

**Implementation Details:**
- 1-minute cache
- Auto-refresh every 5 minutes
- Sorted alphabetically by title
- Only includes published pages

**Example:**
```typescript
const { navigationPages } = usePublishedPagesForNavigation()

// Render navigation menu
<nav>
  {navigationPages.map(page => (
    <Link key={page.id} href={`/p/${page.slug}`}>
      {page.title}
    </Link>
  ))}
</nav>
```

---

### Services (564 lines - 13 methods total)

#### PagesService

**Purpose**: Complete API layer for pages management

**Base Endpoint:** `/api/v1/pages`

**Methods Overview:**

**1. Basic CRUD:**
```typescript
// GET /api/v1/pages
static async getPages(
  filters: PageFilters = {},
  page = 1,
  perPage = 15
): Promise<PaginatedPages>

// GET /api/v1/pages/{id}
static async getPage(id: string): Promise<Page>

// GET /api/v1/pages?filter[slug]={slug}
static async getPageBySlug(slug: string): Promise<Page | null>

// POST /api/v1/pages
static async createPage(data: CreatePageData): Promise<Page>

// PATCH /api/v1/pages/{id}
static async updatePage(id: string, data: UpdatePageData): Promise<Page>

// DELETE /api/v1/pages/{id}
static async deletePage(id: string): Promise<void>
```

**2. Advanced Operations:**
```typescript
// Duplicate page
static async duplicatePage(id: string, newTitle?: string): Promise<Page>

// Check if slug exists
static async checkSlugExists(slug: string, excludeId?: string): Promise<boolean>
```

**3. Soft Delete Operations:**
```typescript
// Soft delete (transform slug + set status)
static async softDeletePage(id: string): Promise<SoftDeleteResult>

// Restore deleted page
static async restorePage(
  id: string,
  options: RestorePageOptions = {}
): Promise<Page>

// Get all deleted pages
static async getDeletedPages(): Promise<Page[]>

// Permanent delete (hard delete)
static async permanentlyDeletePage(id: string): Promise<void>
```

**4. Slug Management:**
```typescript
// Generate unique slug with auto-increment
static async generateUniqueSlug(options: SlugGenerationOptions): Promise<string>

// Check if slug is taken
static async isSlugTaken(
  slug: string,
  excludeId?: string,
  includeDeleted = false
): Promise<boolean>

// Advanced check with suggestions
static async checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<SlugCheckResult>

// Get published pages for navigation
static async getPublishedPagesForNavigation(): Promise<Array<{
  id: string
  title: string
  slug: string
}>>
```

---

### Key Service Implementation Patterns

#### JSON:API Transformation

**Request (CREATE):**
```typescript
const payload: JsonApiCreatePagePayload = {
  data: {
    type: 'pages',
    attributes: {
      title: 'My Page',
      slug: 'my-page',
      html: '<h1>Hello</h1>',
      css: 'h1 { color: blue; }',
      json: { /* GrapeJS data */ },
      status: 'draft'
    },
    relationships: {
      user: {
        data: { type: 'users', id: userId }
      }
    }
  }
}
```

**Response:**
```typescript
{
  data: {
    id: "uuid",
    attributes: {
      title: "My Page",
      slug: "my-page",
      html: "<h1>Hello</h1>",
      css: "h1 { color: blue; }",
      json: "{ /* stringified */ }",  // May be string or object
      status: "draft",
      published_at: null,
      created_at: "2025-11-01T10:00:00Z",
      updated_at: "2025-11-01T10:00:00Z"
    }
  }
}
```

**Transformation Helper:**
```typescript
function convertJsonApiToPage(item: JsonApiPageResource): Page {
  // Handle JSON field (can be string or object)
  let parsedJson: object | undefined = undefined

  if (item.attributes.json) {
    if (typeof item.attributes.json === 'string') {
      try {
        const trimmed = item.attributes.json.trim()
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          parsedJson = JSON.parse(item.attributes.json)
        }
      } catch (error) {
        console.warn('Failed to parse JSON field:', error)
      }
    } else if (typeof item.attributes.json === 'object') {
      parsedJson = item.attributes.json
    }
  }

  return {
    id: item.id,
    title: item.attributes.title,
    slug: item.attributes.slug,
    html: item.attributes.html,
    css: item.attributes.css,
    json: parsedJson,
    status: item.attributes.status,
    publishedAt: item.attributes.publishedAt,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    user: item.relationships?.user ? { /* ... */ } : undefined
  }
}
```

---

#### Client-Side Pagination

**Implementation:**
```typescript
static async getPages(filters: PageFilters = {}, page = 1, perPage = 15) {
  // Fetch all pages (backend doesn't support pagination yet)
  const response = await axios.get<JsonApiResponse>(API_BASE)
  const allPages: Page[] = response.data.data.map(convertJsonApiToPage)

  // Client-side filtering
  let filteredPages = allPages

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredPages = filteredPages.filter(page =>
      page.title.toLowerCase().includes(searchLower) ||
      page.slug.toLowerCase().includes(searchLower)
    )
  }

  // Status filter
  if (filters.status) {
    filteredPages = filteredPages.filter(page =>
      page.status === filters.status
    )
  }

  // Sorting
  if (filters.sortBy) {
    filteredPages.sort((a, b) => {
      const aValue = String(a[filters.sortBy!] || '')
      const bValue = String(b[filters.sortBy!] || '')
      const comparison = aValue.localeCompare(bValue)
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })
  }

  // Pagination
  const total = filteredPages.length
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedPages = filteredPages.slice(startIndex, endIndex)

  return {
    data: paginatedPages,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.ceil(total / perPage)
    },
    links: { /* ... */ }
  }
}
```

---

#### Soft Delete with Slug Transformation

**Implementation:**
```typescript
static async softDeletePage(id: string): Promise<SoftDeleteResult> {
  const page = await this.getPage(id)
  const originalSlug = page.slug

  // Generate deleted slug: original-slug-deleted-{timestamp}
  const timestamp = Date.now()
  const deletedSlug = `${originalSlug}-deleted-${timestamp}`

  // Update page with deleted status and transformed slug
  const updatedPage = await this.updatePage(id, {
    status: 'deleted',
    slug: deletedSlug
  })

  return {
    page: updatedPage,
    originalSlug,
    deletedSlug
  }
}
```

**Restore with Conflict Resolution:**
```typescript
static async restorePage(
  id: string,
  options: RestorePageOptions = {}
): Promise<Page> {
  const page = await this.getPage(id)

  if (page.status !== 'deleted') {
    throw new Error('Page is not deleted')
  }

  // Extract original slug from deleted slug
  // "my-page-deleted-1641234567890" → "my-page"
  const originalSlug = this.extractOriginalSlugFromDeleted(page.slug)
  let newSlug = options.newSlug || originalSlug

  // Ensure slug is unique (auto-increment if conflict)
  newSlug = await this.generateUniqueSlug({
    baseSlug: newSlug,
    excludeId: id
  })

  return this.updatePage(id, {
    status: 'draft',  // Restore as draft
    slug: newSlug,
    title: options.newTitle || page.title
  })
}
```

**Extract Original Slug:**
```typescript
private static extractOriginalSlugFromDeleted(deletedSlug: string): string {
  // Match pattern: "anything-deleted-1234567890"
  const match = deletedSlug.match(/^(.+)-deleted-\d+$/)
  return match ? match[1] : deletedSlug
}
```

---

#### Unique Slug Generation

**Implementation:**
```typescript
static async generateUniqueSlug(options: SlugGenerationOptions): Promise<string> {
  const { baseSlug, excludeId, includeDeleted = false } = options
  let slug = baseSlug
  let counter = 1

  // Keep checking until we find a unique slug
  while (await this.isSlugTaken(slug, excludeId, includeDeleted)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

static async isSlugTaken(
  slug: string,
  excludeId?: string,
  includeDeleted = false
): Promise<boolean> {
  const response = await axios.get<JsonApiResponse>(
    `${API_BASE}?filter[slug]=${slug}`
  )
  const pages = response.data.data

  if (!pages || pages.length === 0) return false

  // Filter out excluded page and optionally deleted pages
  const filteredPages = pages.filter((page: JsonApiPageResource) => {
    if (excludeId && page.id === excludeId) return false
    if (!includeDeleted && page.attributes.status === 'deleted') return false
    return true
  })

  return filteredPages.length > 0
}
```

**Advanced Slug Check with Suggestions:**
```typescript
static async checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<SlugCheckResult> {
  const exists = await this.isSlugTaken(slug, excludeId, false)

  if (!exists) {
    return { exists: false }
  }

  // Generate suggestions if slug exists
  const suggestions: string[] = []
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${slug}-${i}`
    if (!(await this.isSlugTaken(suggestion, excludeId, false))) {
      suggestions.push(suggestion)
    }
  }

  return { exists: true, suggestions }
}
```

---

## Backend Integration Analysis

### Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/pages` | GET | List all pages | ⚠️ **Not validated** |
| `/api/v1/pages` | POST | Create page | ⚠️ **Not validated** |
| `/api/v1/pages/{id}` | GET | Get page | ⚠️ **Not validated** |
| `/api/v1/pages/{id}` | PATCH | Update page | ⚠️ **Not validated** |
| `/api/v1/pages/{id}` | DELETE | Delete page | ⚠️ **Not validated** |
| `/api/v1/pages?filter[slug]={slug}` | GET | Get by slug | ⚠️ **Not validated** |
| `/api/v1/pages?filter[status]={status}` | GET | Filter by status | ⚠️ **Not validated** |

### Backend Schema Comparison

⚠️ **CRITICAL GAP: NO BACKEND SCHEMA DOCUMENTATION**

**Validation Attempt:**
```bash
grep -i "CREATE TABLE.*pages|pages table" \
  /home/jadwer/dev/AtomoSoluciones/base/api-base/docs/

# Result: No files found
```

**Implication:**
- ❌ Cannot validate frontend types against backend schema
- ❌ Cannot verify field names (snake_case vs camelCase mapping)
- ❌ Cannot confirm data types and constraints
- ❌ Cannot validate status enum values
- ❌ Cannot confirm soft delete implementation in backend
- ⚠️ **Similar to Inventory and Contacts modules** - also missing backend schema

**Action Required:**
- [ ] Request backend team to document Pages schema in DATABASE_SCHEMA_REFERENCE.md
- [ ] Include fields: id, title, slug, html, css, json, status, published_at, created_at, updated_at, user_id
- [ ] Document constraints: slug UNIQUE, status ENUM('draft', 'published', 'archived', 'deleted')
- [ ] Document indexes and foreign keys
- [ ] Confirm soft delete pattern (status-based vs deleted_at)

---

### JSON:API Compliance

**Request Format (CREATE Page):**
```typescript
{
  data: {
    type: "pages",
    attributes: {
      title: "Home Page",
      slug: "home",
      html: "<h1>Welcome</h1><p>This is the home page.</p>",
      css: "h1 { color: #333; font-size: 2rem; }",
      json: {
        // GrapeJS component tree
        "assets": [],
        "styles": [],
        "pages": [
          {
            "frames": [
              {
                "component": {
                  "type": "wrapper",
                  "components": [/* ... */]
                }
              }
            ]
          }
        ]
      },
      status: "draft",
      published_at: null
    },
    relationships: {
      user: {
        data: { type: "users", id: "user-uuid" }
      }
    }
  }
}
```

**Response Format:**
```typescript
{
  jsonapi: { version: "1.0" },
  data: {
    type: "pages",
    id: "page-uuid-123",
    attributes: {
      title: "Home Page",
      slug: "home",
      html: "<h1>Welcome</h1><p>This is the home page.</p>",
      css: "h1 { color: #333; font-size: 2rem; }",
      json: "{ /* stringified or object */ }",
      status: "draft",
      published_at: null,
      created_at: "2025-11-01T10:00:00.000000Z",
      updated_at: "2025-11-01T10:00:00.000000Z"
    },
    relationships: {
      user: {
        data: { type: "users", id: "user-uuid" }
      }
    }
  }
}
```

**Compliance Checklist:**
- ✅ Uses `convertJsonApiToPage` for transformation
- ✅ Proper attribute transformation (snake_case ↔ camelCase)
- ✅ Handles relationships (user)
- ✅ JSON field handling (string or object)
- ✅ Filter parameters formatted as `filter[key]`
- ❌ **Missing**: Backend pagination support (handled client-side currently)
- ❌ **Missing**: Backend sorting support (handled client-side currently)

---

### Frontend Backend Communication

**Client-Side Workarounds:**

**1. Pagination (Backend doesn't support yet):**
```typescript
// Frontend solution: Fetch all, paginate in memory
const response = await axios.get('/api/v1/pages')  // No page params
const allPages = response.data.data

// Apply pagination in JavaScript
const paginatedPages = allPages.slice(
  (page - 1) * perPage,
  page * perPage
)
```

**2. Filtering (Backend doesn't support all filters):**
```typescript
// Supported by backend
?filter[slug]=home
?filter[status]=published

// NOT supported by backend (frontend handles)
?filter[search]=keyword  // Frontend searches in title + slug
?sort=created_at&order=desc  // Frontend sorts in memory
```

**3. JSON Field Handling:**
```typescript
// Backend may return string or object
if (typeof apiJson === 'string') {
  json = JSON.parse(apiJson)  // Parse if string
} else {
  json = apiJson  // Use directly if object
}
```

---

## Gaps & Discrepancies

### ⚠️ Gap 1: Backend Schema Documentation Missing

**Descripción**: No backend schema documentation exists for Pages module

**Backend soporta pero no documentado:**
- `pages` table schema
- Field types and constraints
- Slug uniqueness constraint
- Status enum validation
- Soft delete implementation (status-based or deleted_at?)
- GrapeJS JSON field storage (TEXT, JSON, LONGTEXT?)
- Indexes and foreign keys

**Impacto:** **HIGH**

**Evidencia:**
```bash
grep -i "CREATE TABLE.*pages" api-base/docs/
# No matches found
```

**Acción requerida:**
- [ ] Document `pages` table in DATABASE_SCHEMA_REFERENCE.md
- [ ] Confirm field types and constraints
- [ ] Validate soft delete pattern
- [ ] Document JSON field storage capacity

---

### ⚠️ Gap 2: Testing Coverage - CRITICAL VIOLATION

**Descripción**: Zero test coverage violates project policy (70% minimum)

**Missing Tests:**
- ❌ Service layer tests (PagesService - 13 methods)
- ❌ Hook tests (7 hooks: usePages, usePage, usePageActions, etc.)
- ❌ Component tests (12 components)
- ❌ GrapeJS initialization tests
- ❌ Soft delete flow tests
- ❌ Slug generation tests
- ❌ Utility tests (slugify, htmlCleaner)

**Impacto:** **CRITICAL**

**Policy Reference:**
From CLAUDE.md:
> **Quality Gates:**
> - ❌ **NO SE PERMITE** código sin tests en módulos nuevos
> - ❌ **NO SE PERMITE** coverage < 70%

**Current Status:** **0% coverage** ❌ **FAIL - CRITICAL VIOLATION**

**Acción requerida:**
- [ ] Create `tests/` directory
- [ ] Implement service tests (pagesService.test.ts)
- [ ] Implement hook tests (usePages.test.tsx, useSoftDeleteActions.test.tsx, etc.)
- [ ] Implement component tests (PageEditorTemplate.test.tsx, PageForm.test.tsx, etc.)
- [ ] Implement utility tests (slugify.test.ts, htmlCleaner.test.ts)
- [ ] Achieve minimum 70% coverage

---

### ⚠️ Gap 3: Backend Pagination Missing

**Descripción**: Backend doesn't support pagination/sorting parameters

**Frontend workaround:**
```typescript
// Fetch ALL pages
const allPages = await axios.get('/api/v1/pages')

// Handle pagination client-side
const paginatedPages = allPages.slice(
  (page - 1) * perPage,
  page * perPage
)
```

**Impacto:** **MEDIUM**

**Issues:**
- Performance degradation with many pages (1000+)
- Unnecessary data transfer
- Increased memory usage
- Slower initial load

**Backend should support:**
```
GET /api/v1/pages?page[number]=1&page[size]=15
GET /api/v1/pages?sort=created_at&order=desc
GET /api/v1/pages?filter[search]=keyword
```

**Acción requerida:**
- [ ] Request backend team to implement JSON:API pagination
- [ ] Implement sorting support in backend
- [ ] Implement search filter in backend
- [ ] Update frontend to use backend pagination when available

---

### ⚠️ Gap 4: GrapeJS Block Organization

**Descripción**: 50+ blocks in one category makes finding blocks difficult

**Current Implementation:**
- All blocks loaded at once
- Minimal categorization
- No search functionality in block panel

**Impacto:** **LOW**

**User Experience:**
- Hard to find specific block
- Cluttered block panel
- Learning curve for new users

**Acción requerida:**
- [ ] Implement block search in GrapeJS
- [ ] Better categorization (Basic, Advanced, LaborWasser, etc.)
- [ ] Favorite blocks feature
- [ ] Recent blocks panel

---

### ⚠️ Gap 5: JSON Field Size Limit Unknown

**Descripción**: Unknown backend storage capacity for GrapeJS JSON data

**Frontend sends:**
```typescript
json: {
  assets: [...],  // Images, fonts, etc.
  styles: [...],  // CSS rules
  pages: [
    {
      frames: [
        {
          component: {
            type: "wrapper",
            components: [/* Deep component tree */]
          }
        }
      ]
    }
  ]
}
```

**Questions:**
- What's the max JSON size? (64KB? 16MB? Unlimited?)
- Is it stored as TEXT, JSON, or LONGTEXT?
- What happens if JSON exceeds limit?
- Should we compress JSON before sending?

**Impacto:** **MEDIUM**

**Risk:**
- Data loss if JSON too large
- Silent truncation
- Editor crashes on large pages

**Acción requerida:**
- [ ] Document JSON field storage type and size limit
- [ ] Implement client-side validation for JSON size
- [ ] Add compression for large JSON data
- [ ] Add warning when approaching size limit

---

### ⚠️ Gap 6: LocalStorage Cleanup Strategy

**Descripción**: Temporary page data in localStorage may not be cleaned up

**Current Implementation:**
```typescript
// After creating page
localStorage.setItem(`temp-page-${newPage.id}`, JSON.stringify({
  ...newPage,
  timestamp: Date.now()
}))

// Cleanup after 10 minutes (only if page is accessed)
if (now - pageData.timestamp > 10 * 60 * 1000) {
  localStorage.removeItem(tempPageKey)
}
```

**Issues:**
- Only cleans up if page is accessed
- Multiple pages created in succession accumulate
- No global cleanup mechanism
- localStorage quota can be exceeded

**Impacto:** **LOW**

**Acción requerida:**
- [ ] Implement global localStorage cleanup on app load
- [ ] Add periodic cleanup (every 1 hour)
- [ ] Monitor localStorage usage
- [ ] Add error handling for quota exceeded

---

### ℹ️ Frontend Implementation Notes

**Features implemented:**
- ✅ Complete visual editor with GrapeJS
- ✅ 50+ professional blocks
- ✅ Soft delete with recovery
- ✅ Intelligent slug management
- ✅ Client-side pagination/filtering
- ✅ LocalStorage fallback for new pages
- ✅ Toast notification system
- ✅ Professional admin interface

**No features ahead of backend** - All features assume backend support or use client-side workarounds

---

## Testing Coverage

### Current Coverage

| Type | Files | Coverage | Status |
|------|-------|----------|--------|
| Unit Tests (Services) | 0/2 | 0% | ❌ **CRITICAL** |
| Integration Tests (Hooks) | 0/7 | 0% | ❌ **CRITICAL** |
| Component Tests | 0/14 | 0% | ❌ **CRITICAL** |
| Utility Tests | 0/2 | 0% | ❌ **CRITICAL** |
| **Total** | **0/25** | **0%** | ❌ **POLICY VIOLATION** |

### Test Files Needed

**Expected Structure:**
```
tests/
├── services/
│   ├── pagesService.test.ts           # 13 methods to test
│   └── fetchPage.test.ts               # SSR fetching
├── hooks/
│   ├── usePages.test.tsx
│   ├── usePage.test.tsx
│   ├── usePageActions.test.tsx
│   ├── useSoftDeleteActions.test.tsx
│   ├── useDeletedPages.test.tsx
│   ├── useSlugValidation.test.tsx
│   └── usePublishedPagesForNavigation.test.tsx
├── components/
│   ├── PageEditorTemplate.test.tsx     # Complex editor initialization
│   ├── PagesAdminTemplate.test.tsx
│   ├── PageForm.test.tsx               # Form validation, slug checking
│   ├── PagesTable.test.tsx
│   ├── PagesFilters.test.tsx
│   ├── DeletedPagesPanel.test.tsx      # Soft delete UI
│   ├── StatusBadge.test.tsx
│   ├── PaginationControls.test.tsx
│   ├── ToastNotifier.test.tsx
│   └── (more component tests)
├── utils/
│   ├── slugify.test.ts                 # Slug generation logic
│   └── htmlCleaner.test.ts             # HTML sanitization
└── integration/
    ├── soft-delete-flow.test.tsx       # Delete → Restore → Permanent Delete
    ├── slug-conflict-resolution.test.tsx
    └── page-creation-flow.test.tsx     # Create → Edit → Publish
```

**Total:** 25+ test files needed

---

### Critical Test Cases

**PagesService (High Priority):**
- [ ] `getPages` - pagination, filtering, sorting
- [ ] `getPage` - single page fetch
- [ ] `getPageBySlug` - slug-based lookup
- [ ] `createPage` - JSON:API payload construction
- [ ] `updatePage` - partial updates, publishedAt logic
- [ ] `duplicatePage` - slug generation for copy
- [ ] `softDeletePage` - slug transformation
- [ ] `restorePage` - slug conflict resolution
- [ ] `generateUniqueSlug` - auto-increment logic
- [ ] `checkSlugAvailability` - suggestions generation

**Hooks (High Priority):**
- [ ] `usePages` - cache key generation, SWR integration
- [ ] `usePage` - localStorage fallback logic
- [ ] `usePageActions` - cache invalidation after mutations
- [ ] `useSoftDeleteActions` - soft delete flow
- [ ] `useSlugValidation` - debouncing, real-time checking

**Components (Medium Priority):**
- [ ] `PageEditorTemplate` - GrapeJS initialization, race condition protection
- [ ] `PageForm` - validation, slug auto-generation
- [ ] `DeletedPagesPanel` - restore/permanent delete

**Integration Tests (High Priority):**
- [ ] Soft delete flow: Delete → Restore → Permanent Delete
- [ ] Slug conflict: Create page → Duplicate → Auto-increment slug
- [ ] Page lifecycle: Create → Edit → Publish → Archive → Soft Delete

---

## Performance Optimizations

### Current Optimizations

#### 1. SWR Caching Strategy

**Implementation:**
```typescript
const { data, error, isLoading } = useSWR(
  `pages-${JSON.stringify(filters)}-${page}-${perPage}`,
  () => PagesService.getPages(filters, page, perPage),
  {
    revalidateOnFocus: false,    // Don't refetch on tab focus
    dedupingInterval: 30000      // Dedupe requests within 30 seconds
  }
)
```

**Impact:**
- Prevents duplicate requests within 30 seconds
- Reduces backend load
- Faster perceived performance

---

#### 2. Debounced Slug Validation

**Implementation:**
```typescript
// 300ms debounce on slug checking
useEffect(() => {
  if (timerRef.current) {
    clearTimeout(timerRef.current)
  }

  timerRef.current = setTimeout(() => {
    checkSlugAvailability(slug)
  }, 300)

  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }
}, [slug, checkSlugAvailability])
```

**Impact:**
- Reduces API calls during typing
- Better UX (no jitter from rapid checks)
- Lower backend load

---

#### 3. GrapeJS Race Condition Protection

**Implementation:**
```typescript
const initializingRef = useRef(false)  // Prevent double initialization

useEffect(() => {
  if (initializingRef.current) {
    console.log('Already initializing, skipping...')
    return
  }

  initializingRef.current = true

  const initAsync = async () => {
    editor = await initPageBuilder(/* ... */)
    setGrapesjsEditor(editor)
  }

  initAsync()

  return () => {
    initializingRef.current = false
  }
}, [])
```

**Impact:**
- Prevents double initialization in React StrictMode
- Avoids memory leaks
- Ensures single editor instance

---

#### 4. LocalStorage Fallback for New Pages

**Implementation:**
```typescript
// After creating page
if (newPage) {
  localStorage.setItem(`temp-page-${newPage.id}`, JSON.stringify({
    ...newPage,
    timestamp: Date.now()
  }))
}

// On page load, try localStorage if API fails
const tempPageData = localStorage.getItem(tempPageKey)
if (tempPageData) {
  const pageData = JSON.parse(tempPageData)
  if (now - pageData.timestamp < 10 * 60 * 1000) {
    return pageData  // Use temporary data
  }
}
```

**Impact:**
- Enables immediate navigation after page creation
- Prevents 404 errors for newly created pages
- Better UX during API propagation delays

---

#### 5. Client-Side Pagination/Filtering

**Implementation:**
```typescript
// Fetch all once
const allPages = await axios.get('/api/v1/pages')

// Filter in memory
const filtered = allPages.filter(/* ... */)

// Sort in memory
filtered.sort(/* ... */)

// Paginate in memory
const paginated = filtered.slice(start, end)
```

**Impact:**
- Single API call for all pages
- Instant filtering/sorting (no network delay)
- Reduces backend load

**Trade-off:**
- Performance degrades with many pages (1000+)
- Larger initial payload
- More memory usage

---

### Performance Metrics

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Initial Load (Editor) | < 2s | ⚠️ **Unknown** | ⚠️ **Not measured** |
| GrapeJS Initialization | < 1s | ⚠️ **Unknown** | ⚠️ **Not measured** |
| Save Page | < 1s | ⚠️ **Unknown** | ⚠️ **Not measured** |
| Slug Check (debounced) | < 500ms | ⚠️ **Unknown** | ⚠️ **Not measured** |
| Page List Load | < 1s | ⚠️ **Unknown** | ⚠️ **Not measured** |

**Note:** Performance metrics not yet measured - requires instrumentation

---

### Missing Optimizations

#### 1. Code Splitting for GrapeJS

**Issue:** GrapeJS and all plugins loaded upfront

**Solution:**
```typescript
// Dynamic import
const initPageBuilder = dynamic(() => import('../modules/page-builder-pro'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})
```

**Impact:** Reduce initial bundle size by ~300KB

---

#### 2. Virtual Scrolling for Pages Table

**Issue:** All pages rendered in table (performance issue with 1000+ pages)

**Solution:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: pages.length,
  getScrollElement: () => tableRef.current,
  estimateSize: () => 50
})
```

**Impact:** Handle 10,000+ pages without lag

---

#### 3. Lazy Load Block Categories

**Issue:** All 50+ blocks loaded at once

**Solution:**
```typescript
// Load blocks on demand
editor.on('block:category:open', (category) => {
  if (!loadedCategories.has(category)) {
    loadBlocksForCategory(category)
    loadedCategories.add(category)
  }
})
```

**Impact:** Faster initial editor load

---

#### 4. Compress GrapeJS JSON

**Issue:** Large JSON payloads for complex pages

**Solution:**
```typescript
import pako from 'pako'

// Compress before sending
const compressed = pako.deflate(JSON.stringify(json))
const base64 = btoa(String.fromCharCode(...compressed))

// Decompress on load
const compressed = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
const json = JSON.parse(pako.inflate(compressed, { to: 'string' }))
```

**Impact:** Reduce payload size by 50-70%

---

## Known Issues & Limitations

### 🔴 Critical Issues

#### Issue 1: No Backend Schema Validation

**Description**: Cannot validate frontend types against backend schema

**Impact**: **HIGH**

**Details:**
- No schema documentation for `pages` table
- Cannot confirm field types, constraints, indexes
- Risk of type mismatches between frontend and backend
- Cannot validate soft delete implementation

**Workaround**: None - depends on backend documentation

**Planned Fix**: Request backend team to add schema documentation

**Tracking**: Gap #1 above

---

#### Issue 2: Zero Test Coverage - Policy Violation

**Description**: Module has 0% test coverage, violating 70% policy

**Impact**: **CRITICAL**

**Details:**
- No tests for 13 service methods, 7 hooks, 14 components
- Risk of undetected bugs in production
- Violates CLAUDE.md testing policy
- Complex soft delete logic untested

**Workaround**: None - tests must be implemented

**Planned Fix**: Implement comprehensive test suite (25+ test files)

**Tracking**: Gap #2 above

---

### 🟡 Medium Issues

#### Issue 3: Client-Side Pagination Performance

**Description**: All pages fetched at once, paginated in browser

**Impact**: **MEDIUM**

**Details:**
- Performance degrades with 1000+ pages
- Unnecessary data transfer
- Increased memory usage
- Backend doesn't support pagination yet

**Workaround**: Works acceptably for < 500 pages

**Planned Fix**:
- Request backend pagination support
- Implement virtual scrolling as interim solution

**Tracking**: Gap #3 above

---

#### Issue 4: GrapeJS Double Initialization in Strict Mode

**Description**: React StrictMode causes double initialization attempts

**Impact**: **MEDIUM**

**Details:**
- React 18 StrictMode calls useEffect twice in development
- Can cause race conditions
- Memory leaks if not handled properly

**Workaround**: useRef-based flag to prevent double init

**Current Status**: Fixed with `initializingRef.current` guard

**Code:**
```typescript
const initializingRef = useRef(false)

if (initializingRef.current) {
  console.log('Already initializing, skipping...')
  return
}

initializingRef.current = true
```

---

### 🟢 Minor Issues / Tech Debt

#### Issue 5: LocalStorage Cleanup Not Guaranteed

**Description**: Temporary page data may not be cleaned up

**Impact**: **LOW**

**Details:**
- Only cleans up if page is accessed
- Multiple pages accumulate
- localStorage quota can be exceeded

**Workaround**: 10-minute expiry when accessed

**Planned Fix**: Global cleanup mechanism

**Tracking**: Gap #6 above

---

#### Issue 6: No Block Search in GrapeJS

**Description**: Finding blocks among 50+ options is difficult

**Impact**: **LOW**

**Details:**
- All blocks in one panel
- No search functionality
- Learning curve for users

**Workaround**: Users learn block locations over time

**Planned Fix**: Implement block search plugin

---

#### Issue 7: JSON Field Size Limit Unknown

**Description**: Unknown max size for GrapeJS JSON data

**Impact**: **MEDIUM**

**Details:**
- Complex pages may exceed limit
- No client-side validation
- Silent data loss risk

**Workaround**: Assume reasonable backend limit

**Planned Fix**:
- Document backend JSON field limit
- Add client-side size validation
- Implement compression for large JSON

**Tracking**: Gap #5 above

---

#### Issue 8: No Undo/Redo Across Sessions

**Description**: GrapeJS undo history lost on page reload

**Impact**: **LOW**

**Details:**
- GrapeJS has built-in undo/redo
- Only works within current session
- Lost on page reload

**Workaround**: Use localStorage plugin to persist some state

**Planned Fix**: Implement undo history persistence

---

## Usage Examples

### Example 1: Create New Page

```tsx
import { usePageActions } from '@/modules/page-builder-pro'

function CreatePageExample() {
  const { createPage, isLoading } = usePageActions()

  const handleCreate = async () => {
    const newPage = await createPage({
      title: 'About Us',
      slug: 'about-us',
      html: '<h1>About Us</h1><p>Welcome to our company.</p>',
      css: 'h1 { color: #333; } p { color: #666; }',
      json: {
        /* GrapeJS data structure */
        pages: [
          {
            frames: [
              {
                component: {
                  type: 'wrapper',
                  components: [
                    { type: 'text', content: 'About Us' }
                  ]
                }
              }
            ]
          }
        ]
      },
      status: 'draft'
    })

    if (newPage) {
      console.log('Page created:', newPage.id)
      // Redirect to editor
      router.push(`/dashboard/page-builder/${newPage.id}`)
    }
  }

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Page'}
    </button>
  )
}
```

---

### Example 2: Visual Page Editor

```tsx
'use client'
import { PageEditorTemplate } from '@/modules/page-builder-pro'
import { useRouter } from 'next/navigation'

export default function EditPageRoute({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div style={{ height: '100vh' }}>
      <PageEditorTemplate
        pageId={params.id}
        onSave={(savedPageId) => {
          console.log('Page saved:', savedPageId)
          router.push('/dashboard/pages')
        }}
        onCancel={() => router.back()}
      />
    </div>
  )
}
```

---

### Example 3: Admin Page Management

```tsx
import { PagesAdminTemplate } from '@/modules/page-builder-pro'

export default function PagesAdminPage() {
  // PagesAdminTemplate handles everything internally:
  // - Listing pages
  // - Search/filters
  // - Pagination
  // - Edit/Delete/Duplicate actions
  // - Soft delete management

  return <PagesAdminTemplate />
}
```

---

### Example 4: Soft Delete Flow

```tsx
import {
  useSoftDeleteActions,
  useDeletedPages
} from '@/modules/page-builder-pro'

function SoftDeleteExample() {
  const { softDeletePage, restorePage, permanentlyDeletePage } = useSoftDeleteActions()
  const { deletedPages, refreshDeletedPages } = useDeletedPages()

  // 1. Soft delete a page
  const handleSoftDelete = async (pageId: string) => {
    const result = await softDeletePage(pageId)

    if (result) {
      console.log('Soft deleted:')
      console.log('  Original slug:', result.originalSlug)
      console.log('  Deleted slug:', result.deletedSlug)
      // Example: "my-page" → "my-page-deleted-1641234567890"

      refreshDeletedPages()  // Refresh deleted pages list
    }
  }

  // 2. Restore a deleted page
  const handleRestore = async (pageId: string) => {
    const restored = await restorePage(pageId, {
      newTitle: 'Restored Page',  // Optional custom title
      newSlug: 'restored-page'    // Optional custom slug
    })

    if (restored) {
      console.log('Restored as:', restored.slug)
      // If slug conflict, becomes: "restored-page-1"
      refreshDeletedPages()
    }
  }

  // 3. Permanent delete (cannot be undone!)
  const handlePermanentDelete = async (pageId: string) => {
    if (confirm('This cannot be undone. Are you sure?')) {
      const success = await permanentlyDeletePage(pageId)

      if (success) {
        console.log('Permanently deleted')
        refreshDeletedPages()
      }
    }
  }

  return (
    <div>
      <h2>Deleted Pages ({deletedPages.length})</h2>
      <ul>
        {deletedPages.map(page => (
          <li key={page.id}>
            {page.title} ({page.slug})
            <button onClick={() => handleRestore(page.id)}>
              Restore
            </button>
            <button onClick={() => handlePermanentDelete(page.id)}>
              Delete Permanently
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 5: Slug Validation with Suggestions

```tsx
import { useSlugValidation } from '@/modules/page-builder-pro'

function SlugValidationExample({ pageId }: { pageId?: string }) {
  const {
    slug,
    updateSlug,
    slugResult,
    isChecking,
    isAvailable,
    suggestions
  } = useSlugValidation('', pageId)  // Exclude current page if editing

  return (
    <div>
      <label>Slug:</label>
      <input
        type="text"
        value={slug}
        onChange={(e) => updateSlug(e.target.value)}
        placeholder="page-slug"
      />

      {/* Real-time feedback */}
      {isChecking ? (
        <span>⏳ Checking availability...</span>
      ) : slug && isAvailable ? (
        <span style={{ color: 'green' }}>✓ Available</span>
      ) : slug && !isAvailable ? (
        <div style={{ color: 'red' }}>
          <span>✗ Already taken</span>
          {suggestions.length > 0 && (
            <div>
              <p>Suggestions:</p>
              <ul>
                {suggestions.map(suggestion => (
                  <li key={suggestion}>
                    <button onClick={() => updateSlug(suggestion)}>
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
```

---

### Example 6: Duplicate Page with Auto-Slug

```tsx
import { usePageActions } from '@/modules/page-builder-pro'

function DuplicatePageExample() {
  const { duplicatePage, isLoading } = usePageActions()

  const handleDuplicate = async (originalPageId: string) => {
    // Duplicate with custom title
    const duplicate = await duplicatePage(
      originalPageId,
      'My Page (Copy)'
    )

    if (duplicate) {
      console.log('Duplicated page:')
      console.log('  ID:', duplicate.id)
      console.log('  Title:', duplicate.title)
      console.log('  Slug:', duplicate.slug)
      // Slug auto-generated: "my-page-copy-1641234567890"
      console.log('  Status:', duplicate.status)  // Always 'draft'

      // All content copied
      console.log('  HTML:', duplicate.html)
      console.log('  CSS:', duplicate.css)
      console.log('  GrapeJS Data:', duplicate.json)
    }
  }

  return (
    <button onClick={() => handleDuplicate('page-123')} disabled={isLoading}>
      {isLoading ? 'Duplicating...' : 'Duplicate Page'}
    </button>
  )
}
```

---

### Example 7: Published Pages for Navigation

```tsx
import { usePublishedPagesForNavigation } from '@/modules/page-builder-pro'
import Link from 'next/link'

function SiteNavigation() {
  const { navigationPages, isLoading } = usePublishedPagesForNavigation()

  if (isLoading) return <nav>Loading...</nav>

  return (
    <nav>
      <ul>
        {navigationPages.map(page => (
          <li key={page.id}>
            <Link href={`/p/${page.slug}`}>
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

---

### Example 8: Render Published Page (SSR)

```tsx
// app/(front)/p/[slug]/page.tsx
import { fetchPageBySlug } from '@/modules/page-builder-pro'

export default async function PublicPage({
  params
}: {
  params: { slug: string }
}) {
  const page = await fetchPageBySlug(params.slug)

  if (!page || page.status !== 'published') {
    return <div>Page not found</div>
  }

  return (
    <div>
      <h1>{page.title}</h1>

      {/* Render HTML content */}
      <div dangerouslySetInnerHTML={{ __html: page.html }} />

      {/* Inject CSS */}
      {page.css && (
        <style dangerouslySetInnerHTML={{ __html: page.css }} />
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
- [ ] Implement service tests (pagesService.test.ts - 13 methods)
- [ ] Implement hook tests (7 hooks: usePages, useSoftDeleteActions, etc.)
- [ ] Implement component tests (PageEditorTemplate, PageForm, etc.)
- [ ] Implement utility tests (slugify, htmlCleaner)
- [ ] Implement integration tests (soft delete flow, slug conflicts)
- [ ] Configure Vitest coverage thresholds
- [ ] Run tests and ensure 70%+ coverage
- [ ] Add CI/CD enforcement

**Estimated Effort:** 20-30 hours

**Priority:** **HIGHEST**

---

#### 2. ⚠️ Request Backend Schema Documentation

**Status:** ⚠️ **High Priority**

**Tasks:**
- [ ] Contact backend team about missing pages table schema
- [ ] Request documentation for fields, types, constraints
- [ ] Document soft delete implementation (status-based vs deleted_at)
- [ ] Document JSON field storage type and size limit
- [ ] Validate frontend types against backend schema once available
- [ ] Update type definitions if mismatches found

**Estimated Effort:** 2-4 hours (validation after backend provides docs)

**Priority:** **HIGH**

---

#### 3. Request Backend Pagination Support

**Status:** 🟡 **Medium Priority**

**Tasks:**
- [ ] Document current client-side pagination limitations
- [ ] Request JSON:API pagination implementation in backend
- [ ] Request sorting support (`?sort=created_at&order=desc`)
- [ ] Request search filter support (`?filter[search]=keyword`)
- [ ] Update frontend to use backend pagination when available
- [ ] Add feature flag for backend vs client-side pagination

**Estimated Effort:** 4-6 hours

**Priority:** **MEDIUM**

---

### Short Term (1-2 sprints)

#### 4. Performance Optimizations

**Tasks:**
- [ ] Implement virtual scrolling for pages table (TanStack Virtual)
- [ ] Add code splitting for GrapeJS bundle
- [ ] Implement lazy loading for block categories
- [ ] Add compression for large GrapeJS JSON data
- [ ] Implement global localStorage cleanup mechanism
- [ ] Add performance monitoring (Web Vitals, React DevTools Profiler)

**Estimated Effort:** 10-15 hours

**Priority:** **MEDIUM**

---

#### 5. UX Improvements

**Tasks:**
- [ ] Add block search in GrapeJS panel
- [ ] Implement favorite blocks feature
- [ ] Add recent blocks panel
- [ ] Better block categorization
- [ ] Add undo/redo history persistence
- [ ] Implement auto-save for editor
- [ ] Add page templates library

**Estimated Effort:** 12-18 hours

**Priority:** **MEDIUM**

---

#### 6. Error Handling Improvements

**Tasks:**
- [ ] Add JSON size validation before save
- [ ] Implement retry logic for failed saves
- [ ] Add optimistic updates for better UX
- [ ] Improve error messages (user-friendly)
- [ ] Add conflict resolution UI for slug conflicts
- [ ] Implement draft auto-save

**Estimated Effort:** 8-12 hours

**Priority:** **MEDIUM**

---

### Medium Term (3-6 sprints)

#### 7. Advanced Features

**Tasks:**
- [ ] Page versioning system (save multiple versions)
- [ ] Page templates library (pre-built page designs)
- [ ] A/B testing support (multiple versions of same page)
- [ ] Page analytics integration (views, clicks, etc.)
- [ ] SEO metadata management (title, description, og tags)
- [ ] Media library integration
- [ ] Custom blocks builder (let users create custom blocks)

**Estimated Effort:** 40-60 hours

**Priority:** **LOW**

---

#### 8. Collaboration Features

**Tasks:**
- [ ] Multi-user editing (lock mechanism)
- [ ] Comments on pages
- [ ] Approval workflow (draft → review → published)
- [ ] Activity log (who changed what when)
- [ ] Page permissions (who can edit which pages)

**Estimated Effort:** 30-40 hours

**Priority:** **LOW**

---

### Long Term (Roadmap)

#### 9. Multi-Site Support

**Tasks:**
- [ ] Support multiple websites in one instance
- [ ] Site-specific themes and blocks
- [ ] Cross-site page duplication
- [ ] Site switching UI

**Estimated Effort:** 60-80 hours

**Priority:** **FUTURE**

---

#### 10. Mobile App Integration

**Tasks:**
- [ ] Mobile page preview
- [ ] Mobile-specific blocks
- [ ] Responsive design testing tools
- [ ] Mobile app for page editing

**Estimated Effort:** 80-100 hours

**Priority:** **FUTURE**

---

## Changelog

### [2025-11-01] - Initial Documentation (Sprint 2 - Module 1/5)

**Created comprehensive Page-Builder-Pro module documentation:**
- ✅ Documented single Page entity with soft delete support
- ✅ Documented 14 components (2,126 lines)
- ✅ Documented 7 hooks in 1 file (398 lines)
- ✅ Documented 13 service methods in 1 file (509 lines)
- ✅ Documented 50+ GrapeJS blocks (2,289 lines)
- ✅ Documented 7 GrapeJS plugins (696 lines)
- ✅ Documented Soft Delete Pattern with intelligent slug management
- ✅ Documented Slug Validation with conflict resolution
- ✅ Identified 6 gaps and discrepancies
- ⚠️ **Critical Finding**: No backend schema documentation (cannot validate)
- ⚠️ **Critical Finding**: Zero test coverage (violates 70% policy)
- ⚠️ **Critical Finding**: Client-side pagination (backend doesn't support yet)
- ✅ Provided 8 comprehensive usage examples
- ✅ Defined next steps and improvements

**Module Status:**
- ✅ **Functional**: Complete visual editor with CRUD operations
- ✅ **Soft Delete**: Full recovery system with slug transformation
- ✅ **GrapeJS**: 50+ professional blocks, Bootstrap integration
- ⚠️ **Backend Validation**: Not possible (no schema documentation)
- ⚠️ **Performance**: Client-side pagination (works for < 500 pages)
- ❌ **Testing**: 0% coverage (CRITICAL VIOLATION)
- ✅ **Documentation**: Complete (12 sections, ~2,400 lines)

---

**Last Updated**: 2025-11-01
**Documented By**: Claude (Frontend AI Assistant)
**Backend Schema Version**: ⚠️ **NOT AVAILABLE**
**Frontend Code Version**: Current (as of 2025-11-01)
**Total Lines**: 2,439 lines
**Sprint**: Sprint 2 - Module 1/5 (Page-Builder-Pro)
**Total Module Size**: 8,006 lines of code across 35 files
