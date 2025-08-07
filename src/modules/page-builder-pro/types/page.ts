// Page types for Page Builder Pro module
export interface Page {
  id: string
  title: string
  slug: string
  html: string
  css: string
  json: object // GrapeJS data
  publishedAt: string | null // API uses published_at, mapped to publishedAt
  createdAt: string // API uses created_at, mapped to createdAt  
  updatedAt: string // API uses updated_at, mapped to updatedAt
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface CreatePageData {
  title: string
  slug: string
  html: string
  css: string
  json: object
  publishedAt?: string | null // null = draft, date = published
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