'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useBrandsUIStore } from '../store/brandsUIStore'

const useDebouncedFilter = (callback: (value: string) => void, delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(value)
    }, delay)
  }, [callback, delay])
}

export const BrandsFiltersSimple = React.memo(() => {
  // console.log('🔄 BrandsFiltersSimple render')
  
  const { filters, setFilters, clearFilters } = useBrandsUIStore()
  const [localSearch, setLocalSearch] = React.useState(filters.search || '')
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setLocalSearch(filters.search || '')
  }, [filters.search])
  
  const debouncedSearch = useDebouncedFilter(
    useCallback((searchValue: string) => {
      // console.log('🔍 Applying debounced brand search:', searchValue)
      setFilters({ search: searchValue || undefined })
    }, [setFilters]),
    300
  )
  
  const handleSearchChange = useCallback((value: string) => {
    // console.log('⌨️ Brand search input change:', value)
    setLocalSearch(value)
    debouncedSearch(value)
  }, [debouncedSearch])
  
  const handleClearFilters = useCallback(() => {
    // console.log('🧹 Clearing brand filters')
    setLocalSearch('')
    clearFilters()
    
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [clearFilters])
  
  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body py-3">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <i className="bi bi-funnel me-2 text-primary" />
              <h6 className="mb-0 fw-bold">Filtros de Marcas</h6>
              {activeFiltersCount > 0 && (
                <span className="badge bg-primary ms-2">
                  {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="col-auto">
            <div className="d-flex gap-3 align-items-center">
              <div style={{ minWidth: '300px' }}>
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar marcas..."
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon="bi-search"
                  className="shadow-none border-0 bg-light"
                  autoComplete="off"
                />
              </div>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="secondary"
                  buttonStyle="ghost"
                  size="small"
                  onClick={handleClearFilters}
                  title="Limpiar todos los filtros"
                >
                  <i className="bi bi-x-circle me-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="mt-2 pt-2 border-top">
            <div className="d-flex flex-wrap gap-2">
              {filters.search && (
                <div className="d-flex align-items-center">
                  <small className="text-muted me-2">Búsqueda:</small>
                  <code className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded small">
                    &ldquo;{filters.search}&rdquo;
                  </code>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

BrandsFiltersSimple.displayName = 'BrandsFiltersSimple'