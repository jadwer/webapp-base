'use client'

import React from 'react'
import type { Audit } from '../types'
import {
  EVENT_LABELS,
  EVENT_COLORS,
  EVENT_ICONS,
  formatAuditableType,
} from '../types'

interface AuditTimelineProps {
  audits: Audit[]
  isLoading?: boolean
  showEntity?: boolean
  maxItems?: number
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return date.toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
  })
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getEventDescription(audit: Audit, showEntity: boolean): string {
  const event = audit.event
  const action = EVENT_LABELS[event] || event
  const entity = showEntity ? formatAuditableType(audit.auditableType) : ''
  const entityId = audit.auditableId ? ` #${audit.auditableId}` : ''

  if (event === 'login') return 'Inicio sesion'
  if (event === 'logout') return 'Cerro sesion'
  if (event === 'login_failed') return 'Fallo de login'

  if (entity) {
    return `${action} ${entity.toLowerCase()}${entityId}`
  }

  return action
}

export default function AuditTimeline({
  audits,
  isLoading,
  showEntity = true,
  maxItems,
}: AuditTimelineProps) {
  const displayAudits = maxItems ? audits.slice(0, maxItems) : audits

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <i className="bi bi-clock-history fs-3 d-block mb-2" />
        <small>Sin actividad reciente</small>
      </div>
    )
  }

  return (
    <div className="audit-timeline">
      {displayAudits.map((audit, index) => {
        const event = audit.event
        const color = EVENT_COLORS[event] || 'secondary'
        const icon = EVENT_ICONS[event] || 'bi-circle'

        return (
          <div
            key={audit.id}
            className={`d-flex ${index !== displayAudits.length - 1 ? 'mb-3' : ''}`}
          >
            {/* Timeline indicator */}
            <div className="flex-shrink-0 me-3 position-relative">
              <div
                className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center`}
                style={{ width: '32px', height: '32px' }}
              >
                <i className={`bi ${icon} text-white small`} />
              </div>
              {index !== displayAudits.length - 1 && (
                <div
                  className="position-absolute bg-light"
                  style={{
                    width: '2px',
                    height: 'calc(100% + 12px)',
                    left: '15px',
                    top: '32px',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-grow-1 pb-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-0 fw-medium">
                    {getEventDescription(audit, showEntity)}
                  </p>
                  <small className="text-muted">
                    {audit.userId ? `Usuario #${audit.userId}` : 'Sistema'}
                  </small>
                </div>
                <small
                  className="text-muted flex-shrink-0 ms-2"
                  title={formatFullDate(audit.createdAt)}
                >
                  {formatTimeAgo(audit.createdAt)}
                </small>
              </div>
            </div>
          </div>
        )
      })}

      {maxItems && audits.length > maxItems && (
        <div className="text-center mt-2">
          <small className="text-muted">
            +{audits.length - maxItems} acciones mas
          </small>
        </div>
      )}
    </div>
  )
}
