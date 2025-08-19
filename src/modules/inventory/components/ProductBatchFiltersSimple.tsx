/**
 * PRODUCT BATCH FILTERS SIMPLE
 * Filtros específicos para lotes de productos
 * Siguiendo patrón simple y exitoso del módulo inventory
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProductBatchStatus } from '../types'

interface ProductBatchFiltersSimpleProps {
  onFiltersChange: (filters: ProductBatchFiltersState) => void
  className?: string
}

interface ProductBatchFiltersState {
  status?: ProductBatchStatus[]
  expirationDays?: number
  hasLowStock?: boolean
  supplierName?: string
}

export const ProductBatchFiltersSimple = ({
  onFiltersChange,
  className = ""
}: ProductBatchFiltersSimpleProps) => {
  const [filters, setFilters] = useState<ProductBatchFiltersState>({})
  const [isExpanded, setIsExpanded] = useState(false)

  // Notify parent of filter changes
  const notifyFiltersChange = useCallback((newFilters: ProductBatchFiltersState) => {
    onFiltersChange(newFilters)
  }, [onFiltersChange])

  useEffect(() => {
    notifyFiltersChange(filters)
  }, [filters, notifyFiltersChange])

  const handleStatusToggle = (status: ProductBatchStatus) => {
    setFilters(prev => {
      const currentStatuses = prev.status || []
      const isSelected = currentStatuses.includes(status)
      
      const newStatuses = isSelected
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status]
      
      return {
        ...prev,
        status: newStatuses.length > 0 ? newStatuses : undefined
      }
    })
  }

  const handleExpirationChange = (days: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      expirationDays: days
    }))
  }

  const handleSupplierChange = (supplier: string) => {
    setFilters(prev => ({
      ...prev,
      supplierName: supplier.trim() || undefined
    }))
  }

  const clearAllFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  )

  const statusOptions: { value: ProductBatchStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Activo', color: 'success' },
    { value: 'quarantine', label: 'Cuarentena', color: 'warning' },
    { value: 'expired', label: 'Vencido', color: 'danger' },
    { value: 'recalled', label: 'Retirado', color: 'danger' },
    { value: 'consumed', label: 'Consumido', color: 'secondary' }
  ]

  const expirationOptions = [
    { value: 7, label: 'Próximos 7 días' },
    { value: 15, label: 'Próximos 15 días' },
    { value: 30, label: 'Próximos 30 días' },
    { value: 60, label: 'Próximos 60 días' }
  ]

  return (
    <div className={`card mb-4 ${className}`}>
      <div className="card-body py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2" />
            Filtros Avanzados
          </h6>
          <div className="d-flex gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={clearAllFilters}
                title="Limpiar filtros"
              >
                <i className="bi bi-x-circle me-1" />
                Limpiar
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Contraer filtros" : "Expandir filtros"}
            >
              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="row g-3">
            {/* Status Filter */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">Estado</label>
              <div className="d-flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`btn btn-outline-${option.color} btn-sm ${
                      filters.status?.includes(option.value) ? `btn-${option.color}` : ''
                    }`}
                    onClick={() => handleStatusToggle(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiration Filter */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">Vencimiento</label>
              <select
                className="form-select form-select-sm"
                value={filters.expirationDays || ''}
                onChange={(e) => handleExpirationChange(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Todos los vencimientos</option>
                {expirationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="col-md-4">
              <label className="form-label fw-semibold">Proveedor</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nombre del proveedor..."
                value={filters.supplierName || ''}
                onChange={(e) => handleSupplierChange(e.target.value)}
              />
            </div>

            {/* Stock Alert Filter */}
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lowStockFilter"
                  checked={filters.hasLowStock || false}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasLowStock: e.target.checked || undefined
                  }))}
                />
                <label className="form-check-label fw-semibold" htmlFor="lowStockFilter">
                  <i className="bi bi-exclamation-triangle text-warning me-1" />
                  Solo stock bajo (≤25%)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <small className="text-muted fw-semibold me-2">Filtros activos:</small>
              
              {filters.status && filters.status.length > 0 && (
                <span className="badge bg-primary">
                  Estado: {filters.status.length} seleccionado{filters.status.length > 1 ? 's' : ''}
                </span>
              )}
              
              {filters.expirationDays && (
                <span className="badge bg-warning">
                  Vence en {filters.expirationDays} días
                </span>
              )}
              
              {filters.supplierName && (
                <span className="badge bg-info">
                  Proveedor: {filters.supplierName}
                </span>
              )}
              
              {filters.hasLowStock && (
                <span className="badge bg-danger">
                  Stock bajo
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}