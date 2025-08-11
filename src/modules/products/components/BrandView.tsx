'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useBrand } from '../hooks'
// import type { Brand } from '../types' // Unused but may be needed later

interface BrandViewProps {
  brandId: string
  onEdit?: () => void
  onBack?: () => void
}

export const BrandView: React.FC<BrandViewProps> = ({
  brandId,
  onEdit,
  onBack
}) => {
  console.log('🔄 BrandView render', { brandId })
  
  const { brand, error, isLoading } = useBrand(brandId)

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
              <strong>Error al cargar la marca</strong>
              <div className="small mt-1">
                {error.message || 'No se pudo obtener la información de la marca'}
              </div>
            </div>
          </div>
          
          {onBack && (
            <div className="mt-3">
              <Button variant="primary" onClick={onBack}>
                <i className="bi bi-arrow-left me-2" />
                Volver a marcas
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-award" />
          </div>
          <h3 className="text-muted mb-2">Marca no encontrada</h3>
          <p className="text-muted mb-4">La marca que buscas no existe o ha sido eliminada</p>
          
          {onBack && (
            <Button variant="primary" onClick={onBack}>
              <i className="bi bi-arrow-left me-2" />
              Volver a marcas
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        {/* Main Content */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex align-items-center">
              <div className="bg-primary-subtle rounded-circle p-3 me-3">
                <i className="bi bi-award-fill text-primary fs-4" />
              </div>
              <div className="flex-fill">
                <h2 className="h4 mb-0 fw-bold">{brand.name}</h2>
                {brand.slug && (
                  <code className="small text-muted">{brand.slug}</code>
                )}
              </div>
            </div>
          </div>
          
          <div className="card-body">
            {brand.description ? (
              <div className="mb-4">
                <h6 className="fw-semibold mb-2">
                  <i className="bi bi-card-text me-2 text-info" />
                  Descripción
                </h6>
                <p className="text-muted lh-base mb-0">{brand.description}</p>
              </div>
            ) : (
              <div className="alert alert-light d-flex align-items-center mb-4">
                <i className="bi bi-info-circle me-2 text-info" />
                <span className="text-muted">Esta marca no tiene descripción</span>
              </div>
            )}

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
                      {brand.createdAt 
                        ? new Intl.DateTimeFormat('es-ES', { 
                            dateStyle: 'full', 
                            timeStyle: 'short' 
                          }).format(new Date(brand.createdAt))
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
                      {brand.updatedAt 
                        ? new Intl.DateTimeFormat('es-ES', { 
                            dateStyle: 'full', 
                            timeStyle: 'short' 
                          }).format(new Date(brand.updatedAt))
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
                    Editar Marca
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
                    Volver a Marcas
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
                <div className="text-muted"><code>{brand.id}</code></div>
              </div>
              
              <div className="mb-3">
                <strong>Slug:</strong>
                <div className="text-muted">
                  <code>{brand.slug || 'sin-slug'}</code>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>URL Resultante:</strong>
                <div className="text-muted">
                  <code>/products/brand/{brand.slug || brand.id}</code>
                </div>
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
              <div className="text-muted small mb-2">Productos de esta marca</div>
              <div className="display-4 fw-bold text-primary">0</div>
              <div className="text-muted small">Próximamente disponible</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandView