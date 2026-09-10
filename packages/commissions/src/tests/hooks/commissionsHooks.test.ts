/**
 * Commissions Module - Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useSWR from 'swr'
import { useCommissionsByPeriod, useCommissionsByEmployee } from '../../hooks'
import { commissionsService } from '../../services'
import type { CommissionByPeriodResult, CommissionByEmployeeResult } from '../../types'
import { createMockCommission } from '../utils/test-utils'

vi.mock('../../services', () => ({
  commissionsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getByPeriod: vi.fn(),
    getByEmployee: vi.fn(),
    markPaid: vi.fn(),
    payBatch: vi.fn(),
  },
}))

vi.mock('@lwm/app-config', () => ({
  appSettingsService: {
    getByGroup: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr')
  return {
    ...actual,
    default: vi.fn(() => ({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    })),
  }
})

const mockByPeriod: CommissionByPeriodResult = {
  commissions: [createMockCommission()],
  count: 1,
  totalCommissionAmount: 100,
}

const mockByEmployee: CommissionByEmployeeResult = {
  employees: [
    {
      userId: 5,
      userName: 'Juan Perez',
      userEmail: 'juan@example.com',
      commissionsCount: 3,
      totalBaseAmount: 3000,
      totalCommissionAmount: 300,
      earnedAmount: 100,
      paidAmount: 200,
    },
  ],
}

describe('useCommissionsByPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to empty commissions while loading', () => {
    const { result } = renderHook(() => useCommissionsByPeriod({ startDate: '2026-07-01', endDate: '2026-07-31' }))

    expect(result.current.commissions).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.totalCommissionAmount).toBe(0)
    expect(result.current.isLoading).toBe(true)
  })

  it('uses a commissions/by-period SWR key including filters', () => {
    const filters = { startDate: '2026-07-01', endDate: '2026-07-31', userId: 5 }

    renderHook(() => useCommissionsByPeriod(filters))

    expect(vi.mocked(useSWR)).toHaveBeenCalledWith(
      ['commissions', 'by-period', filters],
      expect.any(Function),
      expect.objectContaining({ keepPreviousData: true })
    )
  })

  it('calls commissionsService.getByPeriod through the SWR fetcher', async () => {
    vi.mocked(commissionsService.getByPeriod).mockResolvedValue(mockByPeriod)
    const filters = { startDate: '2026-07-01', endDate: '2026-07-31' }

    renderHook(() => useCommissionsByPeriod(filters))
    const fetcher = vi.mocked(useSWR).mock.calls[0][1] as () => Promise<CommissionByPeriodResult>
    const data = await fetcher()

    expect(commissionsService.getByPeriod).toHaveBeenCalledWith(filters)
    expect(data).toEqual(mockByPeriod)
  })

  it('exposes commissions, count and total when data is available', () => {
    vi.mocked(useSWR).mockReturnValueOnce({
      data: mockByPeriod,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useCommissionsByPeriod({ startDate: '2026-07-01', endDate: '2026-07-31' }))

    expect(result.current.commissions).toHaveLength(1)
    expect(result.current.count).toBe(1)
    expect(result.current.totalCommissionAmount).toBe(100)
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useCommissionsByEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults employees to an empty array while loading', () => {
    const { result } = renderHook(() => useCommissionsByEmployee({ startDate: '2026-07-01', endDate: '2026-07-31' }))

    expect(result.current.employees).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('calls commissionsService.getByEmployee through the SWR fetcher', async () => {
    vi.mocked(commissionsService.getByEmployee).mockResolvedValue(mockByEmployee)
    const filters = { startDate: '2026-07-01', endDate: '2026-07-31' }

    renderHook(() => useCommissionsByEmployee(filters))
    const fetcher = vi.mocked(useSWR).mock.calls[0][1] as () => Promise<CommissionByEmployeeResult>
    const data = await fetcher()

    expect(commissionsService.getByEmployee).toHaveBeenCalledWith(filters)
    expect(data).toEqual(mockByEmployee)
  })

  it('exposes the aggregated employees when data is available', () => {
    vi.mocked(useSWR).mockReturnValueOnce({
      data: mockByEmployee,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useCommissionsByEmployee({ startDate: '2026-07-01', endDate: '2026-07-31' }))

    expect(result.current.employees).toHaveLength(1)
    expect(result.current.employees[0].userName).toBe('Juan Perez')
  })
})
