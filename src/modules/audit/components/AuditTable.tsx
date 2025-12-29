'use client'

import React from 'react'
import Link from 'next/link'
import type { Audit, AuditEvent } from '../types'
import {
  EVENT_LABELS,
  EVENT_COLORS,
  EVENT_ICONS,
  formatAuditableType,
} from '../types'

interface AuditTableProps {
  audits: Audit[]
  isLoading?: boolean
  onRowClick?: (audit: Audit) => void
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

function EventBadge({ event }: { event: AuditEvent }) {
  const color = EVENT_COLORS[event] || 'secondary'
  const icon = EVENT_ICONS[event] || 'bi-circle'
  const label = EVENT_LABELS[event] || event

  return (
    <span className={`badge bg-${color}`}>
      <i className={`bi ${icon} me-1`} />
      {label}
    </span>
  )
}

export default function AuditTable({
  audits,
  isLoading,
  onRowClick,
}: AuditTableProps) {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-clipboard-x fs-1 d-block mb-3" />
        <p className="mb-0">No se encontraron registros de auditoria</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: '180px' }}>Fecha</th>
            <th style={{ width: '130px' }}>Evento</th>
            <th>Usuario</th>
            <th>Entidad</th>
            <th style={{ width: '100px' }}>ID</th>
            <th style={{ width: '80px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr
              key={audit.id}
              onClick={() => onRowClick?.(audit)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              <td>
                <small className="text-muted">
                  <i className="bi bi-clock me-1" />
                  {formatDate(audit.createdAt)}
                </small>
              </td>
              <td>
                <EventBadge event={audit.event} />
              </td>
              <td>
                {audit.userId ? (
                  <span className="text-muted">Usuario #{audit.userId}</span>
                ) : (
                  <span className="text-muted">Sistema</span>
                )}
              </td>
              <td>
                <span className="badge bg-light text-dark">
                  {formatAuditableType(audit.auditableType)}
                </span>
              </td>
              <td>
                {audit.auditableId ? (
                  <code className="small">#{audit.auditableId}</code>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                <Link
                  href={`/dashboard/audit/${audit.id}`}
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-eye" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
