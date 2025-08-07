'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { PagesService } from '../services/pagesService'
import type { Page, CreatePageData, UpdatePageData, PageFilters } from '../types/page'

export function usePages(filters: PageFilters = {}, page = 1, perPage = 15) {
  const cacheKey = `pages-${JSON.stringify(filters)}-${page}-${perPage}`
  
  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => PagesService.getPages(filters, page, perPage),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const refreshPages = () => mutate(cacheKey)

  return {
    pages: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    refreshPages
  }
}

export function usePage(id: string | null | undefined) {
  const { data, error, isLoading } = useSWR(
    id ? `page-${id}` : null,
    () => id ? PagesService.getPage(id) : null,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    page: data,
    isLoading,
    error
  }
}

export function usePageActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPage = async (data: CreatePageData): Promise<Page | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const page = await PagesService.createPage(data)
      
      // Invalidate all related caches
      await mutate((key: string) => key.startsWith('pages-'))
      await mutate((key: string) => key.startsWith('page-'))
      
      return page
    } catch (err) {
      console.error('Error creating page:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la página'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updatePage = async (id: string, data: UpdatePageData): Promise<Page | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const page = await PagesService.updatePage(id, data)
      
      // Invalidate all related caches  
      await mutate((key: string) => key.startsWith('pages-'))
      await mutate((key: string) => key.startsWith('page-'))
      await mutate(`page-${id}`)
      
      return page
    } catch (err) {
      console.error('Error updating page:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la página'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deletePage = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      await PagesService.deletePage(id)
      
      // Invalidate caches
      mutate((key: string) => key.startsWith('pages-') || key === `page-${id}`)
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la página')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const duplicatePage = async (id: string, newTitle?: string): Promise<Page | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const page = await PagesService.duplicatePage(id, newTitle)
      
      // Invalidate pages cache
      mutate((key: string) => key.startsWith('pages-'))
      
      return page
    } catch (err) {
      console.error('Error duplicating page:', err)
      setError(err instanceof Error ? err.message : 'Error al duplicar la página')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
    isLoading,
    error
  }
}