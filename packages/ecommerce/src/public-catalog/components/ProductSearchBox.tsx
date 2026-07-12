'use client'

/**
 * PRODUCT SEARCH BOX (typeahead / autocomplete)
 *
 * Topbar search input with an absolute dropdown of product suggestions. Each
 * suggestion shows a thumbnail (with a fallback icon when the product has no
 * image), the product name and its formatted price. Selecting a suggestion
 * navigates to /productos/{id} (the public catalog detail route).
 *
 * Lives in @lwm/ecommerce because it depends on the public catalog search
 * service. @lwm/ui cannot own it: ui must not depend on ecommerce (ecommerce
 * already depends on ui, so the reverse edge would create a cycle). Consumers
 * mount it via the PublicHeader `search` slot from their (front) layout.
 *
 * Styling uses the project design system (Bootstrap 5 utilities) so it matches
 * other dropdowns/inputs in the catalog. No SCSS module, consistent with the
 * other public-catalog components.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProductSearch } from '../hooks/useProductSearch'

export interface ProductSearchBoxProps {
  /** Placeholder text for the input. */
  placeholder?: string
  /** Debounce delay in ms (default 300). */
  debounceMs?: number
  /** Max number of suggestions to show (default 8). */
  limit?: number
  /** Extra classes for the outer wrapper (e.g. width control). */
  className?: string
  /** Accessible label for the input. */
  ariaLabel?: string
}

export const ProductSearchBox: React.FC<ProductSearchBoxProps> = ({
  placeholder = 'Buscar productos...',
  debounceMs = 300,
  limit = 8,
  className = '',
  ariaLabel = 'Buscar productos'
}) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)

  const { results, loading } = useProductSearch(query, { debounceMs, limit })

  const trimmed = useMemo(() => query.trim(), [query])
  const showDropdown = open && trimmed.length >= 2

  // Reset the keyboard highlight whenever the result set changes.
  useEffect(() => {
    setActiveIndex(-1)
  }, [results])

  // Close on click outside.
  useEffect(() => {
    if (!showDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const goToProduct = useCallback(
    (id: string) => {
      setOpen(false)
      setQuery('')
      router.push(`/productos/${id}`)
    },
    [router]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) {
      if (event.key === 'Escape') setOpen(false)
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
        break
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < results.length) {
          event.preventDefault()
          goToProduct(results[activeIndex].id)
        }
        break
      case 'Escape':
        setOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className={`position-relative ${className}`}
      style={{ minWidth: '240px', maxWidth: '420px' }}
    >
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted" />
        </span>
        <input
          type="search"
          className="form-control border-start-0 ps-0"
          placeholder={placeholder}
          aria-label={ariaLabel}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="product-search-listbox"
          aria-autocomplete="list"
        />
      </div>

      {showDropdown && (
        <div
          id="product-search-listbox"
          role="listbox"
          className="position-absolute start-0 end-0 mt-1 bg-white border rounded shadow"
          style={{ zIndex: 1050, maxHeight: '360px', overflowY: 'auto' }}
        >
          {loading && results.length === 0 && (
            <div className="d-flex align-items-center gap-2 px-3 py-3 text-muted">
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
              <span>Buscando...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-3 py-3 text-muted text-center">Sin coincidencias</div>
          )}

          {results.map((result, index) => (
            <button
              key={result.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`d-flex align-items-center gap-2 w-100 text-start border-0 px-3 py-2 ${
                index === activeIndex ? 'bg-light' : 'bg-white'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => goToProduct(result.id)}
            >
              <ProductThumbnail imageUrl={result.imageUrl} alt={result.name} />
              <span className="flex-grow-1 text-truncate">
                <span className="d-block text-truncate">{result.name}</span>
                <small className="text-primary fw-semibold">{result.displayPrice}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Thumbnail with graceful fallback. Uses a plain img (not next/image) because
 * suggestions are tiny and the source host varies per tenant; onError swaps to
 * the same neutral icon PublicProductCard shows when a product has no image.
 */
const ProductThumbnail: React.FC<{ imageUrl: string | null; alt: string }> = ({
  imageUrl,
  alt
}) => {
  const [failed, setFailed] = useState(false)
  const size = 40

  if (!imageUrl || failed) {
    return (
      <span
        className="d-inline-flex align-items-center justify-content-center bg-light rounded flex-shrink-0"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <i className="bi bi-image text-muted" />
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      width={size}
      height={size}
      className="rounded flex-shrink-0 object-fit-cover"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  )
}

export default ProductSearchBox
