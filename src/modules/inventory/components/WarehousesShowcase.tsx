/**
 * 📦 WAREHOUSES SHOWCASE - INVENTORY MODULE
 * Vista premium showcase con layout atractivo para presentaciones
 * 
 * Features:
 * - Layout premium estilo showcase/portfolio
 * - Imágenes placeholder atractivas
 * - Métricas visuales destacadas
 * - Call-to-actions prominentes
 * - Ideal para demos y presentaciones
 * - Animaciones suaves y effects
 * - Responsive masonry layout
 * - Hero cards para warehouses principales
 */

'use client'

import React, { memo, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { getWarehouseTypeLabel, formatCapacity } from '../services'
import type { Warehouse } from '../types'
import { Button } from '@/ui/components/base/Button'

// ===== COMPONENT PROPS =====

interface WarehousesShowcaseProps {
  warehouses: Warehouse[]
  isLoading?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onToggleSelection?: (id: string) => void
  onDelete?: (warehouse: Warehouse) => void
  onToggleActive?: (warehouse: Warehouse) => void
  className?: string
  showHeroCards?: boolean
}

// ===== SHOWCASE CARD COMPONENT =====

interface ShowcaseCardProps {
  warehouse: Warehouse
  isSelected: boolean
  enableSelection: boolean
  onToggleSelection: (id: string) => void
  onDelete: (warehouse: Warehouse) => void
  onToggleActive: (warehouse: Warehouse) => void
  cardSize: 'hero' | 'large' | 'medium' | 'small'
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = memo(({
  warehouse,
  isSelected,
  enableSelection,
  onToggleSelection,
  onDelete,
  onToggleActive,
  cardSize,
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
  
  // Información formateada
  const location = useMemo(() => {
    const parts = [warehouse.city, warehouse.state, warehouse.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }, [warehouse.city, warehouse.state, warehouse.country])
  
  const capacity = useMemo(() => {
    if (!warehouse.maxCapacity) return null
    return formatCapacity(warehouse.maxCapacity, warehouse.capacityUnit || '')
  }, [warehouse.maxCapacity, warehouse.capacityUnit])
  
  // Stats calculados
  const stats = useMemo(() => ({
    locationCount: warehouse.locations?.length || 0,
    stockCount: warehouse.stock?.length || 0,
    utilization: Math.floor(Math.random() * 100), // Placeholder para demo
    efficiency: Math.floor(Math.random() * 100), // Placeholder para demo
  }), [warehouse])
  
  // Imagen placeholder basada en tipo
  const showcaseImage = useMemo(() => {
    const imageMap = {
      main: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      distribution: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=300&fit=crop',
      returns: 'https://images.unsplash.com/photo-1586952518485-11b180e92764?w=400&h=300&fit=crop',
    }
    return imageMap[warehouse.warehouseType] || imageMap.main
  }, [warehouse.warehouseType])
  
  // Color theme basado en tipo
  const themeColor = useMemo(() => {
    const themes = {
      main: { primary: '#0d6efd', secondary: '#e7f3ff', accent: '#4dabf7' },
      secondary: { primary: '#0dcaf0', secondary: '#e1f5fe', accent: '#74c0fc' },
      distribution: { primary: '#198754', secondary: '#e8f5e8', accent: '#51cf66' },
      returns: { primary: '#ffc107', secondary: '#fff3cd', accent: '#ffd43b' },
    }
    return themes[warehouse.warehouseType] || themes.main
  }, [warehouse.warehouseType])
  
  // Clases CSS basadas en tamaño
  const cardClasses = useMemo(() => {
    const sizeClasses = {
      hero: 'showcase-card-hero col-12',
      large: 'showcase-card-large col-lg-6',
      medium: 'showcase-card-medium col-lg-4 col-md-6',
      small: 'showcase-card-small col-lg-3 col-md-4 col-sm-6'
    }
    return sizeClasses[cardSize] || sizeClasses.medium
  }, [cardSize])
  
  return (
    <div className={`${cardClasses} mb-4`}>
      <div 
        className={`showcase-card card h-100 ${isSelected ? 'selected' : ''}`}
        style={{ '--theme-primary': themeColor.primary, '--theme-secondary': themeColor.secondary, '--theme-accent': themeColor.accent } as React.CSSProperties}
      >
        {/* Card Image */}
        <div className="showcase-image-container position-relative">
          <img 
            src={showcaseImage} 
            alt={`${warehouse.name} warehouse`}
            className="card-img-top showcase-image"
            loading="lazy"
          />
          
          {/* Overlay Gradient */}
          <div className="showcase-overlay"></div>
          
          {/* Selection Checkbox */}
          {enableSelection && (
            <div className="showcase-selection position-absolute top-0 start-0 p-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleToggleSelection}
                  id={`showcase-${warehouse.id}`}
                />
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="showcase-status position-absolute top-0 end-0 p-3">
            <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'} shadow`}>
              <i className={`bi bi-${warehouse.isActive ? 'check-circle' : 'x-circle'} me-1`}></i>
              {warehouse.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          {/* Type Badge */}
          <div className="showcase-type position-absolute bottom-0 start-0 p-3">
            <span className="badge bg-primary shadow-sm">
              {getWarehouseTypeLabel(warehouse.warehouseType)}
            </span>
          </div>
        </div>
        
        {/* Card Body */}
        <div className="card-body p-4">
          {/* Header */}
          <div className="showcase-header mb-3">
            <h5 className="card-title mb-2">
              <Link 
                href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                className="text-decoration-none showcase-title-link"
              >
                {warehouse.name}
              </Link>
            </h5>
            
            <div className="d-flex align-items-center justify-content-between mb-2">
              <code className="badge bg-light text-dark">{warehouse.code}</code>
              {cardSize === 'hero' && location && (
                <div className="text-muted d-flex align-items-center">
                  <i className="bi bi-geo-alt me-1"></i>
                  {location}
                </div>
              )}
            </div>
            
            {warehouse.description && (
              <p className="text-muted small showcase-description">
                {warehouse.description}
              </p>
            )}
          </div>
          
          {/* Metrics Grid */}
          <div className="showcase-metrics mb-4">
            <div className="row g-3">
              <div className="col-6">
                <div className="metric-card text-center p-2 rounded">
                  <div className="metric-value h4 mb-0 text-primary">{stats.locationCount}</div>
                  <div className="metric-label small text-muted">Ubicaciones</div>
                </div>
              </div>
              <div className="col-6">
                <div className="metric-card text-center p-2 rounded">
                  <div className="metric-value h4 mb-0 text-success">{stats.stockCount}</div>
                  <div className="metric-label small text-muted">Stock Items</div>
                </div>
              </div>
              
              {cardSize === 'hero' && (
                <>
                  <div className="col-6">
                    <div className="metric-card text-center p-2 rounded">
                      <div className="metric-value h4 mb-0 text-info">{stats.utilization}%</div>
                      <div className="metric-label small text-muted">Utilización</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-card text-center p-2 rounded">
                      <div className="metric-value h4 mb-0 text-warning">{stats.efficiency}%</div>
                      <div className="metric-label small text-muted">Eficiencia</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Additional Info */}
          {(cardSize === 'hero' || cardSize === 'large') && (
            <div className="showcase-info mb-4">
              <div className="row g-2 small">
                {warehouse.managerName && (
                  <div className="col-12 d-flex align-items-center">
                    <i className="bi bi-person text-muted me-2"></i>
                    <span><strong>Responsable:</strong> {warehouse.managerName}</span>
                  </div>
                )}
                
                {capacity && (
                  <div className="col-12 d-flex align-items-center">
                    <i className="bi bi-speedometer text-muted me-2"></i>
                    <span><strong>Capacidad:</strong> {capacity}</span>
                  </div>
                )}
                
                {warehouse.phone && (
                  <div className="col-12 d-flex align-items-center">
                    <i className="bi bi-telephone text-muted me-2"></i>
                    <a href={`tel:${warehouse.phone}`} className="text-decoration-none">
                      {warehouse.phone}
                    </a>
                  </div>
                )}
                
                {warehouse.operatingHours && (
                  <div className="col-12 d-flex align-items-center">
                    <i className="bi bi-clock text-muted me-2"></i>
                    <span>{warehouse.operatingHours}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Progress Bars for Hero Cards */}
          {cardSize === 'hero' && (
            <div className="showcase-progress mb-4">
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Utilización</small>
                  <small className="text-muted">{stats.utilization}%</small>
                </div>
                <div className="progress progress-sm">
                  <div 
                    className="progress-bar bg-info"
                    style={{ width: `${stats.utilization}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Eficiencia</small>
                  <small className="text-muted">{stats.efficiency}%</small>
                </div>
                <div className="progress progress-sm">
                  <div 
                    className="progress-bar bg-warning"
                    style={{ width: `${stats.efficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Card Footer */}
        <div className="card-footer bg-transparent p-4 pt-0">
          <div className="d-flex justify-content-between align-items-center">
            {/* Primary Action */}
            <Link href={`/dashboard/inventory/warehouses/${warehouse.id}`}>
              <Button variant="primary" size={cardSize === 'hero' ? 'md' : 'sm'}>
                <i className="bi bi-eye me-2"></i>
                Ver Detalles
              </Button>
            </Link>
            
            {/* Secondary Actions */}
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
          
          {/* Created Date */}
          <div className="text-center mt-3">
            <small className="text-muted">
              Creado: {new Date(warehouse.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </small>
          </div>
        </div>
      </div>
    </div>
  )
})

ShowcaseCard.displayName = 'ShowcaseCard'

// ===== LOADING SKELETON =====

const ShowcaseCardSkeleton: React.FC<{ cardSize: 'hero' | 'large' | 'medium' | 'small' }> = memo(({ cardSize }) => {
  const cardClasses = {
    hero: 'col-12',
    large: 'col-lg-6',
    medium: 'col-lg-4 col-md-6',
    small: 'col-lg-3 col-md-4 col-sm-6'
  }
  
  return (
    <div className={`${cardClasses[cardSize]} mb-4`}>
      <div className="showcase-card card h-100">
        <div className="placeholder-glow">
          <div className="placeholder card-img-top" style={{ height: '200px' }}></div>
        </div>
        <div className="card-body p-4">
          <div className="placeholder-glow">
            <div className="placeholder col-8 mb-3"></div>
            <div className="placeholder col-4 mb-3"></div>
            <div className="placeholder col-12 mb-3"></div>
          </div>
          <div className="row g-3">
            <div className="col-6">
              <div className="placeholder-glow text-center p-2">
                <div className="placeholder col-8 mx-auto mb-1"></div>
                <div className="placeholder col-6 mx-auto"></div>
              </div>
            </div>
            <div className="col-6">
              <div className="placeholder-glow text-center p-2">
                <div className="placeholder col-8 mx-auto mb-1"></div>
                <div className="placeholder col-6 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer p-4">
          <div className="placeholder-glow d-flex justify-content-between">
            <div className="placeholder col-4"></div>
            <div className="placeholder col-3"></div>
          </div>
        </div>
      </div>
    </div>
  )
})

ShowcaseCardSkeleton.displayName = 'ShowcaseCardSkeleton'

// ===== MAIN COMPONENT =====

const WarehousesShowcase: React.FC<WarehousesShowcaseProps> = memo(({
  warehouses,
  isLoading = false,
  enableSelection = false, // Por defecto false en showcase
  selectedIds = [],
  onToggleSelection = () => {},
  onDelete = () => {},
  onToggleActive = () => {},
  className = '',
  showHeroCards = true,
}) => {
  
  // ===== LAYOUT LOGIC =====
  
  const warehouseLayout = useMemo(() => {
    if (!showHeroCards) {
      // Todas como medium cards
      return warehouses.map(w => ({ warehouse: w, size: 'medium' as const }))
    }
    
    // Layout inteligente con hero cards
    const layout: Array<{ warehouse: Warehouse, size: 'hero' | 'large' | 'medium' | 'small' }> = []
    
    warehouses.forEach((warehouse, index) => {
      if (index === 0 && warehouse.warehouseType === 'main') {
        layout.push({ warehouse, size: 'hero' })
      } else if (index < 3 && warehouse.warehouseType === 'main') {
        layout.push({ warehouse, size: 'large' })
      } else if (warehouse.warehouseType === 'main' || warehouse.warehouseType === 'distribution') {
        layout.push({ warehouse, size: 'medium' })
      } else {
        layout.push({ warehouse, size: 'small' })
      }
    })
    
    return layout
  }, [warehouses, showHeroCards])
  
  // ===== LOADING STATE =====
  
  if (isLoading && warehouses.length === 0) {
    return (
      <div className={`warehouses-showcase ${className}`}>
        <div className="row">
          <ShowcaseCardSkeleton cardSize="hero" />
          <ShowcaseCardSkeleton cardSize="large" />
          <ShowcaseCardSkeleton cardSize="large" />
          <ShowcaseCardSkeleton cardSize="medium" />
          <ShowcaseCardSkeleton cardSize="medium" />
          <ShowcaseCardSkeleton cardSize="medium" />
        </div>
      </div>
    )
  }
  
  // ===== EMPTY STATE =====
  
  if (warehouses.length === 0) {
    return (
      <div className={`warehouses-showcase-empty ${className}`}>
        <div className="text-center py-5">
          <i className="bi bi-images display-1 text-muted mb-3"></i>
          <h5 className="text-muted mb-3">No hay almacenes para mostrar</h5>
          <p className="text-muted">
            Los almacenes aparecerán aquí en formato showcase premium
          </p>
        </div>
      </div>
    )
  }
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={`warehouses-showcase ${className}`}>
      <div className="row">
        {warehouseLayout.map(({ warehouse, size }) => {
          const isSelected = selectedIds.includes(warehouse.id)
          
          return (
            <ShowcaseCard
              key={warehouse.id}
              warehouse={warehouse}
              isSelected={isSelected}
              enableSelection={enableSelection}
              onToggleSelection={onToggleSelection}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              cardSize={size}
            />
          )
        })}
      </div>
      
      {/* Loading overlay para refreshes */}
      {isLoading && warehouses.length > 0 && (
        <div className="showcase-loading-overlay">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Actualizando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

WarehousesShowcase.displayName = 'WarehousesShowcase'

// ===== STYLES =====

const styles = `
.warehouses-showcase {
  position: relative;
}

.showcase-card {
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.showcase-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-primary, #0d6efd);
}

.showcase-card.selected {
  border-color: var(--theme-primary, #0d6efd) !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.showcase-image-container {
  height: 200px;
  overflow: hidden;
}

.showcase-card-hero .showcase-image-container {
  height: 300px;
}

.showcase-card-small .showcase-image-container {
  height: 150px;
}

.showcase-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.showcase-card:hover .showcase-image {
  transform: scale(1.05);
}

.showcase-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg, 
    rgba(0, 0, 0, 0.1) 0%, 
    rgba(0, 0, 0, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.showcase-card:hover .showcase-overlay {
  opacity: 1;
}

.showcase-selection .form-check-input {
  transform: scale(1.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.showcase-status .badge,
.showcase-type .badge {
  backdrop-filter: blur(10px);
  font-size: 0.8rem;
}

.showcase-title-link {
  color: #212529 !important;
  transition: color 0.3s ease;
}

.showcase-card:hover .showcase-title-link {
  color: var(--theme-primary, #0d6efd) !important;
}

.showcase-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.showcase-card-small .showcase-description {
  -webkit-line-clamp: 2;
}

.showcase-metrics .metric-card {
  background: var(--theme-secondary, #f8f9fa);
  transition: all 0.3s ease;
}

.showcase-card:hover .showcase-metrics .metric-card {
  background: var(--theme-accent, #e9ecef);
  transform: translateY(-1px);
}

.metric-value {
  font-weight: 700;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.showcase-info .bi {
  width: 16px;
  flex-shrink: 0;
}

.progress-sm {
  height: 6px;
}

.showcase-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
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

/* Responsive adjustments */
@media (max-width: 1200px) {
  .showcase-card-hero .showcase-image-container {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .showcase-image-container {
    height: 180px !important;
  }
  
  .showcase-card-hero .showcase-image-container {
    height: 220px !important;
  }
  
  .showcase-card .card-body {
    padding: 1rem !important;
  }
  
  .showcase-card .card-footer {
    padding: 1rem !important;
    padding-top: 0 !important;
  }
  
  .showcase-metrics .row {
    --bs-gutter-x: 0.5rem;
  }
  
  .metric-value {
    font-size: 1.25rem !important;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn {
    border-radius: 0.25rem !important;
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 576px) {
  .showcase-card-hero,
  .showcase-card-large,
  .showcase-card-medium,
  .showcase-card-small {
    width: 100%;
  }
  
  .showcase-info {
    font-size: 0.85rem;
  }
  
  .showcase-progress {
    margin-bottom: 1rem !important;
  }
}

/* Special effects for hero cards */
.showcase-card-hero {
  position: relative;
}

.showcase-card-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 48%, var(--theme-primary, #0d6efd) 49%, var(--theme-primary, #0d6efd) 51%, transparent 52%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  pointer-events: none;
}

.showcase-card-hero:hover::before {
  opacity: 0.05;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .showcase-overlay {
    background: linear-gradient(
      135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.2) 100%
    );
  }
  
  .metric-card {
    background: rgba(255, 255, 255, 0.1) !important;
  }
  
  .showcase-card:hover .metric-card {
    background: rgba(255, 255, 255, 0.15) !important;
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="warehouses-showcase"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouses-showcase')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehousesShowcase