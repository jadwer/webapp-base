'use client'

import React, { useState, useEffect } from 'react'
import { Input, Button } from '@/ui/components/base'
import { useUnitsUIStore } from '../store/unitsUIStore'

// Custom hook para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const UnitsFiltersSimple = React.memo(() => {
  console.log('🔄 UnitsFiltersSimple render') // Should be minimal

  const { filters, setFilters, clearFilters } = useUnitsUIStore()
  
  // Local state para search input (preserva el foco)
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  
  // Debounce del search para evitar requests innecesarios
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Actualizar filtros cuando cambia el debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      console.log('🔍 Updating search filter:', debouncedSearch)
      setFilters({
        ...filters,
        search: debouncedSearch || undefined
      })
    }
  }, [debouncedSearch, filters, setFilters])

  const handleClearFilters = React.useCallback(() => {
    setSearchTerm('')
    clearFilters()
  }, [clearFilters])

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof typeof filters] !== undefined && filters[key as keyof typeof filters] !== ''
  )

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body py-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <i className="bi bi-search me-2 text-muted" />
              <Input
                type="text"
                placeholder="Buscar unidades por nombre o abreviación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 shadow-none"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-end gap-2">
              {hasActiveFilters && (
                <>
                  <small className="text-muted">
                    {Object.keys(filters).filter(key => filters[key as keyof typeof filters]).length} filtro(s) activo(s)
                  </small>
                  <Button
                    size="small"
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={handleClearFilters}
                  >
                    <i className="bi bi-x-circle me-1" />
                    Limpiar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

UnitsFiltersSimple.displayName = 'UnitsFiltersSimple'

export default UnitsFiltersSimple