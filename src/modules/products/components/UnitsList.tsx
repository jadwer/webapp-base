'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Unit } from '../types'

interface UnitsListProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unit: Unit) => void
  onView?: (unit: Unit) => void
  onDelete?: (unitId: string) => void
}

export const UnitsList = React.memo<UnitsListProps>(({
  units,
  isLoading = false,
  onEdit,
  onView,
  onDelete
}) => {
  // console.log('🔄 UnitsList render', { unitCount: units.length })

  if (isLoading) {
    return (
      <div style={{ height: '600px', overflowY: 'auto' }}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="card shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex align-items-start">
                <div className="placeholder-glow me-3">
                  <div className="placeholder rounded" style={{ width: '80px', height: '80px' }}></div>
                </div>
                <div className="flex-fill placeholder-glow">
                  <div className="placeholder col-6 mb-2"></div>
                  <div className="placeholder col-4 mb-2"></div>
                  <div className="placeholder col-8 mb-2"></div>
                  <div className="placeholder col-5"></div>
                </div>
                <div className="placeholder-glow">
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
        <h3 className="text-muted mb-2">Sin resultados</h3>
        <p className="text-muted mb-4">
          No se encontraron unidades que coincidan con los filtros aplicados
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" buttonStyle="outline">
            <i className="bi bi-funnel me-2" />
            Limpiar Filtros
          </Button>
          <Button variant="primary">
            <i className="bi bi-plus-lg me-2" />
            Nueva Unidad
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      style={{ height: '600px', overflowY: 'auto' }}
      className="pe-2"
    >
      {units.map((unit) => (
        <div key={unit.id} className="card shadow-sm mb-3 hover-shadow-lg transition-all">
          <div className="card-body">
            <div className="d-flex align-items-start">
              {/* Icon/Image Section */}
              <div className="me-3 flex-shrink-0">
                <div 
                  className="bg-primary-subtle rounded d-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px' }}
                >
                  <i className="bi bi-rulers text-primary" style={{ fontSize: '2rem' }} />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-fill min-w-0">
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">
                      {unit.name}
                      {unit.code && (
                        <code className="ms-2 bg-light px-2 py-1 rounded small">
                          {unit.code}
                        </code>
                      )}
                    </h5>
                    <div className="d-flex align-items-center gap-2">
                      {unit.unitType && (
                        <span className="badge bg-info-subtle text-info border border-info-subtle">
                          <i className="bi bi-tag-fill me-1" />
                          {unit.unitType}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="d-flex gap-1 ms-3">
                    {onView && (
                      <Button
                        size="small"
                        variant="primary"
                        buttonStyle="outline"
                        onClick={() => onView(unit)}
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        size="small"
                        variant="warning"
                        buttonStyle="outline"
                        onClick={() => onEdit(unit)}
                        title="Editar unidad"
                      >
                        <i className="bi bi-pencil" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="small"
                        variant="danger"
                        buttonStyle="outline"
                        onClick={() => onDelete(unit.id)}
                        title="Eliminar unidad"
                      >
                        <i className="bi bi-trash" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description & Products Count */}
                <div className="mb-3">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <div className="small text-muted">
                        {unit.description || <span className="fst-italic">Sin descripción</span>}
                      </div>
                    </div>
                    <div className="col-md-4 text-end">
                      <span className="badge bg-secondary rounded-pill">
                        <i className="bi bi-box-seam me-1" />
                        {unit.productsCount ?? 0} productos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="row g-3 text-muted small">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar3 me-2 text-info" />
                      <span>
                        Creado: {unit.createdAt ? 
                          new Intl.DateTimeFormat('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          }).format(new Date(unit.createdAt))
                          : 'Sin fecha'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-pencil-square me-2 text-warning" />
                      <span>
                        Modificado: {unit.updatedAt ? 
                          new Intl.DateTimeFormat('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          }).format(new Date(unit.updatedAt))
                          : 'Sin fecha'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

UnitsList.displayName = 'UnitsList'