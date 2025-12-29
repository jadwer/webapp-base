'use client'

import { useSystemHealth } from '../hooks/useSystemHealth'
import { StatusBadge } from './StatusBadge'

interface SystemHealthWidgetProps {
  refreshInterval?: number
}

/**
 * Compact widget for dashboard showing overall system status
 */
export function SystemHealthWidget({ refreshInterval = 30000 }: SystemHealthWidgetProps) {
  const { health, isLoading, isError } = useSystemHealth(refreshInterval)

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !health) {
    return (
      <div className="card border-danger">
        <div className="card-body text-center py-3">
          <i className="bi bi-exclamation-triangle text-danger me-2" aria-hidden="true" />
          <span className="text-danger">Error al cargar</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0">
          <i className="bi bi-heart-pulse me-2" aria-hidden="true" />
          Sistema
        </h6>
        <StatusBadge status={health.status} size="sm" />
      </div>
      <div className="card-body p-2">
        <div className="row g-2 text-center small">
          <div className="col-3">
            <i
              className={`bi ${health.checks.database.status === 'healthy' ? 'bi-database-check text-success' : 'bi-database-x text-danger'}`}
              aria-hidden="true"
            />
            <div className="text-muted">DB</div>
          </div>
          <div className="col-3">
            <i
              className={`bi ${health.checks.cache.status === 'healthy' ? 'bi-lightning-fill text-success' : 'bi-lightning text-danger'}`}
              aria-hidden="true"
            />
            <div className="text-muted">Cache</div>
          </div>
          <div className="col-3">
            <i
              className={`bi ${health.checks.queue.status === 'healthy' ? 'bi-list-check text-success' : 'bi-list-task text-danger'}`}
              aria-hidden="true"
            />
            <div className="text-muted">Cola</div>
          </div>
          <div className="col-3">
            <i
              className={`bi ${health.checks.storage.status === 'healthy' ? 'bi-hdd-fill text-success' : 'bi-hdd text-danger'}`}
              aria-hidden="true"
            />
            <div className="text-muted">Disco</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthWidget
