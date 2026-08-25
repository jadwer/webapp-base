/**
 * PUBLIC CATALOG TEMPLATE
 * Complete template component that combines all catalog functionality
 * Ready-to-use component for public product catalog pages
 */

'use client'

import React from 'react'
import { usePublicCatalogController } from '../hooks/usePublicCatalogController'
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
  onRequestQuote?: (product: EnhancedPublicProduct) => void
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
  onRequestQuote,
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
  // Motor headless compartido (mismo comportamiento de siempre); la piel de
  // cada tenant puede consumir este mismo hook sin duplicar la logica.
  const {
    filters,
    sortField,
    sortDirection,
    viewMode,
    products,
    meta,
    links,
    isLoading,
    error,
    categories: derivedCategories,
    brands: derivedBrands,
    units: derivedUnits,
    handleFiltersChange,
    handleSortChange,
    handleViewModeChange,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    handleRefresh
  } = usePublicCatalogController({
    initialFilters,
    initialSortField,
    initialSortDirection,
    initialViewMode,
    initialPageSize,
    categories,
    brands,
    units,
    refreshInterval
  })

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
            categories={derivedCategories}
            brands={derivedBrands}
            units={derivedUnits}
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

      {/* Products Grid */}
      <div className={`catalog-grid mb-4 ${gridClassName}`}>
        <PublicProductsGrid
          products={products}
          viewMode={viewMode}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
          onRequestQuote={onRequestQuote}
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