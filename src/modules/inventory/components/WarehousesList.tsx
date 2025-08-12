/**
 * 📦 WAREHOUSES LIST - INVENTORY MODULE
 * Vista lista detallada enterprise para almacenes
 * 
 * Features:
 * - Lista detallada con toda la información visible
 * - Expandable rows para información adicional
 * - Ideal para mobile y tablet
 * - Información jerárquica bien organizada
 * - Quick actions inline
 * - Loading skeleton states
 * - Responsive design optimizado
 */

'use client'

import React, { memo, useMemo, useCallback, useState } from 'react'
import Link from 'next/link'
import { getWarehouseTypeLabel, formatCapacity } from '../services'
import type { Warehouse } from '../types'
import { Button } from '@/ui/components/base/Button'

// ===== COMPONENT PROPS =====

interface WarehousesListProps {
  warehouses: Warehouse[]
  isLoading?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onDelete?: (warehouse: Warehouse) => void
  onToggleActive?: (warehouse: Warehouse) => void
  className?: string
  showExpandable?: boolean
}

// ===== WAREHOUSE LIST ITEM COMPONENT =====

interface WarehouseListItemProps {
  warehouse: Warehouse
  isSelected: boolean
  enableSelection: boolean
  onToggleSelection: (id: string) => void
  onDelete: (warehouse: Warehouse) => void
  onToggleActive: (warehouse: Warehouse) => void
  showExpandable: boolean
}

const WarehouseListItem: React.FC<WarehouseListItemProps> = memo(({
  warehouse,
  isSelected,
  enableSelection,
  onToggleSelection,
  onDelete,
  onToggleActive,
  showExpandable,
}) => {
  
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleToggleSelection = useCallback(() => {
    onToggleSelection(warehouse.id)
  }, [warehouse.id, onToggleSelection])
  
  const handleDelete = useCallback(() => {
    onDelete(warehouse)
  }, [warehouse, onDelete])
  
  const handleToggleActive = useCallback(() => {
    onToggleActive(warehouse)
  }, [warehouse, onToggleActive])
  
  const toggleExpanded = useCallback(() => {
    if (showExpandable) {
      setIsExpanded(!isExpanded)
    }
  }, [showExpandable, isExpanded])
  
  // Formatear información
  const location = useMemo(() => {
    const parts = [warehouse.city, warehouse.state, warehouse.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }, [warehouse.city, warehouse.state, warehouse.country])
  
  const capacity = useMemo(() => {
    if (!warehouse.maxCapacity) return null
    return formatCapacity(warehouse.maxCapacity, warehouse.capacityUnit || '')
  }, [warehouse.maxCapacity, warehouse.capacityUnit])
  
  // Stats del warehouse
  const stats = useMemo(() => ({
    locationCount: warehouse.locations?.length || 0,
    stockCount: warehouse.stock?.length || 0,
    hasFullContact: !!(warehouse.phone && warehouse.email && warehouse.managerName),
    hasPartialContact: !!(warehouse.phone || warehouse.email || warehouse.managerName),
  }), [warehouse])
  
  // Color del tipo
  const typeColor = useMemo(() => {
    const colors = {
      main: 'primary',
      secondary: 'info',
      distribution: 'success', 
      returns: 'warning',
    }
    return colors[warehouse.warehouseType] || 'secondary'
  }, [warehouse.warehouseType])
  
  return (
    <div className={`warehouse-list-item ${isSelected ? 'selected' : ''}`}>
      {/* Main Row */}
      <div className="warehouse-main-row d-flex align-items-center p-3">
        
        {/* Selection Checkbox */}
        {enableSelection && (
          <div className="warehouse-selection me-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isSelected}
                onChange={handleToggleSelection}
                id={`warehouse-list-${warehouse.id}`}
              />
            </div>
          </div>
        )}
        
        {/* Expand Button */}
        {showExpandable && (
          <button
            className="btn btn-sm btn-ghost me-2"
            onClick={toggleExpanded}
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
        )}
        
        {/* Warehouse Icon */}
        <div className="warehouse-icon me-3">
          <div className={`warehouse-type-icon bg-${typeColor} text-white rounded-circle d-flex align-items-center justify-content-center`}>
            <i className="bi bi-building"></i>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="warehouse-content flex-grow-1">
          <div className="row align-items-center">
            
            {/* Primary Info */}
            <div className="col-lg-5 col-md-6 mb-2 mb-md-0">
              <div className="warehouse-primary">
                <h6 className="warehouse-name mb-1">
                  <Link 
                    href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                    className="text-decoration-none text-dark"
                  >
                    {warehouse.name}
                  </Link>
                </h6>
                
                <div className="warehouse-meta d-flex align-items-center gap-2 mb-1">
                  <code className="badge bg-light text-dark small">{warehouse.code}</code>
                  <span className={`badge bg-${typeColor} small`}>
                    {getWarehouseTypeLabel(warehouse.warehouseType)}
                  </span>
                  <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'} small`}>
                    <i className={`bi bi-${warehouse.isActive ? 'check-circle' : 'x-circle'} me-1`}></i>
                    {warehouse.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                {warehouse.description && (
                  <div className="warehouse-description text-muted small">
                    {warehouse.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Location & Contact */}
            <div className="col-lg-4 col-md-6 mb-2 mb-lg-0">
              <div className="warehouse-secondary">
                {location && (
                  <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-geo-alt text-muted me-2 small-icon"></i>
                    <span className="small text-muted">{location}</span>
                  </div>
                )}
                
                {warehouse.managerName && (
                  <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-person text-muted me-2 small-icon"></i>
                    <span className="small">{warehouse.managerName}</span>
                  </div>
                )}
                
                {(warehouse.phone || warehouse.email) && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-telephone text-muted me-2 small-icon"></i>
                    <div className="small">
                      {warehouse.phone && (
                        <a href={`tel:${warehouse.phone}`} className="text-decoration-none me-2">
                          {warehouse.phone}
                        </a>
                      )}
                      {warehouse.email && (
                        <a href={`mailto:${warehouse.email}`} className="text-decoration-none">
                          <i className="bi bi-envelope"></i>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats & Actions */}
            <div className="col-lg-3">
              <div className="warehouse-actions d-flex justify-content-between align-items-center">
                
                {/* Quick Stats */}
                <div className="warehouse-stats d-flex gap-3">
                  <div className="text-center">
                    <div className="small fw-medium text-primary">{stats.locationCount}</div>
                    <div className="x-small text-muted">Ubic.</div>
                  </div>
                  <div className="text-center">
                    <div className="small fw-medium text-success">{stats.stockCount}</div>
                    <div className="x-small text-muted">Stock</div>
                  </div>
                  {capacity && (
                    <div className="text-center">
                      <div className="small fw-medium">{capacity.split(' ')[0]}</div>
                      <div className="x-small text-muted">{capacity.split(' ').slice(1).join(' ') || 'Cap.'}</div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="btn-group btn-group-sm">
                  <Link href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}>
                    <Button variant="outline-secondary" size="sm" title="Editar">
                      <i className="bi bi-pencil"></i>
                    </Button>
                  </Link>
                  
                  <Button
                    variant={warehouse.isActive ? "outline-warning" : "outline-success"}
                    size="sm"
                    onClick={handleToggleActive}
                    title={warehouse.isActive ? "Desactivar" : "Activar"}
                  >
                    <i className={`bi bi-${warehouse.isActive ? 'pause' : 'play'}`}></i>
                  </Button>
                  
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDelete}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {showExpandable && isExpanded && (
        <div className="warehouse-expanded-content bg-light p-3 border-top">
          <div className="row g-3">
            
            {/* Full Address */}
            {warehouse.address && (
              <div className="col-md-6">
                <h6 className="small text-muted mb-2">
                  <i className="bi bi-geo-alt me-1"></i>
                  Dirección Completa
                </h6>
                <div className="small">
                  <div>{warehouse.address}</div>
                  {location && <div className="text-muted">{location}</div>}
                  {warehouse.postalCode && <div className="text-muted">CP: {warehouse.postalCode}</div>}
                </div>
              </div>
            )}
            
            {/* Capacity & Operations */}
            <div className="col-md-6">
              <h6 className="small text-muted mb-2">
                <i className="bi bi-speedometer me-1"></i>
                Operaciones
              </h6>
              <div className="small">
                {capacity && <div><strong>Capacidad:</strong> {capacity}</div>}
                {warehouse.operatingHours && <div><strong>Horarios:</strong> {warehouse.operatingHours}</div>}
                <div><strong>Creado:</strong> {new Date(warehouse.createdAt).toLocaleDateString('es-ES')}</div>
              </div>
            </div>
            
            {/* Features */}
            <div className="col-12">
              <div className="d-flex flex-wrap gap-2">
                {stats.hasFullContact && (
                  <span className="badge bg-success">
                    <i className="bi bi-person-check me-1"></i>
                    Contacto Completo
                  </span>
                )}
                {stats.hasPartialContact && !stats.hasFullContact && (
                  <span className="badge bg-warning">
                    <i className="bi bi-person-exclamation me-1"></i>
                    Contacto Parcial
                  </span>
                )}
                {warehouse.maxCapacity && (
                  <span className="badge bg-info">
                    <i className="bi bi-speedometer me-1"></i>
                    Con Capacidad
                  </span>
                )}
                {warehouse.operatingHours && (
                  <span className="badge bg-secondary">
                    <i className="bi bi-clock me-1"></i>
                    Horarios Definidos
                  </span>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  )
})

WarehouseListItem.displayName = 'WarehouseListItem'

// ===== LOADING SKELETON =====

const WarehouseListSkeleton: React.FC = memo(() => (
  <div className="warehouse-list-item">
    <div className="warehouse-main-row d-flex align-items-center p-3">
      <div className="warehouse-icon me-3">
        <div className="placeholder-glow">
          <div className="placeholder rounded-circle bg-secondary" style={{ width: '40px', height: '40px' }}></div>
        </div>
      </div>
      <div className="warehouse-content flex-grow-1">
        <div className="row align-items-center">
          <div className="col-lg-5 col-md-6">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-2"></div>
              <div className="placeholder col-12 mb-1"></div>
              <div className="placeholder col-6"></div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="placeholder-glow">
              <div className="placeholder col-10 mb-1"></div>
              <div className="placeholder col-8 mb-1"></div>
              <div className="placeholder col-6"></div>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="placeholder-glow d-flex justify-content-end">
              <div className="placeholder col-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
))

WarehouseListSkeleton.displayName = 'WarehouseListSkeleton'

// ===== MAIN COMPONENT =====

const WarehousesList: React.FC<WarehousesListProps> = memo(({
  warehouses,
  isLoading = false,
  enableSelection = true,
  selectedIds = [],
  onToggleSelection = () => {},
  onDelete = () => {},
  onToggleActive = () => {},
  className = '',
  showExpandable = true,
}) => {
  
  // ===== LOADING STATE =====
  
  if (isLoading && warehouses.length === 0) {
    return (
      <div className={`warehouses-list ${className}`}>
        <div className="warehouses-list-container">
          {Array.from({ length: 6 }).map((_, index) => (
            <WarehouseListSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }
  
  // ===== EMPTY STATE =====
  
  if (warehouses.length === 0) {
    return (
      <div className={`warehouses-list-empty ${className}`}>
        <div className="text-center py-5">
          <i className="bi bi-list-ul display-1 text-muted mb-3"></i>
          <h5 className="text-muted mb-3">No hay almacenes para mostrar</h5>
          <p className="text-muted">
            Los almacenes aparecerán aquí en formato de lista detallada
          </p>
        </div>
      </div>
    )
  }
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={`warehouses-list ${className}`}>
      <div className="warehouses-list-container">
        {warehouses.map((warehouse) => {
          const isSelected = selectedIds.includes(warehouse.id)
          
          return (
            <WarehouseListItem
              key={warehouse.id}
              warehouse={warehouse}
              isSelected={isSelected}
              enableSelection={enableSelection}
              onToggleSelection={onToggleSelection}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              showExpandable={showExpandable}
            />
          )
        })}
      </div>
      
      {/* Loading overlay para refreshes */}
      {isLoading && warehouses.length > 0 && (
        <div className="warehouses-list-loading-overlay">
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

WarehousesList.displayName = 'WarehousesList'

// ===== STYLES =====

const styles = `
.warehouses-list {
  position: relative;
}

.warehouses-list-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
}

.warehouse-list-item {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.warehouse-list-item:last-child {
  border-bottom: none;
}

.warehouse-list-item:hover {
  background-color: #f8f9fa;
}

.warehouse-list-item.selected {
  background-color: #e7f3ff;
  border-left: 3px solid #0d6efd;
}

.warehouse-type-icon {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
}

.warehouse-name a {
  color: #212529 !important;
  transition: color 0.2s ease;
}

.warehouse-list-item:hover .warehouse-name a {
  color: #0d6efd !important;
}

.warehouse-meta .badge {
  font-size: 0.7rem;
}

.warehouse-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.small-icon {
  width: 14px;
  flex-shrink: 0;
}

.warehouse-stats {
  min-width: 120px;
}

.x-small {
  font-size: 0.7rem;
}

.warehouse-expanded-content {
  animation: expandIn 0.2s ease-out;
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-ghost {
  background: transparent !important;
  border: none !important;
  color: #6c757d;
  transition: color 0.2s ease;
}

.btn-ghost:hover {
  color: #0d6efd !important;
  background: transparent !important;
}

.warehouses-list-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .warehouse-stats {
    min-width: auto;
    gap: 1rem !important;
  }
  
  .warehouse-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .warehouse-main-row {
    padding: 1rem !important;
  }
  
  .warehouse-type-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .warehouse-meta {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.25rem !important;
  }
  
  .warehouse-stats {
    justify-content: space-around;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .warehouse-actions {
    width: 100%;
    justify-content: center;
  }
  
  .warehouse-expanded-content {
    padding: 1rem !important;
  }
}

@media (max-width: 576px) {
  .warehouse-selection {
    margin-right: 0.5rem !important;
  }
  
  .warehouse-icon {
    margin-right: 0.5rem !important;
  }
  
  .warehouse-name {
    font-size: 0.9rem;
  }
  
  .btn-group {
    flex-direction: column;
    width: auto;
  }
  
  .btn-group .btn {
    border-radius: 0.25rem !important;
    margin-bottom: 0.25rem;
  }
}

/* Animation for loading skeletons */
.placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="warehouses-list"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouses-list')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehousesList