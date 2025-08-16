/**
 * FILTER BAR
 * Barra de filtros simple para búsqueda básica
 * UI elegante con debounce para performance
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/ui/components/base/Input'

// Simple debounce function
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  className = ""
}: FilterBarProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm)

  // Debounced search with 300ms delay
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChange(value)
    }, 300),
     
    []
  )

  // Update local search when external searchTerm changes
  useEffect(() => {
    setLocalSearch(searchTerm)
  }, [searchTerm])

  // Handle input change with debounce
  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    debouncedSearch(value)
  }

  // Clear search
  const handleClear = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  return (
    <div className={`card mb-4 ${className}`}>
      <div className="card-body py-3">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="position-relative">
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={placeholder}
                leftIcon="bi-search"
                className="pe-5"
              />
              {localSearch && (
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3"
                  onClick={handleClear}
                  style={{ zIndex: 10 }}
                  title="Clear search"
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-end align-items-center">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1" />
                Search by name, description, or address
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}