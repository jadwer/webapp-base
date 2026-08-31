/**
 * Commissions Module - SWR Hooks
 */

'use client'

import { useCallback, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { commissionsService } from '../services'
import { appSettingsService } from '@lwm/app-config'
import type {
  CommissionListFilters,
  CommissionListResult,
  CommissionByPeriodFilters,
  CommissionByPeriodResult,
  CommissionByEmployeeFilters,
  CommissionByEmployeeResult,
  CommissionsSettings,
  PayBatchPayload,
} from '../types'

const CACHE_PREFIX = 'commissions'

/**
 * Paginated commissions list (JSON:API index), used by the main dashboard
 * table when no explicit period report is requested.
 */
export function useCommissions(filters: CommissionListFilters = {}) {
  const key = [CACHE_PREFIX, 'list', filters]
  const { data, error, isLoading, mutate } = useSWR<CommissionListResult>(
    key,
    () => commissionsService.getAll(filters),
    { keepPreviousData: true, revalidateOnFocus: false }
  )

  return {
    commissions: data?.commissions ?? [],
    meta: data?.meta ?? null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Commissions filtered by earned_at period (custom endpoint), the primary
 * data source for the commissions dashboard filter bar.
 */
export function useCommissionsByPeriod(filters: CommissionByPeriodFilters = {}) {
  const key = [CACHE_PREFIX, 'by-period', filters]
  const { data, error, isLoading, mutate } = useSWR<CommissionByPeriodResult>(
    key,
    () => commissionsService.getByPeriod(filters),
    { keepPreviousData: true, revalidateOnFocus: false }
  )

  return {
    commissions: data?.commissions ?? [],
    count: data?.count ?? 0,
    totalCommissionAmount: data?.totalCommissionAmount ?? 0,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Aggregate per-salesperson report (custom endpoint).
 */
export function useCommissionsByEmployee(filters: CommissionByEmployeeFilters = {}) {
  const key = [CACHE_PREFIX, 'by-employee', filters]
  const { data, error, isLoading, mutate } = useSWR<CommissionByEmployeeResult>(
    key,
    () => commissionsService.getByEmployee(filters),
    { keepPreviousData: true, revalidateOnFocus: false }
  )

  return {
    employees: data?.employees ?? [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Payout mutations: mark a single commission as paid, or pay a batch.
 * Invalidates every cached commissions query on success.
 */
export function useCommissionMutations() {
  const { mutate: globalMutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)

  const invalidateCommissionCaches = useCallback(() => {
    globalMutate(
      (key) => Array.isArray(key) && key[0] === CACHE_PREFIX,
      undefined,
      { revalidate: true }
    )
  }, [globalMutate])

  const markPaid = useCallback(
    async (id: string, paymentReference: string) => {
      setIsLoading(true)
      try {
        const result = await commissionsService.markPaid(id, paymentReference)
        invalidateCommissionCaches()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCommissionCaches]
  )

  const payBatch = useCallback(
    async (payload: PayBatchPayload) => {
      setIsLoading(true)
      try {
        const result = await commissionsService.payBatch(payload)
        invalidateCommissionCaches()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCommissionCaches]
  )

  return { markPaid, payBatch, isLoading }
}

/**
 * AppSettings for the "commissions" group (enabled, default_pct, basis,
 * payout_period). Admin-only card in the dashboard page reads/writes these.
 */
export function useCommissionsSettings() {
  const key = [CACHE_PREFIX, 'settings']
  const { data, error, isLoading, mutate } = useSWR<CommissionsSettings>(
    key,
    async () => {
      const group = await appSettingsService.getByGroup('commissions')
      return {
        enabled: group['commissions.enabled']?.value === true || group['commissions.enabled']?.value === 'true',
        defaultPct: Number(group['commissions.default_pct']?.value ?? 0),
        basis: String(group['commissions.basis']?.value ?? 'collected'),
        payoutPeriod: String(group['commissions.payout_period']?.value ?? 'monthly'),
      }
    },
    { revalidateOnFocus: false }
  )

  const updateSetting = useCallback(
    async (key: 'commissions.enabled' | 'commissions.default_pct' | 'commissions.basis' | 'commissions.payout_period', value: string | boolean) => {
      await appSettingsService.update(key, value)
      await mutate()
    },
    [mutate]
  )

  return {
    settings: data ?? null,
    isLoading,
    error,
    updateSetting,
    mutate,
  }
}
