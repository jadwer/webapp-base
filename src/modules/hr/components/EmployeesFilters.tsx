/**
 * Employees Filters Component
 *
 * Filter component for employees with search and dropdowns
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input, Button } from '@/ui/components/base'
import { useDepartments, usePositions } from '../hooks'
import type { EmployeesFilters as FiltersType, EmployeeStatus } from '../types'

interface EmployeesFiltersProps {
  filters: FiltersType
  onFiltersChange: (filters: FiltersType) => void
}

// Custom debounce hook
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

export const EmployeesFilters: React.FC<EmployeesFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { positions, isLoading: loadingPositions } = usePositions()

  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleStatusChange = useCallback((status: EmployeeStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status || undefined,
    })
  }, [filters, onFiltersChange])

  const handleDepartmentChange = useCallback((departmentId: string) => {
    onFiltersChange({
      ...filters,
      departmentId: departmentId ? parseInt(departmentId) : undefined,
    })
  }, [filters, onFiltersChange])

  const handlePositionChange = useCallback((positionId: string) => {
    onFiltersChange({
      ...filters,
      positionId: positionId ? parseInt(positionId) : undefined,
    })
  }, [filters, onFiltersChange])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    onFiltersChange({})
  }, [onFiltersChange])

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof FiltersType] !== undefined && filters[key as keyof FiltersType] !== ''
  )

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body py-3">
        <div className="row g-3">
          {/* Search */}
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-search me-2 text-muted" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 shadow-none"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value as EmployeeStatus | '')}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="terminated">Terminado</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.departmentId || ''}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              disabled={loadingDepartments}
            >
              <option value="">Todos los departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.positionId || ''}
              onChange={(e) => handlePositionChange(e.target.value)}
              disabled={loadingPositions}
            >
              <option value="">Todos los puestos</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="col-md-2">
            {hasActiveFilters && (
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  {Object.keys(filters).filter((key) => filters[key as keyof FiltersType]).length} filtro(s)
                </small>
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={handleClearFilters}
                >
                  <i className="bi bi-x-circle me-1" />
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeesFilters
