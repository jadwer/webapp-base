'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { Category } from '../types'

interface CategoriesShowcaseProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onView?: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

export const CategoriesShowcase = React.memo<CategoriesShowcaseProps>(({ categories, isLoading = false, onEdit, onView, onDelete }) => {
  if (isLoading) {
    return (
      <div className="row g-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="col-lg-6">
            <div className="card h-100 shadow">
              <div className="placeholder-glow">
                <div className="placeholder" style={{ height: '400px' }}></div>
              </div>
              <div className="card-body placeholder-glow">
                <div className="placeholder col-6 mb-2"></div>
                <div className="placeholder col-8 mb-3"></div>
                <div className="placeholder col-12 mb-2"></div>
                <div className="placeholder col-10"></div>
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
        <div className="bg-primary-subtle rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
          <i className="bi bi-tags text-primary" style={{ fontSize: '3rem' }} />
        </div>
        <h2 className="text-muted mb-3">Showcase Vacío</h2>
        <p className="text-muted mb-4 lead">No hay categorías para mostrar en vista premium</p>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="secondary" buttonStyle="outline" size="large"><i className="bi bi-funnel me-2" />Ajustar Filtros</Button>
          <Button variant="primary" size="large"><i className="bi bi-plus-lg me-2" />Crear Nueva Categoría</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '600px', overflowY: 'auto' }} className="pe-2">
      <div className="row g-4">
        {categories.map((category) => (
          <div key={category.id} className="col-lg-6">
            <div className="card h-100 shadow-lg border-0 hover-transform-scale transition-all">
              {/* Hero Image/Icon Section */}
              <div className="card-img-top bg-gradient position-relative overflow-hidden" style={{ height: '400px' }}>
                {/* Background Pattern */}
                <div className="position-absolute inset-0 bg-primary opacity-10"></div>
                <div className="position-absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                
                {/* Main Icon */}
                <div className="position-absolute inset-0 d-flex align-items-center justify-content-center">
                  <div className="bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                    <i className="bi bi-tag-fill text-primary" style={{ fontSize: '3rem' }} />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="position-absolute top-0 end-0 m-3">
                </div>

                {/* Slug Badge */}
                {category.slug && (
                  <div className="position-absolute top-0 start-0 m-3">
                    <div className="bg-white bg-opacity-90 rounded px-3 py-2 shadow">
                      <code className="fw-bold text-primary">{category.slug}</code>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-body d-flex flex-column">
                {/* Header */}
                <div className="mb-3">
                  <h4 className="fw-bold mb-2">{category.name}</h4>
                </div>

                {/* Description */}
                <div className="flex-fill mb-4">
                  {category.description ? (
                    <p className="text-muted lh-base">{category.description}</p>
                  ) : (
                    <p className="text-muted fst-italic">Sin descripción disponible</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="mb-4">
                  <div className="row g-3 small">
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-calendar3 me-2 text-info" />
                        <div>
                          <div className="fw-semibold">Creado</div>
                          <div>{category.createdAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(category.createdAt)) : 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-pencil-square me-2 text-warning" />
                        <div>
                          <div className="fw-semibold">Modificado</div>
                          <div>{category.updatedAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(category.updatedAt)) : 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-grid gap-2">
                  <div className="row g-2">
                    {onView && (
                      <div className="col">
                        <Button variant="primary" onClick={() => onView(category)} className="w-100" size="large">
                          <i className="bi bi-eye me-2" />Ver Detalles
                        </Button>
                      </div>
                    )}
                    {onEdit && (
                      <div className="col">
                        <Button variant="warning" onClick={() => onEdit(category)} className="w-100" size="large">
                          <i className="bi bi-pencil me-2" />Editar
                        </Button>
                      </div>
                    )}
                  </div>
                  {onDelete && (
                    <Button variant="danger" buttonStyle="outline" onClick={() => onDelete(category.id)} size="small">
                      <i className="bi bi-trash me-2" />Eliminar Categoría
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

CategoriesShowcase.displayName = 'CategoriesShowcase'