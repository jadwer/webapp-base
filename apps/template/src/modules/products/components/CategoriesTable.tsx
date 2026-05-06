'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import { formatDate } from '../utils'
import type { Category } from '../types'

interface CategoriesTableProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onDelete?: (categoryId: string) => Promise<void>
  onView?: (category: Category) => void
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setCategoryLoading = (categoryId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [categoryId]: loading }))
  }

  const handleDelete = async (category: Category) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`
    )

    if (confirmed) {
      setCategoryLoading(category.id, true)
      try {
        await onDelete(category.id)
      } finally {
        setCategoryLoading(category.id, false)
      }
    }
  }


  const truncateText = (text: string | null | undefined, maxLength = 50) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando categorías...</span>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-tags display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay categorías disponibles</h5>
        <p className="text-muted">Crea tu primera categoría para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Descripción</th>
              <th scope="col">Slug</th>
              <th scope="col">Creado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isCategoryLoading = loadingStates[category.id] || false
              
              return (
                <tr key={category.id} className={clsx({ 'opacity-50': isCategoryLoading })}>
                  <td>
                    <div className="fw-medium">{category.name}</div>
                  </td>
                  <td>
                    <div className="text-muted">
                      {truncateText(category.description) || 'Sin descripción'}
                    </div>
                  </td>
                  <td>
                    <code className="small">{category.slug}</code>
                  </td>
                  <td className="text-muted small">
                    {formatDate(category.createdAt)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver categoría"
                          onClick={() => onView(category)}
                          disabled={isCategoryLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar categoría"
                          onClick={() => onEdit(category)}
                          disabled={isCategoryLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar categoría"
                          onClick={() => handleDelete(category)}
                          disabled={isCategoryLoading}
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
      
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default CategoriesTable