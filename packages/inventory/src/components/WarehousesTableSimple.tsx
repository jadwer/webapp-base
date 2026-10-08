/**
 * WAREHOUSES TABLE SIMPLE
 * Tabla de almacenes con el patron de listados (thead oscuro, badges en espanol,
 * columna Sucursal solo con mas de una sucursal).
 */

'use client'

import Link from 'next/link'
import { EmptyState, RowActions, StatusBadge } from '@lwm/ui'
import { useBranchName } from '@lwm/auth'
import { WAREHOUSE_TYPE } from '../utils/labels'
import type { WarehouseParsed } from '../types'

interface WarehousesTableSimpleProps {
  warehouses?: WarehouseParsed[]
  isLoading: boolean
  onDelete: (warehouse: WarehouseParsed) => void
}

export const WarehousesTableSimple = ({
  warehouses = [],
  isLoading,
  onDelete,
}: WarehousesTableSimpleProps) => {
  const branchName = useBranchName()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando almacenes...</span>
        </div>
      </div>
    )
  }

  if (warehouses.length === 0) {
    return (
      <EmptyState
        title="No hay almacenes"
        description="No se encontraron almacenes con los filtros actuales."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            {branchName.multi && <th>Sucursal</th>}
            <th>Estado</th>
            <th style={{ width: '140px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id}>
              <td>
                <code>{warehouse.code || '-'}</code>
              </td>
              <td>
                <Link
                  href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                  className="fw-semibold text-decoration-none"
                >
                  {warehouse.name}
                </Link>
                {warehouse.city && (
                  <div>
                    <small className="text-muted">{warehouse.city}</small>
                  </div>
                )}
              </td>
              <td>
                <StatusBadge status={warehouse.warehouseType} map={WAREHOUSE_TYPE} />
              </td>
              {branchName.multi && (
                <td className="small">{branchName.name(warehouse.branchId)}</td>
              )}
              <td>
                <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'}`}>
                  {warehouse.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <RowActions
                  viewHref={`/dashboard/inventory/warehouses/${warehouse.id}`}
                  editHref={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}
                  onDelete={() => onDelete(warehouse)}
                  labels={{ view: 'Ver detalle' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
