/**
 * useQuotes Hook - SA-M004
 *
 * React Query hooks for quote operations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteService, quoteItemService } from '../services'
import type {
  Quote,
  QuoteItem,
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

// Query keys
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters?: QuoteFilters, sort?: QuoteSortOptions, page?: number) =>
    [...quoteKeys.lists(), { filters, sort, page }] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
  expiringSoon: (days: number) => [...quoteKeys.all, 'expiring-soon', days] as const,
  summary: () => [...quoteKeys.all, 'summary'] as const,
  items: (quoteId: string) => [...quoteKeys.all, 'items', quoteId] as const
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
  return useQuery({
    queryKey: quoteKeys.list(filters, sort, page),
    queryFn: () => quoteService.getAll(filters, sort, page, pageSize)
  })
}

/**
 * Hook to fetch single quote by ID
 */
export function useQuote(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: () => quoteService.getById(id),
    enabled: options?.enabled !== false && !!id
  })
}

/**
 * Hook to fetch quotes expiring soon
 */
export function useExpiringSoonQuotes(days: number = 7) {
  return useQuery({
    queryKey: quoteKeys.expiringSoon(days),
    queryFn: () => quoteService.getExpiringSoon(days)
  })
}

/**
 * Hook to fetch quote summary/statistics
 */
export function useQuoteSummary() {
  return useQuery({
    queryKey: quoteKeys.summary(),
    queryFn: () => quoteService.getSummary()
  })
}

/**
 * Hook to fetch quote items
 */
export function useQuoteItems(quoteId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quoteKeys.items(quoteId),
    queryFn: () => quoteItemService.getByQuoteId(quoteId),
    enabled: options?.enabled !== false && !!quoteId
  })
}

/**
 * Hook for quote mutations (create, update, delete, actions)
 */
export function useQuoteMutations() {
  const queryClient = useQueryClient()

  const invalidateQuotes = () => {
    queryClient.invalidateQueries({ queryKey: quoteKeys.all })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateQuoteRequest) => quoteService.create(data),
    onSuccess: invalidateQuotes
  })

  const createFromCartMutation = useMutation({
    mutationFn: (data: CreateQuoteFromCartRequest) => quoteService.createFromCart(data),
    onSuccess: invalidateQuotes
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteRequest }) =>
      quoteService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) })
      invalidateQuotes()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quoteService.delete(id),
    onSuccess: invalidateQuotes
  })

  const sendMutation = useMutation({
    mutationFn: (id: string) => quoteService.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) })
      invalidateQuotes()
    }
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => quoteService.accept(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) })
      invalidateQuotes()
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: RejectQuoteRequest }) =>
      quoteService.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) })
      invalidateQuotes()
    }
  })

  const convertMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ConvertQuoteRequest }) =>
      quoteService.convert(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) })
      invalidateQuotes()
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => quoteService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) })
      invalidateQuotes()
    }
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => quoteService.duplicate(id),
    onSuccess: invalidateQuotes
  })

  return {
    create: createMutation,
    createFromCart: createFromCartMutation,
    update: updateMutation,
    delete: deleteMutation,
    send: sendMutation,
    accept: acceptMutation,
    reject: rejectMutation,
    convert: convertMutation,
    cancel: cancelMutation,
    duplicate: duplicateMutation
  }
}

/**
 * Hook for quote item mutations
 */
export function useQuoteItemMutations(quoteId: string) {
  const queryClient = useQueryClient()

  const invalidateItems = () => {
    queryClient.invalidateQueries({ queryKey: quoteKeys.items(quoteId) })
    queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateQuoteItemRequest) => quoteItemService.create(data),
    onSuccess: invalidateItems
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteItemRequest }) =>
      quoteItemService.update(id, data),
    onSuccess: invalidateItems
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quoteItemService.delete(id),
    onSuccess: invalidateItems
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: (items: Array<{ id: string; data: UpdateQuoteItemRequest }>) =>
      quoteItemService.bulkUpdate(items),
    onSuccess: invalidateItems
  })

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    bulkUpdate: bulkUpdateMutation
  }
}
