'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

export interface ListToolbarSearch {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Retraso antes de llamar onChange (ms). Default 300 */
  debounceMs?: number
  id?: string
}

export interface ListToolbarProps {
  search?: ListToolbarSearch
  /** Selects de filtro (BranchFilter, estado, etc.) */
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Barra de filtros de listados: buscador con debounce, selects y acciones
 * en una sola fila, sin card.
 */
export const ListToolbar: React.FC<ListToolbarProps> = ({
  search,
  children,
  actions,
  className = 'mb-3',
}) => {
  const [localValue, setLocalValue] = useState(search?.value ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(search?.onChange)
  onChangeRef.current = search?.onChange

  const externalValue = search?.value
  useEffect(() => {
    setLocalValue(externalValue ?? '')
  }, [externalValue])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const handleChange = (value: string) => {
    setLocalValue(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChangeRef.current?.(value)
    }, search?.debounceMs ?? 300)
  }

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocalValue('')
    onChangeRef.current?.('')
  }

  return (
    <div className={clsx('row g-2 align-items-center', className)}>
      {search && (
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" aria-hidden="true" />
            </span>
            <input
              id={search.id}
              type="search"
              className="form-control"
              placeholder={search.placeholder ?? 'Buscar...'}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              aria-label={search.placeholder ?? 'Buscar'}
            />
            {localValue && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClear}
                title="Limpiar busqueda"
                aria-label="Limpiar busqueda"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
      {children && (
        <div className="col-md-5">
          <div className="d-flex flex-wrap gap-2">{children}</div>
        </div>
      )}
      {actions && (
        <div className="col-md-3 ms-auto">
          <div className="d-flex justify-content-md-end flex-wrap gap-2">{actions}</div>
        </div>
      )}
    </div>
  )
}

export default ListToolbar
