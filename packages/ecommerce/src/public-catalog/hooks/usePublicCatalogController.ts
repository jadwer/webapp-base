'use client'

/**
 * PUBLIC CATALOG CONTROLLER (headless)
 *
 * Motor del catalogo publico: estado de filtros/orden/vista/paginacion,
 * fetch de productos y derivacion de facetas (categorias/marcas/unidades
 * con cross-filtering estandar: un grupo nunca se filtra a si mismo).
 *
 * Extraido de PublicCatalogTemplate (rediseno 2026-08) para separar motor
 * de piel: el template clasico lo consume tal cual (mismo comportamiento
 * para todos los tenants) y cada tenant puede construir su propia
 * presentacion sobre este hook sin duplicar logica.
 */

import { useState, useCallback, useMemo } from 'react'
import { usePublicProducts } from './usePublicProducts'
import type {
  PublicProductFilters,
  PublicProductSortField,
  SortDirection,
  ProductViewMode,
  EnhancedPublicProduct,
  FilterOption
} from '../types/publicProduct'

export interface PublicCatalogControllerOptions {
  initialFilters?: Partial<PublicProductFilters>
  initialSortField?: PublicProductSortField
  initialSortDirection?: SortDirection
  initialViewMode?: ProductViewMode
  initialPageSize?: number
  /** Opciones externas; si vienen vacias se derivan de los productos */
  categories?: FilterOption[]
  brands?: FilterOption[]
  units?: FilterOption[]
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

export function usePublicCatalogController({
  initialFilters = {},
  initialSortField = 'name',
  initialSortDirection = 'asc',
  initialViewMode = 'grid',
  initialPageSize = 24,
  categories = [],
  brands = [],
  units = [],
  refreshInterval = 300000
}: PublicCatalogControllerOptions = {}) {
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
  // options (or a future backend facets endpoint with real counts).
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

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    // Estado
    filters,
    sortField,
    sortDirection,
    viewMode,
    currentPage,
    pageSize,
    // Datos
    products,
    meta,
    links,
    isLoading,
    error,
    // Facetas (externas o derivadas)
    categories: derivedCategories,
    brands: derivedBrands,
    units: derivedUnits,
    // Handlers
    handleFiltersChange,
    handleSortChange,
    handleViewModeChange,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
    handleRefresh
  }
}

export type PublicCatalogController = ReturnType<typeof usePublicCatalogController>
