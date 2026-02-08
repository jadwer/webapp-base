'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Category } from '../types'

interface CategoriesGridProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onView?: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

export const CategoriesGrid = React.memo<CategoriesGridProps>(({
  categories,
  isLoading = false,
  onEdit,
  onView,
  onDelete
}) => {
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
                  <div className="placeholder col-12 mb-2"></div>
                  <div className="placeholder col-8 mb-3"></div>
                  <div className="placeholder col-12"></div>
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
        <h3 className="text-muted mb-2">No hay categorías</h3>
        <p className="text-muted mb-4">
          No se encontraron categorías con los filtros actuales
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="primary">
            <i className="bi bi-plus-lg me-2" />
            Crear Primera Categoría
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
      {categories.map((category) => (
        <div key={category.id} className="col-lg-3 col-md-4 col-sm-6">
          <div className="card h-100 shadow-sm border-0 hover-shadow-lg transition-all">
            <div className="card-body d-flex flex-column">
              {/* Header */}
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary-subtle rounded-circle p-3 me-3">
                  <i className="bi bi-tag-fill text-primary fs-4" />
                </div>
                <div className="flex-fill">
                  <h6 className="fw-bold mb-1 text-truncate" title={category.name}>
                    {category.name}
                  </h6>
                </div>
              </div>

              {/* Slug */}
              {category.slug && (
                <div className="mb-2">
                  <code className="bg-light px-2 py-1 rounded small text-muted">
                    {category.slug}
                  </code>
                </div>
              )}

              {/* Description */}
              <div className="flex-fill">
                {category.description ? (
                  <p className="small mb-0 text-truncate-lines-3" title={category.description}>
                    {category.description}
                  </p>
                ) : (
                  <p className="small mb-0 text-muted fst-italic">
                    Sin descripción disponible
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-3 pt-2 border-top">
                <div className="d-flex align-items-center text-muted small">
                  <i className="bi bi-calendar3 me-2" />
                  <span>
                    {category.createdAt ? 
                      new Intl.DateTimeFormat('es-ES', {
                        dateStyle: 'short'
                      }).format(new Date(category.createdAt))
                      : 'Sin fecha'
                    }
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 mt-3 pt-3 border-top">
                {onView && (
                  <Button
                    size="small"
                    variant="primary"
                    buttonStyle="outline"
                    onClick={() => onView(category)}
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
                    onClick={() => onEdit(category)}
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
                    onClick={() => onDelete(category.id)}
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

CategoriesGrid.displayName = 'CategoriesGrid'