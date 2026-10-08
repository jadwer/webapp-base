/**
 * useInventoryCounts Tests
 * Conteos con page[size]=1 leidos de meta.page.total y alertas del dashboard
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import {
  useInventoryDashboardCounts,
  useStockAlerts,
  useLotAlerts,
  readPageTotal,
} from '../../hooks/useInventoryCounts'
import {
  warehousesService,
  locationsService,
  stockService,
  inventoryMovementsService,
  lotTraceabilityService,
} from '../../services'

vi.mock('../../services')

// Cache SWR aislado por prueba
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children)

const page = (total: number, data: unknown[] = []) =>
  ({ data, meta: { page: { currentPage: 1, from: 1, lastPage: total, perPage: 1, to: 1, total } } }) as never

const stockResource = (id: string, quantity: string) => ({
  id,
  type: 'stocks',
  attributes: { quantity, minimumStock: '5.0000' },
})

describe('readPageTotal', () => {
  it('lee meta.page.total y devuelve null sin dato', () => {
    expect(readPageTotal({ page: { total: 12 } })).toBe(12)
    expect(readPageTotal({ page: { total: 0 } })).toBe(0)
    expect(readPageTotal({ pagination: { total: 3 } })).toBeNull()
    expect(readPageTotal(undefined)).toBeNull()
  })
})

describe('useInventoryDashboardCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pide page[size]=1 a cada servicio y mapea meta.page.total', async () => {
    vi.mocked(warehousesService.getAll).mockResolvedValue(page(3))
    vi.mocked(locationsService.getAll).mockResolvedValue(page(7))
    vi.mocked(stockService.getAll).mockImplementation(async (params = {}) => {
      if (params.filters?.lowStock) return page(2)
      if (params.filters?.outOfStock) return page(1)
      return page(40)
    })
    vi.mocked(inventoryMovementsService.getAll).mockImplementation(async (params = {}) =>
      params.filters?.dateFrom ? page(4) : page(120),
    )

    const { result } = renderHook(() => useInventoryDashboardCounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.movements.today).toBe(4)
      expect(result.current.stock.out).toBe(1)
      expect(result.current.locations.count).toBe(7)
    })

    expect(result.current.warehouses.count).toBe(3)
    expect(result.current.stock).toMatchObject({ total: 40, low: 2, out: 1, isLoading: false })
    expect(result.current.movements).toMatchObject({ total: 120, today: 4 })

    expect(warehousesService.getAll).toHaveBeenCalledWith({
      filters: { isActive: true },
      pagination: { size: 1 },
    })
    expect(locationsService.getAll).toHaveBeenCalledWith({
      filters: { isActive: true },
      pagination: { size: 1 },
    })
    expect(stockService.getAll).toHaveBeenCalledWith({ filters: { lowStock: true }, pagination: { size: 1 } })
    expect(stockService.getAll).toHaveBeenCalledWith({ filters: { outOfStock: true }, pagination: { size: 1 } })

    const movementCalls = vi.mocked(inventoryMovementsService.getAll).mock.calls.map((c) => c[0])
    expect(movementCalls.every((p) => p?.pagination?.size === 1)).toBe(true)
    expect(movementCalls.some((p) => /^\d{4}-\d{2}-\d{2}$/.test(p?.filters?.dateFrom ?? ''))).toBe(true)
  })

  it('deja el conteo en null cuando el servicio falla', async () => {
    vi.mocked(warehousesService.getAll).mockRejectedValue(new Error('403'))
    vi.mocked(locationsService.getAll).mockResolvedValue(page(7))
    vi.mocked(stockService.getAll).mockResolvedValue(page(0))
    vi.mocked(inventoryMovementsService.getAll).mockResolvedValue(page(0))

    const { result } = renderHook(() => useInventoryDashboardCounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.warehouses.isLoading).toBe(false)
      expect(result.current.locations.count).toBe(7)
    })

    expect(result.current.warehouses.count).toBeNull()
    expect(result.current.stock.total).toBe(0)
  })
})

describe('useStockAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('combina sin stock y stock bajo filtrados en el backend', async () => {
    vi.mocked(stockService.getAll).mockImplementation(async (params = {}) => {
      if (params.filters?.outOfStock) return page(1, [stockResource('10', '0.0000')])
      return page(6, [stockResource('20', '2.0000'), stockResource('21', '3.0000')])
    })

    const { result } = renderHook(() => useStockAlerts(2), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.alerts).toHaveLength(2)
    })

    expect(result.current.alerts.map((a) => [a.id, a.type])).toEqual([
      ['10', 'out_of_stock'],
      ['20', 'low_stock'],
    ])
    expect(result.current.total).toBe(7)
    expect(stockService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { lowStock: true }, pagination: { size: 2 } }),
    )
  })
})

describe('useLotAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('expone lotes por vencer y deja vencidos en null si el endpoint falla', async () => {
    const item = {
      batch_id: 5,
      batch_number: 'L-001',
      lot_number: null,
      product: { id: 1, name: 'Reactivo', sku: 'R-1' },
      warehouse: { id: 1, name: 'Principal' },
      expiration_date: '2026-10-20',
      current_quantity: '10.0000',
      days_until_expiry: 13,
      available_quantity: 10,
      urgency: 'medium' as const,
    }
    vi.mocked(lotTraceabilityService.getExpiringSoonSummary).mockResolvedValue({ items: [item], count: 3 })
    vi.mocked(lotTraceabilityService.getExpiredSummary).mockRejectedValue(new Error('500'))

    const { result } = renderHook(() => useLotAlerts(30), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(lotTraceabilityService.getExpiringSoonSummary).toHaveBeenCalledWith(30)
    expect(result.current.expiringCount).toBe(3)
    expect(result.current.expiring).toEqual([item])
    expect(result.current.expiredCount).toBeNull()
    expect(result.current.error).toBeTruthy()
  })
})
