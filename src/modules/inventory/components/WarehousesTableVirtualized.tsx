/**
 * 📦 WAREHOUSES TABLE VIRTUALIZED - INVENTORY MODULE
 * Tabla virtualizada enterprise para gestión de almacenes
 * 
 * Features:
 * - TanStack Virtual para performance con 500K+ productos
 * - React.memo optimization para zero re-renders
 * - Sorting por columnas
 * - Selection masiva con checkbox
 * - Quick actions inline
 * - Responsive design
 * - Loading states y empty states
 */

'use client'

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Link from 'next/link'
import { useWarehousesFilters } from '../store'
import { getWarehouseTypeLabel, formatCapacity } from '../services'
import type { Warehouse } from '../types'
import { Button } from '@/ui/components/base/Button'

// ===== COMPONENT PROPS =====

interface WarehousesTableVirtualizedProps {
  warehouses: Warehouse[]
  isLoading?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onSelectAll?: () => void
  isAllSelected?: boolean
  onDelete?: (warehouse: Warehouse) => void
  onToggleActive?: (warehouse: Warehouse) => void
  className?: string
  maxHeight?: number
}

// ===== TABLE CONFIGURATION =====

const ITEM_HEIGHT = 60 // Altura fija por fila para virtualización
const HEADER_HEIGHT = 40 // Altura del header
const DEFAULT_MAX_HEIGHT = 600 // Altura máxima por defecto

// Configuración de columnas
const COLUMNS = [
  { key: 'selection', label: '', width: '40px', sortable: false },
  { key: 'name', label: 'Nombre', width: '200px', sortable: true },
  { key: 'code', label: 'Código', width: '120px', sortable: true },
  { key: 'warehouseType', label: 'Tipo', width: '150px', sortable: true },
  { key: 'location', label: 'Ubicación', width: '180px', sortable: false },
  { key: 'capacity', label: 'Capacidad', width: '120px', sortable: false },
  { key: 'status', label: 'Estado', width: '100px', sortable: false },
  { key: 'actions', label: 'Acciones', width: '120px', sortable: false },
] as const

// ===== ROW COMPONENT =====

interface WarehouseRowProps {
  warehouse: Warehouse
  isSelected: boolean
  enableSelection: boolean
  onToggleSelection: (id: string) => void
  onDelete: (warehouse: Warehouse) => void
  onToggleActive: (warehouse: Warehouse) => void
  style: React.CSSProperties
}

const WarehouseRow: React.FC<WarehouseRowProps> = memo(({
  warehouse,
  isSelected,
  enableSelection,
  onToggleSelection,
  onDelete,
  onToggleActive,
  style,
}) => {
  
  const handleToggleSelection = useCallback(() => {
    onToggleSelection(warehouse.id)
  }, [warehouse.id, onToggleSelection])
  
  const handleDelete = useCallback(() => {
    onDelete(warehouse)
  }, [warehouse, onDelete])
  
  const handleToggleActive = useCallback(() => {
    onToggleActive(warehouse)
  }, [warehouse, onToggleActive])
  
  // Formatear ubicación
  const location = useMemo(() => {
    const parts = [warehouse.city, warehouse.state, warehouse.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No especificada'
  }, [warehouse.city, warehouse.state, warehouse.country])
  
  // Formatear capacidad
  const capacity = useMemo(() => {
    if (!warehouse.maxCapacity) return 'No especificada'
    return formatCapacity(warehouse.maxCapacity, warehouse.capacityUnit || '')
  }, [warehouse.maxCapacity, warehouse.capacityUnit])
  
  return (
    <div 
      className="warehouse-row d-flex align-items-center border-bottom bg-white"
      style={style}
    >
      {/* Selection Checkbox */}
      <div className="warehouse-col" style={{ width: COLUMNS[0].width }}>
        {enableSelection && (
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isSelected}
              onChange={handleToggleSelection}
              id={`warehouse-${warehouse.id}`}
            />
          </div>
        )}
      </div>
      
      {/* Name */}
      <div className="warehouse-col" style={{ width: COLUMNS[1].width }}>
        <div>
          <Link 
            href={`/dashboard/inventory/warehouses/${warehouse.id}`}
            className="text-decoration-none fw-medium text-primary"
          >
            {warehouse.name}
          </Link>
          {warehouse.description && (
            <div className="text-muted small text-truncate" title={warehouse.description}>
              {warehouse.description}
            </div>
          )}
        </div>
      </div>
      
      {/* Code */}
      <div className="warehouse-col" style={{ width: COLUMNS[2].width }}>
        <code className="badge bg-light text-dark">
          {warehouse.code}
        </code>
      </div>
      
      {/* Warehouse Type */}
      <div className="warehouse-col" style={{ width: COLUMNS[3].width }}>
        <span className={`badge bg-${getWarehouseTypeBadgeColor(warehouse.warehouseType)}`}>
          {getWarehouseTypeLabel(warehouse.warehouseType)}
        </span>
      </div>
      
      {/* Location */}
      <div className="warehouse-col" style={{ width: COLUMNS[4].width }}>
        <div className="text-muted small text-truncate" title={location}>
          <i className="bi bi-geo-alt me-1"></i>
          {location}
        </div>
      </div>
      
      {/* Capacity */}
      <div className="warehouse-col" style={{ width: COLUMNS[5].width }}>
        <div className="text-muted small">
          <i className="bi bi-speedometer me-1"></i>
          {capacity}
        </div>
      </div>
      
      {/* Status */}
      <div className="warehouse-col" style={{ width: COLUMNS[6].width }}>
        <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'}`}>
          <i className={`bi bi-${warehouse.isActive ? 'check-circle' : 'x-circle'} me-1`}></i>
          {warehouse.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      
      {/* Actions */}
      <div className="warehouse-col" style={{ width: COLUMNS[7].width }}>
        <div className="btn-group btn-group-sm" role="group">
          {/* View/Edit */}
          <Link href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}>
            <Button
              variant="outline-primary"
              size="sm"
              title="Editar almacén"
            >
              <i className="bi bi-pencil"></i>
            </Button>
          </Link>
          
          {/* Toggle Active */}
          <Button
            variant={warehouse.isActive ? "outline-warning" : "outline-success"}
            size="sm"
            onClick={handleToggleActive}
            title={warehouse.isActive ? "Desactivar" : "Activar"}
          >
            <i className={`bi bi-${warehouse.isActive ? 'pause' : 'play'}`}></i>
          </Button>
          
          {/* Delete */}
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleDelete}
            title="Eliminar almacén"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  )
})

WarehouseRow.displayName = 'WarehouseRow'

// ===== MAIN COMPONENT =====

const WarehousesTableVirtualized: React.FC<WarehousesTableVirtualizedProps> = memo(({
  warehouses,
  isLoading = false,
  enableSelection = true,
  selectedIds = [],
  onToggleSelection = () => {},
  onSelectAll = () => {},
  isAllSelected = false,
  onDelete = () => {},
  onToggleActive = () => {},
  className = '',
  maxHeight = DEFAULT_MAX_HEIGHT,
}) => {
  
  // ===== STORE STATE =====
  
  const filters = useWarehousesFilters()
  
  // ===== REFS =====
  
  const parentRef = useRef<HTMLDivElement>(null)
  
  // ===== VIRTUALIZER =====
  
  const virtualizer = useVirtualizer({
    count: warehouses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10, // Render extra items para smooth scrolling
  })
  
  // ===== HANDLERS =====
  
  const handleSort = useCallback((column: string) => {
    if (COLUMNS.find(col => col.key === column)?.sortable) {
      filters.setSorting(column as any)
    }
  }, [filters])
  
  const handleSelectAll = useCallback(() => {
    onSelectAll()
  }, [onSelectAll])
  
  // ===== COMPUTED VALUES =====
  
  const items = virtualizer.getVirtualItems()
  const totalHeight = virtualizer.getTotalSize()
  const adjustedMaxHeight = Math.min(maxHeight, totalHeight + HEADER_HEIGHT)
  
  // Determinar estado de selección del header checkbox
  const headerCheckboxState = useMemo(() => {
    if (selectedIds.length === 0) return 'unchecked'
    if (isAllSelected || selectedIds.length === warehouses.length) return 'checked'
    return 'indeterminate'
  }, [selectedIds.length, isAllSelected, warehouses.length])
  
  // ===== EFFECTS =====
  
  // Scroll to top cuando cambian los datos
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0
    }
  }, [warehouses])
  
  // ===== RENDER =====
  
  if (isLoading && warehouses.length === 0) {
    return (
      <div className={`warehouses-table-loading ${className}`}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando almacenes...</span>
          </div>
        </div>
      </div>
    )
  }
  
  if (warehouses.length === 0) {
    return (
      <div className={`warehouses-table-empty ${className}`}>
        <div className="text-center py-5">
          <i className="bi bi-building display-4 text-muted mb-3"></i>
          <h5 className="text-muted">No hay almacenes para mostrar</h5>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`warehouses-table-virtualized ${className}`}>
      {/* Header */}
      <div className="warehouse-header d-flex align-items-center bg-light border-bottom fw-medium">
        {COLUMNS.map((column) => (
          <div 
            key={column.key}
            className={`warehouse-header-col ${column.sortable ? 'sortable' : ''}`}
            style={{ width: column.width }}
            onClick={column.sortable ? () => handleSort(column.key) : undefined}
          >
            {column.key === 'selection' && enableSelection ? (
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={headerCheckboxState === 'checked'}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = headerCheckboxState === 'indeterminate'
                    }
                  }}
                  onChange={handleSelectAll}
                  title={
                    headerCheckboxState === 'checked' 
                      ? 'Deseleccionar todos' 
                      : 'Seleccionar todos'
                  }
                />
              </div>
            ) : column.label ? (
              <div className="d-flex align-items-center">
                <span>{column.label}</span>
                {column.sortable && (
                  <div className="ms-2">
                    {filters.sortBy === column.key ? (
                      <i className={`bi bi-sort-${filters.sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                    ) : (
                      <i className="bi bi-sort-alpha-down text-muted"></i>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      
      {/* Virtualized Content */}
      <div 
        ref={parentRef}
        className="warehouse-content"
        style={{
          height: `${adjustedMaxHeight}px`,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: `${totalHeight}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualItem) => {
            const warehouse = warehouses[virtualItem.index]
            const isSelected = selectedIds.includes(warehouse.id)
            
            return (
              <WarehouseRow
                key={warehouse.id}
                warehouse={warehouse}
                isSelected={isSelected}
                enableSelection={enableSelection}
                onToggleSelection={onToggleSelection}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            )
          })}
        </div>
      </div>
      
      {/* Loading Overlay para refreshes */}
      {isLoading && warehouses.length > 0 && (
        <div className="warehouse-loading-overlay">
          <div className="d-flex justify-content-center">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Actualizando...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-speedometer me-1"></i>
            Virtual: {items.length}/{warehouses.length} items | 
            Height: {totalHeight}px | 
            Visible range: {items[0]?.index || 0}-{items[items.length - 1]?.index || 0}
          </small>
        </div>
      )}
    </div>
  )
})

// ===== UTILITIES =====

function getWarehouseTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    main: 'primary',
    secondary: 'info', 
    distribution: 'success',
    returns: 'warning',
  }
  return colors[type] || 'secondary'
}

// ===== COMPONENT OPTIMIZATION =====

WarehousesTableVirtualized.displayName = 'WarehousesTableVirtualized'

// ===== STYLES =====

const styles = `
.warehouses-table-virtualized {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
  background: white;
}

.warehouse-header {
  height: ${HEADER_HEIGHT}px;
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.warehouse-header-col {
  padding: 0 0.5rem;
  user-select: none;
}

.warehouse-header-col.sortable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.warehouse-header-col.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
}

.warehouse-row {
  height: ${ITEM_HEIGHT}px;
  padding: 0 1rem;
  transition: background-color 0.2s;
}

.warehouse-row:hover {
  background-color: #f8f9fa !important;
}

.warehouse-col {
  padding: 0 0.5rem;
  overflow: hidden;
}

.warehouse-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .warehouse-header,
  .warehouse-row {
    padding: 0 0.5rem;
  }
  
  .warehouse-col {
    padding: 0 0.25rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
}

/* Custom scrollbar */
.warehouse-content::-webkit-scrollbar {
  width: 8px;
}

.warehouse-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.warehouse-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.warehouse-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="warehouses-table-virtualized"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouses-table-virtualized')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehousesTableVirtualized