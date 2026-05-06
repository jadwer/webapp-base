'use client'

import type { ErrorMetrics } from '../types'

interface RecentErrorsListProps {
  errors: ErrorMetrics
}

/**
 * Parse exception class name for display
 */
function formatExceptionClass(className: string): string {
  const parts = className.split('\\')
  return parts[parts.length - 1]
}

export function RecentErrorsList({ errors }: RecentErrorsListProps) {
  if (errors.totalExceptionsLast24h === 0) {
    return (
      <div className="card border-success">
        <div className="card-body text-center py-4">
          <i className="bi bi-check-circle-fill text-success fs-1 mb-2" aria-hidden="true" />
          <h6 className="text-success mb-0">Sin errores en las ultimas 24 horas</h6>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-danger">
      <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
          Errores Recientes
        </h6>
        <span className="badge bg-white text-danger">
          {errors.totalExceptionsLast24h} en 24h
        </span>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {errors.recentExceptions.slice(0, 10).map((exception) => (
            <div key={exception.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <code className="text-danger small">
                  {formatExceptionClass(exception.class)}
                </code>
                <small className="text-muted">{exception.timestamp}</small>
              </div>
              {exception.message && (
                <p className="mb-1 small text-truncate" title={exception.message}>
                  {exception.message}
                </p>
              )}
              {exception.file && (
                <small className="text-muted d-block text-truncate">
                  <i className="bi bi-file-code me-1" aria-hidden="true" />
                  {exception.file}:{exception.line}
                </small>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer text-muted small">
        <div className="d-flex flex-wrap gap-2">
          {Object.entries(errors.last24hCounts).map(([type, count]) => (
            <span key={type} className="badge bg-secondary">
              {type}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RecentErrorsList
