/**
 * WAREHOUSES TABLE SIMPLE
 * Tabla de almacenes con el patron de listados (thead oscuro, badges en espanol,
 * columna Sucursal solo con mas de una sucursal).
 */

'use client'

import Link from 'next/link'
import { EmptyState, StatusBadge } from '@lwm/ui'
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
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                    className="btn btn-outline-primary"
                    title="Ver detalle"
                  >
                    <i className="bi bi-eye" />
                  </Link>
                  <Link
                    href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}
                    className="btn btn-outline-secondary"
                    title="Editar"
                  >
                    <i className="bi bi-pencil" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    title="Eliminar"
                    onClick={() => onDelete(warehouse)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
