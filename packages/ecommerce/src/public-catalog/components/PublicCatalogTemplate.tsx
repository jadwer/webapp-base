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

/** Normalizes a single-or-multi filter value into an id array. */
function toIdList(value?: string | string[]): string[] {
  return Array.isArray(value) ? value : value ? [value] : []
}

/** True when there is no selection in the group or the id is selected. */
function matchesSelection(relationId: string | undefined, selectedIds: string[]): boolean {
  return selectedIds.length === 0 || (!!relationId && selectedIds.includes(relationId))
}

/** Builds sorted FilterOption[] with counts from a product list. */
function deriveOptions(
  source: EnhancedPublicProduct[],
  pick: (product: EnhancedPublicProduct) => { id: string; attributes: { name: string } } | undefined
): FilterOption[] {
  const map = new Map<string, { label: string; count: number }>()
  for (const product of source) {
    const related = pick(product)
    if (!related?.id) continue
    const existing = map.get(related.id)
    if (existing) {
      existing.count++
    } else {
      map.set(related.id, { label: related.attributes.name, count: 1 })
    }
  }
  return Array.from(map.entries())
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label))
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
    'unit,category,brand,images,currency',
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  // Baseline query for facet derivation. It keeps search and price (they
  // constrain every group) but drops the category/brand/unit selections:
  // deriving options from the already facet-filtered result made sibling
  // options disappear after the first click, so multi-select was impossible.
  // Each group below is cross-filtered client-side by the OTHER groups only
  // (standard faceted navigation: a group never filters itself).
  const facetFilters = useMemo(() => ({
    search: filters.search,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax
  }), [filters.search, filters.priceMin, filters.priceMax])

  // One page of up to 100 products covers the catalogs that derive facets
  // client-side. Bigger catalogs should pass explicit categories/brands/units
  // props (or a future backend facets endpoint with real counts).
  const facetPagination = useMemo(() => ({ page: 1, size: 100 }), [])

  const { products: facetProducts } = usePublicProducts(
    facetFilters,
    undefined,
    facetPagination,
    'unit,category,brand',
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const selectedCategoryIds = useMemo(() => toIdList(filters.categoryId), [filters.categoryId])
  const selectedBrandIds = useMemo(() => toIdList(filters.brandId), [filters.brandId])
  const selectedUnitIds = useMemo(() => toIdList(filters.unitId), [filters.unitId])

  // Auto-derive filter options when not provided externally
  const derivedCategories = useMemo(() => {
    if (categories.length > 0) return categories
    const source = facetProducts.filter(p =>
      matchesSelection(p.brand?.id, selectedBrandIds) &&
      matchesSelection(p.unit?.id, selectedUnitIds)
    )
    return deriveOptions(source, p => p.category)
  }, [categories, facetProducts, selectedBrandIds, selectedUnitIds])

  const derivedBrands = useMemo(() => {
    if (brands.length > 0) return brands
    const source = facetProducts.filter(p =>
      matchesSelection(p.category?.id, selectedCategoryIds) &&
      matchesSelection(p.unit?.id, selectedUnitIds)
    )
    return deriveOptions(source, p => p.brand)
  }, [brands, facetProducts, selectedCategoryIds, selectedUnitIds])

  const derivedUnits = useMemo(() => {
    if (units.length > 0) return units
    const source = facetProducts.filter(p =>
      matchesSelection(p.category?.id, selectedCategoryIds) &&
      matchesSelection(p.brand?.id, selectedBrandIds)
    )
    return deriveOptions(source, p => p.unit)
  }, [units, facetProducts, selectedCategoryIds, selectedBrandIds])

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