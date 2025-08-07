'use client'

import React, { useState, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button, DataTable, ConfirmModal } from '@/ui/components/base'
import type { DataTableColumn, ConfirmModalHandle } from '@/ui/components/base'
import StatusBadge from './StatusBadge'
import type { Page } from '../types/page'

interface PagesTableDSProps {
  pages: Page[]
  isLoading?: boolean
  onEdit?: (page: Page) => void
  onDelete?: (pageId: string) => Promise<void>
  onDuplicate?: (pageId: string) => Promise<void>
  onViewPage?: (page: Page) => void
}

export const PagesTableDS: React.FC<PagesTableDSProps> = ({
  pages,
  isLoading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onViewPage
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setPageLoading = (pageId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [pageId]: loading }))
  }

  const handleDelete = async (page: Page) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Estás seguro de que quieres eliminar la página "${page.title}"? Esta acción no se puede deshacer.`,
      {
        title: 'Confirmar eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-trash text-danger" />
      }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    
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

  const columns: DataTableColumn<Page>[] = [
    {
      key: 'title',
      title: 'Título',
      dataIndex: 'title',
      render: (title, record) => (
        <div>
          <div className="fw-medium text-truncate" style={{ maxWidth: '200px' }}>
            {String(title)}
          </div>
          {record.slug && (
            <small className="text-muted d-block">
              /{truncateText(record.slug, 30)}
            </small>
          )}
        </div>
      ),
      width: '25%'
    },
    {
      key: 'status',
      title: 'Estado',
      align: 'center',
      render: (_, record) => (
        <StatusBadge status={record.status} />
      ),
      width: '15%'
    },
    {
      key: 'createdAt',
      title: 'Creada',
      dataIndex: 'createdAt',
      render: (createdAt) => (
        <div className="text-nowrap">
          <div>{formatDate(createdAt as string | null)}</div>
        </div>
      ),
      width: '20%'
    },
    {
      key: 'updatedAt',
      title: 'Actualizada',
      dataIndex: 'updatedAt',
      render: (updatedAt) => (
        <div className="text-nowrap">
          <div>{formatDate(updatedAt as string | null)}</div>
        </div>
      ),
      width: '20%'
    },
    {
      key: 'actions',
      title: 'Acciones',
      align: 'center',
      render: (_, record) => {
        const isPageLoading = loadingStates[record.id]
        
        return (
          <div className="d-flex gap-1 justify-content-center">
            {onViewPage && (
              <Button
                size="small"
                variant="secondary"
                buttonStyle="outline"
                onClick={() => onViewPage(record)}
                title="Ver página"
                disabled={isPageLoading}
                iconOnly
              >
                <i className="bi bi-eye" />
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="small"
                variant="primary"
                buttonStyle="outline"
                onClick={() => onEdit(record)}
                title="Editar página"
                disabled={isPageLoading}
                iconOnly
              >
                <i className="bi bi-pencil" />
              </Button>
            )}
            
            {onDuplicate && (
              <Button
                size="small"
                variant="success"
                buttonStyle="outline"
                onClick={() => handleDuplicate(record)}
                title="Duplicar página"
                disabled={isPageLoading}
                loading={isPageLoading}
                iconOnly
              >
                <i className="bi bi-copy" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="small"
                variant="danger"
                buttonStyle="outline"
                onClick={() => handleDelete(record)}
                title="Eliminar página"
                disabled={isPageLoading}
                iconOnly
              >
                <i className="bi bi-trash" />
              </Button>
            )}
          </div>
        )
      },
      width: '20%'
    }
  ]

  return (
    <>
      <DataTable
        data={pages}
        columns={columns}
        loading={isLoading}
        emptyText={
          <div className="text-center py-4">
            <i className="bi bi-file-text" style={{ fontSize: '3rem', opacity: 0.5 }} />
            <p className="mt-2 mb-0 text-muted">No hay páginas disponibles</p>
            <small className="text-muted">Crea tu primera página para comenzar</small>
          </div>
        }
        loadingText="Cargando páginas..."
        hoverable
        striped
        size="medium"
        rowKey="id"
        className="mb-0"
      />
      
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default PagesTableDS