'use client'

/**
 * Movimientos con la piel del rediseno (Figma "Rediseño Labor wasser",
 * Inventario, 2026-11-15). Indicadores por estatus (total, completados,
 * pendientes, cancelados) que filtran al tocarlos. Conserva lo de antes:
 * filtro por almacen, fecha, almacen y ubicacion en la fila, accesos de
 * entrada y salida. Un movimiento completado no se edita (el backend lo
 * rechaza): el lapiz sale deshabilitado con el motivo.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LwSurface,
  LwPageTitle,
  LwKpiCard,
  LwTableWrap,
  LwStatusPill,
  LwIconButton,
  LwPagination,
  type LwTone,
} from '@lwm/ui'
import { useInventoryMovements, useWarehouses } from '../hooks'
import { useMovementCounts } from '../hooks/useInventoryCounts'
import { MOVEMENT_STATUS, MOVEMENT_TYPE } from '../utils/labels'
import { formatDate, formatMoney, formatQty } from '../utils/format'
import { readPageMeta } from '../utils/listing'
import type { MovementFilters } from '../types'

const BASE_HREF = '/dashboard/inventory/movements'

/** Tonos del diseno: entrada azul, salida roja, transferencia verde, ajuste marino. */
export const MOVEMENT_TYPE_TONE: Record<string, LwTone> = {
  entry: 'info',
  exit: 'danger',
  transfer: 'success',
  adjustment: 'navy',
}
export const MOVEMENT_STATUS_TONE: Record<string, LwTone> = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'danger',
}

/** Motivo por el que un movimiento no se edita; null si se puede. */
export const movementLockReason = (status?: string): string | null =>
  status === 'completed' ? 'Un movimiento completado no se edita; corrige con un ajuste.' : null

interface Filters {
  search?: string
  status?: string
  movementType?: string
  warehouseId?: string
}

export function MovementsListPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { movements, meta, isLoading, error } = useInventoryMovements({
    filters: {
      search: filters.search,
      status: filters.status,
      movementType: filters.movementType as MovementFilters['movementType'],
      warehouseId: filters.warehouseId,
    },
    pagination: { page, size: perPage },
    include: ['product', 'warehouse', 'location'],
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const counts = useMovementCounts()
  const pageInfo = readPageMeta(meta, page, perPage)
  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  const setFilter = (next: Filters) => {
    setFilters(next)
    setPage(1)
  }
  const kpi = (label: string, value: number | null, icon: string, status?: string) => (
    <div className="col-6 col-lg-3">
      <LwKpiCard
        label={label}
        value={value ?? '--'}
        icon={icon}
        highlight={(filters.status ?? '') === (status ?? '')}
        isLoading={counts.isLoading}
        onClick={() => setFilter({ ...filters, status })}
      />
    </div>
  )

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Gestión de movimientos"
          subtitle="Entradas, salidas, transferencias y ajustes de stock"
          actions={
            <>
              <button type="button" className="btn btn-outline-success" onClick={() => router.push(`${BASE_HREF}/create?type=entry`)}>
                <i className="bi bi-box-arrow-in-down me-1" aria-hidden="true" /> Entrada
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={() => router.push(`${BASE_HREF}/create?type=exit`)}>
                <i className="bi bi-box-arrow-up me-1" aria-hidden="true" /> Salida
              </button>
            </>
          }
        />

        <div className="row g-3 mb-4">
          {kpi('Total movimientos', counts.total, 'bi-arrow-left-right')}
          {kpi('Completados', counts.completed, 'bi-check2-square', 'completed')}
          {kpi('Pendientes', counts.pending, 'bi-hourglass-split', 'pending')}
          {kpi('Cancelados', counts.cancelled, 'bi-x-octagon', 'cancelled')}
        </div>

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-3">
            <form onSubmit={(e) => { e.preventDefault(); setFilter({ ...filters, search: searchTerm.trim() || undefined }) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por producto, SKU o descripción..."
                  aria-label="Buscar movimiento"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    if (e.target.value === '' && filters.search) setFilter({ ...filters, search: undefined })
                  }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Estatus" value={filters.status ?? ''} onChange={(e) => setFilter({ ...filters, status: e.target.value || undefined })}>
              <option value="">Todos los estatus</option>
              {Object.entries(MOVEMENT_STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Tipo" value={filters.movementType ?? ''} onChange={(e) => setFilter({ ...filters, movementType: e.target.value || undefined })}>
              <option value="">Todos los tipos</option>
              {Object.entries(MOVEMENT_TYPE).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Almacén" value={filters.warehouseId ?? ''} onChange={(e) => setFilter({ ...filters, warehouseId: e.target.value || undefined })}>
              <option value="">Todos los almacenes</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? (
              <button type="button" className="btn btn-link btn-sm" onClick={() => { setFilter({}); setSearchTerm('') }}>Limpiar filtros</button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={() => router.push(`${BASE_HREF}/create`)}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo movimiento
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudieron cargar los movimientos.'}</div> : null}

        <LwTableWrap>
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Fecha</th>
                <th>Almacén</th>
                <th>Producto</th>
                <th className="text-end">Valor</th>
                <th className="text-end">Cantidad</th>
                <th>Tipo</th>
                <th>Estatus</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">Cargando movimientos…</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">{hasFilters ? 'Movimiento no encontrado' : 'Todavía no hay movimientos'}</td></tr>
              ) : (
                movements.map((m, i) => {
                  const lock = movementLockReason(m.status)
                  return (
                    <tr key={m.id}>
                      <td>{String((pageInfo.currentPage - 1) * pageInfo.perPage + i + 1).padStart(2, '0')}</td>
                      <td className="text-nowrap small">{formatDate(m.movementDate, { withTime: true })}</td>
                      <td>
                        {m.warehouse?.name ?? '—'}
                        {m.location?.name ? <div className="small text-muted">{m.location.name}</div> : null}
                      </td>
                      <td>
                        {m.product?.name ?? 'Producto sin datos'}
                        {m.product?.sku ? <div className="small text-muted">SKU: {m.product.sku}</div> : null}
                      </td>
                      <td className="text-end text-nowrap">{formatMoney(m.totalValue)}</td>
                      <td className="text-end">{formatQty(m.quantity)}</td>
                      <td><LwStatusPill tone={MOVEMENT_TYPE_TONE[m.movementType] ?? 'neutral'}>{MOVEMENT_TYPE[m.movementType]?.label ?? m.movementType}</LwStatusPill></td>
                      <td><LwStatusPill tone={MOVEMENT_STATUS_TONE[m.status] ?? 'neutral'}>{MOVEMENT_STATUS[m.status]?.label ?? m.status}</LwStatusPill></td>
                      <td className="text-end text-nowrap">
                        <LwIconButton icon="bi-eye" label={`Ver movimiento ${m.id}`} onClick={() => router.push(`${BASE_HREF}/${m.id}`)} />
                        {/* El boton deshabilitado no muestra su tooltip: el motivo va en el contenedor */}
                        <span title={lock ?? undefined} className="d-inline-block">
                          <LwIconButton
                            icon="bi-pencil"
                            label={lock ?? `Editar movimiento ${m.id}`}
                            disabled={Boolean(lock)}
                            onClick={() => router.push(`${BASE_HREF}/${m.id}/edit`)}
                          />
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </LwTableWrap>

        <LwPagination page={pageInfo.currentPage} lastPage={pageInfo.lastPage} perPage={pageInfo.perPage} total={pageInfo.total} onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }} />
      </LwSurface>
    </div>
  )
}
