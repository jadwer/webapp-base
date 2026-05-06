'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import { formatDate } from '../utils'
import type { Unit } from '../types'

interface UnitsTableProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unit: Unit) => void
  onDelete?: (unitId: string) => Promise<void>
  onView?: (unit: Unit) => void
}

export const UnitsTable: React.FC<UnitsTableProps> = ({
  units,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setUnitLoading = (unitId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [unitId]: loading }))
  }

  const handleDelete = async (unit: Unit) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Estás seguro de que quieres eliminar la unidad "${unit.name}"? Esta acción no se puede deshacer.`
    )

    if (confirmed) {
      setUnitLoading(unit.id, true)
      try {
        await onDelete(unit.id)
      } finally {
        setUnitLoading(unit.id, false)
      }
    }
  }


  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando unidades...</span>
        </div>
      </div>
    )
  }

  if (units.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-rulers display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay unidades disponibles</h5>
        <p className="text-muted">Crea tu primera unidad de medida para comenzar</p>
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
              <th scope="col">Código</th>
              <th scope="col">Tipo</th>
              <th scope="col">Creado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => {
              const isUnitLoading = loadingStates[unit.id] || false
              
              return (
                <tr key={unit.id} className={clsx({ 'opacity-50': isUnitLoading })}>
                  <td>
                    <div className="fw-medium">{unit.name}</div>
                  </td>
                  <td>
                    <code className="small">{unit.code}</code>
                  </td>
                  <td>
                    <span className="badge bg-info text-dark">{unit.unitType}</span>
                  </td>
                  <td className="text-muted small">
                    {formatDate(unit.createdAt)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver unidad"
                          onClick={() => onView(unit)}
                          disabled={isUnitLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar unidad"
                          onClick={() => onEdit(unit)}
                          disabled={isUnitLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar unidad"
                          onClick={() => handleDelete(unit)}
                          disabled={isUnitLoading}
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

export default UnitsTable