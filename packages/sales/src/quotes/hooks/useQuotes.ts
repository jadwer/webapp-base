/**
 * useQuotes Hook - SA-M004
 *
 * SWR hooks for quote operations.
 */

'use client'

import useSWR, { mutate } from 'swr'
import { useState, useCallback } from 'react'
import { quoteService, quoteItemService } from '../services'
import type {
  QuoteFilters,
  QuoteSortOptions,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  CreateQuoteFromCartRequest,
  CreateQuoteItemRequest,
  UpdateQuoteItemRequest,
  ConvertQuoteRequest,
  RejectQuoteRequest
} from '../types'

// SWR key generators
const quoteKeys = {
  all: 'quotes',
  list: (filters?: QuoteFilters, sort?: QuoteSortOptions, page?: number) =>
    `quotes-list-${JSON.stringify({ filters, sort, page })}`,
  detail: (id: string) => `quotes-detail-${id}`,
  expiringSoon: (days: number) => `quotes-expiring-${days}`,
  summary: () => 'quotes-summary',
  items: (quoteId: string) => `quotes-items-${quoteId}`
}

/**
 * Hook to fetch paginated list of quotes
 */
export function useQuotes(
  filters?: QuoteFilters,
  sort?: QuoteSortOptions,
  page?: number,
  pageSize?: number
) {
  return useSWR(
    quoteKeys.list(filters, sort, page),
    () => quoteService.getAll(filters, sort, page, pageSize)
  )
}

/**
 * Hook to fetch single quote by ID
 */
export function useQuote(id: string, options?: { enabled?: boolean }) {
  const shouldFetch = options?.enabled !== false && !!id
  return useSWR(
    shouldFetch ? quoteKeys.detail(id) : null,
    () => quoteService.getById(id)
  )
}

/**
 * Hook to fetch quotes expiring soon
 */
export function useExpiringSoonQuotes(days: number = 7) {
  return useSWR(
    quoteKeys.expiringSoon(days),
    () => quoteService.getExpiringSoon(days)
  )
}

/**
 * Hook to fetch quote summary/statistics
 */
export function useQuoteSummary() {
  return useSWR(
    quoteKeys.summary(),
    () => quoteService.getSummary()
  )
}

/**
 * Hook to fetch quote items
 */
export function useQuoteItems(quoteId: string, options?: { enabled?: boolean }) {
  const shouldFetch = options?.enabled !== false && !!quoteId
  return useSWR(
    shouldFetch ? quoteKeys.items(quoteId) : null,
    () => quoteItemService.getByQuoteId(quoteId)
  )
}

/**
 * Hook for quote mutations (create, update, delete, actions)
 */
export function useQuoteMutations() {
  const [isLoading, setIsLoading] = useState(false)

  const invalidateQuotes = useCallback(() => {
    // Revalidate all quote-related keys
    mutate((key: string) => typeof key === 'string' && key.startsWith('quotes'), undefined, { revalidate: true })
  }, [])

  const createMutation = useCallback(async (data: CreateQuoteRequest) => {
    setIsLoading(true)
    try {
      const result = await quoteService.create(data)
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const createFromCartMutation = useCallback(async (data: CreateQuoteFromCartRequest) => {
    setIsLoading(true)
    try {
      const result = await quoteService.createFromCart(data)
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const updateMutation = useCallback(async ({ id, data }: { id: string; data: UpdateQuoteRequest }) => {
    setIsLoading(true)
    try {
      const result = await quoteService.update(id, data)
      mutate(quoteKeys.detail(id))
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const deleteMutation = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      await quoteService.delete(id)
      invalidateQuotes()
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const sendMutation = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const result = await quoteService.send(id)
      mutate(quoteKeys.detail(id))
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const acceptMutation = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const result = await quoteService.accept(id)
      mutate(quoteKeys.detail(id))
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const rejectMutation = useCallback(async ({ id, data }: { id: string; data?: RejectQuoteRequest }) => {
    setIsLoading(true)
    try {
      const result = await quoteService.reject(id, data)
      mutate(quoteKeys.detail(id))
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const convertMutation = useCallback(async ({ id, data }: { id: string; data?: ConvertQuoteRequest }) => {
    setIsLoading(true)
    try {
      const result = await quoteService.convert(id, data)
      mutate(quoteKeys.detail(id))
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const cancelMutation = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const result = await quoteService.cancel(id)
      mutate(quoteKeys.detail(id))
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  const duplicateMutation = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const result = await quoteService.duplicate(id)
      invalidateQuotes()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateQuotes])

  // Return mutations with consistent interface (mutateAsync pattern)
  return {
    create: {
      mutateAsync: createMutation,
      isPending: isLoading
    },
    createFromCart: {
      mutateAsync: createFromCartMutation,
      isPending: isLoading
    },
    update: {
      mutateAsync: updateMutation,
      isPending: isLoading
    },
    delete: {
      mutateAsync: deleteMutation,
      isPending: isLoading
    },
    send: {
      mutateAsync: sendMutation,
      isPending: isLoading
    },
    accept: {
      mutateAsync: acceptMutation,
      isPending: isLoading
    },
    reject: {
      mutateAsync: rejectMutation,
      isPending: isLoading
    },
    convert: {
      mutateAsync: convertMutation,
      isPending: isLoading
    },
    cancel: {
      mutateAsync: cancelMutation,
      isPending: isLoading
    },
    duplicate: {
      mutateAsync: duplicateMutation,
      isPending: isLoading
    }
  }
}

/**
 * Hook for quote item mutations
 */
export function useQuoteItemMutations(quoteId: string) {
  const [isLoading, setIsLoading] = useState(false)

  const invalidateItems = useCallback(() => {
    mutate(quoteKeys.items(quoteId))
    mutate(quoteKeys.detail(quoteId))
  }, [quoteId])

  const createMutation = useCallback(async (data: CreateQuoteItemRequest) => {
    setIsLoading(true)
    try {
      const result = await quoteItemService.create(data)
      invalidateItems()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateItems])

  const updateMutation = useCallback(async ({ id, data }: { id: string; data: UpdateQuoteItemRequest }) => {
    setIsLoading(true)
    try {
      const result = await quoteItemService.update(id, data)
      invalidateItems()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateItems])

  const deleteMutation = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      await quoteItemService.delete(id)
      invalidateItems()
    } finally {
      setIsLoading(false)
    }
  }, [invalidateItems])

  const bulkUpdateMutation = useCallback(async (items: Array<{ id: string; data: UpdateQuoteItemRequest }>) => {
    setIsLoading(true)
    try {
      const result = await quoteItemService.bulkUpdate(items)
      invalidateItems()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [invalidateItems])

  return {
    create: {
      mutateAsync: createMutation,
      isPending: isLoading
    },
    update: {
      mutateAsync: updateMutation,
      isPending: isLoading
    },
    delete: {
      mutateAsync: deleteMutation,
      isPending: isLoading
    },
    bulkUpdate: {
      mutateAsync: bulkUpdateMutation,
      isPending: isLoading
    }
  }
}

// Export query keys for external usage
export { quoteKeys }
