/**
 * 📍 LOCATIONS TABLE VIRTUALIZED - INVENTORY MODULE
 * Tabla virtualizada enterprise para ubicaciones con jerarquía visual
 * 
 * Features:
 * - TanStack Virtual para performance con miles de locations
 * - Jerarquía visual: warehouse → aisle → rack → shelf → level → position
 * - Agrupación por almacén con estadísticas
 * - Selección masiva y acciones bulk
 * - Ordenamiento inteligente por jerarquía
 * - Responsive con scroll horizontal
 * - Location business rules validation display
 */

'use client'

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Link from 'next/link'
import type { WarehouseLocation } from '../types'
import { getLocationTypeLabel, getLocationStatusLabel, formatLocationCode, getLocationHierarchyDisplay } from '../services'
import { Button } from '@/ui/components/base/Button'

// ===== COMPONENT PROPS =====

interface LocationsTableVirtualizedProps {
  locations: WarehouseLocation[]
  isLoading?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onSelectAll?: () => void
  isAllSelected?: boolean
  onDelete?: (location: WarehouseLocation) => Promise<void>
  onToggleActive?: (location: WarehouseLocation) => Promise<void>
  showWarehouseGroups?: boolean
  showHierarchy?: boolean
  className?: string
  maxHeight?: number
}

// ===== HIERARCHY GROUP TYPE =====

interface LocationGroup {
  type: 'warehouse' | 'location'
  warehouse?: {
    id: string
    name: string
    code: string
    locationsCount: number
    activeCount: number
    pickableCount: number
  }
  location?: WarehouseLocation
  level: number
}

// ===== MAIN COMPONENT =====

const LocationsTableVirtualized: React.FC<LocationsTableVirtualizedProps> = memo(({
  locations,
  isLoading = false,
  enableSelection = true,
  selectedIds = [],
  onToggleSelection,
  onSelectAll,
  isAllSelected = false,
  onDelete,
  onToggleActive,
  showWarehouseGroups = false,
  showHierarchy = true,
  className = '',
  maxHeight = 600,
}) => {
  
  // ===== REFS =====
  
  const parentRef = useRef<HTMLDivElement>(null)
  
  // ===== COMPUTED VALUES =====
  
  // Procesar locations en grupos jerárquicos
  const processedItems = useMemo(() => {
    if (!showWarehouseGroups) {
      // Vista simple: solo locations
      return locations.map(location => ({
        type: 'location' as const,
        location,
        level: 0,
      }))
    }
    
    // Vista agrupada por warehouse
    const warehouseGroups: LocationGroup[] = []
    const warehouseMap = new Map<string, WarehouseLocation[]>()
    
    // Agrupar por warehouse
    locations.forEach(location => {
      const warehouseId = location.warehouse?.id || location.warehouseId || 'unknown'
      if (!warehouseMap.has(warehouseId)) {
        warehouseMap.set(warehouseId, [])
      }
      warehouseMap.get(warehouseId)!.push(location)
    })
    
    // Crear grupos con estadísticas
    warehouseMap.forEach((warehouseLocations, warehouseId) => {
      const firstLocation = warehouseLocations[0]
      const warehouse = firstLocation?.warehouse
      
      if (warehouse) {
        // Header del warehouse
        warehouseGroups.push({
          type: 'warehouse',
          warehouse: {
            id: warehouse.id,
            name: warehouse.name,
            code: warehouse.code,
            locationsCount: warehouseLocations.length,
            activeCount: warehouseLocations.filter(l => l.isActive).length,
            pickableCount: warehouseLocations.filter(l => l.isPickable).length,
          },
          level: 0,
        })
        
        // Locations del warehouse
        warehouseLocations
          .sort((a, b) => {
            // Ordenar por jerarquía: aisle → rack → shelf → level → position
            if (a.aisle !== b.aisle) return (a.aisle || '').localeCompare(b.aisle || '')
            if (a.rack !== b.rack) return (a.rack || '').localeCompare(b.rack || '')
            if (a.shelf !== b.shelf) return (a.shelf || '').localeCompare(b.shelf || '')
            if (a.level !== b.level) return (a.level || 0) - (b.level || 0)
            if (a.position !== b.position) return (a.position || 0) - (b.position || 0)
            return a.name.localeCompare(b.name)
          })
          .forEach(location => {
            warehouseGroups.push({
              type: 'location',
              location,
              level: 1,
            })
          })
      }
    })
    
    return warehouseGroups
  }, [locations, showWarehouseGroups])
  
  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: processedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      const item = processedItems[index]
      return item?.type === 'warehouse' ? 60 : 48 // Warehouse headers más altos
    }, [processedItems]),
    overscan: 10,
  })
  
  // Selection helpers
  const selectedCount = selectedIds.length
  const isIndeterminate = selectedCount > 0 && selectedCount < locations.length
  
  // ===== HANDLERS =====
  
  const handleSelectAllChange = useCallback(() => {
    onSelectAll?.()
  }, [onSelectAll])
  
  const handleRowSelection = useCallback((locationId: string) => {
    onToggleSelection?.(locationId)
  }, [onToggleSelection])
  
  const handleDeleteClick = useCallback((location: WarehouseLocation, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(location)
  }, [onDelete])
  
  const handleToggleActiveClick = useCallback((location: WarehouseLocation, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleActive?.(location)
  }, [onToggleActive])
  
  // ===== RENDER FUNCTIONS =====
  
  const renderWarehouseHeader = useCallback((warehouse: LocationGroup['warehouse']) => {
    if (!warehouse) return null
    
    const activePercentage = warehouse.locationsCount > 0 
      ? Math.round((warehouse.activeCount / warehouse.locationsCount) * 100)
      : 0
    
    return (
      <div className="warehouse-group-header d-flex align-items-center p-3 bg-light border-bottom">
        <div className="d-flex align-items-center flex-grow-1">
          <i className="bi bi-building text-primary me-2"></i>
          <div>
            <strong className="text-dark">{warehouse.name}</strong>
            <small className="text-muted ms-2">({warehouse.code})</small>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3 text-sm">
          <div className="text-center">
            <div className="fw-semibold text-primary">{warehouse.locationsCount}</div>
            <small className="text-muted">Ubicaciones</small>
          </div>
          
          <div className="text-center">
            <div className="fw-semibold text-success">{warehouse.activeCount}</div>
            <small className="text-muted">Activas</small>
          </div>
          
          <div className="text-center">
            <div className="fw-semibold text-info">{warehouse.pickableCount}</div>
            <small className="text-muted">Picking</small>
          </div>
          
          <div className="text-center">
            <div className={`badge ${activePercentage >= 80 ? 'bg-success' : activePercentage >= 50 ? 'bg-warning' : 'bg-danger'}`}>
              {activePercentage}%
            </div>
          </div>
        </div>
      </div>
    )
  }, [])
  
  const renderLocationRow = useCallback((location: WarehouseLocation, level: number) => {
    const isSelected = selectedIds.includes(location.id)
    const hierarchyDisplay = getLocationHierarchyDisplay(location)
    
    return (
      <div 
        className={`location-row d-flex align-items-center p-2 border-bottom ${isSelected ? 'bg-primary bg-opacity-10' : ''} ${level > 0 ? 'ps-4' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handleRowSelection(location.id)}
      >
        {/* Selection Checkbox */}
        {enableSelection && (
          <div className="me-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleRowSelection(location.id)
              }}
            />
          </div>
        )}
        
        {/* Location Info */}
        <div className="location-info flex-grow-1 min-w-0">
          <div className="d-flex align-items-center">
            {/* Hierarchy Indentation */}
            {showHierarchy && level > 0 && (
              <div className="hierarchy-indent me-2 text-muted">
                {'└─'.repeat(Math.min(level, 3))}
              </div>
            )}
            
            {/* Location Icon */}
            <i className={`bi bi-geo-alt-fill me-2 ${location.isActive ? 'text-success' : 'text-muted'}`}></i>
            
            {/* Name & Code */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center">
                <Link 
                  href={`/dashboard/inventory/warehouses/locations/${location.id}`}
                  className="text-decoration-none fw-semibold text-dark"
                  onClick={(e) => e.stopPropagation()}
                >
                  {location.name}
                </Link>
                
                <code className="ms-2 small text-muted bg-light px-1 rounded">
                  {formatLocationCode(location)}
                </code>
              </div>
              
              {/* Hierarchy Display */}
              {showHierarchy && hierarchyDisplay && (
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-diagram-3 me-1"></i>
                  {hierarchyDisplay}
                </small>
              )}
            </div>
          </div>
        </div>
        
        {/* Type */}
        <div className="location-type text-center" style={{ minWidth: '120px' }}>
          <span className="badge bg-secondary">
            {getLocationTypeLabel(location.locationType)}
          </span>
        </div>
        
        {/* Status */}
        <div className="location-status text-center" style={{ minWidth: '120px' }}>
          <span className={`badge ${
            location.status === 'available' ? 'bg-success' :
            location.status === 'occupied' ? 'bg-warning' :
            location.status === 'reserved' ? 'bg-info' :
            location.status === 'maintenance' ? 'bg-danger' : 'bg-secondary'
          }`}>
            {getLocationStatusLabel(location.status)}
          </span>
        </div>
        
        {/* Capacity */}
        <div className="location-capacity text-center text-muted small" style={{ minWidth: '100px' }}>
          {location.maxWeight ? `${location.maxWeight}kg` : '—'}
          {location.maxVolume ? (
            <div>{location.maxVolume}m³</div>
          ) : null}
        </div>
        
        {/* Operational Flags */}
        <div className="operational-flags text-center" style={{ minWidth: '120px' }}>
          <div className="d-flex justify-content-center gap-1">
            {location.isPickable && (
              <span className="badge bg-info" title="Picking habilitado">
                <i className="bi bi-box-arrow-down"></i>
              </span>
            )}
            {location.isReceivable && (
              <span className="badge bg-primary" title="Recepción habilitada">
                <i className="bi bi-box-arrow-in-down"></i>
              </span>
            )}
            {location.pickingPriority && location.pickingPriority !== 'normal' && (
              <span className={`badge ${location.pickingPriority === 'high' ? 'bg-danger' : 'bg-warning'}`} title={`Prioridad: ${location.pickingPriority}`}>
                !
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="location-actions text-end" style={{ minWidth: '140px' }}>
          <div className="btn-group btn-group-sm">
            {/* Toggle Active */}
            <Button
              variant={location.isActive ? "outline-warning" : "outline-success"}
              size="sm"
              onClick={(e) => handleToggleActiveClick(location, e)}
              title={location.isActive ? 'Desactivar' : 'Activar'}
            >
              <i className={`bi bi-${location.isActive ? 'pause' : 'play'}`}></i>
            </Button>
            
            {/* Edit */}
            <Link href={`/dashboard/inventory/warehouses/locations/${location.id}/edit`}>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                title="Editar"
              >
                <i className="bi bi-pencil"></i>
              </Button>
            </Link>
            
            {/* Delete */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => handleDeleteClick(location, e)}
              title="Eliminar"
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </div>
      </div>
    )
  }, [selectedIds, enableSelection, showHierarchy, handleRowSelection, handleDeleteClick, handleToggleActiveClick])
  
  // ===== EFFECTS =====
  
  // Console log para debugging (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 LocationsTableVirtualized render:', {
        locationsCount: locations.length,
        processedItemsCount: processedItems.length,
        selectedCount,
        showWarehouseGroups,
        showHierarchy,
      })
    }
  }, [locations.length, processedItems.length, selectedCount, showWarehouseGroups, showHierarchy])
  
  // ===== RENDER =====
  
  if (isLoading) {
    return (
      <div className="locations-table-loading text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando ubicaciones...</span>
        </div>
        <div className="text-muted">Cargando ubicaciones...</div>
      </div>
    )
  }
  
  if (locations.length === 0) {
    return (
      <div className="locations-table-empty text-center py-5">
        <i className="bi bi-geo-alt display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay ubicaciones para mostrar</h5>
      </div>
    )
  }
  
  return (
    <div className={`locations-table-virtualized ${className}`}>
      {/* Table Header */}
      <div className="table-header bg-light border rounded-top">
        <div className="d-flex align-items-center p-2 border-bottom">
          {/* Selection Header */}
          {enableSelection && (
            <div className="me-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate
                }}
                onChange={handleSelectAllChange}
                title={isAllSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
              />
            </div>
          )}
          
          {/* Headers */}
          <div className="flex-grow-1 fw-semibold">Ubicación</div>
          <div className="text-center fw-semibold" style={{ minWidth: '120px' }}>Tipo</div>
          <div className="text-center fw-semibold" style={{ minWidth: '120px' }}>Estado</div>
          <div className="text-center fw-semibold" style={{ minWidth: '100px' }}>Capacidad</div>
          <div className="text-center fw-semibold" style={{ minWidth: '120px' }}>Operativo</div>
          <div className="text-end fw-semibold" style={{ minWidth: '140px' }}>Acciones</div>
        </div>
      </div>
      
      {/* Virtualized Table Body */}
      <div 
        ref={parentRef}
        className="table-body border border-top-0 rounded-bottom"
        style={{ 
          height: `${maxHeight}px`,
          overflow: 'auto',
        }}
      >
        <div 
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = processedItems[virtualItem.index]
            
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {item.type === 'warehouse' 
                  ? renderWarehouseHeader(item.warehouse)
                  : renderLocationRow(item.location!, item.level)
                }
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Selection Summary */}
      {enableSelection && selectedCount > 0 && (
        <div className="selection-summary mt-2 p-2 bg-primary bg-opacity-10 rounded">
          <small className="text-primary">
            <i className="bi bi-check-square me-1"></i>
            {selectedCount} ubicación{selectedCount !== 1 ? 'es' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
          </small>
        </div>
      )}
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

LocationsTableVirtualized.displayName = 'LocationsTableVirtualized'

// ===== STYLES =====

const styles = `
.locations-table-virtualized {
  .location-row {
    transition: all 0.15s ease;
    border-left: 3px solid transparent;
  }
  
  .location-row:hover {
    background-color: rgba(13, 110, 253, 0.05) !important;
    border-left-color: #0d6efd;
  }
  
  .location-row.bg-primary.bg-opacity-10 {
    border-left-color: #0d6efd;
  }
  
  .hierarchy-indent {
    font-family: monospace;
    font-size: 0.75rem;
    line-height: 1;
    color: #6c757d;
  }
  
  .warehouse-group-header {
    background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
    border-left: 4px solid #0d6efd;
  }
  
  .btn-group-sm .btn {
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
  }
  
  .operational-flags .badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.3rem;
  }
  
  /* Loading & Empty States */
  .locations-table-loading,
  .locations-table-empty {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .location-info {
      flex: 1 1 0;
      min-width: 200px;
    }
    
    .location-type,
    .location-status,
    .location-capacity,
    .operational-flags {
      display: none;
    }
    
    .location-actions {
      min-width: 80px !important;
    }
    
    .location-actions .btn-group {
      flex-direction: column;
    }
    
    .warehouse-group-header .d-flex.gap-3 {
      display: none !important;
    }
  }
  
  @media (max-width: 576px) {
    .hierarchy-indent {
      display: none;
    }
    
    .location-row {
      padding: 0.75rem 0.5rem;
    }
    
    .table-header .d-flex > div:not(.flex-grow-1) {
      display: none;
    }
  }
}

/* Scrollbar styling */
.locations-table-virtualized .table-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.locations-table-virtualized .table-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.locations-table-virtualized .table-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.locations-table-virtualized .table-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation for new rows */
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.location-row {
  animation: slideInFromLeft 0.2s ease-out;
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="locations-table-virtualized"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'locations-table-virtualized')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default LocationsTableVirtualized