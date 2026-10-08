/**
 * lotTraceabilityService Tests
 * Endpoints fuera de JSON:API: { data: [...], meta: { count, ... } }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '../../lib/axiosClient'
import { lotTraceabilityService } from '../../services'

vi.mock('../../lib/axiosClient')

const batch = (id: number) => ({
  batch_id: id,
  batch_number: `L-${id}`,
  lot_number: null,
  product: { id: 1, name: 'Reactivo', sku: 'R-1' },
  warehouse: { id: 1, name: 'Principal' },
  expiration_date: '2026-10-20',
  current_quantity: '10.0000',
})

describe('lotTraceabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getExpiringSoonSummary manda days y devuelve items y meta.count', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { data: [batch(1), batch(2)], meta: { count: 2, threshold_days: 15 } },
    })

    const result = await lotTraceabilityService.getExpiringSoonSummary(15)

    expect(axios.get).toHaveBeenCalledWith('/api/v1/lot-traceability/expiring-soon', {
      params: { days: 15 },
    })
    expect(result.count).toBe(2)
    expect(result.items.map((i) => i.batch_id)).toEqual([1, 2])
  })

  it('getExpiringSoonSummary usa 30 dias por defecto', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [], meta: { count: 0, threshold_days: 30 } } })

    const result = await lotTraceabilityService.getExpiringSoonSummary()

    expect(axios.get).toHaveBeenCalledWith('/api/v1/lot-traceability/expiring-soon', {
      params: { days: 30 },
    })
    expect(result).toEqual({ items: [], count: 0 })
  })

  it('getExpiredSummary devuelve items y meta.count', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { data: [batch(3)], meta: { count: 1, total_value_at_risk: 250 } },
    })

    const result = await lotTraceabilityService.getExpiredSummary()

    expect(axios.get).toHaveBeenCalledWith('/api/v1/lot-traceability/expired')
    expect(result).toEqual({ items: [batch(3)], count: 1 })
  })

  it('sin meta.count cuenta los items; sin data devuelve lista vacia', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { data: [batch(4)] } })
    expect(await lotTraceabilityService.getExpiredSummary()).toEqual({ items: [batch(4)], count: 1 })

    vi.mocked(axios.get).mockResolvedValueOnce({ data: {} })
    expect(await lotTraceabilityService.getExpiredSummary()).toEqual({ items: [], count: 0 })
  })

  it('propaga el error para que el hook muestre --', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Request failed with status code 403'))

    await expect(lotTraceabilityService.getExpiringSoonSummary(30)).rejects.toThrow('403')
  })

  it('getExpiringSoon y getExpired devuelven solo los items', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [batch(5)], meta: { count: 1 } } })

    expect(await lotTraceabilityService.getExpiringSoon(7)).toEqual([batch(5)])
    expect(await lotTraceabilityService.getExpired()).toEqual([batch(5)])
  })
})
