'use client'

import React from 'react'
import { Input } from '@/ui/components/base'
import type { AuditFilters as AuditFiltersType, AuditEvent } from '../types'
import { EVENT_LABELS, AUDITABLE_TYPE_LABELS } from '../types'

interface AuditFiltersProps {
  filters: AuditFiltersType
  onFilterChange: (filters: AuditFiltersType) => void
  onReset: () => void
}

const EVENT_OPTIONS: { value: AuditEvent | ''; label: string }[] = [
  { value: '', label: 'Todos los eventos' },
  { value: 'created', label: EVENT_LABELS.created },
  { value: 'updated', label: EVENT_LABELS.updated },
  { value: 'deleted', label: EVENT_LABELS.deleted },
  { value: 'login', label: EVENT_LABELS.login },
  { value: 'logout', label: EVENT_LABELS.logout },
  { value: 'login_failed', label: EVENT_LABELS.login_failed },
]

const AUDITABLE_TYPE_OPTIONS = [
  { value: '', label: 'Todos los modulos' },
  ...Object.entries(AUDITABLE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

export default function AuditFilters({
  filters,
  onFilterChange,
  onReset,
}: AuditFiltersProps) {
  const handleChange = (field: keyof AuditFiltersType, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== undefined)

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2" />
            Filtros
          </h6>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onReset}
            >
              <i className="bi bi-x-circle me-1" />
              Limpiar
            </button>
          )}
        </div>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Evento</label>
            <select
              className="form-select"
              value={filters.event || ''}
              onChange={(e) => handleChange('event', e.target.value)}
            >
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Modulo</label>
            <select
              className="form-select"
              value={filters.auditableType || ''}
              onChange={(e) => handleChange('auditableType', e.target.value)}
            >
              {AUDITABLE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <Input
              label="ID de Usuario"
              type="text"
              value={String(filters.causer || '')}
              onChange={(e) => handleChange('causer', e.target.value)}
              placeholder="ID del usuario"
            />
          </div>

          <div className="col-md-3">
            <Input
              label="ID de Registro"
              type="text"
              value={String(filters.auditableId || '')}
              onChange={(e) => handleChange('auditableId', e.target.value)}
              placeholder="ID del registro"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
