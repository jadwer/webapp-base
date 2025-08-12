/**
 * 📦 WAREHOUSES COMPACT - INVENTORY MODULE
 * Vista compacta enterprise optimizada para bulk operations
 * 
 * Features:
 * - Máxima densidad de información 
 * - Bulk selection optimizada
 * - Quick actions inline prominentes
 * - Ideal para gestión masiva
 * - Minimal visual noise
 * - Performance optimizada para 500K+ registros
 * - Keyboard navigation friendly
 */

'use client'

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Link from 'next/link'
import { getWarehouseTypeLabel } from '../services'
import type { Warehouse } from '../types'
import { Button } from '@/ui/components/base/Button'

// ===== COMPONENT PROPS =====

interface WarehousesCompactProps {
  warehouses: Warehouse[]
  isLoading?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onSelectAll?: () => void
  isAllSelected?: boolean
  onDelete?: (warehouse: Warehouse) => void
  onToggleActive?: (warehouse: Warehouse) => void
  onBulkAction?: (action: string, selectedIds: string[]) => void
  className?: string
  maxHeight?: number
}

// ===== CONFIGURATION =====

const ITEM_HEIGHT = 38 // Altura ultra-compacta por fila
const HEADER_HEIGHT = 32 // Header más pequeño
const DEFAULT_MAX_HEIGHT = 500

// Configuración de columnas optimizada para bulk operations
const COLUMNS = [
  { key: 'selection', label: '', width: '30px', sortable: false },
  { key: 'name', label: 'Nombre', width: '200px', sortable: true },
  { key: 'code', label: 'Código', width: '80px', sortable: true },
  { key: 'type', label: 'Tipo', width: '90px', sortable: true },
  { key: 'city', label: 'Ciudad', width: '120px', sortable: false },
  { key: 'status', label: 'Estado', width: '70px', sortable: false },
  { key: 'stats', label: 'Stats', width: '80px', sortable: false },
  { key: 'actions', label: 'Acciones', width: '140px', sortable: false },
] as const

// ===== COMPACT ROW COMPONENT =====

interface CompactRowProps {
  warehouse: Warehouse
  isSelected: boolean
  enableSelection: boolean
  onToggleSelection: (id: string) => void
  onDelete: (warehouse: Warehouse) => void
  onToggleActive: (warehouse: Warehouse) => void
  style: React.CSSProperties
}

const CompactRow: React.FC<CompactRowProps> = memo(({
  warehouse,
  isSelected,
  enableSelection,
  onToggleSelection,
  onDelete,
  onToggleActive,
  style,
}) => {
  
  const handleToggleSelection = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelection(warehouse.id)
  }, [warehouse.id, onToggleSelection])
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(warehouse)
  }, [warehouse, onDelete])
  
  const handleToggleActive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleActive(warehouse)
  }, [warehouse, onToggleActive])
  
  // Stats compactos
  const compactStats = useMemo(() => {
    const locations = warehouse.locations?.length || 0
    const stock = warehouse.stock?.length || 0
    return `${locations}L/${stock}S` // L=Locations, S=Stock
  }, [warehouse.locations, warehouse.stock])
  
  // Tipo abreviado
  const typeAbbrev = useMemo(() => {
    const abbrevs = {
      main: 'PRIN',
      secondary: 'SEC',
      distribution: 'DIST', 
      returns: 'DEV'
    }
    return abbrevs[warehouse.warehouseType] || 'UNK'
  }, [warehouse.warehouseType])
  
  return (
    <div 
      className={`compact-row d-flex align-items-center ${isSelected ? 'selected' : ''}`}
      style={style}
      title={`${warehouse.name} - ${warehouse.description || 'Sin descripción'}`}
    >
      {/* Selection */}
      <div className="compact-col" style={{ width: COLUMNS[0].width }}>
        {enableSelection && (
          <input
            className="form-check-input form-check-input-sm"
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelection}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
      
      {/* Name */}
      <div className="compact-col" style={{ width: COLUMNS[1].width }}>
        <Link 
          href={`/dashboard/inventory/warehouses/${warehouse.id}`}
          className="text-decoration-none compact-link"
          title={warehouse.name}
        >
          <span className="compact-text">{warehouse.name}</span>
        </Link>
      </div>
      
      {/* Code */}
      <div className="compact-col" style={{ width: COLUMNS[2].width }}>
        <code className="compact-code">{warehouse.code}</code>
      </div>
      
      {/* Type */}
      <div className="compact-col" style={{ width: COLUMNS[3].width }}>
        <span 
          className={`compact-type type-${warehouse.warehouseType}`}
          title={getWarehouseTypeLabel(warehouse.warehouseType)}
        >
          {typeAbbrev}
        </span>
      </div>
      
      {/* City */}
      <div className="compact-col" style={{ width: COLUMNS[4].width }}>
        <span className="compact-text text-muted" title={warehouse.city || 'Sin especificar'}>
          {warehouse.city || '-'}
        </span>
      </div>
      
      {/* Status */}
      <div className="compact-col" style={{ width: COLUMNS[5].width }}>
        <span 
          className={`compact-status status-${warehouse.isActive ? 'active' : 'inactive'}`}
          title={warehouse.isActive ? 'Activo' : 'Inactivo'}
        >
          <i className={`bi bi-${warehouse.isActive ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
        </span>
      </div>
      
      {/* Stats */}
      <div className="compact-col" style={{ width: COLUMNS[6].width }}>
        <span className="compact-stats" title={`${warehouse.locations?.length || 0} ubicaciones, ${warehouse.stock?.length || 0} stock items`}>
          {compactStats}
        </span>
      </div>
      
      {/* Actions */}
      <div className="compact-col" style={{ width: COLUMNS[7].width }}>
        <div className="compact-actions d-flex gap-1">
          <Link href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}>
            <button 
              className="btn btn-xs btn-outline-primary"
              title="Editar"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-pencil"></i>
            </button>
          </Link>
          
          <button 
            className={`btn btn-xs btn-outline-${warehouse.isActive ? 'warning' : 'success'}`}
            onClick={handleToggleActive}
            title={warehouse.isActive ? "Desactivar" : "Activar"}
          >
            <i className={`bi bi-${warehouse.isActive ? 'pause' : 'play'}`}></i>
          </button>
          
          <button 
            className="btn btn-xs btn-outline-danger"
            onClick={handleDelete}
            title="Eliminar"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  )
})

CompactRow.displayName = 'CompactRow'

// ===== MAIN COMPONENT =====

const WarehousesCompact: React.FC<WarehousesCompactProps> = memo(({
  warehouses,
  isLoading = false,
  enableSelection = true,
  selectedIds = [],
  onToggleSelection = () => {},
  onSelectAll = () => {},
  isAllSelected = false,
  onDelete = () => {},
  onToggleActive = () => {},
  onBulkAction = () => {},
  className = '',
  maxHeight = DEFAULT_MAX_HEIGHT,
}) => {
  
  // ===== REFS =====
  
  const parentRef = useRef<HTMLDivElement>(null)
  
  // ===== VIRTUALIZER =====
  
  const virtualizer = useVirtualizer({
    count: warehouses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5, // Menos overscan para vista compacta
  })
  
  // ===== HANDLERS =====
  
  const handleSelectAll = useCallback(() => {
    onSelectAll()
  }, [onSelectAll])
  
  const handleBulkActivate = useCallback(() => {
    if (selectedIds.length > 0) {
      onBulkAction('activate', selectedIds)
    }
  }, [selectedIds, onBulkAction])
  
  const handleBulkDeactivate = useCallback(() => {
    if (selectedIds.length > 0) {
      onBulkAction('deactivate', selectedIds)
    }
  }, [selectedIds, onBulkAction])
  
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      onBulkAction('delete', selectedIds)
    }
  }, [selectedIds, onBulkAction])
  
  // ===== COMPUTED VALUES =====
  
  const items = virtualizer.getVirtualItems()
  const totalHeight = virtualizer.getTotalSize()
  const adjustedMaxHeight = Math.min(maxHeight, totalHeight + HEADER_HEIGHT)
  
  const headerCheckboxState = useMemo(() => {
    if (selectedIds.length === 0) return 'unchecked'
    if (isAllSelected || selectedIds.length === warehouses.length) return 'checked'
    return 'indeterminate'
  }, [selectedIds.length, isAllSelected, warehouses.length])
  
  const hasSelection = selectedIds.length > 0
  
  // ===== EFFECTS =====
  
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0
    }
  }, [warehouses])
  
  // ===== LOADING STATE =====
  
  if (isLoading && warehouses.length === 0) {
    return (
      <div className={`warehouses-compact-loading ${className}`}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando almacenes...</span>
          </div>
        </div>
      </div>
    )
  }
  
  // ===== EMPTY STATE =====
  
  if (warehouses.length === 0) {
    return (
      <div className={`warehouses-compact-empty ${className}`}>
        <div className="text-center py-4">
          <i className="bi bi-list-columns display-4 text-muted mb-3"></i>
          <h6 className="text-muted">No hay almacenes para mostrar</h6>
          <small className="text-muted">Vista compacta ideal para bulk operations</small>
        </div>
      </div>
    )
  }
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={`warehouses-compact ${className}`}>
      
      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="bulk-actions-bar d-flex justify-content-between align-items-center p-2 bg-light border rounded-top">
          <div className="bulk-info">
            <strong>{selectedIds.length}</strong> almacenes seleccionados
          </div>
          <div className="bulk-buttons d-flex gap-1">
            <button 
              className="btn btn-xs btn-success"
              onClick={handleBulkActivate}
              title="Activar seleccionados"
            >
              <i className="bi bi-play-fill me-1"></i>
              Activar
            </button>
            <button 
              className="btn btn-xs btn-warning"
              onClick={handleBulkDeactivate}
              title="Desactivar seleccionados"
            >
              <i className="bi bi-pause-fill me-1"></i>
              Desactivar
            </button>
            <button 
              className="btn btn-xs btn-danger"
              onClick={handleBulkDelete}
              title="Eliminar seleccionados"
            >
              <i className="bi bi-trash me-1"></i>
              Eliminar
            </button>
          </div>
        </div>
      )}
      
      {/* Compact Table */}
      <div className={`compact-table ${hasSelection ? 'with-bulk-bar' : ''}`}>
        
        {/* Header */}
        <div className="compact-header d-flex align-items-center bg-light border-bottom">
          {COLUMNS.map((column) => (
            <div 
              key={column.key}
              className="compact-header-col"
              style={{ width: column.width }}
            >
              {column.key === 'selection' && enableSelection ? (
                <input
                  className="form-check-input form-check-input-sm"
                  type="checkbox"
                  checked={headerCheckboxState === 'checked'}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = headerCheckboxState === 'indeterminate'
                    }
                  }}
                  onChange={handleSelectAll}
                  title={headerCheckboxState === 'checked' ? 'Deseleccionar todos' : 'Seleccionar todos'}
                />
              ) : (
                <span className="compact-header-text">{column.label}</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Virtualized Content */}
        <div 
          ref={parentRef}
          className="compact-content"
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
                <CompactRow
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
      </div>
      
      {/* Loading overlay para refreshes */}
      {isLoading && warehouses.length > 0 && (
        <div className="compact-loading-overlay">
          <div className="d-flex justify-content-center">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Actualizando...</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

WarehousesCompact.displayName = 'WarehousesCompact'

// ===== STYLES =====

const styles = `
.warehouses-compact {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
  background: white;
}

.warehouses-compact.with-bulk-bar .compact-table {
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
}

.bulk-actions-bar {
  border-bottom: 1px solid #dee2e6;
  font-size: 0.875rem;
}

.bulk-actions-bar .btn-xs {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.compact-table {
  border-radius: 0.375rem;
  overflow: hidden;
}

.compact-header {
  height: ${HEADER_HEIGHT}px;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  position: sticky;
  top: 0;
  z-index: 10;
}

.compact-header-col {
  padding: 0 0.25rem;
  overflow: hidden;
}

.compact-header-text {
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.compact-row {
  height: ${ITEM_HEIGHT}px;
  padding: 0 0.5rem;
  font-size: 0.8rem;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.compact-row:hover {
  background-color: #f8f9fa;
}

.compact-row.selected {
  background-color: #e7f3ff;
  border-left: 2px solid #0d6efd;
}

.compact-col {
  padding: 0 0.25rem;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.compact-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
}

.compact-link {
  color: #212529 !important;
  transition: color 0.15s ease;
}

.compact-row:hover .compact-link {
  color: #0d6efd !important;
}

.compact-code {
  font-size: 0.7rem;
  background: #f8f9fa;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.compact-type {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-align: center;
  min-width: 40px;
}

.compact-type.type-main {
  background: #e7f3ff;
  color: #0d6efd;
}

.compact-type.type-secondary {
  background: #e1f5fe;
  color: #0dcaf0;
}

.compact-type.type-distribution {
  background: #e8f5e8;
  color: #198754;
}

.compact-type.type-returns {
  background: #fff3cd;
  color: #ffc107;
}

.compact-status {
  font-size: 0.9rem;
}

.compact-status.status-active {
  color: #198754;
}

.compact-status.status-inactive {
  color: #6c757d;
}

.compact-stats {
  font-size: 0.7rem;
  color: #6c757d;
  font-family: 'Courier New', monospace;
}

.compact-actions {
  justify-content: flex-end;
}

.btn-xs {
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  line-height: 1.2;
}

.btn-xs i {
  font-size: 0.8rem;
}

.form-check-input-sm {
  transform: scale(0.9);
}

.compact-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .compact-row,
  .compact-header {
    padding: 0 0.25rem;
  }
  
  .compact-col {
    padding: 0 0.125rem;
  }
  
  .compact-text {
    font-size: 0.75rem;
  }
  
  .btn-xs {
    font-size: 0.65rem;
    padding: 0.1rem 0.25rem;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch !important;
  }
  
  .bulk-buttons {
    justify-content: center !important;
  }
}

/* Custom scrollbar for compact view */
.compact-content::-webkit-scrollbar {
  width: 6px;
}

.compact-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.compact-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.compact-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Selection animation */
.compact-row.selected {
  animation: selectHighlight 0.3s ease;
}

@keyframes selectHighlight {
  0% {
    background-color: #cce7ff;
  }
  100% {
    background-color: #e7f3ff;
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="warehouses-compact"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouses-compact')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehousesCompact