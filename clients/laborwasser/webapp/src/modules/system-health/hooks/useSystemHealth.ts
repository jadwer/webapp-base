import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { systemHealthService } from '../services/systemHealthService'
import type {
  SystemHealthStatus,
  PingResponse,
  DatabaseHealth,
  StorageCheck,
  QueueCheck,
  ErrorMetrics,
  ApplicationMetrics,
} from '../types'

/**
 * Hook to track page visibility (pauses polling when tab is hidden)
 */
function usePageVisible() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const handler = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])
  return visible
}

/**
 * Hook for full system health status with auto-refresh
 */
export function useSystemHealth(refreshInterval: number = 30000) {
  const isVisible = usePageVisible()
  const { data, error, isLoading, mutate } = useSWR<SystemHealthStatus>(
    'system-health-full',
    () => systemHealthService.getFullStatus(),
    {
      revalidateOnFocus: false,
      refreshInterval: isVisible ? refreshInterval : 0,
      dedupingInterval: 5000,
    }
  )

  return {
    health: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}

/**
 * Hook for ping endpoint (public, no auth)
 */
export function usePing(refreshInterval: number = 10000) {
  const { data, error, isLoading, mutate } = useSWR<PingResponse>(
    'system-health-ping',
    () => systemHealthService.ping(),
    {
      revalidateOnFocus: false,
      refreshInterval,
      dedupingInterval: 5000,
    }
  )

  return {
    ping: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}

/**
 * Hook for database health
 */
export function useDatabaseHealth(refreshInterval: number = 30000) {
  const { data, error, isLoading, mutate } = useSWR<DatabaseHealth>(
    'system-health-database',
    () => systemHealthService.getDatabaseHealth(),
    {
      revalidateOnFocus: false,
      refreshInterval,
      dedupingInterval: 5000,
    }
  )

  return {
    database: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}

/**
 * Hook for storage health
 */
export function useStorageHealth(refreshInterval: number = 60000) {
  const { data, error, isLoading, mutate } = useSWR<StorageCheck>(
    'system-health-storage',
    () => systemHealthService.getStorageHealth(),
    {
      revalidateOnFocus: false,
      refreshInterval,
      dedupingInterval: 5000,
    }
  )

  return {
    storage: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}

/**
 * Hook for queue health
 */
export function useQueueHealth(refreshInterval: number = 15000) {
  const { data, error, isLoading, mutate } = useSWR<QueueCheck>(
    'system-health-queue',
    () => systemHealthService.getQueueHealth(),
    {
      revalidateOnFocus: false,
      refreshInterval,
      dedupingInterval: 5000,
    }
  )

  return {
    queue: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}

/**
 * Hook for error logs
 */
export function useErrorLogs(refreshInterval: number = 30000) {
  const { data, error, isLoading, mutate } = useSWR<ErrorMetrics>(
    'system-health-errors',
    () => systemHealthService.getErrorLogs(),
    {
      revalidateOnFocus: false,
      refreshInterval,
      dedupingInterval: 5000,
    }
  )

  return {
    errors: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}

/**
 * Hook for application metrics
 */
export function useApplicationMetrics(refreshInterval: number = 60000) {
  const { data, error, isLoading, mutate } = useSWR<ApplicationMetrics>(
    'system-health-metrics',
    () => systemHealthService.getApplicationMetrics(),
    {
      revalidateOnFocus: false,
      refreshInterval,
      dedupingInterval: 5000,
    }
  )

  return {
    metrics: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    refresh: mutate,
  }
}
