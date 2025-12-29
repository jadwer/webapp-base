'use client'

import { useSystemHealth } from '../hooks/useSystemHealth'
import { StatusBadge } from './StatusBadge'
import { HealthCheckCard } from './HealthCheckCard'
import { DatabaseMetricsTable } from './DatabaseMetricsTable'
import { ApplicationMetricsGrid } from './ApplicationMetricsGrid'
import { RecentErrorsList } from './RecentErrorsList'
import { Button } from '@/ui/components/base'

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
          <StatusBadge status={health.status} size="lg" />
          <div className="text-end">
            <small className="text-muted d-block">
              Entorno: <strong>{health.environment}</strong>
            </small>
            <small className="text-muted d-block">
              Actualizado: {new Date(health.timestamp).toLocaleTimeString('es-MX')}
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
          <HealthCheckCard
            title="Base de Datos"
            icon="bi-database"
            check={health.checks.database}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard
            title="Cache"
            icon="bi-lightning"
            check={health.checks.cache}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard
            title="Cola de Trabajos"
            icon="bi-list-task"
            check={health.checks.queue}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <HealthCheckCard
            title="Almacenamiento"
            icon="bi-hdd"
            check={health.checks.storage}
          />
        </div>
      </div>

      {/* Application Metrics */}
      <div className="mb-4">
        <ApplicationMetricsGrid metrics={health.metrics.application} />
      </div>

      {/* Two columns: Database Metrics and Errors */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <DatabaseMetricsTable metrics={health.metrics.database} />
        </div>
        <div className="col-12 col-lg-5">
          <RecentErrorsList errors={health.metrics.errors} />
        </div>
      </div>
    </div>
  )
}

export default SystemHealthAdminPage
