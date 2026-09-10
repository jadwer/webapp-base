/**
 * LOCATIONS TABLE SIMPLE
 * Tabla simple para mostrar ubicaciones con estructura JSON:API
 * Siguiendo patrón exitoso de WarehousesTableSimple
 */

'use client'

import React from 'react'
import Link from 'next/link'
import type { WarehouseLocationParsed } from '../types'

interface LocationsTableSimpleProps {
  locations?: WarehouseLocationParsed[]
  isLoading?: boolean
  onEdit?: (location: WarehouseLocationParsed) => void
  onDelete?: (location: WarehouseLocationParsed) => void
}

export const LocationsTableSimple = ({
  locations = [],
  isLoading = false,
  onEdit: _onEdit, // eslint-disable-line @typescript-eslint/no-unused-vars
  onDelete
}: LocationsTableSimpleProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return '-'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando ubicaciones...</p>
      </div>
    )
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-geo-alt text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay ubicaciones</h4>
        <p className="text-muted">No se encontraron ubicaciones para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Ubicación</th>
            <th scope="col">Código</th>
            <th scope="col">Tipo</th>
            <th scope="col">Almacén</th>
            <th scope="col">Estado</th>
            <th scope="col">Creado</th>
            <th scope="col" style={{ width: '150px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>
                <div className="fw-semibold">{location.name}</div>
                {location.description && (
                  <small className="text-muted">{location.description}</small>
                )}
              </td>
              <td>
                <code className="text-primary">{location.code}</code>
              </td>
              <td>
                <span className="badge bg-info text-dark">
                  {location.locationType || 'general'}
                </span>
              </td>
              <td>
                <span className="text-muted">
                  {location.warehouse?.name || 'Almacén sin datos'}
                </span>
              </td>
              <td>
                <span className={`badge bg-${location.isActive ? 'success' : 'secondary'}`}>
                  {location.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  {formatDate(location.createdAt)}
                </small>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/locations/${location.id}`}
                    className="btn btn-outline-info"
                    title="Ver detalles"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-eye" />
                  </Link>
                  <Link
                    href={`/dashboard/inventory/locations/${location.id}/edit`}
                    className="btn btn-outline-primary"
                    title="Editar ubicación"
                  >
                    <i className="bi bi-pencil" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onDelete?.(location)}
                    title="Eliminar ubicación"
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