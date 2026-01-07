/**
 * useBankTransaction Hook
 *
 * SWR hook for fetching a single bank transaction with caching and error handling.
 */

'use client'

import useSWR from 'swr'
import { bankTransactionsService } from '../services'
import type { UseBankTransactionResult } from '../types'

interface UseBankTransactionParams {
  id?: string
  enabled?: boolean
}

export function useBankTransaction({
  id,
  enabled = true,
}: UseBankTransactionParams = {}): UseBankTransactionResult {
  const shouldFetch = enabled && !!id

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['bank-transaction', id] : null,
    () => bankTransactionsService.getById(id!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    bankTransaction: data,
    isLoading,
    error: error || null,
    mutate,
  }
}
