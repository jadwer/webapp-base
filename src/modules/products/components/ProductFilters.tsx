'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useUnits, useCategories, useBrands } from '../hooks'
import type { ProductFilters as ProductFiltersType, ProductSortOptions } from '../types'

interface ProductFiltersProps {
  filters: ProductFiltersType
  sort: ProductSortOptions
  onFiltersChange: (filters: ProductFiltersType) => void
  onSortChange: (sort: ProductSortOptions) => void
  onClearFilters: () => void
  isLoading?: boolean
}

export const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  isLoading = false
}) => {
  const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const skuInputRef = useRef<HTMLInputElement>(null)
  const lastFocusedField = useRef<string | null>(null)
  const cursorPosition = useRef<number>(0)

  const { units } = useUnits()
  const { categories } = useCategories()
  const { brands } = useBrands()

  useEffect(() => {
    setLocalFilters(filters)
    
    // Restaurar foco después del re-render
    if (lastFocusedField.current) {
      const focusedField = lastFocusedField.current
      const savedCursorPos = cursorPosition.current
      setTimeout(() => {
        if (focusedField === 'name' && nameInputRef.current) {
          nameInputRef.current.focus()
          nameInputRef.current.setSelectionRange(savedCursorPos, savedCursorPos)
        } else if (focusedField === 'sku' && skuInputRef.current) {
          skuInputRef.current.focus()
          skuInputRef.current.setSelectionRange(savedCursorPos, savedCursorPos)
        }
        lastFocusedField.current = null
      }, 0)
    }
  }, [filters])

  // Debounced filter application for name search
  const debouncedApplyFilters = useCallback(
    (newFilters: ProductFiltersType) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(() => {
        onFiltersChange(newFilters)
      }, 300)
    },
    [onFiltersChange]
  )

  const handleFilterChange = (key: keyof ProductFiltersType, value: string | string[] | undefined) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Auto-apply name and SKU filters when user types 3+ characters with debounce
    if ((key === 'name' || key === 'sku') && typeof value === 'string') {
      if (value.length >= 3 || value.length === 0) {
        // Recordar qué campo tiene el foco y posición del cursor antes de aplicar filtros
        lastFocusedField.current = key
        const inputRef = key === 'name' ? nameInputRef : skuInputRef
        if (inputRef.current) {
          cursorPosition.current = inputRef.current.selectionStart || 0
        }
        debouncedApplyFilters(newFilters)
      }
    }
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters: ProductFiltersType = {}
    setLocalFilters(emptyFilters)
    onClearFilters()
  }

  const handleSortChange = (field: string, direction: string) => {
    onSortChange({
      field: field as ProductSortOptions['field'],
      direction: direction as ProductSortOptions['direction']
    })
  }

  const hasActiveFilters = Object.values(localFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  )

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-funnel me-2" />
          Filtros y búsqueda
        </h6>
        <div className="d-flex gap-2">
          <Button
            size="small"
            variant="secondary"
            buttonStyle="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <i className={`bi bi-chevron-${showAdvanced ? 'up' : 'down'}`} />
            {showAdvanced ? 'Menos filtros' : 'Más filtros'}
          </Button>
          {hasActiveFilters && (
            <Button
              size="small"
              variant="secondary"
              buttonStyle="outline"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              <i className="bi bi-x-lg me-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Filtros básicos */}
        <div className="row mb-3">
          <div className="col-md-4">
            <Input
              ref={nameInputRef}
              label="Buscar por nombre"
              type="text"
              value={localFilters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Nombre del producto"
              leftIcon="bi-search"
              disabled={isLoading}
            />
          </div>
          <div className="col-md-4">
            <Input
              ref={skuInputRef}
              label="Buscar por SKU"
              type="text"
              value={localFilters.sku || ''}
              onChange={(e) => handleFilterChange('sku', e.target.value)}
              placeholder="Código SKU"
              leftIcon="bi-upc-scan"
              disabled={isLoading}
            />
          </div>
          <div className="col-md-4">
            <Input
              label="Ordenar por"
              type="select"
              value={`${sort.field}-${sort.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-')
                handleSortChange(field, direction)
              }}
              disabled={isLoading}
              options={[
                { value: 'name-asc', label: 'Nombre (A-Z)' },
                { value: 'name-desc', label: 'Nombre (Z-A)' },
                { value: 'price-asc', label: 'Precio (menor a mayor)' },
                { value: 'price-desc', label: 'Precio (mayor a menor)' },
                { value: 'created_at-desc', label: 'Más recientes' },
                { value: 'created_at-asc', label: 'Más antiguos' },
                { value: 'updated_at-desc', label: 'Actualizados recientemente' }
              ]}
            />
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="row mb-3">
            <div className="col-md-4">
              <Input
                label="Categoría"
                type="select"
                value={localFilters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                disabled={isLoading}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...categories.map(category => ({ 
                    value: category.id, 
                    label: category.name 
                  }))
                ]}
              />
            </div>
            <div className="col-md-4">
              <Input
                label="Marca"
                type="select"
                value={localFilters.brandId || ''}
                onChange={(e) => handleFilterChange('brandId', e.target.value)}
                disabled={isLoading}
                options={[
                  { value: '', label: 'Todas las marcas' },
                  ...brands.map(brand => ({ 
                    value: brand.id, 
                    label: brand.name 
                  }))
                ]}
              />
            </div>
            <div className="col-md-4">
              <Input
                label="Unidad"
                type="select"
                value={localFilters.unitId || ''}
                onChange={(e) => handleFilterChange('unitId', e.target.value)}
                disabled={isLoading}
                options={[
                  { value: '', label: 'Todas las unidades' },
                  ...units.map(unit => ({ 
                    value: unit.id, 
                    label: `${unit.name} (${unit.code})` 
                  }))
                ]}
              />
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="primary"
            onClick={handleApplyFilters}
            disabled={isLoading}
            loading={isLoading}
          >
            <i className="bi bi-search me-2" />
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductFiltersComponent