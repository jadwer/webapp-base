'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Select } from '@/ui/components/base'
import { useUnits, useCategories, useBrands } from '../hooks'
import { useProductsUIStore } from '../store/productsUIStore'

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const ProductsFiltersSimple = React.memo(() => {
  // console.log('🔄 ProductsFiltersSimple render') // Should be minimal
  
  // Local state for instant UI feedback
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  
  // Input refs for focus preservation
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Debounced search (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Get Zustand actions
  const { setFilters, clearFilters } = useProductsUIStore()
  
  // Get auxiliary data
  const { units } = useUnits()
  const { categories } = useCategories() 
  const { brands } = useBrands()

  // Update filters when debounced search or selects change
  useEffect(() => {
    const newFilters: Record<string, unknown> = {}
    
    if (debouncedSearchTerm.trim()) {
      // Usar el filtro unificado search del backend (busca en nombre, SKU y descripción)
      newFilters.name = debouncedSearchTerm.trim()
    }
    if (selectedCategory) {
      newFilters.categoryId = selectedCategory
    }
    if (selectedBrand) {
      newFilters.brandId = selectedBrand
    }
    if (selectedUnit) {
      newFilters.unitId = selectedUnit
    }
    
    // console.log('🔍 Updating filters (debounced):', newFilters)
    setFilters(newFilters)
  }, [debouncedSearchTerm, selectedCategory, selectedBrand, selectedUnit, setFilters])

  const handleClearAll = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedUnit('')
    clearFilters()
    
    // Keep focus on search input
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
  }

  const hasFilters = searchTerm || selectedCategory || selectedBrand || selectedUnit

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          {/* Search Input */}
          <div className="col-md-4">
            <Input
              ref={searchInputRef}
              label="Buscar productos"
              placeholder="Nombre, SKU, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon="bi-search"
            />
          </div>

          {/* Category Filter */}
          <div className="col-md-2">
            <Select
              label="Categoría"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="col-md-2">
            <Select
              label="Marca"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Todas</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Unit Filter */}
          <div className="col-md-2">
            <Select
              label="Unidad"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              <option value="">Todas</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Actions */}
          <div className="col-md-2">
            {hasFilters ? (
              <Button
                variant="secondary"
                buttonStyle="outline"
                onClick={handleClearAll}
                className="w-100"
              >
                <i className="bi bi-x-circle me-2" />
                Limpiar
              </Button>
            ) : (
              <div className="text-muted small text-center py-2">
                <i className="bi bi-funnel me-1" />
                Sin filtros activos
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <small className="text-muted me-2">Filtros activos:</small>
              
              {searchTerm && (
                <span className="badge bg-primary">
                  <i className="bi bi-search me-1" />
                  &ldquo;{searchTerm}&rdquo;
                </span>
              )}
              
              {selectedCategory && (
                <span className="badge bg-info">
                  <i className="bi bi-tag me-1" />
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
              
              {selectedBrand && (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-award me-1" />
                  {brands.find(b => b.id === selectedBrand)?.name}
                </span>
              )}
              
              {selectedUnit && (
                <span className="badge bg-success">
                  <i className="bi bi-rulers me-1" />
                  {units.find(u => u.id === selectedUnit)?.name}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ProductsFiltersSimple.displayName = 'ProductsFiltersSimple'

export default ProductsFiltersSimple