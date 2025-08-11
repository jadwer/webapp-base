'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Unit } from '../types'

interface UnitsGridProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unit: Unit) => void
  onView?: (unit: Unit) => void
  onDelete?: (unitId: string) => void
}

export const UnitsGrid = React.memo<UnitsGridProps>(({
  units,
  isLoading = false,
  onEdit,
  onView,
  onDelete
}) => {
  console.log('🔄 UnitsGrid render', { unitCount: units.length })

  if (isLoading) {
    return (
      <div className="row g-3">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="col-lg-3 col-md-4 col-sm-6">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-light rounded-circle p-3 me-3 placeholder-glow">
                    <div className="placeholder col-6"></div>
                  </div>
                  <div className="flex-fill placeholder-glow">
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-6"></div>
                  </div>
                </div>
                <div className="placeholder-glow">
                  <div className="placeholder col-4 mb-2"></div>
                  <div className="placeholder col-6 mb-3"></div>
                  <div className="placeholder col-12"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="display-1 text-muted mb-4">
          <i className="bi bi-rulers" />
        </div>
        <h3 className="text-muted mb-2">No hay unidades</h3>
        <p className="text-muted mb-4">
          No se encontraron unidades con los filtros actuales
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="primary">
            <i className="bi bi-plus-lg me-2" />
            Crear Primera Unidad
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="row g-3"
      style={{ height: '600px', overflowY: 'auto' }}
    >
      {units.map((unit) => (
        <div key={unit.id} className="col-lg-3 col-md-4 col-sm-6">
          <div className="card h-100 shadow-sm border-0 hover-shadow-lg transition-all">
            <div className="card-body d-flex flex-column">
              {/* Header */}
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary-subtle rounded-circle p-3 me-3">
                  <i className="bi bi-rulers text-primary fs-4" />
                </div>
                <div className="flex-fill">
                  <h6 className="fw-bold mb-1 text-truncate" title={unit.name}>
                    {unit.name}
                  </h6>
                </div>
              </div>

              {/* Content */}
              <div className="flex-fill">
                {/* Type */}
                <div className="mb-2">
                  <span className="badge bg-info-subtle text-info border border-info-subtle">
                    <i className="bi bi-tag-fill me-1" />
                    {unit.unitType || 'General'}
                  </span>
                </div>

                {/* Symbol */}
                {unit.symbol && (
                  <div className="mb-2">
                    <small className="text-muted d-block">Símbolo:</small>
                    <div className="fs-4 fw-bold text-primary">
                      {unit.symbol}
                    </div>
                  </div>
                )}

                {/* Description */}
                {unit.description && (
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Descripción:</small>
                    <p className="small mb-0 text-truncate-lines-2" title={unit.description}>
                      {unit.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 mt-auto pt-3 border-top">
                {onView && (
                  <Button
                    size="small"
                    variant="primary"
                    buttonStyle="outline"
                    onClick={() => onView(unit)}
                    className="flex-fill"
                  >
                    <i className="bi bi-eye me-1" />
                    Ver
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="small"
                    variant="warning"
                    buttonStyle="outline"
                    onClick={() => onEdit(unit)}
                    className="flex-fill"
                  >
                    <i className="bi bi-pencil me-1" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="small"
                    variant="danger"
                    buttonStyle="outline"
                    onClick={() => onDelete(unit.id)}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

UnitsGrid.displayName = 'UnitsGrid'