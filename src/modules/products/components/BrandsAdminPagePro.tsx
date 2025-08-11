'use client'

import React, { useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { BrandsTableVirtualized } from './BrandsTableVirtualized'
import { BrandsGrid } from './BrandsGrid'
import { BrandsList } from './BrandsList'
import { BrandsCompact } from './BrandsCompact'
import { BrandsShowcase } from './BrandsShowcase'
import { BrandsFiltersSimple } from './BrandsFiltersSimple'
import { BrandsViewModeSelector } from './BrandsViewModeSelector'
import { PaginationPro } from './PaginationPro'
import { useBrands, useBrandMutations } from '../hooks'
import { useBrandsUIStore, useBrandsFilters, useBrandsSort, useBrandsPage, useBrandsViewMode } from '../store/brandsUIStore'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'

const BrandsStatsBar = React.memo<{ 
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
          <div className="text-muted small">Total Marcas</div>
        </div>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-success fw-bold">
            <i className="bi bi-award" />
          </div>
          <div className="text-muted small">Sistema de Marcas</div>
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

BrandsStatsBar.displayName = 'BrandsStatsBar'

export const BrandsAdminPagePro = React.memo(() => {
  console.log('🔄 BrandsAdminPagePro render')

  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const toast = useToast()

  // Get UI state from Zustand store
  const filters = useBrandsFilters()
  const sort = useBrandsSort()
  const currentPage = useBrandsPage()
  const viewMode = useBrandsViewMode()
  const { setPage } = useBrandsUIStore()

  // Get brands data using existing hooks
  const { brands, meta, isLoading, error, refresh } = useBrands({
    page: { number: currentPage, size: 20 },
    filter: filters.search ? { name: filters.search } : {},
    sort,
  })

  const { deleteBrand, isLoading: isMutating } = useBrandMutations()

  // Handlers
  const handlePageChange = React.useCallback((page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setPage])

  const handleEdit = React.useCallback((brand: { id: string }) => {
    navigation.push(`/dashboard/products/brands/${brand.id}/edit`)
  }, [navigation])

  const handleView = React.useCallback((brand: { id: string }) => {
    window.open(`/dashboard/products/brands/${brand.id}`, '_blank')
  }, [])

  const handleDelete = React.useCallback(async (brandId: string) => {
    const confirmed = await confirmModalRef.current?.confirm(
      '¿Estás seguro de eliminar esta marca? Esta acción no se puede deshacer.',
      {
        title: 'Eliminar Marca',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-exclamation-triangle-fill text-danger" />
      }
    )
    
    if (confirmed) {
      try {
        await deleteBrand(brandId)
        refresh()
        toast.success('Marca eliminada exitosamente')
      } catch (error) {
        console.error('❌ Error deleting brand:', error)
        // The error message is already handled by the mutation hook
        toast.error((error as Error).message)
      }
    }
  }, [deleteBrand, refresh])

  const handleCreateNew = React.useCallback(() => {
    navigation.push('/dashboard/products/brands/create')
  }, [navigation])

  const handleBackToProducts = React.useCallback(() => {
    navigation.push('/dashboard/products')
  }, [navigation])

  // Dynamic view rendering based on viewMode
  const renderBrandsView = React.useCallback(() => {
    const props = {
      brands,
      isLoading,
      onEdit: handleEdit,
      onView: handleView,
      onDelete: handleDelete,
    }

    switch (viewMode) {
      case 'table':
        return <BrandsTableVirtualized {...props} />
      case 'grid':
        return <BrandsGrid {...props} />
      case 'list':
        return <BrandsList {...props} />
      case 'compact':
        return <BrandsCompact {...props} />
      case 'showcase':
        return <BrandsShowcase {...props} />
      default:
        return <BrandsTableVirtualized {...props} />
    }
  }, [viewMode, brands, isLoading, handleEdit, handleView, handleDelete])

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
              <i className="bi bi-award text-white display-6" />
            </div>
            <div>
              <h1 className="display-5 fw-bold mb-0">
                Gestión de Marcas
                <span className="badge bg-success ms-3">PRO</span>
              </h1>
              <p className="text-muted lead mb-0">
                Sistema de marcas con virtualización
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
              Nueva Marca
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <BrandsStatsBar 
        total={meta?.page?.total || 0}
        loading={isLoading}
      />

      {/* Filters & View Mode */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <BrandsFiltersSimple />
        </div>
        <div className="col-lg-4 d-flex align-items-end justify-content-end">
          <BrandsViewModeSelector />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 text-danger fs-4" />
            <div className="flex-fill">
              <h6 className="mb-1">Error al cargar marcas</h6>
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
          {/* Brands View */}
          {renderBrandsView()}

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
                    <i className="bi bi-award me-2 text-primary" />
                    Marcas de Productos
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

BrandsAdminPagePro.displayName = 'BrandsAdminPagePro'

export default BrandsAdminPagePro