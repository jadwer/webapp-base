/**
 * FILTER BAR - CONTACTS
 * Componente de filtros simple para contactos
 * Siguiendo patrón exitoso de Inventory FilterBar
 */

'use client'

import React from 'react'
import { Input } from '@/ui/components/base/Input'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
  contactTypeFilter?: string
  onContactTypeFilterChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter = '',
  onStatusFilterChange,
  contactTypeFilter = '',
  onContactTypeFilterChange,
  placeholder = 'Buscar contactos...',
  className = ''
}) => {
  return (
    <div className={`card mb-4 ${className}`}>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          {/* Search */}
          <div className="col-md-4">
            <label htmlFor="search" className="form-label small text-muted">
              <i className="bi bi-search me-1"></i>
              Búsqueda
            </label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              leftIcon="bi-search"
            />
          </div>

          {/* Status Filter */}
          <div className="col-md-2">
            <label htmlFor="status-filter" className="form-label small text-muted">
              <i className="bi bi-flag me-1"></i>
              Estado
            </label>
            <select
              id="status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange?.(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          {/* Contact Type Filter */}
          <div className="col-md-2">
            <label htmlFor="type-filter" className="form-label small text-muted">
              <i className="bi bi-people me-1"></i>
              Tipo
            </label>
            <select
              id="type-filter"
              className="form-select"
              value={contactTypeFilter}
              onChange={(e) => onContactTypeFilterChange?.(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="individual">Persona física</option>
              <option value="company">Empresa</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="col-md-4">
            <label className="form-label small text-muted">
              <i className="bi bi-lightning me-1"></i>
              Filtros rápidos
            </label>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  onSearchChange('')
                  onStatusFilterChange?.('active')
                  onContactTypeFilterChange?.('')
                }}
              >
                <i className="bi bi-person-check me-1"></i>
                Solo activos
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => {
                  onSearchChange('')
                  onStatusFilterChange?.('')
                  onContactTypeFilterChange?.('company')
                }}
              >
                <i className="bi bi-building me-1"></i>
                Solo empresas
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  onSearchChange('')
                  onStatusFilterChange?.('')
                  onContactTypeFilterChange?.('')
                }}
              >
                <i className="bi bi-x-lg me-1"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(searchTerm || statusFilter || contactTypeFilter) && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted d-block mb-2">
              <i className="bi bi-funnel me-1"></i>
              Filtros activos:
            </small>
            <div className="d-flex gap-2 flex-wrap">
              {searchTerm && (
                <span className="badge bg-primary">
                  <i className="bi bi-search me-1"></i>
                  &ldquo;{searchTerm}&rdquo;
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.6em' }}
                    onClick={() => onSearchChange('')}
                    aria-label="Limpiar búsqueda"
                  ></button>
                </span>
              )}
              {statusFilter && (
                <span className="badge bg-info">
                  <i className="bi bi-flag me-1"></i>
                  Estado: {statusFilter === 'active' ? 'Activo' : statusFilter === 'inactive' ? 'Inactivo' : 'Suspendido'}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.6em' }}
                    onClick={() => onStatusFilterChange?.('')}
                    aria-label="Limpiar filtro de estado"
                  ></button>
                </span>
              )}
              {contactTypeFilter && (
                <span className="badge bg-success">
                  <i className="bi bi-people me-1"></i>
                  Tipo: {contactTypeFilter === 'individual' ? 'Persona física' : 'Empresa'}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.6em' }}
                    onClick={() => onContactTypeFilterChange?.('')}
                    aria-label="Limpiar filtro de tipo"
                  ></button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}