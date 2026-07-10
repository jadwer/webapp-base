'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { satCatalogsService } from '../services/satCatalogsService'
import type { SatClaveProdServ, SatClaveUnidad } from '../services/satCatalogsService'

const DEBOUNCE_MS = 300
const SEARCH_MIN_LENGTH = 2

type SatCatalogKind = 'claveProdServ' | 'claveUnidad'

/**
 * Union de los dos catalogos SAT soportados, discriminada por el hook que
 * la solicita (ver useSatCatalogSearch más abajo).
 */
export type SatCatalogResult<K extends SatCatalogKind> = K extends 'claveProdServ'
  ? SatClaveProdServ
  : SatClaveUnidad

/**
 * Hook generico de busqueda con debounce para los catalogos SAT (clave
 * producto/servicio y clave de unidad). No busca con menos de
 * SEARCH_MIN_LENGTH (2) caracteres para evitar listas gigantes/ruido.
 *
 * Usado por SatKeyCombobox; no usa SWR porque la busqueda es transitoria
 * (dropdown de tipeo) y no necesita cache entre renders del formulario.
 */
function useSatCatalogSearch<K extends SatCatalogKind>(
  kind: K
): {
  term: string
  setTerm: (term: string) => void
  results: SatCatalogResult<K>[]
  isSearching: boolean
} {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<SatCatalogResult<K>[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const requestIdRef = useRef(0)

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      setResults([])
      setIsSearching(false)
      return
    }

    const requestId = ++requestIdRef.current
    setIsSearching(true)
    try {
      const data =
        kind === 'claveProdServ'
          ? await satCatalogsService.searchClaveProdServ(trimmed)
          : await satCatalogsService.searchClaveUnidad(trimmed)

      // Descarta respuestas fuera de orden (el usuario siguio escribiendo)
      if (requestId !== requestIdRef.current) return
      setResults(data as SatCatalogResult<K>[])
    } catch {
      if (requestId !== requestIdRef.current) return
      setResults([])
    } finally {
      if (requestId === requestIdRef.current) setIsSearching(false)
    }
  }, [kind])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (term.trim().length < SEARCH_MIN_LENGTH) {
      setResults([])
      setIsSearching(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(term)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [term, runSearch])

  return { term, setTerm, results, isSearching }
}

export function useSatClaveProdServSearch() {
  return useSatCatalogSearch('claveProdServ')
}

export function useSatClaveUnidadSearch() {
  return useSatCatalogSearch('claveUnidad')
}

export { useSatCatalogSearch }
