'use client'

import React from 'react'
import type { Audit, FieldChange } from '../types'
import {
  EVENT_LABELS,
  EVENT_COLORS,
  EVENT_ICONS,
  formatAuditableType,
} from '../types'

interface AuditDetailProps {
  audit: Audit
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function PropertyDiff({ change }: { change: FieldChange }) {
  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return 'null'
    if (typeof val === 'object') return JSON.stringify(val, null, 2)
    if (typeof val === 'boolean') return val ? 'true' : 'false'
    return String(val)
  }

  return (
    <div className="mb-3">
      <div className="fw-medium text-muted small mb-1">{change.field}</div>
      <div className="row g-2">
        {change.oldValue !== undefined && change.oldValue !== null && (
          <div className="col-md-6">
            <div className="bg-danger-subtle p-2 rounded small">
              <i className="bi bi-dash-circle text-danger me-1" />
              <code className="text-danger">{formatValue(change.oldValue)}</code>
            </div>
          </div>
        )}
        {change.newValue !== undefined && change.newValue !== null && (
          <div className="col-md-6">
            <div className="bg-success-subtle p-2 rounded small">
              <i className="bi bi-plus-circle text-success me-1" />
              <code className="text-success">{formatValue(change.newValue)}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuditDetail({ audit }: AuditDetailProps) {
  const event = audit.event
  const color = EVENT_COLORS[event] || 'secondary'
  const icon = EVENT_ICONS[event] || 'bi-circle'
  const label = EVENT_LABELS[event] || event

  return (
    <div className="audit-detail">
      {/* Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-4">
            <div
              className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center me-3`}
              style={{ width: '48px', height: '48px' }}
            >
              <i className={`bi ${icon} text-white fs-5`} />
            </div>
            <div>
              <h5 className="mb-0">
                <span className={`badge bg-${color} me-2`}>{label}</span>
                {formatAuditableType(audit.auditableType)}
                {audit.auditableId && (
                  <span className="text-muted fw-normal ms-2">
                    #{audit.auditableId}
                  </span>
                )}
              </h5>
              <small className="text-muted">
                <i className="bi bi-clock me-1" />
                {formatDate(audit.createdAt)}
              </small>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="text-muted mb-2">
                <i className="bi bi-person me-1" />
                Usuario
              </h6>
              {audit.userId ? (
                <span>Usuario #{audit.userId}</span>
              ) : (
                <span className="text-muted">Sistema</span>
              )}
            </div>

            <div className="col-md-6">
              <h6 className="text-muted mb-2">
                <i className="bi bi-tag me-1" />
                Tipo de Entidad
              </h6>
              <code className="small">{audit.auditableType || 'N/A'}</code>
            </div>

            {audit.ipAddress && (
              <div className="col-md-6">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-globe me-1" />
                  Direccion IP
                </h6>
                <code>{audit.ipAddress}</code>
              </div>
            )}

            {audit.userAgent && (
              <div className="col-md-6">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-laptop me-1" />
                  Navegador
                </h6>
                <small className="text-muted">
                  {audit.userAgent.substring(0, 100)}...
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Changes */}
      {audit.changes.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="bi bi-journal-text me-2" />
              Cambios Realizados ({audit.changes.length})
            </h6>
          </div>
          <div className="card-body">
            {audit.changes.map((change, index) => (
              <PropertyDiff key={index} change={change} />
            ))}
          </div>
        </div>
      )}

      {/* Raw Values (for audits without computed changes) */}
      {audit.changes.length === 0 && (audit.oldValues || audit.newValues) && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="bi bi-code me-2" />
              Datos del Registro
            </h6>
          </div>
          <div className="card-body">
            {audit.oldValues && (
              <div className="mb-3">
                <h6 className="text-muted small">Valores Anteriores:</h6>
                <pre className="bg-danger-subtle p-3 rounded small mb-0">
                  {JSON.stringify(audit.oldValues, null, 2)}
                </pre>
              </div>
            )}
            {audit.newValues && (
              <div>
                <h6 className="text-muted small">Valores Nuevos:</h6>
                <pre className="bg-success-subtle p-3 rounded small mb-0">
                  {JSON.stringify(audit.newValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
