/**
 * PUBLIC CATALOG TEMPLATE
 * Complete template component that combines all catalog functionality
 * Ready-to-use component for public product catalog pages
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { usePublicProducts } from '../hooks/usePublicProducts'
import PublicCatalogFilters from './PublicCatalogFilters'
import PublicProductsGrid from './PublicProductsGrid'
import PublicCatalogPagination from './PublicCatalogPagination'
import type {
  PublicProductFilters,
  PublicProductSortField,
  SortDirection,
  ProductViewMode,
  EnhancedPublicProduct,
  FilterOption
} from '../types/publicProduct'

interface PublicCatalogTemplateProps {
  // Initial state
  initialFilters?: Partial<PublicProductFilters>
  initialSortField?: PublicProductSortField
  initialSortDirection?: SortDirection
  initialViewMode?: ProductViewMode
  initialPageSize?: number
  
  // Filter options
  categories: FilterOption[]
  brands: FilterOption[]
  units: FilterOption[]
  priceRange: {
    min: number
    max: number
    step: number
  }
  
  // Event handlers
  onProductClick?: (product: EnhancedPublicProduct) => void
  onAddToCart?: (product: EnhancedPublicProduct) => void
  onAddToWishlist?: (product: EnhancedPublicProduct) => void
  
  // Configuration
  showFilters?: boolean
  showSearch?: boolean
  showCategoryFilter?: boolean
  showBrandFilter?: boolean
  showUnitFilter?: boolean
  showPriceFilter?: boolean
  showSorting?: boolean
  showViewMode?: boolean
  showPagination?: boolean
  showPageSizeSelector?: boolean
  
  // Layout
  filtersVariant?: 'horizontal' | 'vertical' | 'sidebar'
  paginationVariant?: 'default' | 'simple' | 'compact'
  
  // Styling
  className?: string
  filtersClassName?: string
  gridClassName?: string
  paginationClassName?: string
  
  // Custom content
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
  emptyMessage?: string
  
  // Performance
  refreshInterval?: number
}

export const PublicCatalogTemplate: React.FC<PublicCatalogTemplateProps> = ({
  initialFilters = {},
  initialSortField = 'name',
  initialSortDirection = 'asc',
  initialViewMode = 'grid',
  initialPageSize = 24,
  categories = [],
  brands = [],
  units = [],
  priceRange = { min: 0, max: 10000, step: 100 },
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  showFilters = true,
  showSearch = true,
  showCategoryFilter = true,
  showBrandFilter = true,
  showUnitFilter = false,
  showPriceFilter = true,
  showSorting = true,
  showViewMode = true,
  showPagination = true,
  showPageSizeSelector = true,
  filtersVariant = 'horizontal',
  paginationVariant = 'default',
  className = '',
  filtersClassName = '',
  gridClassName = '',
  paginationClassName = '',
  headerContent,
  footerContent,
  emptyMessage = 'No se encontraron productos',
  refreshInterval = 300000 // 5 minutes
}) => {
  // State management
  const [filters, setFilters] = useState<PublicProductFilters>({
    isActive: true,
    ...initialFilters
  })
  const [sortField, setSortField] = useState<PublicProductSortField>(initialSortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)
  const [viewMode, setViewMode] = useState<ProductViewMode>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Prepare API parameters
  const sortParams = useMemo(() => [
    { field: sortField, direction: sortDirection }
  ], [sortField, sortDirection])

  const paginationParams = useMemo(() => ({
    page: currentPage,
    size: pageSize
  }), [currentPage, pageSize])

  // Fetch products with SWR
  const {
    products,
    meta,
    links,
    isLoading,
    error,
    mutate
  } = usePublicProducts(
    filters,
    sortParams,
    paginationParams,
    'unit,category,brand',
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: PublicProductFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handleSortChange = useCallback((field: PublicProductSortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1) // Reset to first page when sort changes
  }, [])

  const handleViewModeChange = useCallback((mode: ProductViewMode) => {
    setViewMode(mode)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top of catalog
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when page size changes
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({ isActive: true })
    setCurrentPage(1)
  }, [])

  // Refresh handler
  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  // Error state
  if (error) {
    return (
      <div className={`public-catalog-template ${className}`}>
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div>
            <strong>Error al cargar productos:</strong> {error.message}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={handleRefresh}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`public-catalog-template ${className}`}>
      {/* Header Content */}
      {headerContent && (
        <div className="catalog-header mb-4">
          {headerContent}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className={`catalog-filters mb-4 ${filtersClassName}`}>
          <PublicCatalogFilters
            filters={filters}
            sortField={sortField}
            sortDirection={sortDirection}
            viewMode={viewMode}
            categories={categories}
            brands={brands}
            units={units}
            priceRange={priceRange}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            onViewModeChange={handleViewModeChange}
            onClearFilters={handleClearFilters}
            showSearch={showSearch}
            showCategoryFilter={showCategoryFilter}
            showBrandFilter={showBrandFilter}
            showUnitFilter={showUnitFilter}
            showPriceFilter={showPriceFilter}
            showSorting={showSorting}
            showViewMode={showViewMode}
            variant={filtersVariant}
          />
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">
            {meta.total > 0 ? (
              <>
                {meta.from && meta.to ? (
                  <>Mostrando {meta.from} - {meta.to} de {meta.total} productos</>
                ) : (
                  <>{meta.total} productos encontrados</>
                )}
              </>
            ) : (
              'No se encontraron productos'
            )}
          </div>
          
          {/* Refresh button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Actualizar resultados"
          >
            <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className={`catalog-grid mb-4 ${gridClassName}`}>
        <PublicProductsGrid
          products={products}
          viewMode={viewMode}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      </div>

      {/* Pagination */}
      {showPagination && meta.lastPage > 1 && (
        <div className={`catalog-pagination ${paginationClassName}`}>
          <PublicCatalogPagination
            meta={meta}
            links={links}
            onPageChange={handlePageChange}
            onPageSizeChange={showPageSizeSelector ? handlePageSizeChange : undefined}
            showPageSizeSelector={showPageSizeSelector}
            variant={paginationVariant}
          />
        </div>
      )}

      {/* Footer Content */}
      {footerContent && (
        <div className="catalog-footer mt-4">
          {footerContent}
        </div>
      )}
    </div>
  )
}

export default PublicCatalogTemplate