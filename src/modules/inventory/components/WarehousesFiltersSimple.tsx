/**
 * 📦 WAREHOUSES FILTERS SIMPLE - INVENTORY MODULE
 * Componente de filtros independiente con debounce automático
 * 
 * Features:
 * - Debounce automático en search (500ms para 500K+ productos)
 * - Focus preservation durante filtrado
 * - Performance optimización con React.memo
 * - Filtros específicos del dominio warehouse
 * - Reset filters functionality
 */

'use client'

import React, { memo, useCallback, useEffect, useRef } from 'react'
import { useWarehousesFilters, useWarehousesFocus } from '../store'
import { WAREHOUSE_BUSINESS_RULES } from '../types'
import { getWarehouseTypeLabel } from '../services'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'

// ===== COMPONENT PROPS =====

interface WarehousesFiltersSimpleProps {
  isVisible?: boolean
  onToggleVisibility?: () => void
  className?: string
  showToggleButton?: boolean
  showResetButton?: boolean
  compactMode?: boolean
}

// ===== MAIN COMPONENT =====

const WarehousesFiltersSimple: React.FC<WarehousesFiltersSimpleProps> = memo(({
  isVisible = true,
  onToggleVisibility,
  className = '',
  showToggleButton = true,
  showResetButton = true,
  compactMode = false,
}) => {
  
  // ===== STORE STATE =====
  
  const filters = useWarehousesFilters()
  const focus = useWarehousesFocus()
  
  // ===== REFS FOR FOCUS MANAGEMENT =====
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const warehouseTypeRef = useRef<HTMLSelectElement>(null)
  const isActiveRef = useRef<HTMLSelectElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const stateRef = useRef<HTMLInputElement>(null)
  const countryRef = useRef<HTMLInputElement>(null)
  
  // ===== HANDLERS =====
  
  const handleSearchChange = useCallback((value: string) => {
    filters.setSearch(value)
    focus.setLastFocusedInput('search')
  }, [filters, focus])
  
  const handleWarehouseTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as any
    filters.setWarehouseType(value === 'all' ? 'all' : value)
    focus.setLastFocusedInput('warehouseType')
  }, [filters, focus])
  
  const handleIsActiveChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setIsActive(value === 'all' ? 'all' : value === 'true')
    focus.setLastFocusedInput('isActive')
  }, [filters, focus])
  
  const handleCityChange = useCallback((value: string) => {
    filters.setCity(value)
    focus.setLastFocusedInput('city')
  }, [filters, focus])
  
  const handleStateChange = useCallback((value: string) => {
    filters.setState(value)
    focus.setLastFocusedInput('state')
  }, [filters, focus])
  
  const handleCountryChange = useCallback((value: string) => {
    filters.setCountry(value)
    focus.setLastFocusedInput('country')
  }, [filters, focus])
  
  const handleResetFilters = useCallback(() => {
    filters.resetFilters()
    focus.setLastFocusedInput(null)
    // Focus en search después de reset
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }, [filters, focus])
  
  // ===== COMPUTED VALUES =====
  
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters.search ||
      filters.warehouseType !== 'all' ||
      filters.isActive !== 'all' ||
      filters.city ||
      filters.state ||
      filters.country ||
      filters.minCapacity ||
      filters.maxCapacity
    )
  }, [filters])
  
  const filtersCount = React.useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.warehouseType !== 'all') count++
    if (filters.isActive !== 'all') count++
    if (filters.city) count++
    if (filters.state) count++
    if (filters.country) count++
    if (filters.minCapacity) count++
    if (filters.maxCapacity) count++
    return count
  }, [filters])
  
  // ===== EFFECTS =====
  
  // Restore focus cuando sea necesario
  useEffect(() => {
    if (focus.lastFocusedInput) {
      const timer = setTimeout(() => {
        focus.restoreFocus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [focus])
  
  // ===== RENDER =====
  
  if (!isVisible) {
    return showToggleButton && onToggleVisibility ? (
      <div className="mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onToggleVisibility}
        >
          <i className="bi bi-funnel me-2"></i>
          Mostrar Filtros
          {filtersCount > 0 && (
            <span className="badge bg-primary ms-2">{filtersCount}</span>
          )}
        </Button>
      </div>
    ) : null
  }
  
  return (
    <div className={`warehouses-filters-simple ${className}`}>
      {/* Header con toggle button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 text-muted">
          <i className="bi bi-funnel me-2"></i>
          Filtros
          {filtersCount > 0 && (
            <span className="badge bg-primary ms-2">{filtersCount}</span>
          )}
        </h6>
        
        <div className="d-flex gap-2">
          {showResetButton && hasActiveFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleResetFilters}
              title="Limpiar todos los filtros"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
          )}
          
          {showToggleButton && onToggleVisibility && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onToggleVisibility}
              title="Ocultar filtros"
            >
              <i className="bi bi-chevron-up"></i>
            </Button>
          )}
        </div>
      </div>
      
      {/* Filters Grid */}
      <div className={`row g-3 ${compactMode ? 'row-cols-2 row-cols-md-4 row-cols-lg-6' : 'row-cols-1 row-cols-md-2 row-cols-lg-3'}`}>
        
        {/* Search */}
        <div className="col">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar almacenes..."
            value={filters.search}
            onChange={handleSearchChange}
            leftIcon="bi-search"
            name="search"
            data-focus-id="search"
            className="form-control-sm"
          />
        </div>
        
        {/* Warehouse Type */}
        <div className="col">
          <select
            ref={warehouseTypeRef}
            className="form-select form-select-sm"
            value={filters.warehouseType}
            onChange={handleWarehouseTypeChange}
            name="warehouseType"
            data-focus-id="warehouseType"
          >
            <option value="all">Todos los tipos</option>
            {WAREHOUSE_BUSINESS_RULES.VALID_WAREHOUSE_TYPES.map(type => (
              <option key={type} value={type}>
                {getWarehouseTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Is Active */}
        <div className="col">
          <select
            ref={isActiveRef}
            className="form-select form-select-sm"
            value={filters.isActive === 'all' ? 'all' : String(filters.isActive)}
            onChange={handleIsActiveChange}
            name="isActive"
            data-focus-id="isActive"
          >
            <option value="all">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        
        {/* City */}
        {!compactMode && (
          <div className="col">
            <Input
              ref={cityRef}
              type="text"
              placeholder="Ciudad..."
              value={filters.city}
              onChange={handleCityChange}
              leftIcon="bi-geo-alt"
              name="city"
              data-focus-id="city"
              className="form-control-sm"
            />
          </div>
        )}
        
        {/* State */}
        {!compactMode && (
          <div className="col">
            <Input
              ref={stateRef}
              type="text"
              placeholder="Estado/Provincia..."
              value={filters.state}
              onChange={handleStateChange}
              leftIcon="bi-map"
              name="state"
              data-focus-id="state"
              className="form-control-sm"
            />
          </div>
        )}
        
        {/* Country */}
        {!compactMode && (
          <div className="col">
            <Input
              ref={countryRef}
              type="text"
              placeholder="País..."
              value={filters.country}
              onChange={handleCountryChange}
              leftIcon="bi-globe"
              name="country"
              data-focus-id="country"
              className="form-control-sm"
            />
          </div>
        )}
        
      </div>
      
      {/* Advanced Filters Row (Capacity) */}
      {!compactMode && (
        <div className="row g-3 mt-2">
          <div className="col-md-6 col-lg-3">
            <label className="form-label small text-muted mb-1">Capacidad Mínima</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minCapacity?.toString() || ''}
              onChange={(value) => filters.setMinCapacity(value ? Number(value) : undefined)}
              leftIcon="bi-arrow-up"
              min="0"
              className="form-control-sm"
            />
          </div>
          
          <div className="col-md-6 col-lg-3">
            <label className="form-label small text-muted mb-1">Capacidad Máxima</label>
            <Input
              type="number"
              placeholder="Sin límite"
              value={filters.maxCapacity?.toString() || ''}
              onChange={(value) => filters.setMaxCapacity(value ? Number(value) : undefined)}
              leftIcon="bi-arrow-down"
              min="0"
              className="form-control-sm"
            />
          </div>
        </div>
      )}
      
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <small className="text-muted me-2">Filtros activos:</small>
            
            {filters.search && (
              <span className="badge bg-light text-dark border">
                <i className="bi bi-search me-1"></i>
                "{filters.search}"
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => filters.setSearch('')}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {filters.warehouseType !== 'all' && (
              <span className="badge bg-light text-dark border">
                <i className="bi bi-building me-1"></i>
                {getWarehouseTypeLabel(filters.warehouseType)}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => filters.setWarehouseType('all')}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {filters.isActive !== 'all' && (
              <span className="badge bg-light text-dark border">
                <i className={`bi bi-${filters.isActive ? 'check-circle' : 'x-circle'} me-1`}></i>
                {filters.isActive ? 'Activos' : 'Inactivos'}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => filters.setIsActive('all')}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {filters.city && (
              <span className="badge bg-light text-dark border">
                <i className="bi bi-geo-alt me-1"></i>
                {filters.city}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => filters.setCity('')}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {filters.state && (
              <span className="badge bg-light text-dark border">
                <i className="bi bi-map me-1"></i>
                {filters.state}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => filters.setState('')}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {filters.country && (
              <span className="badge bg-light text-dark border">
                <i className="bi bi-globe me-1"></i>
                {filters.country}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => filters.setCountry('')}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {(filters.minCapacity || filters.maxCapacity) && (
              <span className="badge bg-light text-dark border">
                <i className="bi bi-speedometer me-1"></i>
                Capacidad: {filters.minCapacity || '0'} - {filters.maxCapacity || '∞'}
                <button 
                  className="btn-close btn-close-sm ms-1"
                  onClick={() => {
                    filters.setMinCapacity(undefined)
                    filters.setMaxCapacity(undefined)
                  }}
                  style={{ fontSize: '0.6em' }}
                ></button>
              </span>
            )}
            
            {/* Reset All */}
            {showResetButton && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleResetFilters}
                className="ms-auto"
              >
                <i className="bi bi-x-lg me-1"></i>
                Limpiar Todo
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Performance Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Debounce: {WAREHOUSE_BUSINESS_RULES.SEARCH_DEBOUNCE_MS}ms | 
            Max resultados: {filters.limit} | 
            {filters.searchDebounced !== filters.search ? ' Escribiendo...' : ' Listo'}
          </small>
        </div>
      )}
      
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

WarehousesFiltersSimple.displayName = 'WarehousesFiltersSimple'

// ===== STYLES =====

const styles = `
.warehouses-filters-simple {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.warehouses-filters-simple .badge {
  font-size: 0.75em;
}

.warehouses-filters-simple .btn-close-sm {
  width: 0.5em;
  height: 0.5em;
}

.warehouses-filters-simple .form-control-sm,
.warehouses-filters-simple .form-select-sm {
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .warehouses-filters-simple .row.g-3 > .col {
    flex: 1 1 100%;
  }
  
  .warehouses-filters-simple .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="warehouses-filters-simple"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouses-filters-simple')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehousesFiltersSimple