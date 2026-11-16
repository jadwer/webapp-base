'use client'

/**
 * Lotes con la piel del rediseno (Figma "Rediseño Labor wasser", Inventario,
 * 2026-11-15). Indicadores: total de lotes, por vencer en 30 dias y vencidos con
 * existencias (alertas de lot-traceability). Conserva lo de antes: busqueda por lote,
 * producto o proveedor, filtro por almacen. Agrega proveedor (el subtitulo del diseno
 * lo promete) y el menu de fila para mover el lote: entrada, salida o ajuste
 * (las cantidades salen de los movimientos, decision 2026-11-16).
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
  LwActionMenu,
  LwPagination,
  type LwTone,
} from '@lwm/ui'
import { useProductBatches, useWarehouses } from '../hooks'
import { useLotAlerts } from '../hooks/useInventoryCounts'
import { batchMovementHref } from './ProductBatchForm'
import { BATCH_STATUS } from '../utils/labels'
import { formatDate, formatMoney, formatQty } from '../utils/format'
import type { ProductBatchStatus } from '../types'

const BASE_HREF = '/dashboard/inventory/product-batch'
const EXPIRING_DAYS = 30

/** Tonos del diseno: activo verde, vencido rojo, cuarentena azul claro, consumido azul. */
export const BATCH_STATUS_TONE: Record<string, LwTone> = {
  active: 'success',
  expired: 'danger',
  quarantine: 'neutral',
  recalled: 'warning',
  consumed: 'info',
}

/** "Vence en N días" o "Venció hace N días", contra la fecha local de hoy. */
export const expiryHint = (expirationDate?: string | null, today: Date = new Date()): string | null => {
  if (!expirationDate) return null
  const [y, m, d] = expirationDate.slice(0, 10).split('-').map(Number)
  const exp = Date.UTC(y, m - 1, d)
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((exp - now) / 86400000)
  if (days > 1) return `Vence en ${days} días`
  if (days === 1) return 'Vence mañana'
  if (days === 0) return 'Vence hoy'
  return days === -1 ? 'Venció ayer' : `Venció hace ${-days} días`
}

export function ProductBatchesListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState<string | undefined>()
  const [status, setStatus] = useState<ProductBatchStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { productBatches, meta, isLoading, error } = useProductBatches({
    filters: { search, status: status || undefined, warehouseId: warehouseId || undefined },
    page,
    pageSize: perPage,
  })
  const all = useProductBatches({ filters: {}, page: 1, pageSize: 1 })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const lotAlerts = useLotAlerts(EXPIRING_DAYS)
  const total = meta?.total ?? productBatches.length
  const lastPage = meta?.lastPage ?? 1
  const hasFilters = Boolean(search || status || warehouseId)

  const reset = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1) }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle title="Gestión de lotes de productos" subtitle="Seguimiento de lotes por vencimiento, almacén y proveedor" />

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <LwKpiCard label="Total de lotes" value={all.meta?.total ?? '--'} icon="bi-calendar2-check" highlight isLoading={all.isLoading} />
          </div>
          <div className="col-md-4">
            <LwKpiCard label={`Lotes por vencer en ${EXPIRING_DAYS} días`} value={lotAlerts.expiringCount ?? '--'} icon="bi-clock-history" isLoading={lotAlerts.isLoading} />
          </div>
          <div className="col-md-4">
            <LwKpiCard label="Lotes vencidos con existencias" value={lotAlerts.expiredCount ?? '--'} icon="bi-exclamation-triangle" isLoading={lotAlerts.isLoading} />
          </div>
        </div>

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-3">
            <form onSubmit={(e) => { e.preventDefault(); reset(setSearch)(searchTerm.trim() || undefined) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por lote, producto o proveedor..."
                  aria-label="Buscar lote"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value === '' && search) reset(setSearch)(undefined) }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Estatus" value={status} onChange={(e) => reset(setStatus)(e.target.value as ProductBatchStatus | '')}>
              <option value="">Todos los estatus</option>
              {Object.entries(BATCH_STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Almacén" value={warehouseId} onChange={(e) => reset(setWarehouseId)(e.target.value)}>
              <option value="">Todos los almacenes</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? (
              <button type="button" className="btn btn-link btn-sm" onClick={() => { setSearch(undefined); setSearchTerm(''); setStatus(''); setWarehouseId(''); setPage(1) }}>Limpiar filtros</button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={() => router.push(`${BASE_HREF}/create`)}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo lote
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudieron cargar los lotes.'}</div> : null}

        <LwTableWrap>
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Producto</th>
                <th>Lote</th>
                <th>Almacén</th>
                <th>Proveedor</th>
                <th className="text-end">Valor</th>
                <th className="text-end">Cantidad</th>
                <th>Vencimiento</th>
                <th>Estatus</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="text-center text-muted py-4">Cargando lotes…</td></tr>
              ) : productBatches.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-muted py-4">{hasFilters ? 'Lote no encontrado' : 'Todavía no hay lotes'}</td></tr>
              ) : (
                productBatches.map((b, i) => {
                  const hint = expiryHint(b.expirationDate)
                  const name = b.product?.name ?? 'Producto sin datos'
                  return (
                    <tr key={b.id}>
                      <td>{String((page - 1) * perPage + i + 1).padStart(2, '0')}</td>
                      <td>
                        {name}
                        {b.product?.sku ? <div className="small text-muted">SKU: {b.product.sku}</div> : null}
                      </td>
                      <td>
                        {b.batchNumber}
                        {b.lotNumber ? <div className="small text-muted">Fabricante: {b.lotNumber}</div> : null}
                      </td>
                      <td>
                        {b.warehouse?.name ?? '—'}
                        {b.warehouseLocation?.name ? <div className="small text-muted">{b.warehouseLocation.name}</div> : null}
                      </td>
                      <td>{b.supplierName || <span className="text-muted">—</span>}</td>
                      <td className="text-end text-nowrap">{formatMoney(b.totalValue)}</td>
                      <td className="text-end">{formatQty(b.currentQuantity)}</td>
                      <td className="text-nowrap">
                        {b.expirationDate ? formatDate(b.expirationDate) : '—'}
                        {hint ? <div className="small text-muted">{hint}</div> : null}
                      </td>
                      <td><LwStatusPill tone={BATCH_STATUS_TONE[b.status] ?? 'neutral'}>{BATCH_STATUS[b.status]?.label ?? b.status}</LwStatusPill></td>
                      <td className="text-end text-nowrap">
                        <LwIconButton icon="bi-eye" label={`Ver lote ${b.batchNumber}`} onClick={() => router.push(`${BASE_HREF}/${b.id}`)} />
                        <LwIconButton icon="bi-pencil" label={`Editar lote ${b.batchNumber}`} onClick={() => router.push(`${BASE_HREF}/${b.id}/edit`)} />
                        <LwActionMenu
                          label={`Más acciones del lote ${b.batchNumber}`}
                          items={[
                            { key: 'entry', label: 'Registrar entrada', icon: 'bi-box-arrow-in-down', onSelect: () => router.push(batchMovementHref(b, 'entry')) },
                            { key: 'exit', label: 'Registrar salida', icon: 'bi-box-arrow-up', onSelect: () => router.push(batchMovementHref(b, 'exit')), disabled: b.status !== 'active', hint: b.status !== 'active' ? 'Solo sale producto de un lote activo' : undefined },
                            { key: 'adjust', label: 'Ajustar lote', icon: 'bi-sliders', onSelect: () => router.push(batchMovementHref(b, 'adjustment')) },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </LwTableWrap>

        <LwPagination page={page} lastPage={lastPage} perPage={perPage} total={total} onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }} />
      </LwSurface>
    </div>
  )
}
