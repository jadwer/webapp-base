/**
 * LOCATIONS TABLE SIMPLE
 * Tabla de ubicaciones de almacen con el patron de listados.
 */

'use client'

import Link from 'next/link'
import { EmptyState, RowActions, StatusBadge } from '@lwm/ui'
import { LOCATION_TYPE } from '../utils/labels'
import type { WarehouseLocationParsed } from '../types'

interface LocationsTableSimpleProps {
  locations?: WarehouseLocationParsed[]
  isLoading?: boolean
  onDelete?: (location: WarehouseLocationParsed) => void
  /** Oculta la columna Almacen (p. ej. dentro del detalle de un almacen) */
  hideWarehouse?: boolean
}

export const LocationsTableSimple = ({
  locations = [],
  isLoading = false,
  onDelete,
  hideWarehouse = false,
}: LocationsTableSimpleProps) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando ubicaciones...</span>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        title="No hay ubicaciones"
        description="No se encontraron ubicaciones con los filtros actuales."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Código</th>
            <th>Ubicación</th>
            <th>Tipo</th>
            {!hideWarehouse && <th>Almacén</th>}
            <th>Estado</th>
            <th style={{ width: '140px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>
                <code>{location.code}</code>
              </td>
              <td>
                <Link
                  href={`/dashboard/inventory/locations/${location.id}`}
                  className="fw-semibold text-decoration-none"
                >
                  {location.name}
                </Link>
                {location.description && (
                  <div>
                    <small className="text-muted">{location.description}</small>
                  </div>
                )}
              </td>
              <td>
                <StatusBadge status={location.locationType} map={LOCATION_TYPE} />
              </td>
              {!hideWarehouse && (
                <td>{location.warehouse?.name || <span className="text-muted">-</span>}</td>
              )}
              <td>
                <span className={`badge bg-${location.isActive ? 'success' : 'secondary'}`}>
                  {location.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <RowActions
                  viewHref={`/dashboard/inventory/locations/${location.id}`}
                  editHref={`/dashboard/inventory/locations/${location.id}/edit`}
                  onDelete={onDelete ? () => onDelete(location) : undefined}
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
