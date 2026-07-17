'use client'

/**
 * PUBLIC CATEGORIES HOOK
 *
 * Categories for the public catalog navigation (footer, product menu, facets)
 * WITHOUT authentication. The authenticated /api/v1/categories returns 401 to
 * guests, leaving the public nav empty; this reads /api/public/v1/public-categories
 * (index, only active). Same shape the consumers expect: {id, name, slug}.
 */

import { useEffect, useState } from 'react'
import { axiosClient } from '@lwm/auth'

export interface PublicCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  productsCount?: number
}

interface UsePublicCategoriesOptions {
  /** Max categories to fetch (default 100 — the full active list). */
  limit?: number
}

interface JsonApiCategory {
  id: string
  attributes?: {
    name?: string
    slug?: string
    description?: string | null
    productsCount?: number
  }
}

export function usePublicCategories(options: UsePublicCategoriesOptions = {}) {
  const { limit = 100 } = options
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true

    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const response = await axiosClient.get<{ data: JsonApiCategory[] }>(
          '/api/public/v1/public-categories',
          { params: { 'page[size]': limit, sort: 'name' } }
        )

        if (!active) return

        const mapped: PublicCategory[] = (response.data?.data ?? []).map((c) => ({
          id: c.id,
          name: c.attributes?.name ?? '',
          slug: c.attributes?.slug ?? '',
          description: c.attributes?.description ?? null,
          productsCount: c.attributes?.productsCount,
        }))
        setCategories(mapped)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err : new Error('Error al cargar categorias'))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchCategories()
    return () => {
      active = false
    }
  }, [limit])

  return { categories, isLoading, error }
}
