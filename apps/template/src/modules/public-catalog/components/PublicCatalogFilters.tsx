/**
 * PUBLIC CATALOG FILTERS
 * Advanced filtering component for public product catalog
 * Features: Search, Category, Brand, Price Range, Sorting
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button, Input, Modal } from '@/ui/components/base'
import type {
  PublicProductFilters,
  PublicProductSortField,
  SortDirection,
  FilterOption,
  ProductViewMode
} from '../types/publicProduct'

interface PublicCatalogFiltersProps {
  // Current filter state
  filters: PublicProductFilters
  sortField: PublicProductSortField
  sortDirection: SortDirection
  viewMode: ProductViewMode
  
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
  onFiltersChange: (filters: PublicProductFilters) => void
  onSortChange: (field: PublicProductSortField, direction: SortDirection) => void
  onViewModeChange: (mode: ProductViewMode) => void
  onClearFilters: () => void
  
  // Configuration
  showSearch?: boolean
  showCategoryFilter?: boolean
  showBrandFilter?: boolean
  showUnitFilter?: boolean
  showPriceFilter?: boolean
  showSorting?: boolean
  showViewMode?: boolean
  showClearButton?: boolean
  
  // Styling
  className?: string
  variant?: 'horizontal' | 'vertical' | 'sidebar'
}

export const PublicCatalogFilters: React.FC<PublicCatalogFiltersProps> = ({
  filters,
  sortField,
  sortDirection,
  viewMode,
  categories,
  brands,
  units,
  priceRange,
  onFiltersChange,
  onSortChange,
  onViewModeChange,
  onClearFilters,
  showSearch = true,
  showCategoryFilter = true,
  showBrandFilter = true,
  showUnitFilter = false,
  showPriceFilter = true,
  showSorting = true,
  showViewMode = true,
  showClearButton = true,
  className = '',
  variant = 'horizontal'
}) => {
  // Local state for price range inputs
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() || '')
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() || '')

  // Modal state for showing more categories/brands
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [showBrandsModal, setShowBrandsModal] = useState(false)

  // Handle search change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      search: value.trim() || undefined
    })
  }, [filters, onFiltersChange])

  // Handle category selection
  const handleCategoryChange = useCallback((categoryId: string) => {
    const currentCategories = Array.isArray(filters.categoryId) 
      ? filters.categoryId 
      : filters.categoryId ? [filters.categoryId] : []
    
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]
    
    onFiltersChange({
      ...filters,
      categoryId: newCategories.length > 0 ? newCategories : undefined
    })
  }, [filters, onFiltersChange])

  // Handle brand selection
  const handleBrandChange = useCallback((brandId: string) => {
    const currentBrands = Array.isArray(filters.brandId)
      ? filters.brandId
      : filters.brandId ? [filters.brandId] : []
    
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(id => id !== brandId)
      : [...currentBrands, brandId]
    
    onFiltersChange({
      ...filters,
      brandId: newBrands.length > 0 ? newBrands : undefined
    })
  }, [filters, onFiltersChange])

  // Handle unit selection
  const handleUnitChange = useCallback((unitId: string) => {
    const currentUnits = Array.isArray(filters.unitId)
      ? filters.unitId
      : filters.unitId ? [filters.unitId] : []
    
    const newUnits = currentUnits.includes(unitId)
      ? currentUnits.filter(id => id !== unitId)
      : [...currentUnits, unitId]
    
    onFiltersChange({
      ...filters,
      unitId: newUnits.length > 0 ? newUnits : undefined
    })
  }, [filters, onFiltersChange])

  // Handle price range change
  const handlePriceChange = useCallback(() => {
    const min = priceMin ? parseFloat(priceMin) : undefined
    const max = priceMax ? parseFloat(priceMax) : undefined
    
    onFiltersChange({
      ...filters,
      priceMin: (min && min >= priceRange.min) ? min : undefined,
      priceMax: (max && max <= priceRange.max) ? max : undefined
    })
  }, [priceMin, priceMax, filters, onFiltersChange, priceRange])

  // Handle sort change
  const handleSortChange = useCallback((field: PublicProductSortField) => {
    const newDirection: SortDirection = 
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(field, newDirection)
  }, [sortField, sortDirection, onSortChange])

  // View mode options
  const viewModeOptions: { value: ProductViewMode; label: string; icon: string }[] = [
    { value: 'grid', label: 'Grilla', icon: 'bi-grid-3x3-gap' },
    { value: 'list', label: 'Lista', icon: 'bi-list-ul' },
    { value: 'cards', label: 'Tarjetas', icon: 'bi-card-text' },
    { value: 'compact', label: 'Compacto', icon: 'bi-menu-button-wide' },
    { value: 'showcase', label: 'Vitrina', icon: 'bi-image' }
  ]

  // Sort options
  const sortOptions: { value: PublicProductSortField; label: string }[] = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'createdAt', label: 'Más reciente' },
    { value: 'category.name', label: 'Categoría' },
    { value: 'brand.name', label: 'Marca' }
  ]

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.categoryId ||
      filters.brandId ||
      filters.unitId ||
      filters.priceMin ||
      filters.priceMax
    )
  }, [filters])

  // Selected categories/brands for display
  const selectedCategories = useMemo(() => {
    const categoryIds = Array.isArray(filters.categoryId) 
      ? filters.categoryId 
      : filters.categoryId ? [filters.categoryId] : []
    return categories.filter(cat => categoryIds.includes(cat.value))
  }, [filters.categoryId, categories])

  const selectedBrands = useMemo(() => {
    const brandIds = Array.isArray(filters.brandId)
      ? filters.brandId
      : filters.brandId ? [filters.brandId] : []
    return brands.filter(brand => brandIds.includes(brand.value))
  }, [filters.brandId, brands])

  const baseClasses = 'public-catalog-filters'
  const variantClasses = {
    horizontal: 'row g-3',
    vertical: 'd-flex flex-column gap-3',
    sidebar: 'd-flex flex-column gap-4 p-3 border rounded'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Search */}
      {showSearch && (
        <div className={variant === 'horizontal' ? 'col-md-4' : ''}>
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon="bi-search"
            className="w-100"
          />
        </div>
      )}

      {/* View Mode Selector */}
      {showViewMode && (
        <div className={variant === 'horizontal' ? 'col-md-auto' : ''}>
          <div className="btn-group" role="group" aria-label="Modo de vista">
            {viewModeOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`btn ${viewMode === option.value ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
                onClick={() => onViewModeChange(option.value)}
                title={option.label}
              >
                <i className={option.icon} />
                {variant === 'sidebar' && <span className="ms-2">{option.label}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sorting */}
      {showSorting && (
        <div className={variant === 'horizontal' ? 'col-md-auto' : ''}>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as PublicProductSortField)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
              title={`Ordenar ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}
            >
              <i className={`bi ${sortDirection === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {showClearButton && hasActiveFilters && (
        <div className={variant === 'horizontal' ? 'col-md-auto' : ''}>
          <Button
            variant="secondary"
            buttonStyle="outline"
            size="small"
            onClick={onClearFilters}
            startIcon={<i className="bi bi-x-circle" />}
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Category Filter */}
      {showCategoryFilter && categories.length > 0 && (
        <div className={variant === 'horizontal' ? 'col-12' : ''}>
          <h6 className="mb-2">
            <i className="bi bi-tag me-2" />
            Categorías
            {selectedCategories.length > 0 && (
              <span className="badge bg-primary ms-2">{selectedCategories.length}</span>
            )}
          </h6>
          <div className="d-flex flex-wrap gap-2" style={{ overflow: 'hidden' }}>
            {categories.slice(0, variant === 'sidebar' ? 10 : 6).map(category => {
              const isSelected = selectedCategories.some(sel => sel.value === category.value)
              return (
                <button
                  key={category.value}
                  type="button"
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'} text-truncate`}
                  style={{ maxWidth: '250px' }}
                  onClick={() => handleCategoryChange(category.value)}
                  title={`${category.label}${category.count ? ` (${category.count})` : ''}`}
                >
                  {category.label}
                  {category.count && (
                    <span className="ms-1 small">({category.count})</span>
                  )}
                </button>
              )
            })}
            {categories.length > (variant === 'sidebar' ? 10 : 6) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => setShowCategoriesModal(true)}
              >
                +{categories.length - (variant === 'sidebar' ? 10 : 6)} mas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      {showBrandFilter && brands.length > 0 && (
        <div className={variant === 'horizontal' ? 'col-12' : ''}>
          <h6 className="mb-2">
            <i className="bi bi-award me-2" />
            Marcas
            {selectedBrands.length > 0 && (
              <span className="badge bg-primary ms-2">{selectedBrands.length}</span>
            )}
          </h6>
          <div className="d-flex flex-wrap gap-2" style={{ overflow: 'hidden' }}>
            {brands.slice(0, variant === 'sidebar' ? 8 : 5).map(brand => {
              const isSelected = selectedBrands.some(sel => sel.value === brand.value)
              return (
                <button
                  key={brand.value}
                  type="button"
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'} text-truncate`}
                  style={{ maxWidth: '250px' }}
                  onClick={() => handleBrandChange(brand.value)}
                  title={`${brand.label}${brand.count ? ` (${brand.count})` : ''}`}
                >
                  {brand.label}
                  {brand.count && (
                    <span className="ms-1 small">({brand.count})</span>
                  )}
                </button>
              )
            })}
            {brands.length > (variant === 'sidebar' ? 8 : 5) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => setShowBrandsModal(true)}
              >
                +{brands.length - (variant === 'sidebar' ? 8 : 5)} mas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Unit Filter */}
      {showUnitFilter && units.length > 0 && (
        <div className={variant === 'horizontal' ? 'col-12' : ''}>
          <h6 className="mb-2">
            <i className="bi bi-rulers me-2" />
            Unidades
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {units.map(unit => {
              const currentUnits = Array.isArray(filters.unitId) 
                ? filters.unitId 
                : filters.unitId ? [filters.unitId] : []
              const isSelected = currentUnits.includes(unit.value)
              
              return (
                <button
                  key={unit.value}
                  type="button"
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handleUnitChange(unit.value)}
                >
                  {unit.label}
                  {unit.count && (
                    <span className="ms-1 small">({unit.count})</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      {showPriceFilter && (
        <div className={variant === 'horizontal' ? 'col-12' : ''}>
          <h6 className="mb-2">
            <i className="bi bi-currency-dollar me-2" />
            Rango de precio
          </h6>
          <div className="row g-2">
            <div className="col">
              <Input
                type="number"
                placeholder={`Mín $${priceRange.min}`}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={handlePriceChange}
                min={priceRange.min}
                max={priceRange.max}
                step={priceRange.step}
                size="small"
              />
            </div>
            <div className="col-auto d-flex align-items-center">
              <span className="text-muted">—</span>
            </div>
            <div className="col">
              <Input
                type="number"
                placeholder={`Máx $${priceRange.max}`}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={handlePriceChange}
                min={priceRange.min}
                max={priceRange.max}
                step={priceRange.step}
                size="small"
              />
            </div>
          </div>
          {(filters.priceMin || filters.priceMax) && (
            <div className="mt-2">
              <small className="text-muted">
                {filters.priceMin && filters.priceMax
                  ? `$${filters.priceMin} - $${filters.priceMax}`
                  : filters.priceMin
                  ? `Desde $${filters.priceMin}`
                  : `Hasta $${filters.priceMax}`
                }
              </small>
            </div>
          )}
        </div>
      )}

      {/* Categories Modal */}
      <Modal
        show={showCategoriesModal}
        onHide={() => setShowCategoriesModal(false)}
        title="Todas las Categorias"
        size="large"
      >
        <div className="d-flex flex-wrap gap-2">
          {categories.map(category => {
            const isSelected = selectedCategories.some(sel => sel.value === category.value)
            return (
              <button
                key={category.value}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
                {category.count && (
                  <span className="ms-1 small">({category.count})</span>
                )}
              </button>
            )
          })}
        </div>
      </Modal>

      {/* Brands Modal */}
      <Modal
        show={showBrandsModal}
        onHide={() => setShowBrandsModal(false)}
        title="Todas las Marcas"
        size="large"
      >
        <div className="d-flex flex-wrap gap-2">
          {brands.map(brand => {
            const isSelected = selectedBrands.some(sel => sel.value === brand.value)
            return (
              <button
                key={brand.value}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleBrandChange(brand.value)}
              >
                {brand.label}
                {brand.count && (
                  <span className="ms-1 small">({brand.count})</span>
                )}
              </button>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

export default PublicCatalogFilters