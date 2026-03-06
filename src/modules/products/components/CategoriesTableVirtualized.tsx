'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Category } from '../types'

const COL_WIDTHS = ['50px', '220px', 'auto', '100px', '130px', '140px', '120px'] as const

interface CategoriesTableVirtualizedProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onView?: (category: Category) => void
  onDelete?: (categoryId: string) => void
  onToggleActive?: (category: Category) => void
}

export const CategoriesTableVirtualized = React.memo<CategoriesTableVirtualizedProps>(({
  categories,
  isLoading = false,
  onEdit,
  onView,
  onDelete,
  onToggleActive
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
        <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={w !== 'auto' ? { width: w } : undefined} />)}
          </colgroup>
          <thead className="table-light sticky-top">
            <tr className="text-nowrap">
              <th></th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th className="text-center">Prods</th>
              <th>Estado</th>
              <th>Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>

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
            <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '50px' }} />
                <col style={{ width: '250px' }} />
                <col />
                <col style={{ width: '100px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '120px' }} />
              </colgroup>
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
                        display: 'table',
                        tableLayout: 'fixed',
                      }}
                      className="hover-bg-light transition-all"
                    >
                      <td style={{ width: COL_WIDTHS[0] }}>
                        <div className="bg-primary-subtle rounded-circle p-2 d-inline-flex align-items-center justify-content-center">
                          <i className="bi bi-tag-fill text-primary" />
                        </div>
                      </td>

                      <td style={{ width: COL_WIDTHS[1] }}>
                        <div className="fw-semibold text-truncate">{category.name}</div>
                        {category.slug && (
                          <code className="small text-muted">{category.slug}</code>
                        )}
                      </td>

                      <td>
                        <div className="text-truncate small">
                          {category.description || (
                            <span className="text-muted fst-italic">Sin descripción</span>
                          )}
                        </div>
                      </td>

                      <td style={{ width: COL_WIDTHS[3] }}>
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="badge bg-secondary rounded-pill">
                            {category.productsCount ?? 0}
                          </span>
                        </div>
                      </td>

                      <td style={{ width: COL_WIDTHS[4] }}>
                        <div className="form-check form-switch d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={category.isActive !== false}
                            onChange={() => onToggleActive?.(category)}
                            title={category.isActive !== false ? 'Desactivar categoría' : 'Activar categoría'}
                          />
                          <span className={`badge ${category.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                            {category.isActive !== false ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </td>

                      <td style={{ width: COL_WIDTHS[5] }}>
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

                      <td style={{ width: COL_WIDTHS[6] }}>
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