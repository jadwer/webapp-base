'use client'

/**
 * CONTEOS DE INVENTARIO
 * Totales reales del backend: cada conteo pide page[size]=1 y lee
 * meta.page.total. Reusan los hooks de lista para compartir llaves SWR,
 * asi las mutaciones que invalidan 'warehouses', 'stocks', etc. refrescan
 * tambien los conteos.
 */

import { useMemo } from 'react'
import useSWR from 'swr'
import { useWarehouses } from './useWarehouses'
import { useLocations } from './useLocations'
import { useStock } from './useStock'
import { useInventoryMovements } from './useInventoryMovements'
import { lotTraceabilityService } from '../services'
import type { Stock, StockFilters } from '../types'

const COUNT_PAGE = { size: 1 }

/** Lee meta.page.total (formato de laravel-json-api). Sin dato -> null */
export const readPageTotal = (meta: unknown): number | null => {
  const total = (meta as { page?: { total?: unknown } } | undefined)?.page?.total
  return typeof total === 'number' ? total : null
}

/** Fecha local YYYY-MM-DD (movement_date se compara contra el inicio del dia) */
const localToday = (): string => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/**
 * Registros de stock: total, stock bajo y sin stock.
 * branchId opcional para el listado con filtro de sucursal.
 */
export const useStockCounts = (filters: Pick<StockFilters, 'branchId' | 'warehouseId'> = {}) => {
  const total = useStock({ filters, pagination: COUNT_PAGE })
  const low = useStock({ filters: { ...filters, lowStock: true }, pagination: COUNT_PAGE })
  const out = useStock({ filters: { ...filters, outOfStock: true }, pagination: COUNT_PAGE })

  return {
    total: readPageTotal(total.meta),
    low: readPageTotal(low.meta),
    out: readPageTotal(out.meta),
    isLoading: total.isLoading || low.isLoading || out.isLoading,
    error: total.error || low.error || out.error,
  }
}

/** Movimientos: total y los registrados hoy */
export const useMovementCounts = () => {
  const today = useMemo(localToday, [])
  const all = useInventoryMovements({ pagination: COUNT_PAGE })
  const todays = useInventoryMovements({ filters: { dateFrom: today }, pagination: COUNT_PAGE })

  return {
    total: readPageTotal(all.meta),
    today: readPageTotal(todays.meta),
    isLoading: all.isLoading || todays.isLoading,
    error: all.error || todays.error,
  }
}

/** Totales del dashboard de inventario */
export const useInventoryDashboardCounts = () => {
  const warehouses = useWarehouses({ filters: { isActive: true }, pagination: COUNT_PAGE })
  const locations = useLocations({ filters: { isActive: true }, pagination: COUNT_PAGE })
  const stock = useStockCounts()
  const movements = useMovementCounts()

  return {
    warehouses: { count: readPageTotal(warehouses.meta), isLoading: warehouses.isLoading },
    locations: { count: readPageTotal(locations.meta), isLoading: locations.isLoading },
    stock,
    movements,
  }
}

export interface StockAlert {
  id: string
  type: 'out_of_stock' | 'low_stock'
  stock: Stock
}

/**
 * Alertas de stock filtradas en el backend: primero sin stock, luego stock bajo.
 * total es la suma de ambos conteos (null si alguno falla).
 */
export const useStockAlerts = (limit = 5) => {
  const include = ['product', 'warehouse']
  const out = useStock({
    filters: { outOfStock: true },
    sort: { field: 'quantity', direction: 'asc' },
    pagination: { size: limit },
    include,
  })
  const low = useStock({
    filters: { lowStock: true },
    sort: { field: 'quantity', direction: 'asc' },
    pagination: { size: limit },
    include,
  })

  const alerts: StockAlert[] = useMemo(
    () =>
      [
        ...out.stock.map((s) => ({ id: s.id, type: 'out_of_stock' as const, stock: s })),
        ...low.stock.map((s) => ({ id: s.id, type: 'low_stock' as const, stock: s })),
      ].slice(0, limit),
    [out.stock, low.stock, limit],
  )

  const outTotal = readPageTotal(out.meta)
  const lowTotal = readPageTotal(low.meta)

  return {
    alerts,
    total: outTotal != null && lowTotal != null ? outTotal + lowTotal : null,
    isLoading: out.isLoading || low.isLoading,
    error: out.error || low.error,
  }
}

/**
 * Lotes activos por vencer en `days` dias y lotes ya vencidos con existencia
 * (endpoints de lot-traceability). En error el conteo queda en null.
 */
export const useLotAlerts = (days = 30) => {
  const swrOptions = { revalidateOnFocus: false, shouldRetryOnError: false }
  const expiring = useSWR(
    ['lot-traceability', 'expiring-soon', days],
    () => lotTraceabilityService.getExpiringSoonSummary(days),
    swrOptions,
  )
  const expired = useSWR(
    ['lot-traceability', 'expired'],
    () => lotTraceabilityService.getExpiredSummary(),
    swrOptions,
  )

  return {
    expiring: expiring.data?.items ?? [],
    expiringCount: expiring.data?.count ?? null,
    expiredCount: expired.data?.count ?? null,
    isLoading: expiring.isLoading || expired.isLoading,
    error: expiring.error || expired.error,
  }
}
