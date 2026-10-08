/**
 * MOVEMENTS ADMIN PAGE
 * Historial de movimientos de inventario con totales del backend.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Alert, KpiCard, ListToolbar, PageHeader } from '@lwm/ui'
import { useInventoryMovements, useWarehouses } from '../hooks'
import { useMovementCounts } from '../hooks/useInventoryCounts'
import { MovementsTableSimple } from './MovementsTableSimple'
import { PaginationSimple } from './PaginationSimple'
import { MOVEMENT_STATUS, MOVEMENT_TYPE } from '../utils/labels'
import { readPageMeta } from '../utils/listing'
import type { MovementFilters } from '../types'

const PAGE_SIZE = 20
const CREATE_HREF = '/dashboard/inventory/movements/create'

export const MovementsAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { movements, meta, isLoading, error } = useInventoryMovements({
    filters: {
      search: searchTerm || undefined,
      movementType: (typeFilter || undefined) as MovementFilters['movementType'],
      status: statusFilter || undefined,
      warehouseId: warehouseId || undefined,
    },
    pagination: { page: currentPage, size: PAGE_SIZE },
    include: ['product', 'warehouse', 'location'],
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const counts = useMovementCounts()

  const page = readPageMeta(meta, currentPage, PAGE_SIZE)

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Movimientos de inventario"
        subtitle="Entradas, salidas, transferencias y ajustes de stock"
        actions={
          <>
            <Link href={`${CREATE_HREF}?type=entry`} className="btn btn-outline-success">
              <i className="bi bi-box-arrow-in-down me-2" />
              Entrada
            </Link>
            <Link href={`${CREATE_HREF}?type=exit`} className="btn btn-outline-danger">
              <i className="bi bi-box-arrow-up me-2" />
              Salida
            </Link>
            <Link href={CREATE_HREF} className="btn btn-primary">
              <i className="bi bi-plus-lg me-2" />
              Nuevo movimiento
            </Link>
          </>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <KpiCard
            label="Movimientos registrados"
            value={counts.total ?? '--'}
            icon="bi-arrow-left-right"
            variant="primary"
            isLoading={counts.isLoading}
          />
        </div>
        <div className="col-md-6">
          <KpiCard
            label="Movimientos de hoy"
            value={counts.today ?? '--'}
            icon="bi-calendar-check"
            variant="info"
            isLoading={counts.isLoading}
          />
        </div>
      </div>

      <ListToolbar
        search={{
          value: searchTerm,
          onChange: withReset(setSearchTerm),
          placeholder: 'Buscar por producto, SKU o descripción',
        }}
      >
        <select
          className="form-select w-auto"
          value={typeFilter}
          onChange={(e) => withReset(setTypeFilter)(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(MOVEMENT_TYPE).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="form-select w-auto"
          value={statusFilter}
          onChange={(e) => withReset(setStatusFilter)(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(MOVEMENT_STATUS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="form-select w-auto"
          value={warehouseId}
          onChange={(e) => withReset(setWarehouseId)(e.target.value)}
          aria-label="Filtrar por almacén"
        >
          <option value="">Todos los almacenes</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </ListToolbar>

      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || 'Error al cargar los movimientos'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <MovementsTableSimple movements={movements} isLoading={isLoading} />
          {page.lastPage > 1 && (
            <PaginationSimple
              currentPage={page.currentPage}
              totalPages={page.lastPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={page.total}
              pageSize={page.perPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}
