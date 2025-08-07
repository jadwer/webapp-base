import axios from '@/lib/axiosClient'
import type { Page, CreatePageData, UpdatePageData, PageFilters, PaginatedPages } from '../types/page'

const API_BASE = '/api/v1/pages'

export class PagesService {
  
  static async getPages(filters: PageFilters = {}, page = 1, perPage = 15): Promise<PaginatedPages> {
    // For now, we'll fetch all pages and handle pagination/filtering on the frontend
    // since the API doesn't support the expected parameters yet
    
    const response = await axios.get(API_BASE)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allPages: Page[] = response.data.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      slug: item.attributes.slug,
      html: item.attributes.html,
      css: item.attributes.css,
      json: item.attributes.json,
      publishedAt: item.attributes.publishedAt, // Backend ya devuelve en camelCase
      createdAt: item.attributes.createdAt,     // Backend ya devuelve en camelCase
      updatedAt: item.attributes.updatedAt,     // Backend ya devuelve en camelCase
      user: item.attributes.user
    }))

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

    // Apply status filter (convert publishedAt to status concept)
    if (filters.status) {
      filteredPages = filteredPages.filter(page => {
        if (filters.status === 'published') return page.publishedAt !== null
        if (filters.status === 'draft') return page.publishedAt === null
        return true // 'archived' not supported yet
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
    const response = await axios.get(`${API_BASE}/${id}`)
    const item = response.data.data
    
    return {
      id: item.id,
      title: item.attributes.title,
      slug: item.attributes.slug,
      html: item.attributes.html,
      css: item.attributes.css,
      json: item.attributes.json,
      publishedAt: item.attributes.publishedAt,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      user: item.attributes.user
    }
  }

  static async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const response = await axios.get(`${API_BASE}?filter[slug]=${slug}`)
      const pages = response.data.data
      return pages.length > 0 ? pages[0] : null
    } catch (error) {
      console.error('Error fetching page by slug:', error)
      return null
    }
  }

  static async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE}?filter[slug]=${slug}`)
      const pages = response.data.data
      
      if (!pages || pages.length === 0) return false
      
      // If we're excluding a specific ID (for editing), check if any other page has this slug
      if (excludeId) {
        return pages.some((page: any) => page.id !== excludeId)
      }
      
      // For new pages, any existing page with this slug means it exists
      return pages.length > 0
    } catch (error) {
      console.error('Error checking slug existence:', error)
      return false
    }
  }

  static async createPage(data: CreatePageData): Promise<Page> {
    const payload = {
      data: {
        type: 'pages',
        attributes: data
      }
    }
    const response = await axios.post(API_BASE, payload)
    
    const item = response.data.data
    return {
      id: item.id,
      title: item.attributes.title,
      slug: item.attributes.slug,
      html: item.attributes.html,
      css: item.attributes.css,
      json: item.attributes.json,
      publishedAt: item.attributes.publishedAt,
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      user: item.attributes.user
    }
  }

  static async updatePage(id: string, data: UpdatePageData): Promise<Page> {
    const payload = {
      data: {
        type: 'pages',
        id,
        attributes: data
      }
    }
    try {
      const response = await axios.patch(`${API_BASE}/${id}`, payload)
      
      const item = response.data.data
      return {
        id: item.id,
        title: item.attributes.title,
        slug: item.attributes.slug,
        html: item.attributes.html,
        css: item.attributes.css,
        json: item.attributes.json,
        publishedAt: item.attributes.publishedAt,
        createdAt: item.attributes.createdAt,
        updatedAt: item.attributes.updatedAt,
        user: item.attributes.user
      }
    } catch (error) {
      console.error('PATCH request failed:', error)
      if ((error as any).response) {
        console.error('Response status:', (error as any).response.status)
        console.error('Response data:', (error as any).response.data)
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
      publishedAt: null // Always create drafts when duplicating
    }

    return this.createPage(duplicatedData)
  }
}