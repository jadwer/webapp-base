'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Category } from '../types'

interface CategoriesListProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onView?: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

export const CategoriesList = React.memo<CategoriesListProps>(({ categories, isLoading = false, onEdit, onView, onDelete }) => {
  // console.log('🔄 CategoriesList render', { categoryCount: categories.length })

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
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="display-1 text-muted mb-4">
          <i className="bi bi-tags" />
        </div>
        <h3 className="text-muted mb-2">Sin resultados</h3>
        <p className="text-muted mb-4">No se encontraron categorías que coincidan con los filtros aplicados</p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" buttonStyle="outline"><i className="bi bi-funnel me-2" />Limpiar Filtros</Button>
          <Button variant="primary"><i className="bi bi-plus-lg me-2" />Nueva Categoría</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '600px', overflowY: 'auto' }} className="pe-2">
      {categories.map((category) => (
        <div key={category.id} className="card shadow-sm mb-3 hover-shadow-lg transition-all">
          <div className="card-body">
            <div className="d-flex align-items-start">
              {/* Icon/Image Section */}
              <div className="me-3 flex-shrink-0">
                <div className="bg-primary-subtle rounded d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-tag-fill text-primary" style={{ fontSize: '2rem' }} />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-fill min-w-0">
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">{category.name}
                      {category.slug && (<code className="ms-2 bg-light px-2 py-1 rounded small">{category.slug}</code>)}
                    </h5>
                    <div className="d-flex align-items-center gap-2">
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="d-flex gap-1 ms-3">
                    {onView && <Button size="small" variant="primary" buttonStyle="outline" onClick={() => onView(category)} title="Ver detalles"><i className="bi bi-eye" /></Button>}
                    {onEdit && <Button size="small" variant="warning" buttonStyle="outline" onClick={() => onEdit(category)} title="Editar categoría"><i className="bi bi-pencil" /></Button>}
                    {onDelete && <Button size="small" variant="danger" buttonStyle="outline" onClick={() => onDelete(category.id)} title="Eliminar categoría"><i className="bi bi-trash" /></Button>}
                  </div>
                </div>

                {/* Description */}
                {category.description && (
                  <div className="mb-3">
                    <p className="text-muted mb-0 small lh-sm">{category.description}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="row g-3 text-muted small">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar3 me-2 text-info" />
                      <span>Creado: {category.createdAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(category.createdAt)) : 'Sin fecha'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-pencil-square me-2 text-warning" />
                      <span>Modificado: {category.updatedAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(category.updatedAt)) : 'Sin fecha'}</span>
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

CategoriesList.displayName = 'CategoriesList'