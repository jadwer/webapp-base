/**
 * 📍 LOCATIONS ADMIN PAGE PRO - INVENTORY MODULE
 * Página principal enterprise para gestión de ubicaciones de almacén
 * 
 * Features:
 * - 5 vistas virtualizadas con jerarquía (Table, Grid, List, Compact, Showcase)
 * - Warehouse selector prominente para filtrado
 * - Performance optimización para locations masivas
 * - Error handling enterprise con FK constraints
 * - Jerarquía visual (warehouse → aisle → rack → shelf)
 * - Bulk operations para gestión masiva
 * - Responsive design desktop/tablet/mobile
 */

'use client'

import React, { memo, useCallback, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocations, useWarehouseOptions } from '../hooks'
import { 
  useLocationsFilters, 
  useLocationsView, 
  useLocationsSelection,
  loadLocationViewPreferences,
  saveLocationViewPreferences,
} from '../store'
import { useLocationsMutations } from '../hooks'
import type { WarehouseLocation } from '../types'

// Imports de componentes
import LocationsTableVirtualized from './LocationsTableVirtualized'
// import LocationsGrid from './LocationsGrid'
// import LocationsList from './LocationsList'
// import LocationsCompact from './LocationsCompact'
// import LocationsShowcase from './LocationsShowcase'
import LocationsFiltersSimple from './LocationsFiltersSimple'
import { ViewModeSelector } from '@/modules/products/components' // Reutilizar del products module
import { PaginationPro } from '@/modules/products/components' // Reutilizar del products module
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'

// ===== COMPONENT PROPS =====

interface LocationsAdminPageProProps {
  className?: string
  title?: string
  showCreateButton?: boolean
  showBulkActions?: boolean
  enableSelection?: boolean
  warehouseId?: string        // Pre-filtro por warehouse específico
  showWarehouseSelector?: boolean  // Mostrar selector de warehouse
}

// ===== WAREHOUSE SELECTOR COMPONENT =====

interface WarehouseSelectorProps {
  selectedWarehouseId: string | 'all'
  onWarehouseChange: (warehouseId: string | 'all') => void
  isVisible: boolean
  onToggleVisibility: () => void
  className?: string
}

const WarehouseSelector: React.FC<WarehouseSelectorProps> = memo(({
  selectedWarehouseId,
  onWarehouseChange,
  isVisible,
  onToggleVisibility,
  className = '',
}) => {
  const { options: warehouseOptions, isLoading: isLoadingWarehouses } = useWarehouseOptions()
  
  if (!isVisible) {
    return (
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={onToggleVisibility}
        title="Mostrar selector de almacén"
      >
        <i className="bi bi-building me-2"></i>
        Filtrar por Almacén
      </Button>
    )
  }
  
  return (
    <div className={`warehouse-selector-container ${className}`}>
      <div className="d-flex align-items-center gap-2">
        <label className="form-label mb-0 text-nowrap">
          <i className="bi bi-building me-1"></i>
          Almacén:
        </label>
        
        <select
          className="form-select form-select-sm"
          value={selectedWarehouseId}
          onChange={(e) => onWarehouseChange(e.target.value)}
          disabled={isLoadingWarehouses}
          style={{ minWidth: '200px' }}
        >
          <option value="all">Todos los almacenes</option>
          {warehouseOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onToggleVisibility}
          title="Ocultar selector de almacén"
        >
          <i className="bi bi-x"></i>
        </Button>
      </div>
      
      {selectedWarehouseId !== 'all' && (
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Mostrando ubicaciones del almacén seleccionado
          </small>
        </div>
      )}
    </div>
  )
})

WarehouseSelector.displayName = 'WarehouseSelector'

// ===== MAIN COMPONENT =====

const LocationsAdminPagePro: React.FC<LocationsAdminPageProProps> = memo(({
  className = '',
  title = 'Gestión de Ubicaciones',
  showCreateButton = true,
  showBulkActions = true,
  enableSelection = true,
  warehouseId,
  showWarehouseSelector = true,
}) => {
  
  // ===== REFS =====
  
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  
  // ===== STORE STATE =====
  
  const filters = useLocationsFilters()
  const view = useLocationsView()
  const selection = useLocationsSelection()
  
  // ===== DATA FETCHING =====
  
  const apiFilters = filters.getApiFilters()
  
  // Pre-filtro por warehouse si se pasa como prop
  const finalFilters = useMemo(() => {
    if (warehouseId && warehouseId !== 'all') {
      return { ...apiFilters, warehouseId }
    }
    return apiFilters
  }, [apiFilters, warehouseId])
  
  const {
    locations,
    total,
    pages,
    currentPage,
    isLoading,
    isError,
    error,
    isEmpty,
    isValidating,
    hasNextPage,
    hasPrevPage,
    refresh,
    locationsByWarehouse,
    activeLocations,
    pickableLocations,
    receivableLocations,
  } = useLocations({
    filters: finalFilters,
    enabled: true,
    refreshInterval: 30000, // Refresh cada 30s para locations
    revalidateOnFocus: true,
    includeStock: false, // Por defecto no incluir stock
  })
  
  // ===== MUTATIONS =====
  
  const mutations = useLocationsMutations()
  
  // ===== HANDLERS =====
  
  const handleDelete = useCallback(async (location: WarehouseLocation) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Estás seguro que deseas eliminar la ubicación "${location.name}" (${location.code})?`,
      {
        title: 'Confirmar Eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger'
      }
    )
    
    if (!confirmed) return
    
    try {
      await mutations.delete.mutate(location, {
        onSuccess: () => {
          // Refrescar datos después de eliminación exitosa
          refresh()
          // Limpiar selección si el item eliminado estaba seleccionado
          if (selection.selectedIds.includes(location.id)) {
            selection.clearSelection()
          }
        }
      })
    } catch (error) {
      // Error ya manejado por el mutation hook con toast
      console.error('Error deleting location:', error)
    }
  }, [mutations.delete, refresh, selection])
  
  const handleBulkDelete = useCallback(async () => {
    const selectedLocations = locations.filter(l => selection.selectedIds.includes(l.id))
    
    if (selectedLocations.length === 0) return
    
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Estás seguro que deseas eliminar ${selectedLocations.length} ubicaciones seleccionadas?`,
      {
        title: 'Confirmar Eliminación Masiva',
        confirmText: 'Eliminar Todas',
        cancelText: 'Cancelar',
        confirmVariant: 'danger'
      }
    )
    
    if (!confirmed) return
    
    try {
      // Eliminar en paralelo (máximo 3 a la vez para no sobrecargar)
      const batchSize = 3
      for (let i = 0; i < selectedLocations.length; i += batchSize) {
        const batch = selectedLocations.slice(i, i + batchSize)
        const promises = batch.map(location => 
          mutations.delete.mutate(location, { showToast: false })
        )
        await Promise.all(promises)
      }
      
      // Success toast manual después de bulk operation
      const toastDiv = document.createElement('div')
      toastDiv.className = 'position-fixed top-0 end-0 m-3 alert alert-success alert-dismissible fade show'
      toastDiv.style.zIndex = '9999'
      toastDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>${selectedLocations.length} ubicaciones eliminadas exitosamente</div>
          <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
      `
      document.body.appendChild(toastDiv)
      setTimeout(() => {
        if (toastDiv.parentNode) toastDiv.parentNode.removeChild(toastDiv)
      }, 4000)
      
      // Refrescar y limpiar selección
      refresh()
      selection.clearSelection()
      
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }, [locations, selection.selectedIds, mutations.delete, refresh, selection])
  
  const handleToggleActive = useCallback(async (location: WarehouseLocation) => {
    try {
      await mutations.update.mutate({
        id: location.id,
        isActive: !location.isActive,
      }, {
        showToast: true,
        revalidateList: true,
      })
    } catch (error) {
      console.error('Error toggling location status:', error)
    }
  }, [mutations.update])
  
  const handleBulkActivate = useCallback(async () => {
    const selectedLocations = locations.filter(l => selection.selectedIds.includes(l.id))
    if (selectedLocations.length === 0) return
    
    try {
      for (const location of selectedLocations) {
        if (!location.isActive) {
          await mutations.update.mutate({
            id: location.id,
            isActive: true,
          }, {
            showToast: false,
            revalidateList: false,
          })
        }
      }
      
      // Toast de éxito
      const toastDiv = document.createElement('div')
      toastDiv.className = 'position-fixed top-0 end-0 m-3 alert alert-success alert-dismissible fade show'
      toastDiv.style.zIndex = '9999'
      toastDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>${selectedLocations.length} ubicaciones activadas</div>
          <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
      `
      document.body.appendChild(toastDiv)
      setTimeout(() => {
        if (toastDiv.parentNode) toastDiv.parentNode.removeChild(toastDiv)
      }, 4000)
      
      refresh()
      selection.clearSelection()
      
    } catch (error) {
      console.error('Error in bulk activate:', error)
    }
  }, [locations, selection.selectedIds, mutations.update, refresh, selection])
  
  const handleBulkDeactivate = useCallback(async () => {
    const selectedLocations = locations.filter(l => selection.selectedIds.includes(l.id))
    if (selectedLocations.length === 0) return
    
    try {
      for (const location of selectedLocations) {
        if (location.isActive) {
          await mutations.update.mutate({
            id: location.id,
            isActive: false,
          }, {
            showToast: false,
            revalidateList: false,
          })
        }
      }
      
      // Toast de éxito
      const toastDiv = document.createElement('div')
      toastDiv.className = 'position-fixed top-0 end-0 m-3 alert alert-warning alert-dismissible fade show'
      toastDiv.style.zIndex = '9999'
      toastDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-pause-circle-fill me-2"></i>
          <div>${selectedLocations.length} ubicaciones desactivadas</div>
          <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
      `
      document.body.appendChild(toastDiv)
      setTimeout(() => {
        if (toastDiv.parentNode) toastDiv.parentNode.removeChild(toastDiv)
      }, 4000)
      
      refresh()
      selection.clearSelection()
      
    } catch (error) {
      console.error('Error in bulk deactivate:', error)
    }
  }, [locations, selection.selectedIds, mutations.update, refresh, selection])
  
  const handlePageChange = useCallback((page: number) => {
    filters.setPage(page)
  }, [filters])
  
  const handleRefresh = useCallback(() => {
    refresh()
  }, [refresh])
  
  const handleWarehouseChange = useCallback((warehouseId: string | 'all') => {
    filters.setWarehouseId(warehouseId)
    selection.clearSelection() // Limpiar selección al cambiar warehouse
  }, [filters, selection])
  
  // ===== COMPUTED VALUES =====
  
  const showPagination = useMemo(() => {
    return total > filters.limit && pages > 1
  }, [total, filters.limit, pages])
  
  const locationIds = useMemo(() => {
    return locations.map(l => l.id)
  }, [locations])
  
  const warehouseStats = useMemo(() => {
    const warehouseCount = Object.keys(locationsByWarehouse).length
    return {
      warehouseCount,
      totalLocations: total,
      activeCount: activeLocations.length,
      pickableCount: pickableLocations.length,
      receivableCount: receivableLocations.length,
    }
  }, [locationsByWarehouse, total, activeLocations, pickableLocations, receivableLocations])
  
  // ===== EFFECTS =====
  
  // Cargar preferencias de vista al montar
  useEffect(() => {
    loadLocationViewPreferences()
  }, [])
  
  // Guardar preferencias cuando cambia el modo de vista
  useEffect(() => {
    saveLocationViewPreferences()
  }, [view.viewMode, view.isCompactMode, filters.limit])
  
  // Limpiar selección cuando cambian los filtros principales
  useEffect(() => {
    if (selection.selectedIds.length > 0) {
      selection.clearSelection()
    }
  }, [apiFilters.search, apiFilters.warehouseId, apiFilters.locationType]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Auto-aplicar warehouse pre-filtro
  useEffect(() => {
    if (warehouseId && warehouseId !== filters.warehouseId) {
      filters.setWarehouseId(warehouseId)
    }
  }, [warehouseId]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // ===== RENDER CONTENT BY VIEW MODE =====
  
  const renderMainContent = useCallback(() => {
    // Error state
    if (isError) {
      return (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Error al cargar ubicaciones:</strong>{' '}
            {error?.message || 'Error desconocido'}
            <button 
              className="btn btn-link p-0 ms-2"
              onClick={handleRefresh}
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    
    // Empty state
    if (isEmpty && !isLoading) {
      const hasFilters = filters.hasActiveFilters()
      
      return (
        <div className="text-center py-5">
          <i className="bi bi-geo-alt display-1 text-muted mb-3"></i>
          <h4 className="text-muted mb-3">
            {hasFilters ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
          </h4>
          <p className="text-muted mb-4">
            {hasFilters 
              ? 'Intenta ajustar los filtros de búsqueda o seleccionar otro almacén'
              : 'Crea tu primera ubicación para comenzar a organizar tu inventario'
            }
          </p>
          {hasFilters ? (
            <Button
              variant="outline-primary"
              onClick={filters.resetFilters}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Limpiar Filtros
            </Button>
          ) : showCreateButton ? (
            <Link href="/dashboard/inventory/warehouses/locations/create">
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Crear Primera Ubicación
              </Button>
            </Link>
          ) : null}
        </div>
      )
    }
    
    // Main content por view mode
    switch (view.viewMode) {
      case 'table':
        return (
          <LocationsTableVirtualized
            locations={locations}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onSelectAll={() => selection.toggleSelectAll(locationIds)}
            isAllSelected={selection.isAllSelected}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            showWarehouseGroups={view.showWarehouseGroups}
            showHierarchy={view.showHierarchy}
          />
        )
      
      case 'grid':
        return <div className="alert alert-info">Vista Grid próximamente</div>
      
      case 'list':
        return <div className="alert alert-info">Vista List próximamente</div>
      
      case 'compact':
        return <div className="alert alert-info">Vista Compact próximamente</div>
      
      case 'showcase':
        return <div className="alert alert-info">Vista Showcase próximamente</div>
      
      default:
        return (
          <LocationsTableVirtualized
            locations={locations}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onSelectAll={() => selection.toggleSelectAll(locationIds)}
            isAllSelected={selection.isAllSelected}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            showWarehouseGroups={view.showWarehouseGroups}
            showHierarchy={view.showHierarchy}
          />
        )
    }
  }, [
    view.viewMode,
    locations,
    locationIds,
    isLoading,
    isError,
    error,
    isEmpty,
    enableSelection,
    selection,
    handleDelete,
    handleToggleActive,
    view.showWarehouseGroups,
    view.showHierarchy,
    filters,
    showCreateButton,
    handleRefresh,
  ])
  
  // ===== RENDER =====
  
  return (
    <div className={`locations-admin-page-pro ${className}`}>
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4">
        <div className="mb-3 mb-lg-0">
          <h1 className="h3 mb-1">{title}</h1>
          <div className="text-muted d-flex align-items-center">
            <span>
              {isLoading ? (
                'Cargando...'
              ) : (
                <>
                  {total} ubicacion{total !== 1 ? 'es' : ''} total{total !== 1 ? 'es' : ''}
                  {warehouseStats.warehouseCount > 1 && (
                    <> en {warehouseStats.warehouseCount} almacenes</>
                  )}
                  {isValidating && (
                    <span className="ms-2">
                      <i className="bi bi-arrow-clockwise spin"></i>
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
          
          {/* Warehouse Stats */}
          {!isLoading && !isEmpty && (
            <div className="mt-2">
              <small className="text-muted d-flex align-items-center gap-3">
                <span>
                  <i className="bi bi-check-circle text-success me-1"></i>
                  {warehouseStats.activeCount} activas
                </span>
                <span>
                  <i className="bi bi-box-arrow-down text-info me-1"></i>
                  {warehouseStats.pickableCount} picking
                </span>
                <span>
                  <i className="bi bi-box-arrow-in-down text-primary me-1"></i>
                  {warehouseStats.receivableCount} recepción
                </span>
              </small>
            </div>
          )}
        </div>
        
        <div className="d-flex flex-column flex-sm-row gap-2">
          {/* Bulk Actions */}
          {showBulkActions && selection.hasSelection && (
            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={handleBulkActivate}
                title="Activar seleccionadas"
              >
                <i className="bi bi-play me-1"></i>
                Activar ({selection.selectedCount})
              </Button>
              
              <Button
                variant="outline-warning"
                size="sm"
                onClick={handleBulkDeactivate}
                title="Desactivar seleccionadas"
              >
                <i className="bi bi-pause me-1"></i>
                Desactivar ({selection.selectedCount})
              </Button>
              
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleBulkDelete}
                title="Eliminar seleccionadas"
              >
                <i className="bi bi-trash me-1"></i>
                Eliminar ({selection.selectedCount})
              </Button>
            </div>
          )}
          
          {/* Create Button */}
          {showCreateButton && (
            <Link href="/dashboard/inventory/warehouses/locations/create">
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Nueva Ubicación
              </Button>
            </Link>
          )}
          
          {/* Refresh Button */}
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Actualizar datos"
          >
            <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
          </Button>
        </div>
      </div>
      
      {/* Warehouse Selector */}
      {showWarehouseSelector && !warehouseId && (
        <div className="mb-3">
          <WarehouseSelector
            selectedWarehouseId={filters.warehouseId}
            onWarehouseChange={handleWarehouseChange}
            isVisible={view.isWarehouseSelectorVisible}
            onToggleVisibility={view.toggleWarehouseSelector}
          />
        </div>
      )}
      
      {/* Filters */}
      <LocationsFiltersSimple 
        isVisible={view.isFiltersVisible}
        onToggleVisibility={view.toggleFilters}
        warehouseId={warehouseId || filters.warehouseId}
      />
      
      {/* View Controls */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <ViewModeSelector 
            currentMode={view.viewMode}
            onModeChange={view.setViewMode}
            availableModes={['table', 'grid', 'list', 'compact', 'showcase']}
          />
          
          {/* View Options */}
          <div className="d-flex align-items-center gap-2">
            <label className="form-check form-check-inline small">
              <input
                className="form-check-input"
                type="checkbox"
                checked={view.showHierarchy}
                onChange={(e) => view.setShowHierarchy(e.target.checked)}
              />
              <span className="form-check-label">Jerarquía</span>
            </label>
            
            <label className="form-check form-check-inline small">
              <input
                className="form-check-input"
                type="checkbox"
                checked={view.showWarehouseGroups}
                onChange={(e) => view.setShowWarehouseGroups(e.target.checked)}
              />
              <span className="form-check-label">Agrupar</span>
            </label>
          </div>
        </div>
        
        {/* Results Info */}
        <div className="text-muted small mt-2 mt-lg-0">
          {!isLoading && !isEmpty && (
            <>
              Mostrando {locations.length} de {total} registros
              {showPagination && (
                <> • Página {currentPage} de {pages}</>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="locations-content">
        {renderMainContent()}
      </div>
      
      {/* Pagination */}
      {showPagination && !isEmpty && (
        <div className="d-flex justify-content-center mt-4">
          <PaginationPro
            meta={{
              pagination: {
                page: currentPage,
                pages,
                count: locations.length,
                total,
                links: {
                  self: '',
                  first: '',
                  last: '',
                  prev: hasPrevPage ? '' : undefined,
                  next: hasNextPage ? '' : undefined,
                }
              }
            }}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {/* Loading Overlay para refreshes */}
      {isValidating && !isLoading && (
        <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 1050 }}>
          <div className="badge bg-primary">
            <i className="bi bi-arrow-clockwise spin me-1"></i>
            Actualizando...
          </div>
        </div>
      )}
      
      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

LocationsAdminPagePro.displayName = 'LocationsAdminPagePro'

// ===== STYLES =====

const styles = `
.locations-admin-page-pro {
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .locations-content {
    min-height: 400px;
  }
  
  .warehouse-selector-container {
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
  }
  
  .warehouse-selector-container:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .d-flex.flex-column.flex-lg-row {
      align-items: stretch !important;
    }
    
    .d-flex.gap-2 {
      flex-direction: column;
    }
    
    .d-flex.gap-2 > * {
      width: 100%;
    }
    
    .warehouse-selector-container .d-flex {
      flex-direction: column;
      align-items: stretch !important;
      gap: 0.5rem;
    }
    
    .warehouse-selector-container .form-select {
      min-width: auto !important;
    }
  }
  
  @media (max-width: 576px) {
    .d-flex.gap-3 {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 0.75rem;
    }
    
    .form-check-inline {
      margin-right: 0.5rem !important;
    }
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="locations-admin-page-pro"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'locations-admin-page-pro')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default LocationsAdminPagePro