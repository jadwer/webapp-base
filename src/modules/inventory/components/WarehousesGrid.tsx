/**
 * 📦 WAREHOUSES GRID - INVENTORY MODULE
 * Vista grid enterprise con cards visuales para almacenes
 * 
 * Features:
 * - Cards atractivos con información clave
 * - Stats visuales por warehouse type
 * - Hover effects profesionales
 * - Responsive grid layout (1-4 columnas)
 * - Loading skeleton states
 * - Empty state handling
 */

'use client'

import React, { memo, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { getWarehouseTypeLabel, formatCapacity } from '../services'
import type { Warehouse } from '../types'
import { Button } from '@/ui/components/base/Button'

// ===== COMPONENT PROPS =====

interface WarehousesGridProps {
  warehouses: Warehouse[]
  isLoading?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onDelete?: (warehouse: Warehouse) => void
  onToggleActive?: (warehouse: Warehouse) => void
  className?: string
}

// ===== WAREHOUSE CARD COMPONENT =====

interface WarehouseCardProps {
  warehouse: Warehouse
  isSelected: boolean
  enableSelection: boolean
  onToggleSelection: (id: string) => void
  onDelete: (warehouse: Warehouse) => void
  onToggleActive: (warehouse: Warehouse) => void
}

const WarehouseCard: React.FC<WarehouseCardProps> = memo(({
  warehouse,
  isSelected,
  enableSelection,
  onToggleSelection,
  onDelete,
  onToggleActive,
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
    return parts.length > 0 ? parts.join(', ') : null
  }, [warehouse.city, warehouse.state, warehouse.country])
  
  // Formatear capacidad
  const capacity = useMemo(() => {
    if (!warehouse.maxCapacity) return null
    return formatCapacity(warehouse.maxCapacity, warehouse.capacityUnit || '')
  }, [warehouse.maxCapacity, warehouse.capacityUnit])
  
  // Stats del warehouse
  const stats = useMemo(() => {
    const locationCount = warehouse.locations?.length || 0
    const stockCount = warehouse.stock?.length || 0
    const hasContact = !!(warehouse.phone || warehouse.email || warehouse.managerName)
    
    return {
      locationCount,
      stockCount,
      hasContact,
      hasCapacity: !!warehouse.maxCapacity,
    }
  }, [warehouse])
  
  // Color del tipo de warehouse
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
    <div className={`warehouse-card card h-100 ${isSelected ? 'border-primary' : ''}`}>
      {/* Card Header */}
      <div className="card-header d-flex justify-content-between align-items-start p-3">
        <div className="flex-grow-1">
          {/* Selection checkbox */}
          {enableSelection && (
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isSelected}
                onChange={handleToggleSelection}
                id={`warehouse-card-${warehouse.id}`}
              />
              <label className="form-check-label" htmlFor={`warehouse-card-${warehouse.id}`}>
                <small className="text-muted">Seleccionar</small>
              </label>
            </div>
          )}
          
          {/* Title */}
          <div className="d-flex align-items-start justify-content-between">
            <div className="flex-grow-1">
              <h6 className="card-title mb-1">
                <Link 
                  href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                  className="text-decoration-none text-dark warehouse-card-link"
                >
                  {warehouse.name}
                </Link>
              </h6>
              <div className="d-flex align-items-center gap-2 mb-2">
                <code className="badge bg-light text-dark small">{warehouse.code}</code>
                <span className={`badge bg-${typeColor}`}>
                  {getWarehouseTypeLabel(warehouse.warehouseType)}
                </span>
              </div>
            </div>
            
            {/* Status badge */}
            <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'} ms-2`}>
              <i className={`bi bi-${warehouse.isActive ? 'check-circle' : 'x-circle'} me-1`}></i>
              {warehouse.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="card-body p-3 pt-0">
        {/* Description */}
        {warehouse.description && (
          <p className="text-muted small mb-3 warehouse-description">
            {warehouse.description}
          </p>
        )}
        
        {/* Key Information */}
        <div className="warehouse-info mb-3">
          {/* Location */}
          {location && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-geo-alt text-muted me-2"></i>
              <span className="small text-muted">{location}</span>
            </div>
          )}
          
          {/* Capacity */}
          {capacity && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-speedometer text-muted me-2"></i>
              <span className="small">
                <strong>Capacidad:</strong> {capacity}
              </span>
            </div>
          )}
          
          {/* Manager */}
          {warehouse.managerName && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-person text-muted me-2"></i>
              <span className="small">
                <strong>Responsable:</strong> {warehouse.managerName}
              </span>
            </div>
          )}
          
          {/* Contact */}
          {(warehouse.phone || warehouse.email) && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-telephone text-muted me-2"></i>
              <span className="small">
                {warehouse.phone && (
                  <a href={`tel:${warehouse.phone}`} className="text-decoration-none me-2">
                    {warehouse.phone}
                  </a>
                )}
                {warehouse.email && (
                  <a href={`mailto:${warehouse.email}`} className="text-decoration-none">
                    <i className="bi bi-envelope me-1"></i>
                  </a>
                )}
              </span>
            </div>
          )}
        </div>
        
        {/* Stats Row */}
        <div className="warehouse-stats row g-2 mb-3">
          <div className="col-6">
            <div className="text-center p-2 bg-light rounded">
              <div className="h6 mb-0 text-primary">{stats.locationCount}</div>
              <small className="text-muted">Ubicaciones</small>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center p-2 bg-light rounded">
              <div className="h6 mb-0 text-success">{stats.stockCount}</div>
              <small className="text-muted">Stock Items</small>
            </div>
          </div>
        </div>
        
        {/* Features indicators */}
        <div className="warehouse-features d-flex gap-2 mb-3">
          {stats.hasContact && (
            <span className="badge bg-light text-dark border">
              <i className="bi bi-person-check me-1"></i>
              Contacto
            </span>
          )}
          {stats.hasCapacity && (
            <span className="badge bg-light text-dark border">
              <i className="bi bi-speedometer me-1"></i>
              Capacidad
            </span>
          )}
          {warehouse.operatingHours && (
            <span className="badge bg-light text-dark border">
              <i className="bi bi-clock me-1"></i>
              Horarios
            </span>
          )}
        </div>
      </div>
      
      {/* Card Footer - Actions */}
      <div className="card-footer bg-transparent p-3 pt-0">
        <div className="d-flex justify-content-between align-items-center">
          {/* View link */}
          <Link href={`/dashboard/inventory/warehouses/${warehouse.id}`}>
            <Button variant="outline-primary" size="sm">
              <i className="bi bi-eye me-1"></i>
              Ver Detalles
            </Button>
          </Link>
          
          {/* Action buttons */}
          <div className="btn-group btn-group-sm">
            {/* Edit */}
            <Link href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}>
              <Button
                variant="outline-secondary"
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
        
        {/* Created date */}
        <div className="text-center mt-2">
          <small className="text-muted">
            Creado: {new Date(warehouse.createdAt).toLocaleDateString('es-ES')}
          </small>
        </div>
      </div>
    </div>
  )
})

WarehouseCard.displayName = 'WarehouseCard'

// ===== LOADING SKELETON =====

const WarehouseCardSkeleton: React.FC = memo(() => (
  <div className="warehouse-card card h-100">
    <div className="card-header p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="placeholder-glow">
            <div className="placeholder col-8 mb-2"></div>
            <div className="placeholder col-4 mb-2"></div>
          </div>
        </div>
        <div className="placeholder-glow">
          <div className="placeholder col-12"></div>
        </div>
      </div>
    </div>
    
    <div className="card-body p-3 pt-0">
      <div className="placeholder-glow">
        <div className="placeholder col-12 mb-2"></div>
        <div className="placeholder col-8 mb-3"></div>
        <div className="placeholder col-6 mb-2"></div>
        <div className="placeholder col-7 mb-2"></div>
      </div>
      
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="placeholder-glow bg-light rounded p-2">
            <div className="placeholder col-8 mx-auto mb-1"></div>
            <div className="placeholder col-6 mx-auto"></div>
          </div>
        </div>
        <div className="col-6">
          <div className="placeholder-glow bg-light rounded p-2">
            <div className="placeholder col-8 mx-auto mb-1"></div>
            <div className="placeholder col-6 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="card-footer p-3 pt-0">
      <div className="placeholder-glow d-flex justify-content-between">
        <div className="placeholder col-4"></div>
        <div className="placeholder col-3"></div>
      </div>
    </div>
  </div>
))

WarehouseCardSkeleton.displayName = 'WarehouseCardSkeleton'

// ===== MAIN COMPONENT =====

const WarehousesGrid: React.FC<WarehousesGridProps> = memo(({
  warehouses,
  isLoading = false,
  enableSelection = true,
  selectedIds = [],
  onToggleSelection = () => {},
  onDelete = () => {},
  onToggleActive = () => {},
  className = '',
}) => {
  
  // ===== LOADING STATE =====
  
  if (isLoading && warehouses.length === 0) {
    return (
      <div className={`warehouses-grid ${className}`}>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="col">
              <WarehouseCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // ===== EMPTY STATE =====
  
  if (warehouses.length === 0) {
    return (
      <div className={`warehouses-grid-empty ${className}`}>
        <div className="text-center py-5">
          <i className="bi bi-grid-3x3-gap display-1 text-muted mb-3"></i>
          <h5 className="text-muted mb-3">No hay almacenes para mostrar</h5>
          <p className="text-muted">
            Los almacenes aparecerán aquí en formato de cards visuales
          </p>
        </div>
      </div>
    )
  }
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={`warehouses-grid ${className}`}>
      {/* Grid Layout */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {warehouses.map((warehouse) => {
          const isSelected = selectedIds.includes(warehouse.id)
          
          return (
            <div key={warehouse.id} className="col">
              <WarehouseCard
                warehouse={warehouse}
                isSelected={isSelected}
                enableSelection={enableSelection}
                onToggleSelection={onToggleSelection}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            </div>
          )
        })}
      </div>
      
      {/* Loading overlay para refreshes */}
      {isLoading && warehouses.length > 0 && (
        <div className="warehouses-grid-loading-overlay">
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

WarehousesGrid.displayName = 'WarehousesGrid'

// ===== STYLES =====

const styles = `
.warehouses-grid {
  position: relative;
}

.warehouse-card {
  transition: all 0.2s ease;
  border: 1px solid #dee2e6;
}

.warehouse-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd;
}

.warehouse-card.border-primary {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.warehouse-card-link {
  color: #212529 !important;
  transition: color 0.2s ease;
}

.warehouse-card:hover .warehouse-card-link {
  color: #0d6efd !important;
}

.warehouse-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 2.8em;
}

.warehouse-info .bi {
  width: 16px;
  flex-shrink: 0;
}

.warehouse-stats .bg-light {
  background-color: #f8f9fa !important;
  transition: background-color 0.2s ease;
}

.warehouse-card:hover .warehouse-stats .bg-light {
  background-color: #e9ecef !important;
}

.warehouse-features .badge {
  font-size: 0.7rem;
  font-weight: normal;
}

.warehouses-grid-loading-overlay {
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
@media (max-width: 576px) {
  .warehouse-card .card-header,
  .warehouse-card .card-body,
  .warehouse-card .card-footer {
    padding: 1rem !important;
  }
  
  .warehouse-stats {
    gap: 0.5rem !important;
  }
  
  .warehouse-features {
    gap: 0.25rem !important;
  }
  
  .warehouse-features .badge {
    font-size: 0.65rem;
  }
}

@media (max-width: 768px) {
  .warehouse-card .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
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
  const existingStyle = document.querySelector('style[data-component="warehouses-grid"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouses-grid')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehousesGrid