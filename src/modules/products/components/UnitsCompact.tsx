'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Unit } from '../types'

interface UnitsCompactProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unit: Unit) => void
  onView?: (unit: Unit) => void
  onDelete?: (unitId: string) => void
}

export const UnitsCompact = React.memo<UnitsCompactProps>(({
  units,
  isLoading = false,
  onEdit,
  onView,
  onDelete
}) => {
  console.log('🔄 UnitsCompact render', { unitCount: units.length })

  if (isLoading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <div style={{ height: '400px', overflowY: 'auto' }}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="d-flex align-items-center py-2 border-bottom">
                <div className="placeholder-glow d-flex align-items-center w-100">
                  <div className="placeholder rounded-circle" style={{ width: '32px', height: '32px' }}></div>
                  <div className="ms-3 flex-fill">
                    <div className="placeholder col-4 mb-1"></div>
                    <div className="placeholder col-6"></div>
                  </div>
                  <div className="placeholder col-2"></div>
                  <div className="ms-2">
                    <div className="placeholder col-3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (units.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-3 text-muted mb-3">
            <i className="bi bi-rulers" />
          </div>
          <h5 className="text-muted mb-2">Lista vacía</h5>
          <p className="text-muted small">
            No se encontraron unidades con los filtros actuales
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white border-bottom d-flex align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-rulers text-primary me-2" />
          <h6 className="mb-0">Vista Compacta - {units.length} unidades</h6>
        </div>
        <div className="ms-auto">
          <small className="text-muted">
            <i className="bi bi-lightning-charge text-warning me-1" />
            Optimizada para densidad
          </small>
        </div>
      </div>
      
      <div className="card-body p-0">
        <div style={{ height: '400px', overflowY: 'auto' }}>
          {units.map((unit, index) => (
            <div 
              key={unit.id} 
              className={`d-flex align-items-center py-2 px-3 hover-bg-light transition-all ${
                index < units.length - 1 ? 'border-bottom' : ''
              }`}
              style={{ minHeight: '50px' }}
            >
              {/* Icon */}
              <div className="bg-primary-subtle rounded-circle p-2 me-3">
                <i className="bi bi-rulers text-primary" style={{ fontSize: '0.875rem' }} />
              </div>

              {/* Main Info */}
              <div className="flex-fill min-w-0">
                <div className="d-flex align-items-center">
                  <span className="fw-semibold me-2 text-truncate" title={unit.name}>
                    {unit.name}
                  </span>
                  {unit.symbol && (
                    <code className="bg-light px-2 py-1 rounded me-2 small">
                      {unit.symbol}
                    </code>
                  )}
                </div>
                {unit.unitType && (
                  <small className="text-muted">
                    {unit.unitType}
                  </small>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex gap-1 ms-2">
                {onView && (
                  <Button
                    size="small"
                    variant="primary"
                    buttonStyle="ghost"
                    onClick={() => onView(unit)}
                    className="p-1"
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="small"
                    variant="warning"
                    buttonStyle="ghost"
                    onClick={() => onEdit(unit)}
                    className="p-1"
                    title="Editar"
                  >
                    <i className="bi bi-pencil" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="small"
                    variant="danger"
                    buttonStyle="ghost"
                    onClick={() => onDelete(unit.id)}
                    className="p-1"
                    title="Eliminar"
                  >
                    <i className="bi bi-trash" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card-footer bg-light border-top">
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1" />
            Vista compacta • 50px por item
          </small>
          <small className="text-muted">
            {units.length} {units.length === 1 ? 'unidad' : 'unidades'}
          </small>
        </div>
      </div>
    </div>
  )
})

UnitsCompact.displayName = 'UnitsCompact'