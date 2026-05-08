// SystemHealth Module Types - Aligned with Backend API

export type HealthStatus = 'healthy' | 'warning' | 'critical'
export type PingStatus = 'ok' | 'error'

// Health Check interfaces
export interface HealthCheck {
  status: HealthStatus
  message: string
  responseTimeMs?: number
  driver?: string
  error?: string
}

export interface QueueCheck extends HealthCheck {
  pendingJobs: number
  failedJobs: number
}

export interface StorageCheck extends HealthCheck {
  totalGb: number
  usedGb: number
  freeGb: number
  usedPercent: number
}

export interface CacheCheck extends HealthCheck {
  driver: string
}

// Database metrics
export interface TableInfo {
  name: string
  rows: number
  sizeMb: number
}

export interface DatabaseMetrics {
  driver: string
  database: string
  totalSizeMb: string
  topTables: TableInfo[]
}

export interface DatabaseHealth {
  connection: HealthCheck
  metrics: DatabaseMetrics
}

// Application metrics
export interface ApplicationMetrics {
  users: number
  products: number
  salesOrders: number
  purchaseOrders: number
  contacts: number
  activityLast24h: number
  totalActivityLogs: number
}

// Error metrics
export interface ExceptionInfo {
  id: string
  timestamp: string
  class: string
  message: string | null
  file: string | null
  line: number | null
}

export interface ErrorMetrics {
  recentExceptions: ExceptionInfo[]
  last24hCounts: Record<string, number>
  totalExceptionsLast24h: number
}

// Full health status response
export interface SystemHealthStatus {
  status: HealthStatus
  timestamp: string
  environment: string
  checks: {
    database: HealthCheck
    cache: CacheCheck
    queue: QueueCheck
    storage: StorageCheck
  }
  metrics: {
    database: DatabaseMetrics
    application: ApplicationMetrics
    errors: ErrorMetrics
  }
}

// Ping response
export interface PingResponse {
  status: PingStatus
  timestamp: string
}

// Status colors for UI
export const STATUS_COLORS: Record<HealthStatus | PingStatus, string> = {
  healthy: 'success',
  ok: 'success',
  warning: 'warning',
  critical: 'danger',
  error: 'danger',
}

// Status icons
export const STATUS_ICONS: Record<HealthStatus | PingStatus, string> = {
  healthy: 'bi-check-circle-fill',
  ok: 'bi-check-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  critical: 'bi-x-circle-fill',
  error: 'bi-x-circle-fill',
}

// Status labels
export const STATUS_LABELS: Record<HealthStatus | PingStatus, string> = {
  healthy: 'Saludable',
  ok: 'OK',
  warning: 'Advertencia',
  critical: 'Critico',
  error: 'Error',
}

/**
 * Get Bootstrap color class for status
 */
export function getStatusColorClass(status: HealthStatus | PingStatus): string {
  const colorMap: Record<string, string> = {
    healthy: 'text-success',
    ok: 'text-success',
    warning: 'text-warning',
    critical: 'text-danger',
    error: 'text-danger',
  }
  return colorMap[status] || 'text-secondary'
}

/**
 * Get Bootstrap badge class for status
 */
export function getStatusBadgeClass(status: HealthStatus | PingStatus): string {
  const colorMap: Record<string, string> = {
    healthy: 'bg-success',
    ok: 'bg-success',
    warning: 'bg-warning',
    critical: 'bg-danger',
    error: 'bg-danger',
  }
  return colorMap[status] || 'bg-secondary'
}
