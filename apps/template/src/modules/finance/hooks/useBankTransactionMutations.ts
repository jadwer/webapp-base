/**
 * useBankTransactionMutations Hook
 *
 * Hook for bank transaction CRUD mutations with SWR cache invalidation.
 */

'use client'

import { useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { bankTransactionsService } from '../services'
import type {
  CreateBankTransactionRequest,
  UpdateBankTransactionRequest,
  UseBankTransactionMutationsResult,
  ParsedBankTransaction,
} from '../types'

export function useBankTransactionMutations(): UseBankTransactionMutationsResult {
  const [isLoading, setIsLoading] = useState(false)
  const { mutate: globalMutate } = useSWRConfig()

  const invalidateCache = useCallback(() => {
    // Invalidate all bank transactions queries
    globalMutate(
      (key: unknown) =>
        Array.isArray(key) && key[0] === 'bank-transactions',
      undefined,
      { revalidate: true }
    )
  }, [globalMutate])

  const createBankTransaction = useCallback(
    async (data: CreateBankTransactionRequest): Promise<ParsedBankTransaction> => {
      setIsLoading(true)
      try {
        const result = await bankTransactionsService.create(data)
        invalidateCache()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCache]
  )

  const updateBankTransaction = useCallback(
    async (id: string, data: UpdateBankTransactionRequest): Promise<ParsedBankTransaction> => {
      setIsLoading(true)
      try {
        const result = await bankTransactionsService.update(id, data)
        invalidateCache()
        // Also invalidate the specific transaction
        globalMutate(['bank-transaction', id])
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCache, globalMutate]
  )

  const deleteBankTransaction = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true)
      try {
        await bankTransactionsService.delete(id)
        invalidateCache()
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCache]
  )

  const reconcile = useCallback(
    async (id: string, notes?: string): Promise<ParsedBankTransaction> => {
      setIsLoading(true)
      try {
        const result = await bankTransactionsService.reconcile(id, notes)
        invalidateCache()
        globalMutate(['bank-transaction', id])
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCache, globalMutate]
  )

  const unreconcile = useCallback(
    async (id: string): Promise<ParsedBankTransaction> => {
      setIsLoading(true)
      try {
        const result = await bankTransactionsService.unreconcile(id)
        invalidateCache()
        globalMutate(['bank-transaction', id])
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [invalidateCache, globalMutate]
  )

  return {
    createBankTransaction,
    updateBankTransaction,
    deleteBankTransaction,
    reconcile,
    unreconcile,
    isLoading,
  }
}
