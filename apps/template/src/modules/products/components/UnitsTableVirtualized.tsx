'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Unit } from '../types'

const COL_WIDTHS = ['auto', 'auto', '100px', '140px'] as const

interface UnitsTableVirtualizedProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unit: Unit) => void
  onDelete?: (unitId: string) => void
  onView?: (unit: Unit) => void
}

export const UnitsTableVirtualized = React.memo<UnitsTableVirtualizedProps>(({
  units,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: units.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 10,
  })

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
          <p className="text-muted">Intenta cambiar los filtros de busqueda o crea una nueva unidad.</p>
        </div>
      </div>
    )
  }

  const colgroup = (
    <colgroup>
      {COL_WIDTHS.map((w, i) => <col key={i} style={w !== 'auto' ? { width: w } : undefined} />)}
    </colgroup>
  )

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
          {colgroup}
          <thead className="table-light sticky-top">
            <tr className="text-nowrap">
              <th>Unidad</th>
              <th>Descripcion</th>
              <th className="text-center">Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>

        <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }} className="position-relative">
          <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
              {colgroup}
              <tbody>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const unit = units[virtualItem.index]
                  return (
                    <tr
                      key={unit.id}
                      data-index={virtualItem.index}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        display: 'table',
                        tableLayout: 'fixed',
                      }}
                      className="hover-bg-light transition-all"
                    >
                      <td>
                        <div className="fw-bold text-dark">{unit.name}</div>
                        <small className="text-muted">
                          {unit.code ? `Codigo: ${unit.code}` : unit.unitType || 'Sin tipo'}
                        </small>
                      </td>

                      <td>
                        <div className="small text-muted text-truncate">
                          {unit.description || <span className="fst-italic">Sin descripcion</span>}
                        </div>
                      </td>

                      <td style={{ width: COL_WIDTHS[2] }} className="text-center">
                        <span className="badge bg-secondary rounded-pill">
                          {unit.productsCount ?? 0}
                        </span>
                      </td>

                      <td style={{ width: COL_WIDTHS[3] }}>
                        <div className="d-flex gap-1">
                          {onView && (
                            <Button size="small" variant="primary" buttonStyle="ghost" onClick={() => onView(unit)} title="Ver detalles">
                              <i className="bi bi-eye" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button size="small" variant="warning" buttonStyle="ghost" onClick={() => onEdit(unit)} title="Editar">
                              <i className="bi bi-pencil" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button size="small" variant="danger" buttonStyle="ghost" onClick={() => onDelete(unit.id)} title="Eliminar">
                              <i className="bi bi-trash" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {units.length} unidades
          </small>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Tabla virtualizada
          </small>
        </div>
      </div>
    </div>
  )
})

UnitsTableVirtualized.displayName = 'UnitsTableVirtualized'

export default UnitsTableVirtualized