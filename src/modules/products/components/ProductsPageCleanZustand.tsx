'use client'

import React, { useCallback } from 'react'
import { Button } from '@/ui/components/base'
import { ProductsView } from './ProductsView'
import { ProductsFiltersClean } from './ProductsFiltersClean'
import { ProductsViewControls } from './ProductsViewControls'
import { useProductMutations, useProducts } from '../hooks'
import { useProductsUIStore, useProductsFilters, useProductsSort, useProductsPage, useProductsViewMode } from '../store/productsUIStore'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export const ProductsPageCleanZustand: React.FC = () => {
  console.log('🔄 ProductsPageCleanZustand render') // Debug - should be minimal
  
  const navigation = useNavigationProgress()
  
  // Get UI state from Zustand (selective subscriptions prevent re-renders)
  const filters = useProductsFilters()
  const sort = useProductsSort()  
  const currentPage = useProductsPage()
  const viewMode = useProductsViewMode()
  const { setViewMode, setPage } = useProductsUIStore()

  // Data fetching using existing modular hooks - this maintains modularity
  const { products, meta, isLoading, error, refresh } = useProducts({
    page: { number: currentPage, size: 20 },
    filters,
    sort,
    include: ['unit', 'category', 'brand']
  })

  const { deleteProduct, duplicateProduct, isLoading: isMutating } = useProductMutations()

  // Clean handlers - only update Zustand, no component state
  const handleViewModeChange = useCallback((newViewMode: typeof viewMode) => {
    console.log('👁️ View mode change (Zustand):', newViewMode)
    setViewMode(newViewMode)
  }, [setViewMode])

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Page change (Zustand):', page)
    setPage(page)
  }, [setPage])

  // Product actions (these are fine - they don't affect filters)
  const handleEditProduct = useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}/edit`)
  }, [navigation])

  const handleViewProduct = useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}`)
  }, [navigation])

  const handleDeleteProduct = useCallback(async (productId: string) => {
    await deleteProduct(productId)
    refresh()
  }, [deleteProduct, refresh])

  const handleDuplicateProduct = useCallback(async (productId: string) => {
    await duplicateProduct(productId)
    refresh()
  }, [duplicateProduct, refresh])

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-box-seam me-2" />
            Gestión de Productos
            <span className="badge bg-primary ms-2">Zustand Store</span>
          </h1>
          <p className="text-muted mb-0">
            Filtros independientes con Zustand - Sin re-renders
          </p>
        </div>
      </div>

      {/* View Controls - These only re-render when view mode changes */}
      <ProductsViewControls
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isLoading={isLoading || isMutating}
        className="mb-4"
      />

      {/* Filters - Connected directly to Zustand store */}
      <ProductsFiltersClean
        isLoading={isLoading}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar los productos: {error.message}
          <Button
            size="small"
            variant="secondary"
            buttonStyle="outline"
            onClick={() => refresh()}
            className="ms-2"
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Main Products View - should have React.memo to prevent unnecessary re-renders */}
      <ProductsView
        products={products}
        meta={meta}
        isLoading={isLoading}
        viewMode={viewMode}
        showStats={true}
        showPagination={true}
        showDetailedStats={true}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onEdit={handleEditProduct}
        onView={handleViewProduct}
        onDelete={handleDeleteProduct}
        onDuplicate={handleDuplicateProduct}
        customStats={
          <div className="col-md-3">
            <div className="text-center p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-25">
              <i className="bi bi-database text-primary h4 mb-0" />
              <div className="small text-primary fw-medium">Zustand Store</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Estado global
              </div>
            </div>
          </div>
        }
      />

      {/* Development Info */}
      <div className="card mt-4 border-primary">
        <div className="card-header bg-primary bg-opacity-10">
          <h6 className="mb-0 text-primary">
            <i className="bi bi-database me-2" />
            Implementación con Zustand Store
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><i className="bi bi-check-circle me-2 text-success" />¿Qué funciona?</h6>
              <ul className="small text-muted mb-3">
                <li>✅ Estado UI en Zustand (filtros, sort, página)</li>
                <li>✅ Datos siguen usando hooks modulares</li>
                <li>✅ Filtros NO causan re-render del padre</li>
                <li>✅ Suscripciones selectivas</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6><i className="bi bi-lightning me-2 text-warning" />Logs a revisar</h6>
              <ul className="small text-muted mb-3">
                <li>🔄 ProductsPageCleanZustand render (mínimos)</li>
                <li>🔍 Zustand: Setting filters (NO RERENDER)</li>
                <li>🔄 ProductsFiltersClean render (controlados)</li>
                <li>📄 Page/View changes sin re-render de lista</li>
              </ul>
            </div>
          </div>
          
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge bg-primary">Zustand ✅</span>
            <span className="badge bg-success">Modular ✅</span>
            <span className="badge bg-info">Suscripciones Selectivas ✅</span>
            <span className="badge bg-warning">Testing Required ⚠️</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPageCleanZustand