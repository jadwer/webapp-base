'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { productService } from '../services/productService'
import type { Product } from '../types/product'

export interface ProductSearchOption {
  id: string
  name: string
  sku?: string
}

export interface ProductSearchSelectProps {
  /** Id del producto seleccionado ('' o null = sin seleccion) */
  value: string | null | undefined
  onChange: (id: string, product?: ProductSearchOption) => void
  /** Etiqueta conocida del valor inicial; evita la consulta extra al editar */
  initialProduct?: ProductSearchOption | null
  label?: string
  placeholder?: string
  helpText?: string
  errorText?: string
  required?: boolean
  disabled?: boolean
  id?: string
  /** Ids que no deben ofrecerse (p.ej. el producto origen en una conversion) */
  excludeIds?: string[]
  /** Solo productos activos (filter[is_active]=1) */
  onlyActive?: boolean
  /** Milisegundos de espera antes de buscar */
  debounceMs?: number
  /** Caracteres minimos para buscar */
  minChars?: number
  className?: string
}

const PAGE_SIZE = 20

function toOption(product: Product | ProductSearchOption): ProductSearchOption {
  return { id: String(product.id), name: product.name, sku: product.sku || undefined }
}

/**
 * Selector de producto con busqueda en el backend (filter[search]).
 * El valor es siempre un id real devuelto por la API: no hay captura libre.
 */
export const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  value,
  onChange,
  initialProduct,
  label = 'Producto',
  placeholder = 'Buscar por nombre o SKU',
  helpText,
  errorText,
  required = false,
  disabled = false,
  id,
  excludeIds,
  onlyActive = true,
  debounceMs = 300,
  minChars = 2,
  className = 'mb-3',
}) => {
  const autoId = useId()
  const inputId = id || autoId
  const containerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef(0)

  const [selected, setSelected] = useState<ProductSearchOption | null>(
    initialProduct && value && String(initialProduct.id) === String(value) ? toOption(initialProduct) : null
  )
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<ProductSearchOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingValue, setIsLoadingValue] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const currentId = value ? String(value) : ''

  // Sincroniza la etiqueta cuando el valor cambia desde afuera
  useEffect(() => {
    if (!currentId) {
      setSelected(null)
      return
    }
    if (selected && selected.id === currentId) return
    if (initialProduct && String(initialProduct.id) === currentId) {
      setSelected(toOption(initialProduct))
      return
    }

    let cancelled = false
    setIsLoadingValue(true)
    productService
      .getProduct(currentId)
      .then((response) => {
        if (!cancelled && response?.data) setSelected(toOption(response.data))
      })
      .catch(() => {
        if (!cancelled) setSelected({ id: currentId, name: `Producto #${currentId}` })
      })
      .finally(() => {
        if (!cancelled) setIsLoadingValue(false)
      })
    return () => {
      cancelled = true
    }
    // selected se omite a proposito: solo reacciona al valor externo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, initialProduct?.id])

  // Busqueda con debounce
  useEffect(() => {
    const trimmed = term.trim()
    if (trimmed.length < minChars) {
      setResults([])
      setIsSearching(false)
      return
    }

    const requestId = ++requestRef.current
    setIsSearching(true)
    const timer = setTimeout(() => {
      productService
        .getProducts({
          filters: { name: trimmed, ...(onlyActive ? { isActive: true } : {}) },
          page: { size: PAGE_SIZE },
          sort: { field: 'name', direction: 'asc' },
        })
        .then((response) => {
          if (requestId !== requestRef.current) return
          setResults((response.data || []).map(toOption))
          setSearchError(null)
        })
        .catch(() => {
          if (requestId !== requestRef.current) return
          setResults([])
          setSearchError('No se pudo buscar productos')
        })
        .finally(() => {
          if (requestId === requestRef.current) setIsSearching(false)
        })
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [term, minChars, onlyActive, debounceMs])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const excluded = new Set((excludeIds || []).filter(Boolean).map(String))
  const options = results.filter((option) => !excluded.has(option.id))

  const handleSelect = (option: ProductSearchOption) => {
    setSelected(option)
    setTerm('')
    setResults([])
    setIsOpen(false)
    onChange(option.id, option)
  }

  const handleClear = () => {
    setSelected(null)
    setTerm('')
    setResults([])
    setIsOpen(false)
    onChange('')
  }

  const trimmedTerm = term.trim()
  const showDropdown = isOpen && trimmedTerm.length >= minChars && !isSearching
  const showSummary = Boolean(currentId) && (Boolean(selected) || isLoadingValue)

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}

      {showSummary ? (
        <div
          className={`d-flex align-items-center gap-2 border rounded px-2 py-2 bg-light${errorText ? ' border-danger' : ''}`}
          data-testid="product-search-selected"
        >
          <div className="flex-grow-1 small">
            {isLoadingValue && !selected ? (
              <span className="text-muted">
                <span className="spinner-border spinner-border-sm me-2" />
                Cargando producto...
              </span>
            ) : (
              <>
                <strong>{selected?.name}</strong>
                {selected?.sku && <span className="text-muted ms-2">{selected.sku}</span>}
              </>
            )}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClear}
            disabled={disabled}
            aria-label={`Quitar ${label || 'producto'}`}
            title="Cambiar producto"
          >
            <i className="bi bi-x" />
          </button>
        </div>
      ) : (
        <div className="position-relative">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" />
            </span>
            <input
              id={inputId}
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              autoComplete="off"
              className={`form-control${errorText ? ' is-invalid' : ''}`}
              value={term}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(e) => {
                setTerm(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false)
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (options.length === 1) handleSelect(options[0])
                }
              }}
            />
            {isSearching && (
              <span className="input-group-text">
                <span className="spinner-border spinner-border-sm" role="status" aria-label="Buscando" />
              </span>
            )}
          </div>

          {showDropdown && (
            <div
              className="position-absolute w-100 bg-white border rounded-bottom shadow-sm"
              style={{ zIndex: 1050, maxHeight: '260px', overflowY: 'auto' }}
              role="listbox"
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 small text-muted">
                  {searchError || 'Sin resultados'}
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="btn btn-link text-start w-100 text-decoration-none px-3 py-2 border-bottom"
                    onClick={() => handleSelect(option)}
                  >
                    <div className="fw-medium text-body">{option.name}</div>
                    {option.sku && <small className="text-muted">{option.sku}</small>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {helpText && !errorText && <div className="form-text">{helpText}</div>}
      {!helpText && !errorText && !showSummary && (
        <div className="form-text">Escribe al menos {minChars} caracteres para buscar.</div>
      )}
      {errorText && <div className="invalid-feedback d-block small">{errorText}</div>}
    </div>
  )
}

export default ProductSearchSelect
