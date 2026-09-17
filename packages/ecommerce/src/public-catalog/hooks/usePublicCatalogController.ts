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

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { usePublicProducts, createProductsKey } from './usePublicProducts'
import type { PublicProductsPage } from '../services/publicProductsTransform'
import {
  catalogInitialQuery,
  CATALOG_PRODUCTS_INCLUDE,
  type CatalogInitialQueryOptions
} from '../services/catalogQuery'
import type {
  PublicProductFilters,
  PublicProductSortField,
  SortDirection,
  ProductViewMode,
  EnhancedPublicProduct,
  FilterOption
} from '../types/publicProduct'

// catalogInitialQuery vive en services/catalogQuery.ts (modulo puro) porque
// los server components tambien la usan; aqui solo se consume.

export interface PublicCatalogControllerOptions extends CatalogInitialQueryOptions {
  initialViewMode?: ProductViewMode
  /** Opciones externas; si vienen vacias se derivan de los productos */
  categories?: FilterOption[]
  brands?: FilterOption[]
  units?: FilterOption[]
  refreshInterval?: number
  /**
   * Pagina inicial prerenderizada en servidor (SEO Bloque 1), obtenida con
   * fetchPublicCatalogServer(catalogInitialQuery(...)). Solo se usa como
   * fallback mientras la consulta actual coincide con la inicial; al cambiar
   * filtros/orden/pagina el hook vuelve a su flujo normal (skeleton + fetch).
   */
  initialData?: PublicProductsPage
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
  refreshInterval = 300000,
  initialData
}: PublicCatalogControllerOptions = {}) {
  // State management
  const [filters, setFilters] = useState<PublicProductFilters>(
    () => catalogInitialQuery({ initialFilters }).filters
  )

  const [sortField, setSortField] = useState<PublicProductSortField>(initialSortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)
  const [viewMode, setViewMode] = useState<ProductViewMode>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Navegar /productos -> /productos?categoryId=X NO desmonta la pagina
  // (mismo segmento de ruta), asi que el useState de filters ignora el
  // initialFilters nuevo y el catalogo no re-filtra (el fix historico
  // 11aea79 forzaba remount con una key en la page; el rediseno lo perdio).
  // Cuando initialFilters cambia tras el montaje se replica la semantica
  // del remount: reset completo de filtros y regreso a la pagina 1.
  const serializedInitialFilters = JSON.stringify(initialFilters)
  const appliedInitialFiltersRef = useRef(serializedInitialFilters)
  useEffect(() => {
    if (appliedInitialFiltersRef.current === serializedInitialFilters) return
    appliedInitialFiltersRef.current = serializedInitialFilters
    setFilters(catalogInitialQuery({ initialFilters: JSON.parse(serializedInitialFilters) }).filters)
    setCurrentPage(1)
  }, [serializedInitialFilters])

  // Prepare API parameters
  const sortParams = useMemo(() => [
    { field: sortField, direction: sortDirection }
  ], [sortField, sortDirection])

  const paginationParams = useMemo(() => ({
    page: currentPage,
    size: pageSize
  }), [currentPage, pageSize])

  // Fallback prerenderizado: solo mientras la consulta actual es la inicial.
  // Sin esta comparacion SWR devolveria la pagina inicial (sin skeleton) al
  // cambiar de filtro, porque fallbackData aplica a cualquier clave sin data.
  const initialKey = useMemo(() => {
    if (!initialData) return null
    const q = catalogInitialQuery({
      initialFilters: JSON.parse(serializedInitialFilters),
      initialSortField,
      initialSortDirection,
      initialPageSize
    })
    return createProductsKey(q.filters, q.sort, q.pagination, q.include)
  }, [initialData, serializedInitialFilters, initialSortField, initialSortDirection, initialPageSize])
  const currentKey = createProductsKey(filters, sortParams, paginationParams, CATALOG_PRODUCTS_INCLUDE)
  const fallbackData = initialData && currentKey === initialKey ? initialData : undefined

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
    CATALOG_PRODUCTS_INCLUDE,
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      fallbackData
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
