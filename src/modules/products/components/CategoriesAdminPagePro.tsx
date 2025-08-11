'use client'

import React, { useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { CategoriesTableVirtualized } from './CategoriesTableVirtualized'
import { CategoriesGrid } from './CategoriesGrid'
import { CategoriesList } from './CategoriesList'
import { CategoriesCompact } from './CategoriesCompact'
import { CategoriesShowcase } from './CategoriesShowcase'
import { CategoriesFiltersSimple } from './CategoriesFiltersSimple'
import { CategoriesViewModeSelector } from './CategoriesViewModeSelector'
import { PaginationPro } from './PaginationPro'
import { useCategories, useCategoryMutations } from '../hooks'
import { useCategoriesUIStore, useCategoriesFilters, useCategoriesSort, useCategoriesPage, useCategoriesViewMode } from '../store/categoriesUIStore'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'

const CategoriesStatsBar = React.memo<{ 
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
          <div className="text-muted small">Total Categorías</div>
        </div>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-success fw-bold">
            <i className="bi bi-tags" />
          </div>
          <div className="text-muted small">Sistema de Categorización</div>
          <div className="text-success small">Organización completa</div>
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

CategoriesStatsBar.displayName = 'CategoriesStatsBar'

export const CategoriesAdminPagePro = React.memo(() => {
  console.log('🔄 CategoriesAdminPagePro render')

  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const toast = useToast()

  // Get UI state from Zustand store
  const filters = useCategoriesFilters()
  const sort = useCategoriesSort()
  const currentPage = useCategoriesPage()
  const viewMode = useCategoriesViewMode()
  const { setPage } = useCategoriesUIStore()

  // Get categories data using existing hooks
  const { categories, meta, isLoading, error, refresh } = useCategories({
    page: { number: currentPage, size: 20 },
    filter: filters.search ? { name: filters.search } : {},
    sort,
  })

  const { deleteCategory, isLoading: isMutating } = useCategoryMutations()

  // Handlers
  const handlePageChange = React.useCallback((page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setPage])

  const handleEdit = React.useCallback((category: { id: string }) => {
    navigation.push(`/dashboard/products/categories/${category.id}/edit`)
  }, [navigation])

  const handleView = React.useCallback((category: { id: string }) => {
    window.open(`/dashboard/products/categories/${category.id}`, '_blank')
  }, [])

  const handleDelete = React.useCallback(async (categoryId: string) => {
    const confirmed = await confirmModalRef.current?.confirm(
      '¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.',
      {
        title: 'Eliminar Categoría',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-exclamation-triangle-fill text-danger" />
      }
    )
    
    if (confirmed) {
      try {
        await deleteCategory(categoryId)
        refresh()
        toast.success('Categoría eliminada exitosamente')
      } catch (error) {
        console.error('❌ Error deleting category:', error)
        // The error message is already handled by the mutation hook
        toast.error((error as Error).message)
      }
    }
  }, [deleteCategory, refresh])

  const handleCreateNew = React.useCallback(() => {
    navigation.push('/dashboard/products/categories/create')
  }, [navigation])

  const handleBackToProducts = React.useCallback(() => {
    navigation.push('/dashboard/products')
  }, [navigation])

  // Dynamic view rendering based on viewMode
  const renderCategoriesView = React.useCallback(() => {
    const props = {
      categories,
      isLoading,
      onEdit: handleEdit,
      onView: handleView,
      onDelete: handleDelete,
    }

    switch (viewMode) {
      case 'table':
        return <CategoriesTableVirtualized {...props} />
      case 'grid':
        return <CategoriesGrid {...props} />
      case 'list':
        return <CategoriesList {...props} />
      case 'compact':
        return <CategoriesCompact {...props} />
      case 'showcase':
        return <CategoriesShowcase {...props} />
      default:
        return <CategoriesTableVirtualized {...props} />
    }
  }, [viewMode, categories, isLoading, handleEdit, handleView, handleDelete])

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
              <i className="bi bi-tags text-white display-6" />
            </div>
            <div>
              <h1 className="display-5 fw-bold mb-0">
                Gestión de Categorías
                <span className="badge bg-success ms-3">PRO</span>
              </h1>
              <p className="text-muted lead mb-0">
                Sistema de categorización con virtualización
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
              Nueva Categoría
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <CategoriesStatsBar 
        total={meta?.page?.total || 0}
        loading={isLoading}
      />

      {/* Filters & View Mode */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <CategoriesFiltersSimple />
        </div>
        <div className="col-lg-4 d-flex align-items-end justify-content-end">
          <CategoriesViewModeSelector />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 text-danger fs-4" />
            <div className="flex-fill">
              <h6 className="mb-1">Error al cargar categorías</h6>
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
          {/* Categories View */}
          {renderCategoriesView()}

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
                    <i className="bi bi-tags me-2 text-primary" />
                    Categorías de Productos
                  </h6>
                  <div className="d-flex flex-wrap gap-3 small text-muted">
                    <span><i className="bi bi-check-circle text-success me-1" />5 vistas virtualizadas</span>
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

CategoriesAdminPagePro.displayName = 'CategoriesAdminPagePro'

export default CategoriesAdminPagePro