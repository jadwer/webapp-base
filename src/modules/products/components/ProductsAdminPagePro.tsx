'use client'

import React, { useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { ProductsTableVirtualized } from './ProductsTableVirtualized'
import { ProductsGrid } from './ProductsGrid'
import { ProductsList } from './ProductsList'
import { ProductsCompact } from './ProductsCompact'
import { ProductsShowcase } from './ProductsShowcase'
import { ProductsFiltersSimple } from './ProductsFiltersSimple'
import { ViewModeSelector } from './ViewModeSelector'
import { PaginationPro } from './PaginationPro'
import { useProducts, useProductMutations } from '../hooks'
import { useProductsUIStore, useProductsFilters, useProductsSort, useProductsPage, useProductsViewMode } from '../store/productsUIStore'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'

const ProductsStatsBar = React.memo<{ 
  total: number
  loading?: boolean
  lastUpdated?: Date 
}>(({ total, loading, lastUpdated }) => (
  <div className="row g-3 mb-4">
    <div className="col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-primary fw-bold">
            {loading ? (
              <div className="spinner-border spinner-border-sm" />
            ) : (
              total.toLocaleString()
            )}
          </div>
          <div className="text-muted small">Total Productos</div>
        </div>
      </div>
    </div>
    <div className="col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-success fw-bold">
            <i className="bi bi-lightning-charge" />
          </div>
          <div className="text-muted small">Virtualizado</div>
          <div className="text-success small">Ultra rápido</div>
        </div>
      </div>
    </div>
    <div className="col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="display-4 text-info fw-bold">
            <i className="bi bi-funnel" />
          </div>
          <div className="text-muted small">Filtros Inteligentes</div>
          <div className="text-info small">300ms debounce</div>
        </div>
      </div>
    </div>
    <div className="col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="text-muted small">Última actualización</div>
          <div className="fw-bold">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Cargando...'}
          </div>
        </div>
      </div>
    </div>
  </div>
))

ProductsStatsBar.displayName = 'ProductsStatsBar'

export const ProductsAdminPagePro = React.memo(() => {
  console.log('🔄 ProductsAdminPagePro render') // Should be minimal

  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const toast = useToast()

  // Get UI state from Zustand store
  const filters = useProductsFilters()
  const sort = useProductsSort()
  const currentPage = useProductsPage()
  const viewMode = useProductsViewMode()
  const { setPage } = useProductsUIStore()

  // Get products data using existing hooks (maintains modularity)
  const { products, meta, isLoading, error, refresh } = useProducts({
    page: { number: currentPage, size: 20 },
    filters,
    sort,
    include: ['unit', 'category', 'brand']
  })

  const { deleteProduct, isLoading: isMutating } = useProductMutations()

  // Handlers
  const handlePageChange = React.useCallback((page: number) => {
    setPage(page)
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setPage])

  const handleEdit = React.useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}/edit`)
  }, [navigation])

  const handleView = React.useCallback((product: { id: string }) => {
    // Open in new tab to keep current working context
    window.open(`/dashboard/products/${product.id}`, '_blank')
  }, [])

  const handleDelete = React.useCallback(async (productId: string) => {
    const confirmed = await confirmModalRef.current?.confirm(
      '¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.',
      {
        title: 'Eliminar Producto',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-exclamation-triangle-fill text-danger" />
      }
    )
    
    if (confirmed) {
      try {
        await deleteProduct(productId)
        refresh()
        toast.success('Producto eliminado exitosamente')
      } catch (error) {
        console.error('❌ Error deleting product:', error)
        // The error message is already handled by the mutation hook
        toast.error((error as Error).message)
      }
    }
  }, [deleteProduct, refresh])

  const handleCreateNew = React.useCallback(() => {
    navigation.push('/dashboard/products/create')
  }, [navigation])

  const lastUpdated = React.useMemo(() => new Date(), [products])

  // Render different view components based on view mode
  const renderProductView = React.useCallback(() => {
    const commonProps = {
      products,
      isLoading,
      onEdit: handleEdit,
      onView: handleView,
      onDelete: handleDelete,
    }

    switch (viewMode) {
      case 'grid':
        return <ProductsGrid {...commonProps} />
      case 'list':
        return <ProductsList {...commonProps} />
      case 'compact':
        return <ProductsCompact {...commonProps} />
      case 'showcase':
        return <ProductsShowcase {...commonProps} />
      case 'table':
      default:
        return <ProductsTableVirtualized {...commonProps} />
    }
  }, [viewMode, products, isLoading, handleEdit, handleView, handleDelete])

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle p-3 me-3">
              <i className="bi bi-box-seam text-white display-6" />
            </div>
            <div>
              <h1 className="display-5 fw-bold mb-0">
                Gestión de Productos
                <span className="badge bg-success ms-3">PRO</span>
              </h1>
              <p className="text-muted lead mb-0">
                Panel administrativo profesional con virtualización y filtros inteligentes
              </p>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              buttonStyle="outline"
              onClick={refresh}
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
              Nuevo Producto
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <ProductsStatsBar 
        total={meta?.page?.total || 0}
        loading={isLoading}
        lastUpdated={lastUpdated}
      />

      {/* Filters */}
      <ProductsFiltersSimple />

      {/* View Mode Selector */}
      <ViewModeSelector />

      {/* Error State */}
      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 text-danger fs-4" />
            <div className="flex-fill">
              <h6 className="mb-1">Error al cargar productos</h6>
              <p className="mb-0 small">{error.message}</p>
            </div>
            <Button
              variant="danger"
              buttonStyle="outline"
              onClick={refresh}
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
          {/* Dynamic View Rendering */}
          {renderProductView()}

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
                    <i className="bi bi-gear-wide-connected me-2 text-primary" />
                    Características Técnicas
                  </h6>
                  <div className="d-flex flex-wrap gap-3 small text-muted">
                    <span><i className="bi bi-check-circle text-success me-1" />Tabla virtualizada (TanStack)</span>
                    <span><i className="bi bi-check-circle text-success me-1" />React.memo optimizations</span>
                    <span><i className="bi bi-check-circle text-success me-1" />Zustand state management</span>
                    <span><i className="bi bi-check-circle text-success me-1" />Debounced search (300ms)</span>
                    <span><i className="bi bi-check-circle text-success me-1" />Focus preservation</span>
                    <span><i className="bi bi-check-circle text-success me-1" />Smart pagination</span>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="small text-muted">
                    Implementación Enterprise Level
                    <div className="fw-bold text-primary">Sin re-renders innecesarios</div>
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

ProductsAdminPagePro.displayName = 'ProductsAdminPagePro'

export default ProductsAdminPagePro