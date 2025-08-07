'use client'

import React, { useState, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
// import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress' // TODO: Use for navigation
import StatusBadge from './StatusBadge'
import type { Page } from '../types/page'

interface PagesTableProps {
  pages: Page[]
  isLoading?: boolean
  onEdit?: (page: Page) => void
  onDelete?: (pageId: string) => Promise<void>
  onDuplicate?: (pageId: string) => Promise<void>
  onViewPage?: (page: Page) => void
}

export const PagesTable: React.FC<PagesTableProps> = ({
  pages,
  isLoading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onViewPage
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  // const navigation = useNavigationProgress() // TODO: Use for navigation

  const setPageLoading = (pageId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [pageId]: loading }))
  }

  const handleDelete = async (page: Page) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Estás seguro de que quieres eliminar la página "${page.title}"? Esta acción no se puede deshacer.`
    )

    if (confirmed) {
      setPageLoading(page.id, true)
      try {
        await onDelete(page.id)
      } finally {
        setPageLoading(page.id, false)
      }
    }
  }

  const handleDuplicate = async (page: Page) => {
    if (!onDuplicate) return
    
    setPageLoading(page.id, true)
    try {
      await onDuplicate(page.id)
    } finally {
      setPageLoading(page.id, false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha inválida'
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return 'Fecha inválida'
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
          <span className="visually-hidden">Cargando páginas...</span>
        </div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-file-earmark-text display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay páginas disponibles</h5>
        <p className="text-muted">Crea tu primera página para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Slug</th>
              <th scope="col">Estado</th>
              <th scope="col">Creado</th>
              <th scope="col">Actualizado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const isPageLoading = loadingStates[page.id] || false
              
              return (
                <tr key={page.id} className={clsx({ 'opacity-50': isPageLoading })}>
                  <td>
                    <div className="fw-medium">{truncateText(page.title)}</div>
                  </td>
                  <td>
                    <code className="small">{truncateText(page.slug, 30)}</code>
                  </td>
                  <td>
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="text-muted small">
                    {formatDate(page.createdAt)}
                  </td>
                  <td className="text-muted small">
                    {formatDate(page.updatedAt)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onViewPage && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver página"
                          onClick={() => onViewPage(page)}
                          disabled={isPageLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar página"
                          onClick={() => onEdit(page)}
                          disabled={isPageLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}
                      
                      {onDuplicate && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Duplicar página"
                          onClick={() => handleDuplicate(page)}
                          disabled={isPageLoading}
                          loading={isPageLoading}
                        >
                          <i className="bi bi-files" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar página"
                          onClick={() => handleDelete(page)}
                          disabled={isPageLoading}
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

export default PagesTable