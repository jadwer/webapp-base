'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/ui/components/base'
import { ProductsView } from './ProductsView'
import { ProductsFiltersClean } from './ProductsFiltersClean'
import { ProductsViewControls } from './ProductsViewControls'
import { useProductMutations } from '../hooks'
import { useProductsNoRerender } from '../hooks/useProductsNoRerender'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { ViewMode, ProductFilters, ProductSortOptions } from '../types'

export const ProductsPageClean2: React.FC = () => {
  console.log('🔄 ProductsPageClean2 re-render') // Debug re-renders
  
  // UI-only states (these should be the ONLY things that cause re-renders)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [sort, setSort] = useState<ProductSortOptions>({
    field: 'name',
    direction: 'asc'
  })

  const navigation = useNavigationProgress()

  // No-rerender data fetching
  const productsAPI = useProductsNoRerender({
    page: { number: currentPage, size: 20 },
    filters,
    sort,
    include: ['unit', 'category', 'brand']
  })

  const { deleteProduct, duplicateProduct, isLoading: isMutating } = useProductMutations()

  // Initial fetch
  useEffect(() => {
    console.log('🚀 Initial fetch triggered')
    productsAPI.fetchProducts({
      page: { number: currentPage, size: 20 },
      filters,
      sort,
      include: ['unit', 'category', 'brand']
    })
  }, []) // Only run once on mount

  // Handlers that DON'T cause re-renders of the products list
  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    console.log('🔍 Filter change (NO RERENDER):', newFilters)
    
    // Update local state for UI
    setFilters(newFilters)
    setCurrentPage(1)
    
    // Fetch without causing re-render
    productsAPI.search(newFilters)
  }, [productsAPI])

  const handleSortChange = useCallback((newSort: ProductSortOptions) => {
    console.log('📊 Sort change (NO RERENDER):', newSort)
    
    // Update local state for UI
    setSort(newSort)
    setCurrentPage(1)
    
    // Sort without causing re-render
    productsAPI.sort(newSort)
  }, [productsAPI])

  const handleClearFilters = useCallback(() => {
    console.log('🧹 Clear filters (NO RERENDER)')
    
    // Update local state for UI
    setFilters({})
    setCurrentPage(1)
    
    // Search empty filters without causing re-render
    productsAPI.search({})
  }, [productsAPI])

  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    console.log('👁️ View mode change:', newViewMode)
    setViewMode(newViewMode)
    // This is the ONLY thing that should cause a re-render
  }, [])

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Page change (NO RERENDER):', page)
    
    // Update local state for UI
    setCurrentPage(page)
    
    // Change page without causing re-render
    productsAPI.changePage(page)
  }, [productsAPI])

  // Product actions
  const handleEditProduct = useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}/edit`)
  }, [navigation])

  const handleViewProduct = useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}`)
  }, [navigation])

  const handleDeleteProduct = useCallback(async (productId: string) => {
    await deleteProduct(productId)
    productsAPI.refresh()
  }, [deleteProduct, productsAPI])

  const handleDuplicateProduct = useCallback(async (productId: string) => {
    await duplicateProduct(productId)
    productsAPI.refresh()
  }, [duplicateProduct, productsAPI])

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-box-seam me-2" />
            Gestión de Productos
            <span className="badge bg-danger ms-2">Sin Re-renders</span>
          </h1>
          <p className="text-muted mb-0">
            Versión experimental sin re-renders en filtros
          </p>
        </div>
      </div>

      {/* View Controls */}
      <ProductsViewControls
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isLoading={productsAPI.isLoading || isMutating}
        className="mb-4"
      />

      {/* Filters - Should NOT cause re-renders */}
      <ProductsFiltersClean
        filters={filters}
        sort={sort}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        isLoading={productsAPI.isLoading}
      />

      {/* Error State */}
      {productsAPI.error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar los productos: {productsAPI.error.message}
          <Button
            size="small"
            variant="secondary"
            buttonStyle="outline"
            onClick={productsAPI.refresh}
            className="ms-2"
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Main Products View */}
      <ProductsView
        products={productsAPI.products}
        meta={productsAPI.meta}
        isLoading={productsAPI.isLoading}
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
            <div className="text-center p-3 bg-danger bg-opacity-10 rounded border border-danger border-opacity-25">
              <i className="bi bi-lightning text-danger h4 mb-0" />
              <div className="small text-danger fw-medium">Sin Re-renders</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Filtros optimizados
              </div>
            </div>
          </div>
        }
      />

      {/* Development Info */}
      <div className="card mt-4 border-danger">
        <div className="card-header bg-danger bg-opacity-10">
          <h6 className="mb-0 text-danger">
            <i className="bi bi-lightning me-2" />
            Versión Experimental - Sin Re-renders
          </h6>
        </div>
        <div className="card-body">
          <p className="mb-2">
            Esta versión utiliza <strong>refs</strong> en lugar de <strong>state</strong> 
            para evitar re-renders innecesarios de la lista de productos.
          </p>
          
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge bg-success">Estado en Refs ✅</span>
            <span className="badge bg-success">Sin Re-renders ✅</span>
            <span className="badge bg-warning">Experimental ⚠️</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPageClean2