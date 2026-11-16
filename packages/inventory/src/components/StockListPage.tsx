'use client'

/**
 * Control de Stock con la piel del rediseno (Figma "Rediseño Labor wasser",
 * Inventario, 2026-11-15). Indicadores Total, Stock bajo y Sin stock que filtran;
 * nivel y estatus en pastilla. Conserva lo de antes: filtro por almacen y sucursal,
 * enlace ?level=low|out desde el dashboard. Las existencias se mueven con
 * movimientos (decision 2026-11-15): el menu de la fila registra una entrada o un ajuste.
 */

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { BranchFilter, useBranchName } from '@lwm/auth'
import { useStock, useWarehouses } from '../hooks'
import { useStockCounts } from '../hooks/useInventoryCounts'
import { stockMovementHref } from './StockForm'
import { STOCK_STATUS } from '../utils/labels'
import { formatMoney, formatQty, toNumber } from '../utils/format'
import { readPageMeta } from '../utils/listing'
import type { Stock } from '../types'

const BASE_HREF = '/dashboard/inventory/stock'

type StockLevel = '' | 'low' | 'out'
const parseLevel = (value: string | null): StockLevel => (value === 'low' || value === 'out' ? value : '')

export const STOCK_STATUS_TONE: Record<string, LwTone> = {
  active: 'success',
  inactive: 'neutral',
  quarantine: 'info',
  damaged: 'danger',
}

/**
 * Nivel de la fila, con la misma regla que los filtros del backend (Stock::scopeLowStock
 * y scopeOutOfStock): sin stock si la cantidad es 0 o menos; bajo si no pasa del minimo.
 */
export const stockLevel = (row: Pick<Stock, 'quantity' | 'minimumStock'>): { label: string; tone: LwTone } => {
  const qty = toNumber(row.quantity)
  if (qty <= 0) return { label: 'Sin stock', tone: 'neutral' }
  if (qty <= toNumber(row.minimumStock)) return { label: 'Stock bajo', tone: 'danger' }
  return { label: 'Disponible', tone: 'success' }
}

function StockListContent() {
  const router = useRouter()
  const branchName = useBranchName()
  const searchParams = useSearchParams()
  const levelParam = parseLevel(searchParams.get('level'))

  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState<string | undefined>()
  const [status, setStatus] = useState('')
  const [level, setLevel] = useState<StockLevel>(levelParam)
  const [warehouseId, setWarehouseId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Navegar a ?level=... con la pagina abierta tambien aplica el filtro
  useEffect(() => {
    setLevel(levelParam)
    setPage(1)
  }, [levelParam])

  const { stock, meta, isLoading, error } = useStock({
    filters: {
      search,
      status: status || undefined,
      warehouseId: warehouseId || undefined,
      branchId: branchId || undefined,
      lowStock: level === 'low' ? true : undefined,
      outOfStock: level === 'out' ? true : undefined,
    },
    pagination: { page, size: perPage },
    include: ['product', 'warehouse', 'location'],
  })
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const counts = useStockCounts({ branchId: branchId || undefined, warehouseId: warehouseId || undefined })
  const pageInfo = readPageMeta(meta, page, perPage)
  const hasFilters = Boolean(search || status || level || warehouseId || branchId)

  const reset = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1) }
  const clearAll = () => { setSearch(undefined); setSearchTerm(''); setStatus(''); setLevel(''); setWarehouseId(''); setBranchId(''); setPage(1) }
  const kpi = (label: string, value: number | null, icon: string, target: StockLevel) => (
    <div className="col-md-4">
      <LwKpiCard label={label} value={value ?? '--'} icon={icon} highlight={level === target} isLoading={counts.isLoading} onClick={() => reset(setLevel)(target)} />
    </div>
  )
  const colCount = branchName.multi ? 10 : 9

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle title="Gestión de Stock" subtitle="Existencias por producto, almacén y ubicación" />

        <div className="row g-3 mb-4">
          {kpi('Registros de stock', counts.total, 'bi-boxes', '')}
          {kpi('Stock bajo', counts.low, 'bi-exclamation-triangle', 'low')}
          {kpi('Sin stock', counts.out, 'bi-x-octagon', 'out')}
        </div>

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-3">
            <form onSubmit={(e) => { e.preventDefault(); reset(setSearch)(searchTerm.trim() || undefined) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar producto, SKU o almacén..."
                  aria-label="Buscar stock"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value === '' && search) reset(setSearch)(undefined) }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Estatus" value={status} onChange={(e) => reset(setStatus)(e.target.value)}>
              <option value="">Todos los estatus</option>
              {Object.entries(STOCK_STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Nivel" value={level} onChange={(e) => reset(setLevel)(parseLevel(e.target.value))}>
              <option value="">Todos los niveles</option>
              <option value="low">Stock bajo</option>
              <option value="out">Sin stock</option>
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Almacén" value={warehouseId} onChange={(e) => reset(setWarehouseId)(e.target.value)}>
              <option value="">Todos los almacenes</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          {branchName.multi ? (
            <div className="col-md-auto">
              <BranchFilter className="form-select" value={branchId} onChange={reset(setBranchId)} />
            </div>
          ) : null}
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? <button type="button" className="btn btn-link btn-sm" onClick={clearAll}>Limpiar filtros</button> : null}
            <button type="button" className="btn btn-primary" onClick={() => router.push(`${BASE_HREF}/create`)}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo stock
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudo cargar el stock.'}</div> : null}

        <LwTableWrap>
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>No</th>
                <th>Producto</th>
                <th>Almacén</th>
                {branchName.multi ? <th>Sucursal</th> : null}
                <th className="text-end">Valor</th>
                <th className="text-end">Cantidad</th>
                <th className="text-end">Disponible</th>
                <th>Nivel</th>
                <th>Estatus</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={colCount} className="text-center text-muted py-4">Cargando stock…</td></tr>
              ) : stock.length === 0 ? (
                <tr><td colSpan={colCount} className="text-center text-muted py-4">{hasFilters ? 'Stock no encontrado' : 'Todavía no hay stock registrado'}</td></tr>
              ) : (
                stock.map((row, i) => {
                  const lvl = stockLevel(row)
                  const name = row.product?.name ?? 'Producto sin datos'
                  return (
                    <tr key={row.id}>
                      <td>{String((pageInfo.currentPage - 1) * pageInfo.perPage + i + 1).padStart(2, '0')}</td>
                      <td>
                        {name}
                        {row.product?.sku ? <div className="small text-muted">SKU: {row.product.sku}</div> : null}
                      </td>
                      <td>
                        {row.warehouse?.name ?? '—'}
                        {row.location?.name ? <div className="small text-muted">{row.location.name}</div> : null}
                      </td>
                      {branchName.multi ? <td className="small">{branchName.name(row.warehouse?.branchId)}</td> : null}
                      <td className="text-end text-nowrap">{formatMoney(row.totalValue)}</td>
                      <td className="text-end">{formatQty(row.quantity)}</td>
                      <td className="text-end">{formatQty(row.availableQuantity)}</td>
                      <td><LwStatusPill tone={lvl.tone}>{lvl.label}</LwStatusPill></td>
                      <td><LwStatusPill tone={STOCK_STATUS_TONE[row.status] ?? 'neutral'}>{STOCK_STATUS[row.status]?.label ?? row.status}</LwStatusPill></td>
                      <td className="text-end text-nowrap">
                        <LwIconButton icon="bi-eye" label={`Ver stock de ${name}`} onClick={() => router.push(`${BASE_HREF}/${row.id}`)} />
                        <LwIconButton icon="bi-pencil" label={`Editar stock de ${name}`} onClick={() => router.push(`${BASE_HREF}/${row.id}/edit`)} />
                        <LwActionMenu
                          label={`Más acciones de ${name}`}
                          items={[
                            { key: 'entry', label: 'Registrar entrada', icon: 'bi-box-arrow-in-down', onSelect: () => router.push(stockMovementHref(row, 'entry')) },
                            { key: 'adjust', label: 'Ajustar existencia', icon: 'bi-sliders', onSelect: () => router.push(stockMovementHref(row, 'adjustment')) },
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

        <LwPagination page={pageInfo.currentPage} lastPage={pageInfo.lastPage} perPage={pageInfo.perPage} total={pageInfo.total} onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }} />
      </LwSurface>
    </div>
  )
}

/** useSearchParams exige un limite de Suspense en paginas estaticas */
export function StockListPage() {
  return (
    <Suspense fallback={<div className="container-fluid py-4 text-muted">Cargando stock…</div>}>
      <StockListContent />
    </Suspense>
  )
}
