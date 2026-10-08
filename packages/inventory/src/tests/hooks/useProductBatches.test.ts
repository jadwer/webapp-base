/**
 * useProductBatches: la paginacion sale de meta.page (PagePagination del
 * backend), igual que el resto de listas.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import React from 'react'
import { useProductBatches } from '../../hooks/useProductBatches'
import { productBatchService } from '../../services/productBatchService'
import { createMockProductBatch } from '../utils/test-utils'

vi.mock('../../services/productBatchService')

// Cache aislada por prueba
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children)

describe('useProductBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mapea meta.page a total, perPage, currentPage y lastPage', async () => {
    vi.mocked(productBatchService.getAll).mockResolvedValue({
      data: [createMockProductBatch({ id: '1' })],
      meta: { page: { currentPage: 2, from: 21, lastPage: 3, perPage: 20, to: 40, total: 47 } },
    })

    const { result } = renderHook(() => useProductBatches({ page: 2 }), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.meta).toEqual({ total: 47, perPage: 20, currentPage: 2, lastPage: 3 })
  })

  it('sin meta.page no inventa paginacion', async () => {
    vi.mocked(productBatchService.getAll).mockResolvedValue({
      data: [],
      meta: {},
    })

    const { result } = renderHook(() => useProductBatches(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.meta).toBeUndefined()
  })

  it('pasa un solo estado y la busqueda al servicio', async () => {
    vi.mocked(productBatchService.getAll).mockResolvedValue({ data: [], meta: {} })

    const { result } = renderHook(
      () => useProductBatches({ filters: { status: 'quarantine', search: 'LOT-1' }, pageSize: 50 }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(productBatchService.getAll).toHaveBeenCalledWith(
      { status: 'quarantine', search: 'LOT-1' },
      { field: 'createdAt', direction: 'desc' },
      1,
      50,
    )
  })

  it('no consulta si enabled es false', () => {
    renderHook(() => useProductBatches({ enabled: false }), { wrapper })

    expect(productBatchService.getAll).not.toHaveBeenCalled()
  })
})
