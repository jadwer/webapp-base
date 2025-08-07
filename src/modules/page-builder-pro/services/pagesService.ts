import axios from '@/lib/axiosClient'
import type { Page, CreatePageData, UpdatePageData, PageFilters, PaginatedPages } from '../types/page'

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
    status: 'draft' | 'published' | 'archived'
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

interface JsonApiResponse {
  data: JsonApiPageResource[]
}

interface JsonApiSingleResponse {
  data: JsonApiPageResource
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

// Helper function to convert JsonApiPageResource to Page
function convertJsonApiToPage(item: JsonApiPageResource): Page {
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
    user: item.relationships?.user?.data ? {
      id: item.relationships.user.data.id,
      name: 'Usuario', // TODO: Get from included resources
      email: 'user@example.com' // TODO: Get from included resources
    } : undefined
  }
}

export class PagesService {
  
  static async getPages(filters: PageFilters = {}, page = 1, perPage = 15): Promise<PaginatedPages> {
    // For now, we'll fetch all pages and handle pagination/filtering on the frontend
    // since the API doesn't support the expected parameters yet
    
    const response = await axios.get<JsonApiResponse>(API_BASE)
    const allPages: Page[] = response.data.data.map(convertJsonApiToPage)

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
    const response = await axios.get<JsonApiSingleResponse>(`${API_BASE}/${id}`)
    return convertJsonApiToPage(response.data.data)
  }

  static async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const response = await axios.get<JsonApiResponse>(`${API_BASE}?filter[slug]=${slug}`)
      const pages = response.data.data
      return pages.length > 0 ? convertJsonApiToPage(pages[0]) : null
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
    
    const payload: JsonApiCreatePagePayload = {
      data: {
        type: 'pages',
        attributes
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
    return convertJsonApiToPage(response.data.data)
  }

  static async updatePage(id: string, data: UpdatePageData): Promise<Page> {
    const { userId, ...attributes } = data
    
    const payload: JsonApiUpdatePagePayload = {
      data: {
        type: 'pages',
        id,
        attributes
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
      return convertJsonApiToPage(response.data.data)
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
}