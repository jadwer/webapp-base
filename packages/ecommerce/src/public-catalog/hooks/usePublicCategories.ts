'use client'

/**
 * PUBLIC CATEGORIES HOOK
 *
 * Categories for the public catalog navigation (footer, product menu, facets)
 * WITHOUT authentication. The authenticated /api/v1/categories returns 401 to
 * guests, leaving the public nav empty; this reads /api/public/v1/public-categories
 * (index, only active). Same shape the consumers expect: {id, name, slug}.
 *
 * SEO Bloque 1: acepta `initialData` (categorias traidas en servidor con
 * fetchPublicCategoriesServer). Con initialData no hay fetch en el cliente ni
 * estado "Cargando...": el HTML del servidor ya trae el menu completo.
 */

import { useEffect, useState } from 'react'
import { axiosClient } from '@lwm/auth'
import {
  PUBLIC_CATEGORIES_PATH,
  mapPublicCategories,
  type JsonApiPublicCategory,
  type PublicCategorySummary,
} from '../services/publicCategoriesTransform'

/** Alias historico del hook (shape plano {id, name, slug}). */
export type PublicCategory = PublicCategorySummary
export type { PublicCategorySummary }

interface UsePublicCategoriesOptions {
  /** Max categories to fetch (default 100 — the full active list). */
  limit?: number
  /** Categorias prerenderizadas en servidor; si vienen, no se hace fetch. */
  initialData?: PublicCategorySummary[]
}

export function usePublicCategories(options: UsePublicCategoriesOptions = {}) {
  const { limit = 100, initialData } = options
  const hasInitial = Array.isArray(initialData)
  const [categories, setCategories] = useState<PublicCategorySummary[]>(initialData ?? [])
  const [isLoading, setIsLoading] = useState(!hasInitial)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (hasInitial) return

    let active = true

    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const response = await axiosClient.get<{ data: JsonApiPublicCategory[] }>(
          PUBLIC_CATEGORIES_PATH,
          { params: { 'page[size]': limit, sort: 'name' } }
        )

        if (!active) return

        setCategories(mapPublicCategories(response.data?.data))
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err : new Error('Error al cargar categorías'))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchCategories()
    return () => {
      active = false
    }
  }, [limit, hasInitial])

  return { categories, isLoading, error }
}
