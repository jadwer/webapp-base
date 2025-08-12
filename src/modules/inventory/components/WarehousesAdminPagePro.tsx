/**
 * 📦 WAREHOUSES ADMIN PAGE PRO - INVENTORY MODULE
 * Página principal enterprise para gestión de almacenes
 * 
 * Features:
 * - 5 vistas virtualizadas (Table, Grid, List, Compact, Showcase)
 * - Performance optimización para 500K+ productos
 * - Error handling enterprise con toast notifications
 * - Filtros avanzados con debounce
 * - Bulk operations para gestión masiva
 * - Responsive design desktop/tablet/mobile
 */

'use client'

import React, { memo, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useWarehouses } from '../hooks'
import { 
  useWarehousesFilters, 
  useWarehousesView, 
  useWarehousesSelection,
  loadWarehouseViewPreferences,
  saveWarehouseViewPreferences,
} from '../store'
import { useWarehousesMutations } from '../hooks'
import type { Warehouse } from '../types'

// Imports de componentes vistas
import WarehousesTableVirtualized from './WarehousesTableVirtualized'
import WarehousesGrid from './WarehousesGrid'
import WarehousesList from './WarehousesList'
import WarehousesCompact from './WarehousesCompact'
import WarehousesShowcase from './WarehousesShowcase'
import WarehousesFiltersSimple from './WarehousesFiltersSimple'
import { ViewModeSelector } from '@/modules/products/components' // Reutilizar del products module
import { PaginationPro } from '@/modules/products/components' // Reutilizar del products module
import { Button } from '@/ui/components/base/Button'
import { ConfirmModal } from '@/ui/components/base/ConfirmModal'

// ===== COMPONENT PROPS =====

interface WarehousesAdminPageProProps {
  className?: string
  title?: string
  showCreateButton?: boolean
  showBulkActions?: boolean
  enableSelection?: boolean
}

// ===== MAIN COMPONENT =====

const WarehousesAdminPagePro: React.FC<WarehousesAdminPageProProps> = memo(({
  className = '',
  title = 'Gestión de Almacenes',
  showCreateButton = true,
  showBulkActions = true,
  enableSelection = true,
}) => {
  
  // ===== STORE STATE =====
  
  const filters = useWarehousesFilters()
  const view = useWarehousesView()
  const selection = useWarehousesSelection()
  
  // ===== DATA FETCHING =====
  
  const apiFilters = filters.getApiFilters()
  const {
    warehouses,
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
  } = useWarehouses({
    filters: apiFilters,
    enabled: true,
    // Performance: Refresh cada 30s para datos no críticos
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })
  
  // ===== MUTATIONS =====
  
  const mutations = useWarehousesMutations()
  
  // ===== HANDLERS =====
  
  const handleDelete = useCallback(async (warehouse: Warehouse) => {
    const confirmed = await ConfirmModal.confirm({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro que deseas eliminar el almacén "${warehouse.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    
    if (!confirmed) return
    
    try {
      await mutations.delete.mutate(warehouse, {
        onSuccess: () => {
          // Refrescar datos después de eliminación exitosa
          refresh()
          // Limpiar selección si el item eliminado estaba seleccionado
          if (selection.selectedIds.includes(warehouse.id)) {
            selection.clearSelection()
          }
        }
      })
    } catch (error) {
      // Error ya manejado por el mutation hook con toast
      console.error('Error deleting warehouse:', error)
    }
  }, [mutations.delete, refresh, selection])
  
  const handleBulkDelete = useCallback(async () => {
    const selectedWarehouses = warehouses.filter(w => selection.selectedIds.includes(w.id))
    
    if (selectedWarehouses.length === 0) return
    
    const confirmed = await ConfirmModal.confirm({
      title: 'Confirmar Eliminación Masiva',
      message: `¿Estás seguro que deseas eliminar ${selectedWarehouses.length} almacenes seleccionados?`,
      confirmText: 'Eliminar Todos',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    
    if (!confirmed) return
    
    try {
      // Eliminar en paralelo (máximo 3 a la vez para no sobrecargar)
      const batchSize = 3
      for (let i = 0; i < selectedWarehouses.length; i += batchSize) {
        const batch = selectedWarehouses.slice(i, i + batchSize)
        const promises = batch.map(warehouse => 
          mutations.delete.mutate(warehouse, { showToast: false })
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
          <div>${selectedWarehouses.length} almacenes eliminados exitosamente</div>
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
  }, [warehouses, selection.selectedIds, mutations.delete, refresh, selection])
  
  const handleToggleActive = useCallback(async (warehouse: Warehouse) => {
    try {
      await mutations.update.mutate({
        id: warehouse.id,
        isActive: !warehouse.isActive,
      }, {
        showToast: true,
        revalidateList: true,
      })
    } catch (error) {
      console.error('Error toggling warehouse status:', error)
    }
  }, [mutations.update])
  
  const handlePageChange = useCallback((page: number) => {
    filters.setPage(page)
  }, [filters])
  
  const handleRefresh = useCallback(() => {
    refresh()
  }, [refresh])
  
  // ===== COMPUTED VALUES =====
  
  const showPagination = useMemo(() => {
    return total > filters.limit && pages > 1
  }, [total, filters.limit, pages])
  
  const warehouseIds = useMemo(() => {
    return warehouses.map(w => w.id)
  }, [warehouses])
  
  // ===== EFFECTS =====
  
  // Cargar preferencias de vista al montar
  useEffect(() => {
    loadWarehouseViewPreferences()
  }, [])
  
  // Guardar preferencias cuando cambia el modo de vista
  useEffect(() => {
    saveWarehouseViewPreferences()
  }, [view.viewMode, view.isCompactMode, filters.limit])
  
  // Limpiar selección cuando cambian los filtros
  useEffect(() => {
    if (selection.selectedIds.length > 0) {
      selection.clearSelection()
    }
  }, [apiFilters.search, apiFilters.warehouseType, apiFilters.isActive]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // ===== RENDER CONTENT BY VIEW MODE =====
  
  const renderMainContent = useCallback(() => {
    // Error state
    if (isError) {
      return (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Error al cargar almacenes:</strong>{' '}
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
      const hasFilters = Object.keys(apiFilters).some(key => 
        key !== 'page' && key !== 'limit' && apiFilters[key as keyof typeof apiFilters]
      )
      
      return (
        <div className="text-center py-5">
          <i className="bi bi-building display-1 text-muted mb-3"></i>
          <h4 className="text-muted mb-3">
            {hasFilters ? 'No se encontraron almacenes' : 'No hay almacenes registrados'}
          </h4>
          <p className="text-muted mb-4">
            {hasFilters 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea tu primer almacén para comenzar a gestionar tu inventario'
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
            <Link href="/dashboard/inventory/warehouses/create">
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Crear Primer Almacén
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
          <WarehousesTableVirtualized
            warehouses={warehouses}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onSelectAll={() => selection.toggleSelectAll(warehouseIds)}
            isAllSelected={selection.isAllSelected}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )
      
      case 'grid':
        return (
          <WarehousesGrid
            warehouses={warehouses}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )
      
      case 'list':
        return (
          <WarehousesList
            warehouses={warehouses}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            showExpandable={true}
          />
        )
      
      case 'compact':
        return (
          <WarehousesCompact
            warehouses={warehouses}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onSelectAll={() => selection.toggleSelectAll(warehouseIds)}
            isAllSelected={selection.isAllSelected}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onBulkAction={(action, selectedIds) => {
              if (action === 'delete') {
                handleBulkDelete()
              }
              // TODO: Implementar otras bulk actions (activate, deactivate)
            }}
            maxHeight={600}
          />
        )
      
      case 'showcase':
        return (
          <WarehousesShowcase
            warehouses={warehouses}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            showHeroCards={true}
          />
        )
      
      default:
        return (
          <WarehousesTableVirtualized
            warehouses={warehouses}
            isLoading={isLoading}
            enableSelection={enableSelection}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onSelectAll={() => selection.toggleSelectAll(warehouseIds)}
            isAllSelected={selection.isAllSelected}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )
    }
  }, [
    view.viewMode,
    warehouses,
    isLoading,
    isError,
    error,
    isEmpty,
    enableSelection,
    selection,
    warehouseIds,
    handleDelete,
    handleToggleActive,
    handleBulkDelete,
    apiFilters,
    filters.resetFilters,
    showCreateButton,
    handleRefresh,
  ])
  
  // ===== RENDER =====
  
  return (
    <div className={`warehouses-admin-page-pro ${className}`}>
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
                  {total} almacen{total !== 1 ? 'es' : ''} total{total !== 1 ? 'es' : ''}
                  {isValidating && (
                    <span className="ms-2">
                      <i className="bi bi-arrow-clockwise spin"></i>
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="d-flex flex-column flex-sm-row gap-2">
          {/* Bulk Actions */}
          {showBulkActions && selection.hasSelection && (
            <div className="d-flex gap-2">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleBulkDelete}
              >
                <i className="bi bi-trash me-1"></i>
                Eliminar ({selection.selectedCount})
              </Button>
            </div>
          )}
          
          {/* Create Button */}
          {showCreateButton && (
            <Link href="/dashboard/inventory/warehouses/create">
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Nuevo Almacén
              </Button>
            </Link>
          )}
          
          {/* Refresh Button */}
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <WarehousesFiltersSimple 
        isVisible={view.isFiltersVisible}
        onToggleVisibility={view.toggleFilters}
      />
      
      {/* View Controls */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3">
        <ViewModeSelector 
          currentMode={view.viewMode}
          onModeChange={view.setViewMode}
          availableModes={['table', 'grid', 'list', 'compact', 'showcase']}
        />
        
        {/* Results Info */}
        <div className="text-muted small mt-2 mt-lg-0">
          {!isLoading && !isEmpty && (
            <>
              Mostrando {warehouses.length} de {total} registros
              {showPagination && (
                <> • Página {currentPage} de {pages}</>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="warehouses-content">
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
                count: warehouses.length,
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
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

WarehousesAdminPagePro.displayName = 'WarehousesAdminPagePro'

// ===== STYLES =====

const styles = `
.warehouses-admin-page-pro {
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .warehouses-content {
    min-height: 400px;
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
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default WarehousesAdminPagePro