/**
 * INVENTORY MOVEMENTS FILTERS
 * Filtros avanzados para movimientos de inventario con debounce
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useCallback, useState, useEffect } from 'react'
import type { MovementFiltersData, Warehouse, Product } from '../types'

interface InventoryMovementsFiltersProps {
  filters: MovementFiltersData
  onFiltersChange: (filters: MovementFiltersData) => void
  warehouses: Warehouse[]
  products: Product[]
  isLoading?: boolean
}

export const InventoryMovementsFilters = memo<InventoryMovementsFiltersProps>(({
  filters,
  onFiltersChange,
  warehouses,
  products,
  isLoading = false
}) => {
  console.log('🔄 [InventoryMovementsFilters] Rendering with filters', filters)
  
  // Local state for debounced search
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [referenceIdTerm, setReferenceIdTerm] = useState(filters.referenceId || '')
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ ...filters, search: searchTerm })
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm, filters, onFiltersChange])
  
  // Debounce reference ID
  useEffect(() => {
    const timer = setTimeout(() => {
      if (referenceIdTerm !== filters.referenceId) {
        onFiltersChange({ ...filters, referenceId: referenceIdTerm })
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [referenceIdTerm, filters, onFiltersChange])
  
  const handleFilterChange = useCallback((field: keyof MovementFiltersData, value: any) => {
    onFiltersChange({ ...filters, [field]: value })
  }, [filters, onFiltersChange])
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setReferenceIdTerm('')
    onFiltersChange({})
  }, [onFiltersChange])
  
  const getMovementTypeOptions = () => [
    { value: '', label: 'All Movement Types' },
    { value: 'entry', label: 'Entry' },
    { value: 'exit', label: 'Exit' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Adjustment' }
  ]
  
  const getStatusOptions = () => [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]
  
  const getReferenceTypeOptions = () => [
    { value: '', label: 'All Reference Types' },
    { value: 'purchase', label: 'Purchase Order' },
    { value: 'sale', label: 'Sales Order' },
    { value: 'adjustment', label: 'Stock Adjustment' },
    { value: 'transfer', label: 'Internal Transfer' },
    { value: 'return', label: 'Return' },
    { value: 'damage', label: 'Damage Report' },
    { value: 'count', label: 'Physical Count' }
  ]
  
  const getWarehouseOptions = () => [
    { value: '', label: 'All Warehouses' },
    ...warehouses.map(warehouse => ({
      value: warehouse.id,
      label: `${warehouse.name} (${warehouse.code})`
    }))
  ]
  
  const getProductOptions = () => [
    { value: '', label: 'All Products' },
    ...products.slice(0, 50).map(product => ({
      value: product.id,
      label: `${product.name} (${product.sku})`
    }))
  ]
  
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.movementType) count++
    if (filters.referenceType) count++
    if (filters.status) count++
    if (filters.warehouseId) count++
    if (filters.productId) count++
    if (filters.referenceId) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }
  
  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-funnel me-2" />
          <h6 className="mb-0">Advanced Filters</h6>
          {getActiveFiltersCount() > 0 && (
            <span className="badge bg-primary ms-2">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={handleClearFilters}
          disabled={getActiveFiltersCount() === 0 || isLoading}
        >
          <i className="bi bi-x-circle me-1" />
          Clear All
        </button>
      </div>
      
      <div className="card-body">
        <div className="row g-3">
          {/* Search */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-search me-1" />
              Search
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search in description, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {/* Movement Type */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-arrow-repeat me-1" />
              Movement Type
            </label>
            <select
              className="form-select"
              value={filters.movementType || ''}
              onChange={(e) => handleFilterChange('movementType', e.target.value)}
              disabled={isLoading}
            >
              {getMovementTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-check-circle me-1" />
              Status
            </label>
            <select
              className="form-select"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              disabled={isLoading}
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Reference Type */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-file-text me-1" />
              Reference Type
            </label>
            <select
              className="form-select"
              value={filters.referenceType || ''}
              onChange={(e) => handleFilterChange('referenceType', e.target.value)}
              disabled={isLoading}
            >
              {getReferenceTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Reference ID */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-hash me-1" />
              Reference ID
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Reference number..."
              value={referenceIdTerm}
              onChange={(e) => setReferenceIdTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {/* Warehouse */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-building me-1" />
              Warehouse
            </label>
            <select
              className="form-select"
              value={filters.warehouseId || ''}
              onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
              disabled={isLoading}
            >
              {getWarehouseOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Product */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-box me-1" />
              Product
            </label>
            <select
              className="form-select"
              value={filters.productId || ''}
              onChange={(e) => handleFilterChange('productId', e.target.value)}
              disabled={isLoading}
            >
              {getProductOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date From */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-calendar-event me-1" />
              Date From
            </label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {/* Date To */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-calendar-check me-1" />
              Date To
            </label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="row mt-3">
          <div className="col-12">
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                onClick={() => handleFilterChange('movementType', 'entry')}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-down-circle me-1" />
                Entries Only
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleFilterChange('movementType', 'exit')}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-up-circle me-1" />
                Exits Only
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => handleFilterChange('movementType', 'transfer')}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-left-right me-1" />
                Transfers Only
              </button>
              <button
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={() => handleFilterChange('status', 'pending')}
                disabled={isLoading}
              >
                <i className="bi bi-clock me-1" />
                Pending Only
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  handleFilterChange('dateFrom', today)
                  handleFilterChange('dateTo', today)
                }}
                disabled={isLoading}
              >
                <i className="bi bi-calendar-day me-1" />
                Today Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

InventoryMovementsFilters.displayName = 'InventoryMovementsFilters'