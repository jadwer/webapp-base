import axios from '@/lib/axiosClient'
import type { 
  Page, 
  CreatePageData, 
  UpdatePageData, 
  PageFilters, 
  PaginatedPages,
  SlugCheckResult,
  SlugGenerationOptions,
  SoftDeleteResult,
  RestorePageOptions
} from '../types/page'

const API_BASE = '/api/v1/pages'

// JSON:API response types
interface JsonApiPageResource {
  id: string
  attributes: {
    title: string
    slug: string
    html: string
    css?: string
    json?: string | object // API might return string or parsed object
    status: 'draft' | 'published' | 'archived' | 'deleted'
    publishedAt: string | null // Keep for compatibility
    createdAt: string
    updatedAt: string
  }
  relationships?: {
    user?: {
      data: {
        id: string
        type: 'users'
      }
    }
  }
}

interface JsonApiUserResource {
  id: string
  type: 'users'
  attributes: {
    name: string
    email: string
  }
}

interface JsonApiResponse {
  data: JsonApiPageResource[]
  included?: JsonApiUserResource[]
}

interface JsonApiSingleResponse {
  data: JsonApiPageResource
  included?: JsonApiUserResource[]
}

// JSON:API request payload types
interface JsonApiCreatePagePayload {
  data: {
    type: 'pages'
    attributes: Omit<CreatePageData, 'userId'>
    relationships?: {
      user?: {
        data: { type: 'users'; id: string }
      }
    }
  }
}

interface JsonApiUpdatePagePayload {
  data: {
    type: 'pages'
    id: string
    attributes: Omit<UpdatePageData, 'userId' | 'id'>
    relationships?: {
      user?: {
        data: { type: 'users'; id: string }
      }
    }
  }
}

// Helper function to find user data from included resources
function findUserFromIncluded(userId: string, included?: JsonApiUserResource[]): { name: string; email: string } | undefined {
  if (!included) return undefined
  const user = included.find(inc => inc.type === 'users' && inc.id === userId)
  if (user) {
    return {
      name: user.attributes.name,
      email: user.attributes.email
    }
  }
  return undefined
}

// Helper function to convert JsonApiPageResource to Page
function convertJsonApiToPage(item: JsonApiPageResource, included?: JsonApiUserResource[]): Page {
  // Safely parse JSON field - could be string JSON, object, or empty
  let parsedJson: object | undefined = undefined
  
  if (item.attributes.json) {
    if (typeof item.attributes.json === 'string') {
      try {
        // Only attempt JSON.parse if it looks like JSON (starts with { or [)
        const trimmed = item.attributes.json.trim()
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          parsedJson = JSON.parse(item.attributes.json)
        } else {
          // If it's a string but not JSON format, keep it undefined for now
          console.warn('JSON field contains non-JSON string:', item.attributes.json.substring(0, 100))
        }
      } catch (error) {
        console.warn('Failed to parse JSON field for page', item.id, ':', error)
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
    user: item.relationships?.user?.data ? (() => {
      const userId = item.relationships.user.data.id
      const userData = findUserFromIncluded(userId, included)
      return {
        id: userId,
        name: userData?.name ?? 'Usuario',
        email: userData?.email ?? ''
      }
    })() : undefined
  }
}

export class PagesService {
  
  static async getPages(filters: PageFilters = {}, page = 1, perPage = 15): Promise<PaginatedPages> {
    // For now, we'll fetch all pages and handle pagination/filtering on the frontend
    // since the API doesn't support the expected parameters yet
    
    const response = await axios.get<JsonApiResponse>(API_BASE, { params: { include: 'user' } })
    const allPages: Page[] = response.data.data.map(item => convertJsonApiToPage(item, response.data.included))

    // Client-side filtering and pagination
    let filteredPages = allPages

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredPages = filteredPages.filter(page => 
        page.title.toLowerCase().includes(searchLower) || 
        page.slug.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status) {
      filteredPages = filteredPages.filter(page => {
        return page.status === filters.status
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredPages.sort((a, b) => {
        let aValue: string, bValue: string
        
        switch (filters.sortBy) {
          case 'title':
            aValue = a.title || ''
            bValue = b.title || ''
            break
          case 'created_at':
            aValue = a.createdAt || ''
            bValue = b.createdAt || ''
            break
          case 'updated_at':
            aValue = a.updatedAt || ''
            bValue = b.updatedAt || ''
            break
          default:
            aValue = a.createdAt || ''
            bValue = b.createdAt || ''
        }

        // Ensure we have valid strings for comparison
        const safeAValue = String(aValue || '')
        const safeBValue = String(bValue || '')
        
        const comparison = safeAValue.localeCompare(safeBValue)
        return filters.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    // Apply pagination
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
      links: {
        first: null,
        last: null,
        prev: page > 1 ? 'prev' : null,
        next: page < Math.ceil(total / perPage) ? 'next' : null
      }
    }
  }

  static async getPage(id: string): Promise<Page> {
    const response = await axios.get<JsonApiSingleResponse>(`${API_BASE}/${id}`, { params: { include: 'user' } })
    return convertJsonApiToPage(response.data.data, response.data.included)
  }

  static async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const response = await axios.get<JsonApiResponse>(`${API_BASE}?filter[slug]=${slug}&include=user`)
      const pages = response.data.data
      return pages.length > 0 ? convertJsonApiToPage(pages[0], response.data.included) : null
    } catch (error) {
      console.error('Error fetching page by slug:', error)
      return null
    }
  }

  static async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await axios.get<JsonApiResponse>(`${API_BASE}?filter[slug]=${slug}`)
      const pages = response.data.data
      
      if (!pages || pages.length === 0) return false
      
      // If we're excluding a specific ID (for editing), check if any other page has this slug
      if (excludeId) {
        return pages.some((page: JsonApiPageResource) => page.id !== excludeId)
      }
      
      // For new pages, any existing page with this slug means it exists
      return pages.length > 0
    } catch (error) {
      console.error('Error checking slug existence:', error)
      return false
    }
  }

  static async createPage(data: CreatePageData): Promise<Page> {
    const { userId, ...attributes } = data
    
    // Handle publishedAt logic: set it if page is created as 'published'
    const finalAttributes = { ...attributes }
    if (data.status === 'published') {
      finalAttributes.publishedAt = new Date().toISOString()
    }
    
    const payload: JsonApiCreatePagePayload = {
      data: {
        type: 'pages',
        attributes: finalAttributes
      }
    }
    
    // Add relationships if userId is provided
    if (userId) {
      payload.data.relationships = {
        user: {
          data: { type: 'users', id: userId }
        }
      }
    }
    
    const response = await axios.post<JsonApiSingleResponse>(API_BASE, payload)
    return convertJsonApiToPage(response.data.data, response.data.included)
  }

  static async updatePage(id: string, data: UpdatePageData): Promise<Page> {
    const { userId, ...attributes } = data
    
    // Handle publishedAt logic: set it only once when status changes to 'published'
    const finalAttributes = { ...attributes }
    
    // If status is being changed to 'published', we need to check if publishedAt should be set
    if (data.status === 'published') {
      try {
        // Get current page to check if publishedAt is already set
        const currentPage = await this.getPage(id)
        
        // Only set publishedAt if it's not already set (first time publishing)
        if (!currentPage.publishedAt) {
          finalAttributes.publishedAt = new Date().toISOString()
        }
      } catch (error) {
        console.error('Error checking current page for publishedAt logic:', error)
        // If we can't get the current page, set publishedAt anyway for safety
        finalAttributes.publishedAt = new Date().toISOString()
      }
    }
    
    const payload: JsonApiUpdatePagePayload = {
      data: {
        type: 'pages',
        id,
        attributes: finalAttributes
      }
    }
    
    // Add relationships if userId is provided
    if (userId) {
      payload.data.relationships = {
        user: {
          data: { type: 'users', id: userId }
        }
      }
    }
    try {
      const response = await axios.patch<JsonApiSingleResponse>(`${API_BASE}/${id}`, payload)
      return convertJsonApiToPage(response.data.data, response.data.included)
    } catch (error) {
      console.error('PATCH request failed:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } }
        console.error('Response status:', axiosError.response.status)
        console.error('Response data:', axiosError.response.data)
      }
      throw error
    }
  }

  static async deletePage(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`)
  }

  static async duplicatePage(id: string, newTitle?: string): Promise<Page> {
    const originalPage = await this.getPage(id)
    
    const duplicatedData: CreatePageData = {
      title: newTitle || `${originalPage.title} (Copia)`,
      slug: `${originalPage.slug}-copy-${Date.now()}`,
      html: originalPage.html,
      css: originalPage.css,
      json: originalPage.json,
      status: 'draft' // Always create drafts when duplicating
    }

    return this.createPage(duplicatedData)
  }

  // ============================================
  // SOFT DELETE & SLUG MANAGEMENT METHODS
  // ============================================

  /**
   * Soft delete a page by changing its status to 'deleted' and transforming its slug
   */
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

  /**
   * Restore a soft-deleted page
   */
  static async restorePage(id: string, options: RestorePageOptions = {}): Promise<Page> {
    const page = await this.getPage(id)
    
    if (page.status !== 'deleted') {
      throw new Error('Page is not deleted')
    }
    
    // Extract original slug from deleted slug or use provided slug
    const originalSlug = this.extractOriginalSlugFromDeleted(page.slug)
    let newSlug = options.newSlug || originalSlug
    
    // Ensure slug is unique
    newSlug = await this.generateUniqueSlug({ baseSlug: newSlug, excludeId: id })
    
    return this.updatePage(id, {
      status: 'draft', // Restore as draft by default
      slug: newSlug,
      title: options.newTitle || page.title
    })
  }

  /**
   * Get all deleted pages
   */
  static async getDeletedPages(): Promise<Page[]> {
    try {
      const allPages = await this.getPages({ status: 'deleted' }, 1, 1000)
      return allPages.data.filter(page => page.status === 'deleted')
    } catch (error) {
      console.error('Error in getDeletedPages:', error)
      // Return empty array instead of throwing to prevent UI errors
      return []
    }
  }

  /**
   * Generate a unique slug by auto-incrementing if necessary
   */
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

  /**
   * Check if a slug is taken, with options to exclude certain pages and include deleted ones
   */
  static async isSlugTaken(slug: string, excludeId?: string, includeDeleted = false): Promise<boolean> {
    try {
      const response = await axios.get<JsonApiResponse>(`${API_BASE}?filter[slug]=${slug}`)
      const pages = response.data.data
      
      if (!pages || pages.length === 0) return false
      
      // Filter out excluded page and optionally deleted pages
      const filteredPages = pages.filter((page: JsonApiPageResource) => {
        if (excludeId && page.id === excludeId) return false
        if (!includeDeleted && page.attributes.status === 'deleted') return false
        return true
      })
      
      return filteredPages.length > 0
    } catch (error) {
      console.error('Error checking if slug is taken:', error)
      return false
    }
  }

  /**
   * Advanced slug checking with suggestions
   */
  static async checkSlugAvailability(slug: string, excludeId?: string): Promise<SlugCheckResult> {
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

  /**
   * Extract original slug from a deleted slug
   * Example: "my-page-deleted-1641234567890" -> "my-page"
   */
  private static extractOriginalSlugFromDeleted(deletedSlug: string): string {
    const match = deletedSlug.match(/^(.+)-deleted-\d+$/)
    return match ? match[1] : deletedSlug
  }

  /**
   * Permanently delete a page (hard delete)
   */
  static async permanentlyDeletePage(id: string): Promise<void> {
    const page = await this.getPage(id)
    
    if (page.status !== 'deleted') {
      throw new Error('Page must be soft deleted first')
    }
    
    await axios.delete(`${API_BASE}/${id}`)
  }

  /**
   * Get all published pages for navigation (public use)
   */
  static async getPublishedPagesForNavigation(): Promise<Array<{ id: string; title: string; slug: string }>> {
    try {
      const response = await axios.get<JsonApiResponse>(`${API_BASE}?filter[status]=published`)
      const pages = response.data.data || []

      return pages
        .filter((page: JsonApiPageResource) => page.attributes.status === 'published')
        .map((page: JsonApiPageResource) => ({
          id: page.id,
          title: page.attributes.title,
          slug: page.attributes.slug
        }))
        .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically by title
    } catch (error) {
      console.error('Error fetching published pages for navigation:', error)
      return []
    }
  }

  /**
   * Get published page by slug using public endpoint (no auth required)
   * Used for public website pages (about-us, terms, privacy, etc.)
   */
  static async getPublicPageBySlug(slug: string): Promise<Page | null> {
    try {
      const response = await axios.get<JsonApiSingleResponse>(`/api/public/v1/pages/${slug}`)
      return convertJsonApiToPage(response.data.data, response.data.included)
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 404) {
          return null
        }
      }
      console.error('Error fetching public page by slug:', error)
      return null
    }
  }
}