/**
 * 📍 LOCATIONS FILTERS SIMPLE - INVENTORY MODULE
 * Componente de filtros independiente para ubicaciones con debounce automático
 * 
 * Features:
 * - Debounce automático en search (500ms para locations masivas)
 * - Focus preservation durante filtrado
 * - Performance optimización con React.memo
 * - Filtros específicos del dominio location (tipo, estado, jerarquía)
 * - Integration con warehouse parent filtering
 * - Reset filters functionality
 */

'use client'

import React, { memo, useCallback, useEffect, useRef } from 'react'
import { useLocationsFilters, useLocationsFocus } from '../store'
import { LOCATION_BUSINESS_RULES } from '../types'
import { getLocationTypeLabel, getLocationStatusLabel } from '../services'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'

// ===== COMPONENT PROPS =====

interface LocationsFiltersSimpleProps {
  isVisible?: boolean
  onToggleVisibility?: () => void
  className?: string
  showToggleButton?: boolean
  showResetButton?: boolean
  compactMode?: boolean
  warehouseId?: string | 'all'  // Pre-filtro por warehouse
}

// ===== MAIN COMPONENT =====

const LocationsFiltersSimple: React.FC<LocationsFiltersSimpleProps> = memo(({
  isVisible = true,
  onToggleVisibility,
  className = '',
  showToggleButton = true,
  showResetButton = true,
  compactMode = false,
  warehouseId = 'all',
}) => {
  
  // ===== STORE STATE =====
  
  const filters = useLocationsFilters()
  const focus = useLocationsFocus()
  
  // ===== REFS FOR FOCUS MANAGEMENT =====
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const locationTypeRef = useRef<HTMLSelectElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)
  
  // ===== HANDLERS =====
  
  const handleSearchChange = useCallback((value: string) => {
    filters.setSearch(value)
    // Focus se preserva automáticamente por el debounce pattern
  }, [filters])
  
  const handleLocationTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setLocationType(value === 'all' ? 'all' : value as any)
    
    // Preservar focus
    setTimeout(() => {
      if (locationTypeRef.current) {
        locationTypeRef.current.focus()
      }
    }, 0)
  }, [filters])
  
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setStatus(value === 'all' ? 'all' : value as any)
    
    // Preservar focus
    setTimeout(() => {
      if (statusRef.current) {
        statusRef.current.focus()
      }
    }, 0)
  }, [filters])
  
  const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setIsActive(value === 'all' ? 'all' : value === 'true')
  }, [filters])
  
  const handlePickableChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setIsPickable(value === 'all' ? 'all' : value === 'true')
  }, [filters])
  
  const handleReceivableChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setIsReceivable(value === 'all' ? 'all' : value === 'true')
  }, [filters])
  
  const handleAisleChange = useCallback((value: string) => {
    filters.setAisle(value)
  }, [filters])
  
  const handleRackChange = useCallback((value: string) => {
    filters.setRack(value)
  }, [filters])
  
  const handleShelfChange = useCallback((value: string) => {
    filters.setShelf(value)
  }, [filters])
  
  const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    filters.setPickingPriority(value === 'all' ? 'all' : value as any)
  }, [filters])
  
  const handleResetFilters = useCallback(() => {
    filters.resetFilters()
    
    // Preservar el warehouse si se pasa como prop
    if (warehouseId && warehouseId !== 'all') {
      setTimeout(() => {
        filters.setWarehouseId(warehouseId)
      }, 0)
    }
    
    // Refocus en search input después del reset
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 100)
  }, [filters, warehouseId])
  
  const handleToggleVisibility = useCallback(() => {
    onToggleVisibility?.()
  }, [onToggleVisibility])
  
  // ===== EFFECTS =====
  
  // Setup focus refs para store
  useEffect(() => {
    focus.setSearchInputRef(searchInputRef.current)
  }, [focus])
  
  // Preservar focus durante actualizaciones
  useEffect(() => {
    if (focus.focusedField === 'search' && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [filters.search, focus.focusedField])
  
  // ===== COMPUTED VALUES =====
  
  const hasActiveFilters = filters.hasActiveFilters()
  const filterCount = [
    filters.searchDebounced.trim() ? 1 : 0,
    filters.warehouseId !== 'all' ? 1 : 0,
    filters.locationType !== 'all' ? 1 : 0,
    filters.status !== 'all' ? 1 : 0,
    filters.isActive !== 'all' ? 1 : 0,
    filters.isPickable !== 'all' ? 1 : 0,
    filters.isReceivable !== 'all' ? 1 : 0,
    filters.aisle.trim() ? 1 : 0,
    filters.rack.trim() ? 1 : 0,
    filters.shelf.trim() ? 1 : 0,
    filters.pickingPriority !== 'all' ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)
  
  // ===== RENDER =====
  
  if (!isVisible) {
    return showToggleButton ? (
      <div className={`locations-filters-toggle ${className}`}>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleToggleVisibility}
        >
          <i className="bi bi-funnel me-2"></i>
          Filtros
          {filterCount > 0 && (
            <span className="badge bg-primary ms-2">{filterCount}</span>
          )}
        </Button>
      </div>
    ) : null
  }
  
  return (
    <div className={`locations-filters-simple ${compactMode ? 'compact' : ''} ${className}`}>
      
      {/* Header */}
      <div className="filters-header d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <h6 className="mb-0 me-2">
            <i className="bi bi-funnel me-1"></i>
            Filtros de Ubicaciones
          </h6>
          {filterCount > 0 && (
            <span className="badge bg-primary">{filterCount} activos</span>
          )}
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {showResetButton && hasActiveFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleResetFilters}
              title="Limpiar todos los filtros"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reset
            </Button>
          )}
          
          {showToggleButton && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleToggleVisibility}
              title="Ocultar filtros"
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </div>
      </div>
      
      {/* Filters Grid */}
      <div className={`filters-grid ${compactMode ? 'compact-grid' : 'normal-grid'}`}>
        
        {/* Row 1: Search + Tipo + Estado */}
        <div className="row g-3 mb-3">
          
          {/* Search */}
          <div className="col-lg-4 col-md-6">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre, código..."
              value={filters.search}
              onChange={handleSearchChange}
              leftIcon="bi-search"
              onFocus={() => focus.setFocus('search')}
              onBlur={() => focus.setFocus(null)}
              debounce={500}
            />
          </div>
          
          {/* Tipo de Ubicación */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              ref={locationTypeRef}
              className="form-select form-select-sm"
              value={filters.locationType}
              onChange={handleLocationTypeChange}
            >
              <option value="all">Todos los tipos</option>
              {LOCATION_BUSINESS_RULES.VALID_LOCATION_TYPES.map(type => (
                <option key={type} value={type}>
                  {getLocationTypeLabel(type)}
                </option>
              ))}
            </select>
            <label className="form-label small text-muted">Tipo</label>
          </div>
          
          {/* Estado */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              ref={statusRef}
              className="form-select form-select-sm"
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="all">Todos los estados</option>
              {LOCATION_BUSINESS_RULES.VALID_STATUSES.map(status => (
                <option key={status} value={status}>
                  {getLocationStatusLabel(status)}
                </option>
              ))}
            </select>
            <label className="form-label small text-muted">Estado</label>
          </div>
          
          {/* Activo/Inactivo */}
          <div className="col-lg-2 col-md-6 col-6">
            <select
              className="form-select form-select-sm"
              value={filters.isActive === 'all' ? 'all' : String(filters.isActive)}
              onChange={handleActiveChange}
            >
              <option value="all">Todos</option>
              <option value="true">Solo activos</option>
              <option value="false">Solo inactivos</option>
            </select>
            <label className="form-label small text-muted">Activo</label>
          </div>
          
          {/* Prioridad */}
          <div className="col-lg-2 col-md-6">
            <select
              className="form-select form-select-sm"
              value={filters.pickingPriority}
              onChange={handlePriorityChange}
            >
              <option value="all">Todas las prioridades</option>
              {LOCATION_BUSINESS_RULES.VALID_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
            <label className="form-label small text-muted">Prioridad</label>
          </div>
        </div>
        
        {/* Row 2: Jerarquía Física */}
        <div className="row g-3 mb-3">
          <div className="col-12">
            <h6 className="small text-muted mb-2">
              <i className="bi bi-diagram-3 me-1"></i>
              Jerarquía Física
            </h6>
          </div>
          
          {/* Pasillo */}
          <div className="col-lg-2 col-md-3 col-6">
            <Input
              type="text"
              placeholder="Ej: A, B, 01"
              value={filters.aisle}
              onChange={handleAisleChange}
              size="sm"
            />
            <label className="form-label small text-muted">Pasillo</label>
          </div>
          
          {/* Rack */}
          <div className="col-lg-2 col-md-3 col-6">
            <Input
              type="text"
              placeholder="Ej: R1, R2"
              value={filters.rack}
              onChange={handleRackChange}
              size="sm"
            />
            <label className="form-label small text-muted">Rack</label>
          </div>
          
          {/* Estante */}
          <div className="col-lg-2 col-md-3 col-6">
            <Input
              type="text"
              placeholder="Ej: S1, S2"
              value={filters.shelf}
              onChange={handleShelfChange}
              size="sm"
            />
            <label className="form-label small text-muted">Estante</label>
          </div>
          
          {/* Operaciones */}
          <div className="col-lg-3 col-md-3">
            <div className="row g-2">
              <div className="col-6">
                <select
                  className="form-select form-select-sm"
                  value={filters.isPickable === 'all' ? 'all' : String(filters.isPickable)}
                  onChange={handlePickableChange}
                >
                  <option value="all">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
                <label className="form-label small text-muted">Picking</label>
              </div>
              
              <div className="col-6">
                <select
                  className="form-select form-select-sm"
                  value={filters.isReceivable === 'all' ? 'all' : String(filters.isReceivable)}
                  onChange={handleReceivableChange}
                >
                  <option value="all">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
                <label className="form-label small text-muted">Recepción</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="filters-summary mt-3 p-2 bg-light rounded">
          <small className="text-muted">
            <strong>Filtros activos:</strong>
            {filters.searchDebounced.trim() && (
              <span className="badge bg-primary ms-1">
                Búsqueda: &quot;{filters.searchDebounced}&quot;
              </span>
            )}
            {filters.warehouseId !== 'all' && (
              <span className="badge bg-info ms-1">Almacén específico</span>
            )}
            {filters.locationType !== 'all' && (
              <span className="badge bg-secondary ms-1">
                {getLocationTypeLabel(filters.locationType)}
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="badge bg-warning ms-1">
                {getLocationStatusLabel(filters.status)}
              </span>
            )}
            {filters.aisle.trim() && (
              <span className="badge bg-success ms-1">Pasillo: {filters.aisle}</span>
            )}
            {filters.rack.trim() && (
              <span className="badge bg-success ms-1">Rack: {filters.rack}</span>
            )}
            {filters.shelf.trim() && (
              <span className="badge bg-success ms-1">Estante: {filters.shelf}</span>
            )}
          </small>
        </div>
      )}
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

LocationsFiltersSimple.displayName = 'LocationsFiltersSimple'

// ===== STYLES =====

const styles = `
.locations-filters-simple {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.locations-filters-simple:hover {
  border-color: #adb5bd;
  background: #e9ecef;
}

.locations-filters-simple.compact {
  padding: 0.75rem;
}

.locations-filters-simple.compact .filters-grid {
  font-size: 0.875rem;
}

.filters-header h6 {
  color: #495057;
  font-weight: 600;
}

.filters-grid .form-label {
  margin-top: 0.25rem;
  margin-bottom: 0;
  font-size: 0.75rem;
  font-weight: 500;
}

.filters-summary {
  border-top: 1px solid #dee2e6;
}

.filters-summary .badge {
  font-size: 0.7rem;
  margin: 0.1rem;
}

.locations-filters-toggle {
  margin-bottom: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filters-grid .col-lg-2,
  .filters-grid .col-lg-3,
  .filters-grid .col-lg-4 {
    margin-bottom: 0.5rem;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem;
  }
  
  .filters-header .d-flex:last-child {
    align-self: flex-end;
  }
}

@media (max-width: 576px) {
  .locations-filters-simple {
    padding: 0.75rem;
  }
  
  .filters-grid .row {
    margin-bottom: 0.75rem;
  }
  
  .filters-grid .col-6 {
    margin-bottom: 0.25rem;
  }
}

/* Focus states */
.locations-filters-simple input:focus,
.locations-filters-simple select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Animation for filter changes */
.filters-summary {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="locations-filters-simple"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'locations-filters-simple')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default LocationsFiltersSimple