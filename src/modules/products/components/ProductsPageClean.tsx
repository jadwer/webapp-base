'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/ui/components/base'
import { ProductsView } from './ProductsView'
import { ProductsFiltersClean } from './ProductsFiltersClean'
import { ProductsViewControls } from './ProductsViewControls'
import { useProductMutations } from '../hooks'
import { useProductsStable } from '../hooks/useProductsStable'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { ViewMode, ProductFilters, ProductSortOptions } from '../types'

export const ProductsPageClean: React.FC = () => {
  // Separate independent states
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [sort, setSort] = useState<ProductSortOptions>({
    field: 'name',
    direction: 'asc'
  })

  const navigation = useNavigationProgress()

  // Data fetching with STABLE parameters - prevents unnecessary re-fetches
  const { products, meta, isLoading, error, refresh } = useProductsStable({
    page: { number: currentPage, size: 20 },
    filters,
    sort,
    include: ['unit', 'category', 'brand']
  })

  const { deleteProduct, duplicateProduct, isLoading: isMutating } = useProductMutations()

  // Handler callbacks - optimized to prevent unnecessary re-renders
  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters(prev => {
      // Only update if filters actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
        setCurrentPage(1) // Reset to first page when filters change
        return newFilters
      }
      return prev
    })
  }, [])

  const handleSortChange = useCallback((newSort: ProductSortOptions) => {
    setSort(prev => {
      // Only update if sort actually changed
      if (prev.field !== newSort.field || prev.direction !== newSort.direction) {
        setCurrentPage(1) // Reset to first page when sort changes
        return newSort
      }
      return prev
    })
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(prev => {
      if (Object.keys(prev).length > 0) {
        setCurrentPage(1)
        return {}
      }
      return prev
    })
  }, [])

  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode)
    // No need to reset page - view changes shouldn't affect pagination
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Product actions
  const handleEditProduct = useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}/edit`)
  }, [navigation])

  const handleViewProduct = useCallback((product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}`)
  }, [navigation])

  const handleDeleteProduct = useCallback(async (productId: string) => {
    await deleteProduct(productId)
    refresh()
    
    // If we deleted the last item on current page and we're not on page 1, go back
    if (products.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }, [deleteProduct, refresh, products.length, currentPage])

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
            <span className="badge bg-success ms-2">Implementación Limpia</span>
          </h1>
          <p className="text-muted mb-0">
            Arquitectura optimizada con filtros independientes y paginación integrada
          </p>
        </div>
      </div>

      {/* View Controls */}
      <ProductsViewControls
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isLoading={isLoading || isMutating}
        className="mb-4"
      />

      {/* Filters - Completely independent */}
      <ProductsFiltersClean
        filters={filters}
        sort={sort}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
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

      {/* Main Products View - Integrated pagination */}
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
            <div className="text-center p-3 bg-success bg-opacity-10 rounded border border-success border-opacity-25">
              <i className="bi bi-check-circle text-success h4 mb-0" />
              <div className="small text-success fw-medium">Implementación Limpia</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Filtros independientes
              </div>
            </div>
          </div>
        }
      />

      {/* Development Info */}
      <div className="card mt-4 border-success">
        <div className="card-header bg-success bg-opacity-10">
          <h6 className="mb-0 text-success">
            <i className="bi bi-info-circle me-2" />
            Mejoras de esta Implementación
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><i className="bi bi-lightning me-2 text-warning" />Performance</h6>
              <ul className="small text-muted mb-3">
                <li>Filtros independientes sin causar refresh de página</li>
                <li>Debounce en búsquedas (300ms)</li>
                <li>React.memo en filtros para evitar re-renders</li>
                <li>Estados separados para mejor gestión</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6><i className="bi bi-gear-wide-connected me-2 text-info" />Arquitectura</h6>
              <ul className="small text-muted mb-3">
                <li>Separación completa de responsabilidades</li>
                <li>Paginación integrada en ProductsView</li>
                <li>Cambio de vista sin perder filtros</li>
                <li>Código limpio sin dependencias legacy</li>
              </ul>
            </div>
          </div>
          
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge bg-primary">Filtros Independientes ✅</span>
            <span className="badge bg-success">Paginación Integrada ✅</span>
            <span className="badge bg-info">React.memo ✅</span>
            <span className="badge bg-warning">Debounce ✅</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPageClean