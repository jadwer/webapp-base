import useSWR from 'swr'
import { auditService } from '../services/auditService'
import type { Audit, AuditFilters } from '../types'

interface UseAuditsOptions {
  filters?: AuditFilters
  sort?: string
  page?: number
  pageSize?: number
}

interface UseAuditsReturn {
  audits: Audit[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  mutate: () => void
  meta?: {
    page?: {
      currentPage: number
      lastPage: number
      perPage: number
      total: number
    }
  }
}

/**
 * Hook to fetch audits with filters
 */
export function useAudits(options: UseAuditsOptions = {}): UseAuditsReturn {
  const { filters, sort = '-createdAt', page, pageSize } = options

  // Build cache key
  const cacheKey = [
    'audits',
    JSON.stringify(filters),
    sort,
    page,
    pageSize,
  ].join('|')

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => auditService.getAll(filters, sort, page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    audits: data?.audits ?? [],
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
    meta: data?.meta,
  }
}

/**
 * Hook to fetch a single audit
 */
export function useAudit(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `audit-${id}` : null,
    () => (id ? auditService.getById(id) : null),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    audit: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
  }
}

/**
 * Hook to fetch recent audits for dashboard
 */
export function useRecentAudits(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `audits-recent-${limit}`,
    () => auditService.getRecent(limit),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    audits: data ?? [],
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
  }
}

/**
 * Hook to fetch entity history
 */
export function useEntityHistory(auditableType: string | null, auditableId: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    auditableType && auditableId ? `audit-entity-${auditableType}-${auditableId}` : null,
    () =>
      auditableType && auditableId
        ? auditService.getByEntity(auditableType, auditableId)
        : null,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    history: data ?? [],
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
  }
}

/**
 * Hook to fetch user activity
 */
export function useUserActivity(userId: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `audit-user-${userId}` : null,
    () => (userId ? auditService.getByUser(userId) : null),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    activity: data ?? [],
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
  }
}

/**
 * Hook to fetch login history
 */
export function useLoginHistory(userId: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `audit-login-${userId}` : null,
    () => (userId ? auditService.getLoginHistory(userId) : null),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    loginHistory: data ?? [],
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
  }
}
