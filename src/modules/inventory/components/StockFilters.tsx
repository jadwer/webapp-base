/**
 * STOCK FILTERS
 * Componente de filtros para stock con debounce
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useState, useEffect, useCallback } from 'react'
import { Input } from '@/ui/components/base/Input'
import type { StockFilters, Warehouse } from '../types'

interface StockFiltersProps {
  filters: StockFilters
  warehouses: Warehouse[]
  onFiltersChange: (filters: StockFilters) => void
}

export const StockFilters = memo<StockFiltersProps>(({
  filters,
  warehouses,
  onFiltersChange
}) => {
  console.log('🔄 [StockFilters] Rendering with filters:', filters)
  
  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [localMinQuantity, setLocalMinQuantity] = useState(filters.minQuantity?.toString() || '')
  const [localMaxQuantity, setLocalMaxQuantity] = useState(filters.maxQuantity?.toString() || '')
  
  // Sync local state when filters change externally
  useEffect(() => {
    setLocalSearch(filters.search || '')
    setLocalMinQuantity(filters.minQuantity?.toString() || '')
    setLocalMaxQuantity(filters.maxQuantity?.toString() || '')
  }, [filters.search, filters.minQuantity, filters.maxQuantity])
  
  // Debounced search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        console.log('🔍 [StockFilters] Debounced search update:', localSearch)
        onFiltersChange({ ...filters, search: localSearch || undefined })
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [localSearch, filters, onFiltersChange])
  
  // Debounced min quantity update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const minQuantity = localMinQuantity ? parseFloat(localMinQuantity) : undefined
      if (minQuantity !== filters.minQuantity) {
        console.log('🔍 [StockFilters] Debounced min quantity update:', minQuantity)
        onFiltersChange({ ...filters, minQuantity })
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [localMinQuantity, filters, onFiltersChange])
  
  // Debounced max quantity update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const maxQuantity = localMaxQuantity ? parseFloat(localMaxQuantity) : undefined
      if (maxQuantity !== filters.maxQuantity) {
        console.log('🔍 [StockFilters] Debounced max quantity update:', maxQuantity)
        onFiltersChange({ ...filters, maxQuantity })
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [localMaxQuantity, filters, onFiltersChange])
  
  const handleWarehouseChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      warehouseId: value === 'all' ? undefined : value
    })
  }, [filters, onFiltersChange])
  
  const handleStatusChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      status: value === 'all' ? undefined : value
    })
  }, [filters, onFiltersChange])
  
  const handleStockLevelChange = useCallback((level: string) => {
    if (level === 'all') {
      onFiltersChange({ 
        ...filters, 
        lowStock: undefined,
        outOfStock: undefined 
      })
    } else if (level === 'low') {
      onFiltersChange({ 
        ...filters, 
        lowStock: true,
        outOfStock: undefined 
      })
    } else if (level === 'out') {
      onFiltersChange({ 
        ...filters, 
        lowStock: undefined,
        outOfStock: true 
      })
    }
  }, [filters, onFiltersChange])
  
  const getCurrentStockLevel = () => {
    if (filters.outOfStock) return 'out'
    if (filters.lowStock) return 'low'
    return 'all'
  }
  
  const clearFilters = useCallback(() => {
    setLocalSearch('')
    setLocalMinQuantity('')
    setLocalMaxQuantity('')
    onFiltersChange({})
  }, [onFiltersChange])
  
  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof StockFilters] !== undefined
  )
  
  return (
    <div className="row g-3">
      {/* Search */}
      <div className="col-md-3">
        <Input
          type="text"
          placeholder="Search products, SKU..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          leftIcon="bi-search"
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
      
      {/* Status */}
      <div className="col-md-2">
        <select
          className="form-select"
          value={filters.status || 'all'}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
      
      {/* Min Quantity */}
      <div className="col-md-2">
        <Input
          type="number"
          placeholder="Min Qty..."
          value={localMinQuantity}
          onChange={(e) => setLocalMinQuantity(e.target.value)}
          leftIcon="bi-arrow-up"
          min="0"
        />
      </div>
      
      {/* Max Quantity */}
      <div className="col-md-2">
        <Input
          type="number"
          placeholder="Max Qty..."
          value={localMaxQuantity}
          onChange={(e) => setLocalMaxQuantity(e.target.value)}
          leftIcon="bi-arrow-down"
          min="0"
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
      
      {/* Second Row - Stock Level Filters */}
      <div className="col-md-12">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <div className="small text-muted mb-1">Stock Level:</div>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="stockLevel"
                id="stock-all"
                checked={getCurrentStockLevel() === 'all'}
                onChange={() => handleStockLevelChange('all')}
              />
              <label className="btn btn-outline-secondary btn-sm" htmlFor="stock-all">
                All
              </label>
              
              <input
                type="radio"
                className="btn-check"
                name="stockLevel"
                id="stock-low"
                checked={getCurrentStockLevel() === 'low'}
                onChange={() => handleStockLevelChange('low')}
              />
              <label className="btn btn-outline-warning btn-sm" htmlFor="stock-low">
                <i className="bi bi-exclamation-triangle me-1" />
                Low Stock
              </label>
              
              <input
                type="radio"
                className="btn-check"
                name="stockLevel"
                id="stock-out"
                checked={getCurrentStockLevel() === 'out'}
                onChange={() => handleStockLevelChange('out')}
              />
              <label className="btn btn-outline-danger btn-sm" htmlFor="stock-out">
                <i className="bi bi-x-circle me-1" />
                Out of Stock
              </label>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="col-md-8">
            <div className="small text-muted mb-1">Quick Actions:</div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => onFiltersChange({ ...filters, lowStock: true })}
              >
                <i className="bi bi-funnel me-1" />
                Show Low Stock Only
              </button>
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                onClick={() => onFiltersChange({ ...filters, minQuantity: 1 })}
              >
                <i className="bi bi-check-circle me-1" />
                Show Available Only
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => onFiltersChange({ ...filters, status: 'active' })}
              >
                <i className="bi bi-power me-1" />
                Active Stock Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

StockFilters.displayName = 'StockFilters'