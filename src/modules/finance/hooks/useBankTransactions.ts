/**
 * useBankTransactions Hook
 *
 * SWR hook for fetching bank transactions list with filtering, sorting, and pagination.
 */

'use client'

import useSWR from 'swr'
import { bankTransactionsService } from '../services'
import type { BankTransactionFilters, BankTransactionSortOptions, UseBankTransactionsResult } from '../types'

interface UseBankTransactionsParams {
  filters?: BankTransactionFilters
  sort?: BankTransactionSortOptions
  page?: number
  pageSize?: number
  enabled?: boolean
}

export function useBankTransactions({
  filters,
  sort,
  page = 1,
  pageSize = 20,
  enabled = true,
}: UseBankTransactionsParams = {}): UseBankTransactionsResult {
  // Build SWR key based on parameters
  const swrKey = enabled
    ? ['bank-transactions', JSON.stringify(filters), JSON.stringify(sort), page, pageSize]
    : null

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => bankTransactionsService.getAll(filters, sort, page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    bankTransactions: data?.data || [],
    meta: data?.meta
      ? {
          currentPage: data.meta.currentPage || page,
          perPage: data.meta.perPage || pageSize,
          total: data.meta.total || 0,
          lastPage: data.meta.lastPage || 1,
        }
      : undefined,
    isLoading,
    error: error || null,
    mutate,
  }
}
