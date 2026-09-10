/**
 * WAREHOUSES TABLE SIMPLE
 * Tabla simple de warehouses para el UI elegante
 * Sin complejidades innecesarias, solo funcionalidad esencial
 */

'use client'

import React from 'react'
import Link from 'next/link'
import type { WarehouseParsed } from '../types'

interface WarehousesTableSimpleProps {
  warehouses?: WarehouseParsed[]
  isLoading: boolean
  onEdit: (warehouse: WarehouseParsed) => void
  onDelete: (warehouse: WarehouseParsed) => void
}

export const WarehousesTableSimple = ({
  warehouses = [],
  isLoading,
  onEdit: _unused, // eslint-disable-line @typescript-eslint/no-unused-vars
  onDelete
}: WarehousesTableSimpleProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando almacenes...</p>
      </div>
    )
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-building display-1 text-muted" />
        <h5 className="mt-3">No se encontraron almacenes</h5>
        <p className="text-muted">Crea tu primer almacén para comenzar</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>Creado</th>
            <th style={{ width: '150px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id}>
              <td>
                <div className="fw-semibold">{warehouse.name}</div>
                {warehouse.phone && (
                  <small className="text-muted">{warehouse.phone}</small>
                )}
              </td>
              <td>
                <span className="text-muted">
                  {warehouse.description || '-'}
                </span>
              </td>
              <td>
                <span className="text-muted">
                  {warehouse.address || '-'}
                </span>
              </td>
              <td>
                <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'}`}>
                  {warehouse.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  {warehouse.createdAt ? formatDate(warehouse.createdAt) : '-'}
                </small>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                    className="btn btn-outline-info"
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye" />
                  </Link>
                  <Link
                    href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}
                    className="btn btn-outline-primary"
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