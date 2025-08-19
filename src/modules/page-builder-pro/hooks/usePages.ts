'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useSWR, { mutate } from 'swr'
import { PagesService } from '../services/pagesService'
import type { 
  Page, 
  CreatePageData, 
  UpdatePageData, 
  PageFilters, 
  SlugCheckResult,
  SoftDeleteResult,
  RestorePageOptions 
} from '../types/page'

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
    async () => {
      if (!id) return null
      
      try {
        // Intentar obtener desde API primero
        return await PagesService.getPage(id)
      } catch (apiError) {
        console.warn('API fetch failed, trying localStorage fallback:', apiError)
        
        // 🔧 FALLBACK: Buscar en localStorage si API falla (útil para páginas recién creadas)
        const tempPageKey = `temp-page-${id}`
        const tempPageData = localStorage.getItem(tempPageKey)
        
        if (tempPageData) {
          try {
            const pageData = JSON.parse(tempPageData)
            
            // Verificar que no sea muy antiguo (cleanup de 10 minutos)
            const now = Date.now()
            const isRecent = now - pageData.timestamp < 10 * 60 * 1000
            
            if (isRecent) {
              console.log('✅ Using temporary page data from localStorage')
              
              // Cleanup del localStorage después de usar
              setTimeout(() => {
                localStorage.removeItem(tempPageKey)
                console.log('🧹 Cleaned up temporary page data')
              }, 2000)
              
              return pageData
            } else {
              // Cleanup de datos antiguos
              localStorage.removeItem(tempPageKey)
              console.log('🧹 Removed expired temporary page data')
            }
          } catch (parseError) {
            console.error('Error parsing temporary page data:', parseError)
            localStorage.removeItem(tempPageKey)
          }
        }
        
        // Si todo falló, lanzar el error original
        throw apiError
      }
    },
    {
      revalidateOnFocus: false,
      retryInterval: 2000, // Retry cada 2 segundos
      retryWhen: () => true, // Siempre hacer retry en errores
      retryCount: 5, // Máximo 5 intentos
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

// ============================================
// SOFT DELETE HOOKS
// ============================================

export function useSoftDeleteActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const softDeletePage = async (id: string): Promise<SoftDeleteResult | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await PagesService.softDeletePage(id)
      
      // Invalidate caches
      await mutate((key: string) => key.startsWith('pages-'))
      await mutate(`page-${id}`)
      
      return result
    } catch (err) {
      console.error('Error soft deleting page:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la página'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const restorePage = async (id: string, options: RestorePageOptions = {}): Promise<Page | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const page = await PagesService.restorePage(id, options)
      
      // Invalidate caches
      await mutate((key: string) => key.startsWith('pages-'))
      await mutate(`page-${id}`)
      
      return page
    } catch (err) {
      console.error('Error restoring page:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al restaurar la página'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const permanentlyDeletePage = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      await PagesService.permanentlyDeletePage(id)
      
      // Invalidate caches
      mutate((key: string) => key.startsWith('pages-') || key === `page-${id}`)
      
      return true
    } catch (err) {
      console.error('Error permanently deleting page:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar permanentemente la página')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    softDeletePage,
    restorePage,
    permanentlyDeletePage,
    isLoading,
    error
  }
}

export function useDeletedPages() {
  const { data, error, isLoading } = useSWR(
    'deleted-pages',
    async () => {
      try {
        return await PagesService.getDeletedPages()
      } catch (err) {
        console.error('Error fetching deleted pages:', err)
        throw err
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      onError: (error) => {
        console.error('SWR error in useDeletedPages:', error)
      }
    }
  )

  const refreshDeletedPages = () => mutate('deleted-pages')

  return {
    deletedPages: data || [],
    isLoading,
    error,
    refreshDeletedPages
  }
}

// ============================================
// SLUG VALIDATION HOOKS  
// ============================================

export function useSlugValidation(initialSlug = '', excludeId?: string) {
  const [slug, setSlug] = useState(initialSlug)
  const [slugResult, setSlugResult] = useState<SlugCheckResult>({ exists: false })
  const [isChecking, setIsChecking] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck.trim()) {
      setSlugResult({ exists: false })
      return
    }

    setIsChecking(true)
    try {
      const result = await PagesService.checkSlugAvailability(slugToCheck, excludeId)
      setSlugResult(result)
    } catch (error) {
      console.error('Error checking slug availability:', error)
      setSlugResult({ exists: false })
    } finally {
      setIsChecking(false)
    }
  }, [excludeId])

  // Debounced slug checking using ref instead of state
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      checkSlugAvailability(slug)
    }, 300) // 300ms debounce

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [slug, checkSlugAvailability])

  const updateSlug = (newSlug: string) => {
    setSlug(newSlug)
  }

  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    try {
      return await PagesService.generateUniqueSlug({ 
        baseSlug, 
        excludeId,
        includeDeleted: false 
      })
    } catch (error) {
      console.error('Error generating unique slug:', error)
      return baseSlug
    }
  }

  return {
    slug,
    updateSlug,
    slugResult,
    isChecking,
    generateUniqueSlug,
    isAvailable: !slugResult.exists && !isChecking,
    suggestions: slugResult.suggestions || []
  }
}