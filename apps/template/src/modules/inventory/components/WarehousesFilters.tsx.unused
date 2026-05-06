/**
 * WAREHOUSES FILTERS
 * Componente de filtros para warehouses con debounce
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useState, useEffect, useCallback } from 'react'
import { Input } from '@/ui/components/base/Input'
import type { WarehouseFilters } from '../types'

interface WarehousesFiltersProps {
  filters: WarehouseFilters
  onFiltersChange: (filters: WarehouseFilters) => void
}

export const WarehousesFilters = memo<WarehousesFiltersProps>(({
  filters,
  onFiltersChange
}) => {
  console.log('🔄 [WarehousesFilters] Rendering with filters:', filters)
  
  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localCode, setLocalCode] = useState(filters.code || '')
  
  // Sync local state when filters change externally
  useEffect(() => {
    setLocalSearch(filters.search || '')
    setLocalCode(filters.code || '')
  }, [filters.search, filters.code])
  
  // Debounced search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        console.log('🔍 [WarehousesFilters] Debounced search update:', localSearch)
        onFiltersChange({ ...filters, search: localSearch || undefined })
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [localSearch, filters, onFiltersChange])
  
  // Debounced code update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localCode !== filters.code) {
        console.log('🔍 [WarehousesFilters] Debounced code update:', localCode)
        onFiltersChange({ ...filters, code: localCode || undefined })
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [localCode, filters, onFiltersChange])
  
  const handleWarehouseTypeChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      warehouseType: value === 'all' ? undefined : value as unknown
    })
  }, [filters, onFiltersChange])
  
  const handleStatusChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      isActive: value === 'all' ? undefined : value === 'active'
    })
  }, [filters, onFiltersChange])
  
  const handleCityChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      city: value || undefined
    })
  }, [filters, onFiltersChange])
  
  const clearFilters = useCallback(() => {
    setLocalSearch('')
    setLocalCode('')
    onFiltersChange({})
  }, [onFiltersChange])
  
  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof WarehouseFilters] !== undefined)
  
  return (
    <div className="row g-3">
      {/* Search */}
      <div className="col-md-3">
        <Input
          type="text"
          placeholder="Search warehouses..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          leftIcon="bi-search"
        />
      </div>
      
      {/* Code */}
      <div className="col-md-2">
        <Input
          type="text"
          placeholder="Code..."
          value={localCode}
          onChange={(e) => setLocalCode(e.target.value)}
          leftIcon="bi-hash"
        />
      </div>
      
      {/* Warehouse Type */}
      <div className="col-md-2">
        <select
          className="form-select"
          value={filters.warehouseType || 'all'}
          onChange={(e) => handleWarehouseTypeChange(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="main">Principal</option>
          <option value="secondary">Secundario</option>
          <option value="distribution">Distribución</option>
          <option value="returns">Devoluciones</option>
        </select>
      </div>
      
      {/* Status */}
      <div className="col-md-2">
        <select
          className="form-select"
          value={
            filters.isActive === undefined 
              ? 'all' 
              : filters.isActive 
                ? 'active' 
                : 'inactive'
          }
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      {/* City */}
      <div className="col-md-2">
        <Input
          type="text"
          placeholder="City..."
          value={filters.city || ''}
          onChange={(e) => handleCityChange(e.target.value)}
          leftIcon="bi-geo-alt"
        />
      </div>
      
      {/* Clear Filters */}
      <div className="col-md-1">
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          title="Clear all filters"
        >
          <i className="bi bi-x-circle" />
        </button>
      </div>
    </div>
  )
})

WarehousesFilters.displayName = 'WarehousesFilters'