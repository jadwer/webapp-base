'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button, Input, Select } from '@/ui/components/base'
import { useUnits, useCategories, useBrands } from '../hooks'
import { useProductsUIStore } from '../store/productsUIStore'
import type { ProductFilters, ProductSortOptions } from '../types'

interface ProductsFiltersCleanProps {
  isLoading?: boolean
}

interface FilterState {
  searchName: string
  searchSku: string  
  categoryId: string
  brandId: string
  unitId: string
}

const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Nombre (A-Z)' },
  { value: 'name:desc', label: 'Nombre (Z-A)' },
  { value: 'price:desc', label: 'Precio (Mayor a menor)' },
  { value: 'price:asc', label: 'Precio (Menor a mayor)' },
  { value: 'createdAt:desc', label: 'Más recientes' },
  { value: 'createdAt:asc', label: 'Más antiguos' }
] as const

const ProductsFiltersCleanComponent: React.FC<ProductsFiltersCleanProps> = ({
  isLoading = false
}) => {
  console.log('🔄 ProductsFiltersClean render') // Debug
  
  // Get state from Zustand store
  const { filters, sort, setFilters, setSort, clearFilters } = useProductsUIStore()
  
  const [localFilters, setLocalFilters] = useState<FilterState>({
    searchName: filters.name || '',
    searchSku: filters.sku || '',
    categoryId: filters.categoryId || '',
    brandId: filters.brandId || '',
    unitId: filters.unitId || ''
  })
  
  const { units, isLoading: isLoadingUnits } = useUnits()
  const { categories, isLoading: isLoadingCategories } = useCategories()
  const { brands, isLoading: isLoadingBrands } = useBrands()

  // Update Zustand store when local filters change
  useEffect(() => {
    const newFilters: ProductFilters = {}
    
    if (localFilters.searchName.trim()) {
      newFilters.name = localFilters.searchName.trim()
    }
    if (localFilters.searchSku.trim()) {
      newFilters.sku = localFilters.searchSku.trim()
    }
    if (localFilters.categoryId) {
      newFilters.categoryId = localFilters.categoryId
    }
    if (localFilters.brandId) {
      newFilters.brandId = localFilters.brandId
    }
    if (localFilters.unitId) {
      newFilters.unitId = localFilters.unitId
    }
    
    // Update Zustand store (this won't cause re-renders)
    setFilters(newFilters)
  }, [localFilters, setFilters])

  const handleSearchNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, searchName: e.target.value }))
  }, [])

  const handleSearchSkuChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, searchSku: e.target.value }))
  }, [])

  const handleSelectChange = useCallback((field: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalFilters(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split(':') as [ProductSortOptions['field'], 'asc' | 'desc']
    setSort({ field, direction })
  }, [setSort])

  const handleClearAll = useCallback(() => {
    setLocalFilters({
      searchName: '',
      searchSku: '',
      categoryId: '',
      brandId: '',
      unitId: ''
    })
    clearFilters()
  }, [clearFilters])

  const hasFilters = Object.values(localFilters).some(value => value.trim() !== '')
  const currentSortValue = `${sort.field}:${sort.direction}`

  const unitOptions = units.map(unit => ({ 
    value: unit.id, 
    label: unit.name 
  }))

  const categoryOptions = categories.map(category => ({ 
    value: category.id, 
    label: category.name 
  }))

  const brandOptions = brands.map(brand => ({ 
    value: brand.id, 
    label: brand.name 
  }))

  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2" />
            Filtros y Ordenamiento
          </h6>
          {hasFilters && (
            <Button
              size="small"
              variant="secondary"
              buttonStyle="outline"
              onClick={handleClearAll}
              disabled={isLoading}
            >
              <i className="bi bi-x-circle me-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Search Inputs */}
          <div className="col-md-6">
            <Input
              label="Buscar por nombre"
              placeholder="Nombre del producto..."
              value={localFilters.searchName}
              onChange={handleSearchNameChange}
              leftIcon="bi-search"
              disabled={isLoading}
            />
          </div>
          <div className="col-md-6">
            <Input
              label="Buscar por SKU"
              placeholder="Código SKU..."
              value={localFilters.searchSku}
              onChange={handleSearchSkuChange}
              leftIcon="bi-upc-scan"
              disabled={isLoading}
            />
          </div>

          {/* Dropdowns */}
          <div className="col-md-3">
            <Select
              label="Categoría"
              value={localFilters.categoryId}
              onChange={handleSelectChange('categoryId')}
              disabled={isLoading || isLoadingCategories}
            >
              <option value="">Todas las categorías</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-md-3">
            <Select
              label="Marca"
              value={localFilters.brandId}
              onChange={handleSelectChange('brandId')}
              disabled={isLoading || isLoadingBrands}
            >
              <option value="">Todas las marcas</option>
              {brandOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-md-3">
            <Select
              label="Unidad"
              value={localFilters.unitId}
              onChange={handleSelectChange('unitId')}
              disabled={isLoading || isLoadingUnits}
            >
              <option value="">Todas las unidades</option>
              {unitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-md-3">
            <Select
              label="Ordenar por"
              value={currentSortValue}
              onChange={handleSortChange}
              disabled={isLoading}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Filter Summary */}
        {hasFilters && (
          <div className="mt-3">
            <div className="d-flex flex-wrap gap-2">
              {localFilters.searchName && (
                <span className="badge bg-primary">
                  Nombre: {localFilters.searchName}
                </span>
              )}
              {localFilters.searchSku && (
                <span className="badge bg-primary">
                  SKU: {localFilters.searchSku}
                </span>
              )}
              {localFilters.categoryId && (
                <span className="badge bg-secondary">
                  Categoría: {categories.find(c => c.id === localFilters.categoryId)?.name}
                </span>
              )}
              {localFilters.brandId && (
                <span className="badge bg-secondary">
                  Marca: {brands.find(b => b.id === localFilters.brandId)?.name}
                </span>
              )}
              {localFilters.unitId && (
                <span className="badge bg-secondary">
                  Unidad: {units.find(u => u.id === localFilters.unitId)?.name}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Memoize the component with careful comparison
export const ProductsFiltersClean = React.memo(ProductsFiltersCleanComponent, (prevProps, nextProps) => {
  // Only re-render if essential props changed
  return (
    JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters) &&
    JSON.stringify(prevProps.sort) === JSON.stringify(nextProps.sort) &&
    prevProps.isLoading === nextProps.isLoading
  )
})

ProductsFiltersClean.displayName = 'ProductsFiltersClean'

export default ProductsFiltersClean