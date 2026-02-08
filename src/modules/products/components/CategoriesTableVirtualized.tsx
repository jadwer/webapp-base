'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Category } from '../types'

interface CategoriesTableVirtualizedProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onView?: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

export const CategoriesTableVirtualized = React.memo<CategoriesTableVirtualizedProps>(({
  categories,
  isLoading = false,
  onEdit,
  onView,
  onDelete
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: categories.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  })

  if (isLoading) {
    return (
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th style={{ width: '50px' }}>
                  <div className="placeholder-glow">
                    <div className="placeholder col-6"></div>
                  </div>
                </th>
                <th style={{ width: '300px' }}>
                  <div className="placeholder-glow">
                    <div className="placeholder col-4"></div>
                  </div>
                </th>
                <th>
                  <div className="placeholder-glow">
                    <div className="placeholder col-6"></div>
                  </div>
                </th>
                <th style={{ width: '120px' }}>
                  <div className="placeholder-glow">
                    <div className="placeholder col-5"></div>
                  </div>
                </th>
                <th style={{ width: '180px' }}>
                  <div className="placeholder-glow">
                    <div className="placeholder col-7"></div>
                  </div>
                </th>
                <th style={{ width: '150px' }}>
                  <div className="placeholder-glow">
                    <div className="placeholder col-6"></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="placeholder-glow">
                      <div className="placeholder rounded-circle" style={{ width: '32px', height: '32px' }}></div>
                    </div>
                  </td>
                  <td>
                    <div className="placeholder-glow">
                      <div className="placeholder col-8 mb-1"></div>
                      <div className="placeholder col-6"></div>
                    </div>
                  </td>
                  <td>
                    <div className="placeholder-glow">
                      <div className="placeholder col-12 mb-1"></div>
                      <div className="placeholder col-8"></div>
                    </div>
                  </td>
                  <td>
                    <div className="placeholder-glow">
                      <div className="placeholder col-5"></div>
                    </div>
                  </td>
                  <td>
                    <div className="placeholder-glow">
                      <div className="placeholder col-9"></div>
                    </div>
                  </td>
                  <td>
                    <div className="placeholder-glow">
                      <div className="placeholder col-12"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-tags" />
          </div>
          <h3 className="text-muted mb-2">Sin categorías</h3>
          <p className="text-muted mb-4">
            No se encontraron categorías con los filtros aplicados
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="secondary" buttonStyle="outline">
              <i className="bi bi-funnel me-2" />
              Limpiar Filtros
            </Button>
            <Button variant="primary">
              <i className="bi bi-plus-lg me-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bi bi-tags text-primary me-2" />
          <h6 className="mb-0">Tabla de Categorías Virtualizada</h6>
        </div>
        <div className="d-flex align-items-center text-muted small">
          <i className="bi bi-lightning-charge text-warning me-1" />
          <span>Renderizando {virtualizer.getVirtualItems().length} de {categories.length} filas</span>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th style={{ width: '50px' }}></th>
              <th style={{ width: '300px' }}>Categoría</th>
              <th>Descripción</th>
              <th style={{ width: '100px' }}>Productos</th>
              <th style={{ width: '120px' }}>Estado</th>
              <th style={{ width: '180px' }}>Fecha Creación</th>
              <th style={{ width: '150px' }}>Acciones</th>
            </tr>
          </thead>
        </table>
        
        {/* Virtualized Table Body */}
        <div
          ref={parentRef}
          style={{ height: '600px', overflow: 'auto' }}
          className="position-relative"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <table className="table table-hover mb-0">
              <tbody>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const category = categories[virtualItem.index]
                  
                  return (
                    <tr
                      key={category.id}
                      data-index={virtualItem.index}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                      }}
                      className="hover-bg-light transition-all"
                    >
                      {/* Icon */}
                      <td style={{ width: '50px' }}>
                        <div className="bg-primary-subtle rounded-circle p-2 d-inline-flex align-items-center justify-content-center">
                          <i className="bi bi-tag-fill text-primary" />
                        </div>
                      </td>
                      
                      {/* Name */}
                      <td style={{ width: '300px' }}>
                        <div className="fw-semibold">{category.name}</div>
                        {category.slug && (
                          <code className="small text-muted">{category.slug}</code>
                        )}
                      </td>
                      
                      {/* Description */}
                      <td>
                        <div className="text-truncate-lines-2 small">
                          {category.description || (
                            <span className="text-muted fst-italic">Sin descripción</span>
                          )}
                        </div>
                      </td>
                      
                      {/* Products Count */}
                      <td style={{ width: '100px' }}>
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="badge bg-secondary rounded-pill">
                            {category.productsCount ?? 0}
                          </span>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td style={{ width: '120px' }}>
                      </td>
                      
                      {/* Created At */}
                      <td style={{ width: '180px' }}>
                        <div className="small text-muted">
                          {category.createdAt ? 
                            new Intl.DateTimeFormat('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            }).format(new Date(category.createdAt))
                            : 'Sin fecha'
                          }
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td style={{ width: '150px' }}>
                        <div className="d-flex gap-1">
                          {onView && (
                            <Button
                              size="small"
                              variant="primary"
                              buttonStyle="ghost"
                              onClick={() => onView(category)}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="small"
                              variant="warning"
                              buttonStyle="ghost"
                              onClick={() => onEdit(category)}
                              title="Editar categoría"
                            >
                              <i className="bi bi-pencil" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="small"
                              variant="danger"
                              buttonStyle="ghost"
                              onClick={() => onDelete(category.id)}
                              title="Eliminar categoría"
                            >
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
      
      <div className="card-footer bg-light d-flex align-items-center justify-content-between">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1" />
          Tabla virtualizada • {categories.length} categorías • Performance optimizado
        </small>
        <small className="text-muted">
          <i className="bi bi-lightning-charge text-warning me-1" />
          TanStack Virtual
        </small>
      </div>
    </div>
  )
})

CategoriesTableVirtualized.displayName = 'CategoriesTableVirtualized'