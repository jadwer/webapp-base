'use client'

import React from 'react'
import { useLoginHistory } from '../hooks/useAudits'
import { EVENT_COLORS, EVENT_ICONS, EVENT_LABELS } from '../types'

interface UserLoginHistoryProps {
  userId: string | number
  title?: string
  maxItems?: number
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Component to show login/logout/login_failed history for a specific user
 * Useful for security and monitoring
 */
export default function UserLoginHistory({
  userId,
  title = 'Historial de Sesiones',
  maxItems = 10,
}: UserLoginHistoryProps) {
  const { loginHistory, isLoading, isError } = useLoginHistory(userId)
  const displayHistory = maxItems ? loginHistory.slice(0, maxItems) : loginHistory

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2" />
        Error al cargar el historial de sesiones
      </div>
    )
  }

  return (
    <div className="user-login-history">
      <h6 className="mb-3">
        <i className="bi bi-shield-lock me-2" />
        {title}
      </h6>

      {displayHistory.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-clock-history fs-3 d-block mb-2" />
          <small>Sin historial de sesiones</small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="table-light">
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((audit) => {
                const event = audit.event
                const color = EVENT_COLORS[event] || 'secondary'
                const icon = EVENT_ICONS[event] || 'bi-circle'
                const label = EVENT_LABELS[event] || event

                return (
                  <tr key={audit.id}>
                    <td>
                      <span className={`badge bg-${color}`}>
                        <i className={`bi ${icon} me-1`} />
                        {label}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(audit.createdAt)}
                      </small>
                    </td>
                    <td>
                      <code className="small">
                        {audit.ipAddress || '-'}
                      </code>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {maxItems && loginHistory.length > maxItems && (
        <div className="text-center mt-2">
          <small className="text-muted">
            +{loginHistory.length - maxItems} registros mas
          </small>
        </div>
      )}
    </div>
  )
}
