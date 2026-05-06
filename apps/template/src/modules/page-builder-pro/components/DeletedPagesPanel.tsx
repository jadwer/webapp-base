'use client'

import React, { useState } from 'react'
import { Button, DataTable, Modal } from '@/ui/components/base'
import { useDeletedPages, useSoftDeleteActions } from '../hooks/usePages'
import { StatusBadge } from './StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Page, RestorePageOptions } from '../types/page'

interface DeletedPagesPanelProps {
  onPageRestored?: (page: Page) => void
  onPagePermanentlyDeleted?: (pageId: string) => void
}

export const DeletedPagesPanel: React.FC<DeletedPagesPanelProps> = ({
  onPageRestored,
  onPagePermanentlyDeleted,
}) => {
  const { deletedPages, isLoading, error, refreshDeletedPages } = useDeletedPages()
  const { restorePage, permanentlyDeletePage, isLoading: isActionLoading } = useSoftDeleteActions()
  
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false)
  const [restoreOptions, setRestoreOptions] = useState<RestorePageOptions>({})

  const handleRestore = async (page: Page) => {
    setSelectedPage(page)
    setRestoreOptions({
      newSlug: extractOriginalSlug(page.slug),
      newTitle: page.title
    })
    setShowRestoreModal(true)
  }

  const confirmRestore = async () => {
    if (!selectedPage) return
    
    const restoredPage = await restorePage(selectedPage.id, restoreOptions)
    if (restoredPage) {
      setShowRestoreModal(false)
      setSelectedPage(null)
      refreshDeletedPages()
      onPageRestored?.(restoredPage)
    }
  }

  const handlePermanentDelete = (page: Page) => {
    setSelectedPage(page)
    setShowPermanentDeleteModal(true)
  }

  const confirmPermanentDelete = async () => {
    if (!selectedPage) return
    
    const success = await permanentlyDeletePage(selectedPage.id)
    if (success) {
      setShowPermanentDeleteModal(false)
      setSelectedPage(null)
      refreshDeletedPages()
      onPagePermanentlyDeleted?.(selectedPage.id)
    }
  }

  const extractOriginalSlug = (deletedSlug: string): string => {
    const match = deletedSlug.match(/^(.+)-deleted-\d+$/)
    return match ? match[1] : deletedSlug
  }

  const columns = [
    {
      key: 'title',
      title: 'Título',
      render: (_: unknown, page: Page) => (
        <div>
          <div className="fw-medium">{page.title}</div>
          <small className="text-muted">
            Slug original: {extractOriginalSlug(page.slug)}
          </small>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Estado',
      render: (_: unknown, page: Page) => <StatusBadge status={page.status} />,
    },
    {
      key: 'deletedAt',
      title: 'Eliminado',
      render: (_: unknown, page: Page) => (
        <small className="text-muted">
          {formatDistanceToNow(new Date(page.updatedAt), { 
            addSuffix: true, 
            locale: es 
          })}
        </small>
      ),
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_: unknown, page: Page) => (
        <div className="d-flex gap-2">
          <Button
            size="small"
            variant="success"
            buttonStyle="outline"
            onClick={() => handleRestore(page)}
            disabled={isActionLoading}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Restaurar
          </Button>
          <Button
            size="small"
            variant="danger"
            buttonStyle="outline"
            onClick={() => handlePermanentDelete(page)}
            disabled={isActionLoading}
          >
            <i className="bi bi-trash-fill me-1" />
            Eliminar definitivamente
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando páginas eliminadas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        <i className="bi bi-exclamation-triangle me-2" />
        Error al cargar las páginas eliminadas: {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }

  return (
    <div className="deleted-pages-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Páginas Eliminadas</h5>
          <small className="text-muted">
            {deletedPages.length} página{deletedPages.length !== 1 ? 's' : ''} eliminada{deletedPages.length !== 1 ? 's' : ''}
          </small>
        </div>
        <Button
          variant="secondary"
          buttonStyle="outline"
          size="small"
          onClick={refreshDeletedPages}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </Button>
      </div>

      {deletedPages.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-trash display-1" />
            <p className="mt-3">No hay páginas eliminadas</p>
          </div>
        </div>
      ) : (
        <DataTable
          data={deletedPages}
          columns={columns}
          loading={isLoading}
        />
      )}

      {/* Restore Modal */}
      <Modal
        show={showRestoreModal}
        onHide={() => setShowRestoreModal(false)}
        title="Restaurar Página"
        size="medium"
      >
        <div className="modal-body">
          <p>¿Estás seguro de que quieres restaurar la página <strong>{selectedPage?.title}</strong>?</p>
          
          <div className="mb-3">
            <label className="form-label">Nuevo título:</label>
            <input
              type="text"
              className="form-control"
              value={restoreOptions.newTitle || ''}
              onChange={(e) => setRestoreOptions({ ...restoreOptions, newTitle: e.target.value })}
              placeholder="Título de la página restaurada"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Nuevo slug:</label>
            <input
              type="text"
              className="form-control"
              value={restoreOptions.newSlug || ''}
              onChange={(e) => setRestoreOptions({ ...restoreOptions, newSlug: e.target.value })}
              placeholder="slug-de-la-pagina"
            />
            <small className="form-text text-muted">
              Se verificará automáticamente que el slug esté disponible
            </small>
          </div>
          
          <small className="text-muted">
            La página será restaurada como borrador.
          </small>
        </div>
        <div className="modal-footer">
          <Button
            variant="secondary"
            buttonStyle="outline"
            onClick={() => setShowRestoreModal(false)}
            disabled={isActionLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={confirmRestore}
            loading={isActionLoading}
            disabled={isActionLoading}
          >
            Restaurar
          </Button>
        </div>
      </Modal>

      {/* Permanent Delete Modal */}
      <Modal
        show={showPermanentDeleteModal}
        onHide={() => setShowPermanentDeleteModal(false)}
        title="Eliminar Permanentemente"
        size="medium"
      >
        <div className="modal-body">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2" />
            <strong>¡Atención!</strong> Esta acción no se puede deshacer.
          </div>
          <p>
            ¿Estás seguro de que quieres eliminar permanentemente la página{' '}
            <strong>{selectedPage?.title}</strong>?
          </p>
          <p>
            Se perderá toda la información de la página incluyendo su contenido, 
            diseño y configuraciones.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            variant="secondary"
            buttonStyle="outline"
            onClick={() => setShowPermanentDeleteModal(false)}
            disabled={isActionLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmPermanentDelete}
            loading={isActionLoading}
            disabled={isActionLoading}
          >
            Eliminar Permanentemente
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default DeletedPagesPanel