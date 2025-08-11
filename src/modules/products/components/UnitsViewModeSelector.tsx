'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useUnitsUIStore } from '../store/unitsUIStore'

export type ViewMode = 'table' | 'grid' | 'list' | 'compact' | 'showcase'

interface ViewModeOption {
  id: ViewMode
  label: string
  icon: string
  description: string
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  {
    id: 'table',
    label: 'Tabla',
    icon: 'bi-table',
    description: 'Vista en tabla con virtualización'
  },
  {
    id: 'grid',
    label: 'Grilla',
    icon: 'bi-grid-3x3',
    description: 'Vista en cuadrícula con tarjetas'
  },
  {
    id: 'list',
    label: 'Lista',
    icon: 'bi-list-ul',
    description: 'Vista en lista con detalles'
  },
  {
    id: 'compact',
    label: 'Compacto',
    icon: 'bi-list',
    description: 'Vista compacta con información esencial'
  },
  {
    id: 'showcase',
    label: 'Showcase',
    icon: 'bi-images',
    description: 'Vista destacada con imágenes grandes'
  }
]

export const UnitsViewModeSelector = React.memo(() => {
  const { viewMode, setViewMode } = useUnitsUIStore()

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body py-3">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <i className="bi bi-rulers me-2 text-primary" />
              <h6 className="mb-0 fw-bold">Vista de Unidades</h6>
            </div>
          </div>
          <div className="col-auto">
            <div className="btn-group" role="group" aria-label="Modos de vista de unidades">
              {VIEW_MODE_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={viewMode === option.id ? 'primary' : 'secondary'}
                  buttonStyle={viewMode === option.id ? 'solid' : 'outline'}
                  size="small"
                  onClick={() => setViewMode(option.id)}
                  title={option.description}
                  className="position-relative"
                >
                  <i className={`bi ${option.icon} me-1`} />
                  {option.label}
                  {viewMode === option.id && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
                      <span className="visually-hidden">Modo actual</span>
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Current mode description */}
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1" />
            {VIEW_MODE_OPTIONS.find(opt => opt.id === viewMode)?.description}
          </small>
        </div>
      </div>
    </div>
  )
})

UnitsViewModeSelector.displayName = 'UnitsViewModeSelector'

export default UnitsViewModeSelector