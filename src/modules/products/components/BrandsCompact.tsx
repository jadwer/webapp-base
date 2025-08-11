'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Brand } from '../types'

interface BrandsCompactProps {
  brands: Brand[]
  isLoading?: boolean
  onEdit?: (brand: Brand) => void
  onView?: (brand: Brand) => void
  onDelete?: (brandId: string) => void
}

export const BrandsCompact = React.memo<BrandsCompactProps>(({ brands, isLoading = false, onEdit, onView, onDelete }) => {
  console.log('🔄 BrandsCompact render', { brandCount: brands.length })

  if (isLoading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <div style={{ height: '400px', overflowY: 'auto' }}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="d-flex align-items-center py-2 border-bottom">
                <div className="placeholder-glow d-flex align-items-center w-100">
                  <div className="placeholder rounded-circle" style={{ width: '32px', height: '32px' }}></div>
                  <div className="ms-3 flex-fill"><div className="placeholder col-4 mb-1"></div><div className="placeholder col-6"></div></div>
                  <div className="placeholder col-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-3 text-muted mb-3"><i className="bi bi-award" /></div>
          <h5 className="text-muted mb-2">Lista vacía</h5>
          <p className="text-muted small">No se encontraron marcas con los filtros actuales</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white border-bottom d-flex align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-award text-primary me-2" />
          <h6 className="mb-0">Vista Compacta - {brands.length} marcas</h6>
        </div>
        <div className="ms-auto">
          <small className="text-muted"><i className="bi bi-lightning-charge text-warning me-1" />Optimizada para densidad</small>
        </div>
      </div>
      
      <div className="card-body p-0">
        <div style={{ height: '400px', overflowY: 'auto' }}>
          {brands.map((brand, index) => (
            <div key={brand.id} className={`d-flex align-items-center py-2 px-3 hover-bg-light transition-all ${index < brands.length - 1 ? 'border-bottom' : ''}`} style={{ minHeight: '50px' }}>
              <div className="bg-primary-subtle rounded-circle p-2 me-3">
                <i className="bi bi-award-fill text-primary" style={{ fontSize: '0.875rem' }} />
              </div>

              <div className="flex-fill min-w-0">
                <div className="d-flex align-items-center">
                  <span className="fw-semibold me-2 text-truncate" title={brand.name}>{brand.name}</span>
                  {brand.slug && <code className="bg-light px-2 py-1 rounded me-2 small">{brand.slug}</code>}
                </div>
                {brand.description && <small className="text-muted text-truncate">{brand.description}</small>}
              </div>

              <div className="d-flex gap-1 ms-2">
                {onView && <Button size="small" variant="primary" buttonStyle="ghost" onClick={() => onView(brand)} className="p-1" title="Ver detalles"><i className="bi bi-eye" /></Button>}
                {onEdit && <Button size="small" variant="warning" buttonStyle="ghost" onClick={() => onEdit(brand)} className="p-1" title="Editar"><i className="bi bi-pencil" /></Button>}
                {onDelete && <Button size="small" variant="danger" buttonStyle="ghost" onClick={() => onDelete(brand.id)} className="p-1" title="Eliminar"><i className="bi bi-trash" /></Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card-footer bg-light border-top">
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted"><i className="bi bi-info-circle me-1" />Vista compacta • 50px por item</small>
          <small className="text-muted">{brands.length} {brands.length === 1 ? 'marca' : 'marcas'}</small>
        </div>
      </div>
    </div>
  )
})

BrandsCompact.displayName = 'BrandsCompact'