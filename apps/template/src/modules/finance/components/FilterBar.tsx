/**
 * FILTER BAR COMPONENT
 * Reusable filter bar for Finance module following inventory pattern
 */

'use client'

import React from 'react'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  statusOptions?: Array<{ value: string; label: string }>
  placeholder?: string
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  statusFilter = '',
  onStatusFilterChange,
  statusOptions = [],
  placeholder = 'Buscar...'
}: FilterBarProps) => {
  return (
    <div className="mb-4 p-4 bg-light rounded">
      <div className="row g-3">
        {/* Search Input */}
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => onSearchChange('')}
                title="Limpiar búsqueda"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        {onStatusFilterChange && statusOptions.length > 0 && (
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters */}
        {(searchTerm || statusFilter) && (
          <div className="col-md-3">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                onSearchChange('')
                if (onStatusFilterChange) onStatusFilterChange('')
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}