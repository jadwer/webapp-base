/**
 * Tests for PublicCatalogFilters
 *
 * Regression (facetas): al seleccionar una opcion de un grupo, las opciones
 * hermanas no deben desaparecer y el toggle debe acumular la seleccion
 * (multi-select via arrays en filters.categoryId / filters.brandId).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PublicCatalogFilters } from '../../components/PublicCatalogFilters'
import type { PublicProductFilters, FilterOption } from '../../types/publicProduct'

const categories: FilterOption[] = [
  { value: '1', label: 'Consumibles', count: 5 },
  { value: '2', label: 'Equipos', count: 5 },
  { value: '3', label: 'Accesorios', count: 4 }
]

const brands: FilterOption[] = [
  { value: '10', label: 'EcoMax', count: 5 },
  { value: '11', label: 'ProLine', count: 5 }
]

const priceRange = { min: 0, max: 50000, step: 100 }

function renderFilters(filters: PublicProductFilters, onFiltersChange = vi.fn()) {
  render(
    <PublicCatalogFilters
      filters={filters}
      sortField="name"
      sortDirection="asc"
      viewMode="grid"
      categories={categories}
      brands={brands}
      units={[]}
      priceRange={priceRange}
      onFiltersChange={onFiltersChange}
      onSortChange={vi.fn()}
      onViewModeChange={vi.fn()}
      onClearFilters={vi.fn()}
    />
  )
  return onFiltersChange
}

describe('PublicCatalogFilters facets', () => {
  it('shows every category option with its count', () => {
    renderFilters({})
    expect(screen.getByText('Consumibles')).toBeInTheDocument()
    expect(screen.getByText('Equipos')).toBeInTheDocument()
    expect(screen.getByText('Accesorios')).toBeInTheDocument()
  })

  it('keeps sibling options visible while a category is selected', () => {
    renderFilters({ categoryId: ['1'] })
    expect(screen.getByText('Consumibles')).toBeInTheDocument()
    expect(screen.getByText('Equipos')).toBeInTheDocument()
    expect(screen.getByText('Accesorios')).toBeInTheDocument()
  })

  it('keeps a selected option visible even when its count drops to 0', () => {
    render(
      <PublicCatalogFilters
        filters={{ categoryId: ['3'] }}
        sortField="name"
        sortDirection="asc"
        viewMode="grid"
        categories={[
          { value: '1', label: 'Consumibles', count: 5 },
          { value: '3', label: 'Accesorios', count: 0 }
        ]}
        brands={brands}
        units={[]}
        priceRange={priceRange}
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onClearFilters={vi.fn()}
      />
    )
    expect(screen.getByText('Accesorios')).toBeInTheDocument()
    expect(screen.getByText('(0)')).toBeInTheDocument()
  })

  it('hides zero-count options that are not selected', () => {
    render(
      <PublicCatalogFilters
        filters={{}}
        sortField="name"
        sortDirection="asc"
        viewMode="grid"
        categories={[
          { value: '1', label: 'Consumibles', count: 5 },
          { value: '3', label: 'Accesorios', count: 0 }
        ]}
        brands={brands}
        units={[]}
        priceRange={priceRange}
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onClearFilters={vi.fn()}
      />
    )
    expect(screen.queryByText('Accesorios')).not.toBeInTheDocument()
  })

  it('accumulates a second category on click (multi-select)', () => {
    const onFiltersChange = renderFilters({ categoryId: ['1'] })
    fireEvent.click(screen.getByText('Equipos'))
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: ['1', '2'] })
    )
  })

  it('accumulates a second brand on click (multi-select)', () => {
    const onFiltersChange = renderFilters({ brandId: ['10'] })
    fireEvent.click(screen.getByText('ProLine'))
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ brandId: ['10', '11'] })
    )
  })

  it('removes a selected option on second click (toggle off)', () => {
    const onFiltersChange = renderFilters({ categoryId: ['1', '2'] })
    fireEvent.click(screen.getByText('Equipos'))
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: ['1'] })
    )
  })
})
