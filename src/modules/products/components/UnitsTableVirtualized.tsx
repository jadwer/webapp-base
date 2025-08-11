'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Unit } from '../types'

interface UnitsTableVirtualizedProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unit: Unit) => void
  onDelete?: (unitId: string) => void
  onView?: (unit: Unit) => void
}

const UnitRow = React.memo<{
  unit: Unit
  style: React.CSSProperties
  onEdit?: (unit: Unit) => void
  onDelete?: (unitId: string) => void
  onView?: (unit: Unit) => void
}>(({ unit, style, onEdit, onDelete, onView }) => (
  <div 
    style={style} 
    className="d-flex align-items-center border-bottom bg-white hover-bg-light transition-all"
  >
    {/* Name & Abbreviation */}
    <div className="flex-fill me-3" style={{ minWidth: '200px' }}>
      <div className="fw-bold text-dark mb-1">{unit.name}</div>
      <small className="text-muted">Abrev: {unit.abbreviation}</small>
    </div>

    {/* Description */}
    <div className="flex-fill me-3" style={{ minWidth: '300px' }}>
      <small className="text-muted">productos</small>
    </div>

    {/* Actions */}
    <div className="d-flex gap-1" style={{ width: '140px' }}>
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
          variant="secondary"
          buttonStyle="outline"
          onClick={() => onEdit(unit)}
          title="Editar"
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
          title="Eliminar"
        >
          <i className="bi bi-trash" />
        </Button>
      )}
    </div>
  </div>
))

UnitRow.displayName = 'UnitRow'

export const UnitsTableVirtualized = React.memo<UnitsTableVirtualizedProps>(({ 
  units, 
  isLoading = false,
  onEdit,
  onDelete,
  onView 
}) => {
  console.log('🔄 UnitsTableVirtualized render:', units.length, 'units')

  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: units.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70, // Height per row
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()

  if (isLoading && units.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando unidades...</p>
        </div>
      </div>
    )
  }

  if (units.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-rulers display-1 text-muted mb-3"></i>
          <h5 className="text-muted">No se encontraron unidades</h5>
          <p className="text-muted">Intenta cambiar los filtros de búsqueda o crea una nueva unidad.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header bg-light">
        <div className="d-flex align-items-center">
          <div className="flex-fill me-3" style={{ minWidth: '200px' }}>
            <small className="fw-bold text-uppercase text-muted">Unidad</small>
          </div>
          <div className="flex-fill me-3" style={{ minWidth: '300px' }}>
            <small className="fw-bold text-uppercase text-muted">Descripción</small>
          </div>
          <div className="text-center me-3" style={{ width: '80px' }}>
            <small className="fw-bold text-uppercase text-muted">Uso</small>
          </div>
          <div className="text-center" style={{ width: '140px' }}>
            <small className="fw-bold text-uppercase text-muted">Acciones</small>
          </div>
        </div>
      </div>

      {/* Virtualized Content */}
      <div 
        ref={parentRef}
        style={{
          height: '400px', // Smaller height for auxiliary modules
          overflow: 'auto'
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualItems.map((virtualRow) => {
            const unit = units[virtualRow.index]
            return (
              <UnitRow
                key={unit.id}
                unit={unit}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '12px 16px'
                }}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            )
          })}
        </div>
      </div>

      {/* Footer with count */}
      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {units.length} unidades
          </small>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Tabla virtualizada para máximo rendimiento
          </small>
        </div>
      </div>
    </div>
  )
})

UnitsTableVirtualized.displayName = 'UnitsTableVirtualized'

export default UnitsTableVirtualized