'use client'

import type { ApplicationMetrics } from '../types'

interface ApplicationMetricsGridProps {
  metrics: ApplicationMetrics
}

interface MetricCardProps {
  label: string
  value: number
  icon: string
  color: string
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <div className="col-6 col-md-3">
      <div className={`card border-${color} h-100`}>
        <div className="card-body text-center">
          <i className={`bi ${icon} fs-3 text-${color} mb-2`} aria-hidden="true" />
          <h3 className="mb-0">{value.toLocaleString()}</h3>
          <p className="text-muted small mb-0">{label}</p>
        </div>
      </div>
    </div>
  )
}

export function ApplicationMetricsGrid({ metrics }: ApplicationMetricsGridProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-graph-up me-2" aria-hidden="true" />
          Metricas de Aplicacion
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <MetricCard
            label="Usuarios"
            value={metrics.users}
            icon="bi-people"
            color="primary"
          />
          <MetricCard
            label="Productos"
            value={metrics.products}
            icon="bi-box"
            color="success"
          />
          <MetricCard
            label="Ordenes de Venta"
            value={metrics.salesOrders}
            icon="bi-cart"
            color="info"
          />
          <MetricCard
            label="Ordenes de Compra"
            value={metrics.purchaseOrders}
            icon="bi-truck"
            color="warning"
          />
          <MetricCard
            label="Contactos"
            value={metrics.contacts}
            icon="bi-person-lines-fill"
            color="secondary"
          />
          <MetricCard
            label="Actividad (24h)"
            value={metrics.activityLast24h}
            icon="bi-activity"
            color="danger"
          />
          <MetricCard
            label="Total Auditorias"
            value={metrics.totalActivityLogs}
            icon="bi-journal-text"
            color="dark"
          />
        </div>
      </div>
    </div>
  )
}

export default ApplicationMetricsGrid
