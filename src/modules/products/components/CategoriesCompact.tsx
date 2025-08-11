'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Category } from '../types'

interface CategoriesCompactProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onView?: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

export const CategoriesCompact = React.memo<CategoriesCompactProps>(({ categories, isLoading = false, onEdit, onView, onDelete }) => {
  console.log('🔄 CategoriesCompact render', { categoryCount: categories.length })

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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-3 text-muted mb-3">
            <i className="bi bi-tags" />
          </div>
          <h5 className="text-muted mb-2">Lista vacía</h5>
          <p className="text-muted small">No se encontraron categorías con los filtros actuales</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white border-bottom d-flex align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-tags text-primary me-2" />
          <h6 className="mb-0">Vista Compacta - {categories.length} categorías</h6>
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
          {categories.map((category, index) => (
            <div key={category.id} className={`d-flex align-items-center py-2 px-3 hover-bg-light transition-all ${index < categories.length - 1 ? 'border-bottom' : ''}`} style={{ minHeight: '50px' }}>
              {/* Icon */}
              <div className="bg-primary-subtle rounded-circle p-2 me-3">
                <i className="bi bi-tag-fill text-primary" style={{ fontSize: '0.875rem' }} />
              </div>

              {/* Main Info */}
              <div className="flex-fill min-w-0">
                <div className="d-flex align-items-center">
                  <span className="fw-semibold me-2 text-truncate" title={category.name}>{category.name}</span>
                  {category.slug && (
                    <code className="bg-light px-2 py-1 rounded me-2 small">{category.slug}</code>
                  )}
                </div>
                {category.description && (
                  <small className="text-muted text-truncate">{category.description}</small>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex gap-1 ms-2">
                {onView && (
                  <Button size="small" variant="primary" buttonStyle="ghost" onClick={() => onView(category)} className="p-1" title="Ver detalles">
                    <i className="bi bi-eye" />
                  </Button>
                )}
                {onEdit && (
                  <Button size="small" variant="warning" buttonStyle="ghost" onClick={() => onEdit(category)} className="p-1" title="Editar">
                    <i className="bi bi-pencil" />
                  </Button>
                )}
                {onDelete && (
                  <Button size="small" variant="danger" buttonStyle="ghost" onClick={() => onDelete(category.id)} className="p-1" title="Eliminar">
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
            <i className="bi bi-info-circle me-1" />Vista compacta • 50px por item
          </small>
          <small className="text-muted">{categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}</small>
        </div>
      </div>
    </div>
  )
})

CategoriesCompact.displayName = 'CategoriesCompact'