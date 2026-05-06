'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import { formatDate } from '../utils'
import type { Brand } from '../types'

interface BrandsTableProps {
  brands: Brand[]
  isLoading?: boolean
  onEdit?: (brand: Brand) => void
  onDelete?: (brandId: string) => Promise<void>
  onView?: (brand: Brand) => void
}

export const BrandsTable: React.FC<BrandsTableProps> = ({
  brands,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setBrandLoading = (brandId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [brandId]: loading }))
  }

  const handleDelete = async (brand: Brand) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Estás seguro de que quieres eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`
    )

    if (confirmed) {
      setBrandLoading(brand.id, true)
      try {
        await onDelete(brand.id)
      } finally {
        setBrandLoading(brand.id, false)
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
          <span className="visually-hidden">Cargando marcas...</span>
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-award display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay marcas disponibles</h5>
        <p className="text-muted">Crea tu primera marca para comenzar</p>
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
            {brands.map((brand) => {
              const isBrandLoading = loadingStates[brand.id] || false
              
              return (
                <tr key={brand.id} className={clsx({ 'opacity-50': isBrandLoading })}>
                  <td>
                    <div className="fw-medium">{brand.name}</div>
                  </td>
                  <td>
                    <div className="text-muted">
                      {truncateText(brand.description) || 'Sin descripción'}
                    </div>
                  </td>
                  <td>
                    <code className="small">{brand.slug}</code>
                  </td>
                  <td className="text-muted small">
                    {formatDate(brand.createdAt)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver marca"
                          onClick={() => onView(brand)}
                          disabled={isBrandLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar marca"
                          onClick={() => onEdit(brand)}
                          disabled={isBrandLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar marca"
                          onClick={() => handleDelete(brand)}
                          disabled={isBrandLoading}
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

export default BrandsTable