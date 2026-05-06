'use client'

import React from 'react'
import { Button, Input } from '@/ui/components/base'
import type { PageFilters } from '../types/page'

interface PagesFiltersProps {
  filters: PageFilters
  onFiltersChange: (filters: PageFilters) => void
  onClearFilters: () => void
  className?: string
}

export const PagesFilters: React.FC<PagesFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value || undefined })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(':')
    onFiltersChange({ 
      ...filters, 
      sortBy: sortBy as PageFilters['sortBy'],
      sortOrder: sortOrder as PageFilters['sortOrder']
    })
  }

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.sortBy)

  return (
    <div className={className}>
      <div className="row g-3 align-items-end">
        {/* Search */}
        <div className="col-12 col-md-4">
          <Input
            placeholder="Buscar por título o slug..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            leftIcon="bi-search"
          />
        </div>

        {/* Status Filter */}
        <div className="col-6 col-md-3">
          <label className="form-label small fw-medium text-muted">Estado</label>
          <select 
            className="form-select"
            value={filters.status || ''}
            onChange={handleStatusChange}
          >
            <option value="">Todos</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {/* Sort */}
        <div className="col-6 col-md-3">
          <label className="form-label small fw-medium text-muted">Ordenar por</label>
          <select 
            className="form-select"
            value={filters.sortBy ? `${filters.sortBy}:${filters.sortOrder || 'desc'}` : 'created_at:desc'}
            onChange={handleSortChange}
          >
            <option value="created_at:desc">Más recientes</option>
            <option value="created_at:asc">Más antiguos</option>
            <option value="updated_at:desc">Actualizados recientemente</option>
            <option value="title:asc">Título (A-Z)</option>
            <option value="title:desc">Título (Z-A)</option>
          </select>
        </div>

        {/* Actions */}
        <div className="col-12 col-md-2">
          {hasActiveFilters && (
            <Button
              variant="secondary"
              buttonStyle="outline"
              size="small"
              onClick={onClearFilters}
              fullWidth
              startIcon={<i className="bi bi-x-circle" />}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PagesFilters