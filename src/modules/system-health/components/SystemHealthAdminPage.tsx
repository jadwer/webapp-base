'use client'

import { useSystemHealth } from '../hooks/useSystemHealth'
import { StatusBadge } from './StatusBadge'
import { HealthCheckCard } from './HealthCheckCard'
import { DatabaseMetricsTable } from './DatabaseMetricsTable'
import { ApplicationMetricsGrid } from './ApplicationMetricsGrid'
import { RecentErrorsList } from './RecentErrorsList'
import { Button } from '@/ui/components/base'
import type {
  HealthCheck,
  CacheCheck,
  QueueCheck,
  StorageCheck,
  DatabaseMetrics,
  ApplicationMetrics,
  ErrorMetrics,
} from '../types'

// Default values for when API returns incomplete data
const defaultHealthCheck: HealthCheck = {
  status: 'warning',
  message: 'No disponible',
}

const defaultCacheCheck: CacheCheck = {
  ...defaultHealthCheck,
  driver: 'unknown',
}

const defaultQueueCheck: QueueCheck = {
  ...defaultHealthCheck,
  pendingJobs: 0,
  failedJobs: 0,
}

const defaultStorageCheck: StorageCheck = {
  ...defaultHealthCheck,
  totalGb: 0,
  usedGb: 0,
  freeGb: 0,
  usedPercent: 0,
}

const defaultDatabaseMetrics: DatabaseMetrics = {
  driver: 'unknown',
  database: 'unknown',
  totalSizeMb: '0',
  topTables: [],
}

const defaultApplicationMetrics: ApplicationMetrics = {
  users: 0,
  products: 0,
  salesOrders: 0,
  purchaseOrders: 0,
  contacts: 0,
  activityLast24h: 0,
  totalActivityLogs: 0,
}

const defaultErrorMetrics: ErrorMetrics = {
  recentExceptions: [],
  last24hCounts: {},
  totalExceptionsLast24h: 0,
}

export function SystemHealthAdminPage() {
  const { health, isLoading, isError, error, refresh } = useSystemHealth(30000)

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando estado del sistema...</span>
          </div>
          <p className="mt-3 text-muted">Cargando estado del sistema...</p>
        </div>
      </div>
    )
  }

  if (isError || !health) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <div>
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            Error al cargar el estado del sistema: {error?.message || 'Error desconocido'}
          </div>
          <Button variant="danger" size="small" onClick={() => refresh()}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Safely extract data with defaults
  const checks = health.checks || {}
  const metrics = health.metrics || {}

  const databaseCheck = checks.database || defaultHealthCheck
  const cacheCheck = checks.cache || defaultCacheCheck
  const queueCheck = checks.queue || defaultQueueCheck
  const storageCheck = checks.storage || defaultStorageCheck

  const databaseMetrics = metrics.database || defaultDatabaseMetrics
  const applicationMetrics = metrics.application || defaultApplicationMetrics
  const errorMetrics = metrics.errors || defaultErrorMetrics

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-heart-pulse me-2" aria-hidden="true" />
            Estado del Sistema
          </h1>
          <p className="text-muted mb-0">
            Monitoreo en tiempo real del estado de la aplicacion
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <StatusBadge status={health.status || 'warning'} size="lg" />
          <div className="text-end">
            <small className="text-muted d-block">
              Entorno: <strong>{health.environment || 'unknown'}</strong>
            </small>
            <small className="text-muted d-block">
              Actualizado:{' '}
              {health.timestamp
                ? new Date(health.timestamp).toLocaleTimeString('es-MX')
                : 'N/A'}
            </small>
          </div>
          <Button variant="secondary" size="small" onClick={() => refresh()}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Health Checks Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard title="Base de Datos" icon="bi-database" check={databaseCheck} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard title="Cache" icon="bi-lightning" check={cacheCheck} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard title="Cola de Trabajos" icon="bi-list-task" check={queueCheck} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard title="Almacenamiento" icon="bi-hdd" check={storageCheck} />
        </div>
      </div>

      {/* Application Metrics */}
      <div className="mb-4">
        <ApplicationMetricsGrid metrics={applicationMetrics} />
      </div>

      {/* Two columns: Database Metrics and Errors */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <DatabaseMetricsTable metrics={databaseMetrics} />
        </div>
        <div className="col-12 col-lg-5">
          <RecentErrorsList errors={errorMetrics} />
        </div>
      </div>
    </div>
  )
}

export default SystemHealthAdminPage
