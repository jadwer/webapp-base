/**
 * Attendances Filters Component
 *
 * Filter component for attendance records by employee and date
 */

'use client'

import React, { useCallback } from 'react'
import { Button } from '@/ui/components/base'
import { useEmployees } from '../hooks'
import type { AttendancesFilters as FiltersType, AttendanceStatus } from '../types'

interface AttendancesFiltersProps {
  filters: FiltersType
  onFiltersChange: (filters: FiltersType) => void
}

export const AttendancesFilters: React.FC<AttendancesFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { employees, isLoading: loadingEmployees } = useEmployees()

  const handleEmployeeChange = useCallback((employeeId: string) => {
    onFiltersChange({
      ...filters,
      employeeId: employeeId ? parseInt(employeeId) : undefined,
    })
  }, [filters, onFiltersChange])

  const handleDateFromChange = useCallback((dateFrom: string) => {
    onFiltersChange({
      ...filters,
      dateFrom: dateFrom || undefined,
    })
  }, [filters, onFiltersChange])

  const handleDateToChange = useCallback((dateTo: string) => {
    onFiltersChange({
      ...filters,
      dateTo: dateTo || undefined,
    })
  }, [filters, onFiltersChange])

  const handleStatusChange = useCallback((status: AttendanceStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status || undefined,
    })
  }, [filters, onFiltersChange])

  const handleClearFilters = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof FiltersType] !== undefined && filters[key as keyof FiltersType] !== ''
  )

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body py-3">
        <div className="row g-3">
          {/* Employee Filter */}
          <div className="col-md-3">
            <label className="form-label small">Empleado</label>
            <select
              className="form-select form-select-sm"
              value={filters.employeeId || ''}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={loadingEmployees}
            >
              <option value="">Todos los empleados</option>
              {employees.filter(e => e.status === 'active').map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} - {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="col-md-2">
            <label className="form-label small">Desde</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateFromChange(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="col-md-2">
            <label className="form-label small">Hasta</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateToChange(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="col-md-2">
            <label className="form-label small">Estado</label>
            <select
              className="form-select form-select-sm"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value as AttendanceStatus | '')}
            >
              <option value="">Todos</option>
              <option value="present">Presente</option>
              <option value="absent">Ausente</option>
              <option value="late">Tarde</option>
              <option value="half_day">Medio Día</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="col-md-3">
            <label className="form-label small">&nbsp;</label>
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

export default AttendancesFilters
