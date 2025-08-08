// Page types for Page Builder Pro module
export interface Page extends Record<string, unknown> {
  id: string
  title: string
  slug: string
  html: string
  css?: string
  json?: object // GrapeJS data
  status: 'draft' | 'published' | 'archived' | 'deleted' // New status field with soft delete support
  publishedAt: string | null // Keep for compatibility, but status is now primary
  createdAt: string // API uses created_at, mapped to createdAt  
  updatedAt: string // API uses updated_at, mapped to updatedAt
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface CreatePageData {
  title: string
  slug: string
  html: string
  css?: string
  json?: object
  status: 'draft' | 'published' | 'archived' | 'deleted' // Use status instead of publishedAt
  publishedAt?: string | null // Automatically managed, but included for API compatibility
  userId?: string // For relationships
}

export interface UpdatePageData extends Partial<CreatePageData> {
  id?: string
}

export interface PageFilters {
  search?: string
  status?: string
  sortBy?: 'created_at' | 'updated_at' | 'title'
  sortOrder?: 'asc' | 'desc'
}

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

// Slug management types
export interface SlugCheckResult {
  exists: boolean
  suggestions?: string[]
}

export interface SlugGenerationOptions {
  baseSlug: string
  excludeId?: string
  includeDeleted?: boolean
}

// Soft delete related types
export interface SoftDeleteResult {
  page: Page
  originalSlug: string
  deletedSlug: string
}

export interface RestorePageOptions {
  newSlug?: string
  newTitle?: string
}