/**
 * LOCATIONS TABLE SIMPLE
 * Tabla simple para mostrar ubicaciones con estructura JSON:API
 * Siguiendo patrón exitoso de WarehousesTableSimple
 */

'use client'

import React from 'react'
import type { WarehouseLocation } from '../types'

interface LocationsTableSimpleProps {
  locations?: WarehouseLocation[]
  isLoading?: boolean
  onEdit?: (location: WarehouseLocation) => void
  onDelete?: (location: WarehouseLocation) => void
}

export const LocationsTableSimple = ({
  locations = [],
  isLoading = false,
  onEdit,
  onDelete
}: LocationsTableSimpleProps) => {
  // Debug logs
  console.log('📊 [LocationsTableSimple] Debug info:', {
    locationsReceived: locations,
    locationsLength: locations?.length,
    firstLocation: locations?.[0],
    firstLocationKeys: locations?.[0] ? Object.keys(locations[0]) : null,
    isLoading
  })

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
            <th scope="col" width="120">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>
                <div className="fw-semibold">{location.attributes.name}</div>
                {location.attributes.description && (
                  <small className="text-muted">{location.attributes.description}</small>
                )}
              </td>
              <td>
                <code className="text-primary">{location.attributes.code}</code>
              </td>
              <td>
                <span className="badge bg-info text-dark">
                  {location.attributes.locationType || 'general'}
                </span>
              </td>
              <td>
                <span className="text-muted">
                  {location.attributes.warehouse?.name || `ID: ${location.attributes.warehouseId}`}
                </span>
              </td>
              <td>
                <span className={`badge bg-${location.attributes.isActive ? 'success' : 'secondary'}`}>
                  {location.attributes.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  {formatDate(location.attributes.createdAt)}
                </small>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onEdit?.(location)}
                    title="Editar ubicación"
                  >
                    <i className="bi bi-pencil" />
                  </button>
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