'use client'

import React, { useRef, useCallback } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { UnitsTableVirtualized } from './UnitsTableVirtualized'
import { UnitsGrid } from './UnitsGrid'
import { UnitsList } from './UnitsList'
import { UnitsCompact } from './UnitsCompact'
import { UnitsShowcase } from './UnitsShowcase'
import { UnitsFiltersSimple } from './UnitsFiltersSimple'
import { UnitsViewModeSelector } from './UnitsViewModeSelector'
import { PaginationPro } from './PaginationPro'
import { useUnits, useUnitMutations, useErrorHandler } from '../hooks'
import { useUnitsUIStore, useUnitsFilters, useUnitsSort, useUnitsPage, useUnitsViewMode } from '../store/unitsUIStore'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

const UnitsStatsBar = React.memo<{ 
  total: number
  loading?: boolean
}>(({ total, loading }) => (
  <div className="row g-3 mb-4">
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-primary fw-bold">
            {loading ? (
              <div className="spinner-border spinner-border-sm" />
            ) : (
              total.toLocaleString()
            )}
          </div>
          <div className="text-muted small">Total Unidades</div>
        </div>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-success fw-bold">
            <i className="bi bi-rulers" />
          </div>
          <div className="text-muted small">Sistema de Medidas</div>
          <div className="text-success small">Gestión completa</div>
        </div>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-info fw-bold">
            <i className="bi bi-lightning-charge" />
          </div>
          <div className="text-muted small">Virtualizado</div>
          <div className="text-info small">Ultra rápido</div>
        </div>
      </div>
    </div>
  </div>
))

UnitsStatsBar.displayName = 'UnitsStatsBar'

export const UnitsAdminPagePro = React.memo(() => {
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { handleError } = useErrorHandler()
  
  // Función simple de toast usando DOM directo
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Crear toast elemento directamente
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    `
    toast.textContent = message
    
    // Agregar animación CSS si no existe
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style')
      style.id = 'toast-animations'
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)
    }
    
    // Mostrar toast
    document.body.appendChild(toast)
    
    // Remover después de 4 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => {
          toast.remove()
        }, 300)
      }
    }, 4000)
  }, [])

  // Get UI state from Zustand store
  const filters = useUnitsFilters()
  const sort = useUnitsSort()
  const currentPage = useUnitsPage()
  const viewMode = useUnitsViewMode()
  const { setPage } = useUnitsUIStore()

  // Get units data using existing hooks
  const { units, meta, isLoading, error, refresh } = useUnits({
    page: { number: currentPage, size: 20 },
    filter: filters.search ? { name: filters.search } : {},
    sort,
  })

  const { deleteUnit, isLoading: isMutating } = useUnitMutations()

  // Handlers
  const handlePageChange = React.useCallback((page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setPage])

  const handleEdit = React.useCallback((unit: { id: string }) => {
    navigation.push(`/dashboard/products/units/${unit.id}/edit`)
  }, [navigation])

  const handleView = React.useCallback((unit: { id: string }) => {
    window.open(`/dashboard/products/units/${unit.id}`, '_blank')
  }, [])

  const handleDelete = React.useCallback(async (unitId: string) => {
    const confirmed = await confirmModalRef.current?.confirm(
      '¿Estás seguro de eliminar esta unidad? Esta acción no se puede deshacer.',
      {
        title: 'Eliminar Unidad',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-exclamation-triangle-fill text-danger" />
      }
    )
    
    if (confirmed) {
      try {
        await deleteUnit(unitId)
        refresh()
        showToast('Unidad eliminada exitosamente', 'success')
      } catch (error) {
        handleError(error, 'Error al eliminar unidad')
      }
    }
  }, [deleteUnit, refresh, showToast, handleError])

  const handleCreateNew = React.useCallback(() => {
    navigation.push('/dashboard/products/units/create')
  }, [navigation])

  const handleBackToProducts = React.useCallback(() => {
    navigation.push('/dashboard/products')
  }, [navigation])

  // Dynamic view rendering based on viewMode
  const renderUnitsView = React.useCallback(() => {
    const props = {
      units,
      isLoading,
      onEdit: handleEdit,
      onView: handleView,
      onDelete: handleDelete,
    }

    switch (viewMode) {
      case 'table':
        return <UnitsTableVirtualized {...props} />
      case 'grid':
        return <UnitsGrid {...props} />
      case 'list':
        return <UnitsList {...props} />
      case 'compact':
        return <UnitsCompact {...props} />
      case 'showcase':
        return <UnitsShowcase {...props} />
      default:
        return <UnitsTableVirtualized {...props} />
    }
  }, [viewMode, units, isLoading, handleEdit, handleView, handleDelete])

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <div className="d-flex align-items-center">
            <Button
              size="small"
              variant="secondary"
              buttonStyle="ghost"
              onClick={handleBackToProducts}
              className="me-3"
            >
              <i className="bi bi-arrow-left me-1" />
              Productos
            </Button>
            <div className="bg-primary rounded-circle p-3 me-3">
              <i className="bi bi-rulers text-white display-6" />
            </div>
            <div>
              <h1 className="display-5 fw-bold mb-0">
                Gestión de Unidades
                <span className="badge bg-success ms-3">PRO</span>
              </h1>
              <p className="text-muted lead mb-0">
                Sistema de unidades de medida con virtualización
              </p>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              buttonStyle="outline"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-2" />
              Actualizar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateNew}
            >
              <i className="bi bi-plus-lg me-2" />
              Nueva Unidad
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <UnitsStatsBar 
        total={meta?.page?.total || 0}
        loading={isLoading}
      />

      {/* Filters & View Mode */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <UnitsFiltersSimple />
        </div>
        <div className="col-lg-4 d-flex align-items-end justify-content-end">
          <UnitsViewModeSelector />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 text-danger fs-4" />
            <div className="flex-fill">
              <h6 className="mb-1">Error al cargar unidades</h6>
              <p className="mb-0 small">{error.message}</p>
            </div>
            <Button
              variant="danger"
              buttonStyle="outline"
              onClick={() => refresh()}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="row">
        <div className="col">
          {/* Units Table */}
          {renderUnitsView()}

          {/* Pagination */}
          {meta && (
            <div className="mt-4">
              <PaginationPro
                meta={meta}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isLoading={isLoading || isMutating}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="row mt-4">
        <div className="col">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6 className="mb-1">
                    <i className="bi bi-rulers me-2 text-primary" />
                    Unidades de Medida
                  </h6>
                  <div className="d-flex flex-wrap gap-3 small text-muted">
                    <span><i className="bi bi-check-circle text-success me-1" />Tabla virtualizada</span>
                    <span><i className="bi bi-check-circle text-success me-1" />Filtros con debounce</span>
                    <span><i className="bi bi-check-circle text-success me-1" />Performance optimizado</span>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="small text-muted">
                    Implementación Enterprise Level
                    <div className="fw-bold text-primary">Auxiliar al módulo Productos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
})

UnitsAdminPagePro.displayName = 'UnitsAdminPagePro'

export default UnitsAdminPagePro