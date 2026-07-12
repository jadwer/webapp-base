'use client'

/**
 * PRODUCT SEARCH HOOK (typeahead)
 *
 * Debounced product search intended for the topbar autocomplete. Wraps
 * publicProductsService.searchProducts and maps the enhanced products down to
 * a light suggestion shape (id, name, price, imageUrl) so the dropdown does not
 * carry the full JSON:API payload.
 *
 * The image is resolved from product.attributes.imageUrl, the computed field the
 * public schema already exposes for every product (same source used by
 * PublicProductCard). No extra include is needed for the primary thumbnail.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { publicProductsService } from '../services/publicProductsService'
import type { EnhancedPublicProduct } from '../types/publicProduct'

export interface ProductSearchResult {
  id: string
  name: string
  /** Formatted price string, e.g. "$100.00" (falls back to raw when needed). */
  displayPrice: string
  /** Currency code resolved from the product, defaults to MXN. */
  currency: string
  /** Absolute image URL or null when the product has no image. */
  imageUrl: string | null
}

export interface UseProductSearchResult {
  results: ProductSearchResult[]
  loading: boolean
  error: Error | null
}

function toSearchResult(product: EnhancedPublicProduct): ProductSearchResult {
  return {
    id: product.id,
    name: product.attributes.name,
    displayPrice: product.displayPrice,
    currency: product.displayCurrency,
    imageUrl: product.attributes.imageUrl
  }
}

const DEFAULT_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2
const RESULT_LIMIT = 8

/**
 * Debounced typeahead search hook.
 *
 * @param query   Raw input value. Trimmed internally.
 * @param options debounceMs (default 300), limit (default 8).
 */
export function useProductSearch(
  query: string,
  options?: { debounceMs?: number; limit?: number }
): UseProductSearchResult {
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS
  const limit = options?.limit ?? RESULT_LIMIT

  const [debounced, setDebounced] = useState('')
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Track the latest request so out-of-order responses do not overwrite newer ones.
  const requestIdRef = useRef(0)

  const trimmed = useMemo(() => query.trim(), [query])

  // Debounce the query value.
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(trimmed), debounceMs)
    return () => clearTimeout(handle)
  }, [trimmed, debounceMs])

  // Run the search whenever the debounced value changes.
  useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    const currentRequest = ++requestIdRef.current
    setLoading(true)
    setError(null)

    publicProductsService
      .searchProducts(debounced, { size: limit })
      .then(({ products }) => {
        if (currentRequest !== requestIdRef.current) return
        setResults(products.map(toSearchResult))
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (currentRequest !== requestIdRef.current) return
        setError(err instanceof Error ? err : new Error('Product search failed'))
        setResults([])
        setLoading(false)
      })
  }, [debounced, limit])

  return { results, loading, error }
}

export default useProductSearch
