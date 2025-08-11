'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useUnit } from '../hooks'
// import type { Unit } from '../types' // Unused but may be needed later

interface UnitViewProps {
  unitId: string
  onEdit?: () => void
  onBack?: () => void
}

export const UnitView: React.FC<UnitViewProps> = ({
  unitId,
  onEdit,
  onBack
}) => {
  console.log('🔄 UnitView render', { unitId })
  
  const { unit, error, isLoading } = useUnit(unitId)

  if (isLoading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="placeholder-glow">
            <div className="placeholder col-4 mb-3" style={{ height: '2rem' }}></div>
            <div className="placeholder col-12 mb-2"></div>
            <div className="placeholder col-8 mb-2"></div>
            <div className="placeholder col-6 mb-4"></div>
            <div className="placeholder col-5" style={{ height: '3rem' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="alert alert-danger d-flex align-items-start">
            <i className="bi bi-exclamation-triangle-fill me-2 mt-1" />
            <div>
              <strong>Error al cargar la unidad</strong>
              <div className="small mt-1">
                {error.message || 'No se pudo obtener la información de la unidad'}
              </div>
            </div>
          </div>
          
          {onBack && (
            <div className="mt-3">
              <Button variant="primary" onClick={onBack}>
                <i className="bi bi-arrow-left me-2" />
                Volver a unidades
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-rulers" />
          </div>
          <h3 className="text-muted mb-2">Unidad no encontrada</h3>
          <p className="text-muted mb-4">La unidad que buscas no existe o ha sido eliminada</p>
          
          {onBack && (
            <Button variant="primary" onClick={onBack}>
              <i className="bi bi-arrow-left me-2" />
              Volver a unidades
            </Button>
          )}
        </div>
      </div>
    )
  }

  const getUnitTypeLabel = (unitType: string): string => {
    const types: Record<string, string> = {
      peso: 'Peso',
      longitud: 'Longitud',
      volumen: 'Volumen',
      cantidad: 'Cantidad',
      tiempo: 'Tiempo',
      area: 'Área',
      otro: 'Otro'
    }
    return types[unitType] || unitType
  }

  const getUnitTypeIcon = (unitType: string): string => {
    const icons: Record<string, string> = {
      peso: 'bi-scaless',
      longitud: 'bi-rulers',
      volumen: 'bi-droplet',
      cantidad: 'bi-123',
      tiempo: 'bi-clock',
      area: 'bi-square',
      otro: 'bi-question-circle'
    }
    return icons[unitType] || 'bi-rulers'
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        {/* Main Content */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex align-items-center">
              <div className="bg-primary-subtle rounded-circle p-3 me-3">
                <i className={`${getUnitTypeIcon(unit.unitType)} text-primary fs-4`} />
              </div>
              <div className="flex-fill">
                <h2 className="h4 mb-0 fw-bold">{unit.name}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <code className="bg-light px-2 py-1 rounded">{unit.code}</code>
                  <span className="badge bg-primary-subtle text-primary">
                    {getUnitTypeLabel(unit.unitType)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-body">
            {/* Unit Details */}
            <div className="row g-4 mb-4">
              <div className="col-sm-4">
                <div className="d-flex align-items-center">
                  <div className="bg-info-subtle rounded p-2 me-3">
                    <i className="bi bi-code-slash text-info" />
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">CÓDIGO</div>
                    <div className="fw-bold">{unit.code}</div>
                  </div>
                </div>
              </div>
              
              <div className="col-sm-4">
                <div className="d-flex align-items-center">
                  <div className="bg-success-subtle rounded p-2 me-3">
                    <i className={`${getUnitTypeIcon(unit.unitType)} text-success`} />
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">TIPO</div>
                    <div className="fw-bold">{getUnitTypeLabel(unit.unitType)}</div>
                  </div>
                </div>
              </div>
              
              <div className="col-sm-4">
                <div className="d-flex align-items-center">
                  <div className="bg-warning-subtle rounded p-2 me-3">
                    <i className="bi bi-tag text-warning" />
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">NOMBRE</div>
                    <div className="fw-bold">{unit.name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className="alert alert-info mb-4">
              <div className="d-flex align-items-start">
                <i className="bi bi-lightbulb me-2 mt-1 text-info" />
                <div>
                  <strong>Ejemplos de uso:</strong>
                  <div className="mt-1">
                    Esta unidad se puede usar para medir productos como: 
                    {unit.unitType === 'peso' && ' productos alimenticios, materiales de construcción, productos químicos'}
                    {unit.unitType === 'longitud' && ' cables, tubos, telas, materiales lineales'}
                    {unit.unitType === 'volumen' && ' líquidos, gases, contenedores'}
                    {unit.unitType === 'cantidad' && ' productos individuales, artículos unitarios'}
                    {unit.unitType === 'tiempo' && ' servicios por tiempo, suscripciones'}
                    {unit.unitType === 'area' && ' superficies, terrenos, materiales planos'}
                    {(unit.unitType === 'otro' || !['peso', 'longitud', 'volumen', 'cantidad', 'tiempo', 'area'].includes(unit.unitType)) && ' productos diversos según su naturaleza'}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="row g-4">
              <div className="col-sm-6">
                <div className="d-flex align-items-center">
                  <div className="bg-info-subtle rounded p-2 me-3">
                    <i className="bi bi-calendar3 text-info" />
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">FECHA DE CREACIÓN</div>
                    <div>
                      {unit.createdAt 
                        ? new Intl.DateTimeFormat('es-ES', { 
                            dateStyle: 'full', 
                            timeStyle: 'short' 
                          }).format(new Date(unit.createdAt))
                        : 'Sin información'
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-sm-6">
                <div className="d-flex align-items-center">
                  <div className="bg-warning-subtle rounded p-2 me-3">
                    <i className="bi bi-pencil-square text-warning" />
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">ÚLTIMA MODIFICACIÓN</div>
                    <div>
                      {unit.updatedAt 
                        ? new Intl.DateTimeFormat('es-ES', { 
                            dateStyle: 'full', 
                            timeStyle: 'short' 
                          }).format(new Date(unit.updatedAt))
                        : 'Sin información'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-top">
              <div className="d-flex gap-2">
                {onEdit && (
                  <Button
                    variant="warning"
                    onClick={onEdit}
                    size="large"
                  >
                    <i className="bi bi-pencil me-2" />
                    Editar Unidad
                  </Button>
                )}
                
                {onBack && (
                  <Button
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={onBack}
                    size="large"
                  >
                    <i className="bi bi-arrow-left me-2" />
                    Volver a Unidades
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-lg-4">
        {/* Sidebar Info */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2" />
              Información Técnica
            </h6>
          </div>
          <div className="card-body">
            <div className="small">
              <div className="mb-3">
                <strong>ID:</strong>
                <div className="text-muted"><code>{unit.id}</code></div>
              </div>
              
              <div className="mb-3">
                <strong>Código único:</strong>
                <div className="text-muted">
                  <code>{unit.code}</code>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Clasificación:</strong>
                <div className="text-muted">{getUnitTypeLabel(unit.unitType)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mt-3">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-graph-up-arrow me-2" />
              Estadísticas
            </h6>
          </div>
          <div className="card-body">
            <div className="text-center">
              <div className="text-muted small mb-2">Productos con esta unidad</div>
              <div className="display-4 fw-bold text-primary">0</div>
              <div className="text-muted small">Próximamente disponible</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnitView