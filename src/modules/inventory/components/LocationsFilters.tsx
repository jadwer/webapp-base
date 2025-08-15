/**
 * LOCATIONS FILTERS
 * Componente de filtros para locations con debounce
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useState, useEffect, useCallback } from 'react'
import { Input } from '@/ui/components/base/Input'
import type { LocationFilters, Warehouse } from '../types'

interface LocationsFiltersProps {
  filters: LocationFilters
  warehouses: Warehouse[]
  onFiltersChange: (filters: LocationFilters) => void
}

export const LocationsFilters = memo<LocationsFiltersProps>(({
  filters,
  warehouses,
  onFiltersChange
}) => {
  console.log('🔄 [LocationsFilters] Rendering with filters:', filters)
  
  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localCode, setLocalCode] = useState(filters.code || '')
  const [localAisle, setLocalAisle] = useState(filters.aisle || '')
  
  // Sync local state when filters change externally
  useEffect(() => {
    setLocalSearch(filters.search || '')
    setLocalCode(filters.code || '')
    setLocalAisle(filters.aisle || '')
  }, [filters.search, filters.code, filters.aisle])
  
  // Debounced search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        console.log('🔍 [LocationsFilters] Debounced search update:', localSearch)
        onFiltersChange({ ...filters, search: localSearch || undefined })
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [localSearch, filters, onFiltersChange])
  
  // Debounced code update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localCode !== filters.code) {
        console.log('🔍 [LocationsFilters] Debounced code update:', localCode)
        onFiltersChange({ ...filters, code: localCode || undefined })
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [localCode, filters, onFiltersChange])
  
  // Debounced aisle update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localAisle !== filters.aisle) {
        console.log('🔍 [LocationsFilters] Debounced aisle update:', localAisle)
        onFiltersChange({ ...filters, aisle: localAisle || undefined })
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [localAisle, filters, onFiltersChange])
  
  const handleWarehouseChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      warehouseId: value === 'all' ? undefined : value
    })
  }, [filters, onFiltersChange])
  
  const handleLocationTypeChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      locationType: value === 'all' ? undefined : value
    })
  }, [filters, onFiltersChange])
  
  const handleStatusChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      isActive: value === 'all' ? undefined : value === 'active'
    })
  }, [filters, onFiltersChange])
  
  const handlePickableChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      isPickable: value === 'all' ? undefined : value === 'pickable'
    })
  }, [filters, onFiltersChange])
  
  const handleReceivableChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      isReceivable: value === 'all' ? undefined : value === 'receivable'
    })
  }, [filters, onFiltersChange])
  
  const clearFilters = useCallback(() => {
    setLocalSearch('')
    setLocalCode('')
    setLocalAisle('')
    onFiltersChange({})
  }, [onFiltersChange])
  
  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof LocationFilters] !== undefined)
  
  return (
    <div className="row g-3">
      {/* Search */}
      <div className="col-md-3">
        <Input
          type="text"
          placeholder="Search locations..."
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
      
      {/* Warehouse */}
      <div className="col-md-2">
        <select
          className="form-select"
          value={filters.warehouseId || 'all'}
          onChange={(e) => handleWarehouseChange(e.target.value)}
        >
          <option value="all">All Warehouses</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Location Type */}
      <div className="col-md-2">
        <select
          className="form-select"
          value={filters.locationType || 'all'}
          onChange={(e) => handleLocationTypeChange(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="rack">Rack</option>
          <option value="shelf">Shelf</option>
          <option value="floor">Floor</option>
          <option value="bin">Bin</option>
          <option value="dock">Dock</option>
        </select>
      </div>
      
      {/* Aisle */}
      <div className="col-md-1">
        <Input
          type="text"
          placeholder="Aisle..."
          value={localAisle}
          onChange={(e) => setLocalAisle(e.target.value)}
          leftIcon="bi-geo"
        />
      </div>
      
      {/* Status */}
      <div className="col-md-1">
        <select
          className="form-select form-select-sm"
          value={
            filters.isActive === undefined 
              ? 'all' 
              : filters.isActive 
                ? 'active' 
                : 'inactive'
          }
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="all">Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
      
      {/* Second Row - Properties */}
      <div className="col-md-12">
        <div className="row g-2">
          <div className="col-md-2">
            <div className="small text-muted mb-1">Properties:</div>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="pickable"
                id="pickable-all"
                checked={filters.isPickable === undefined}
                onChange={() => handlePickableChange('all')}
              />
              <label className="btn btn-outline-secondary btn-sm" htmlFor="pickable-all">
                All
              </label>
              
              <input
                type="radio"
                className="btn-check"
                name="pickable"
                id="pickable-yes"
                checked={filters.isPickable === true}
                onChange={() => handlePickableChange('pickable')}
              />
              <label className="btn btn-outline-primary btn-sm" htmlFor="pickable-yes">
                Pickable
              </label>
            </div>
          </div>
          
          <div className="col-md-2">
            <div className="small text-muted mb-1">&nbsp;</div>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="receivable"
                id="receivable-all"
                checked={filters.isReceivable === undefined}
                onChange={() => handleReceivableChange('all')}
              />
              <label className="btn btn-outline-secondary btn-sm" htmlFor="receivable-all">
                All
              </label>
              
              <input
                type="radio"
                className="btn-check"
                name="receivable"
                id="receivable-yes"
                checked={filters.isReceivable === true}
                onChange={() => handleReceivableChange('receivable')}
              />
              <label className="btn btn-outline-info btn-sm" htmlFor="receivable-yes">
                Receivable
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

LocationsFilters.displayName = 'LocationsFilters'