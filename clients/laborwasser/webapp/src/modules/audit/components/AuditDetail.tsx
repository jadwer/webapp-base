'use client'

import React from 'react'
import type { Audit, FieldChange } from '../types'
import {
  EVENT_LABELS,
  EVENT_COLORS,
  EVENT_ICONS,
  formatAuditableType,
  getSubjectDisplayName,
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

// Field name translations for display
const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  email: 'Correo electronico',
  description: 'Descripcion',
  fullDescription: 'Descripcion completa',
  full_description: 'Descripcion completa',
  price: 'Precio',
  cost: 'Costo',
  sku: 'SKU',
  img_path: 'Imagen',
  imgPath: 'Imagen',
  datasheet_path: 'Ficha tecnica',
  datasheetPath: 'Ficha tecnica',
  is_active: 'Activo',
  isActive: 'Activo',
  unit_id: 'Unidad',
  unitId: 'Unidad',
  category_id: 'Categoria',
  categoryId: 'Categoria',
  brand_id: 'Marca',
  brandId: 'Marca',
  created_at: 'Fecha creacion',
  updated_at: 'Fecha actualizacion',
  status: 'Estado',
  total: 'Total',
  subtotal: 'Subtotal',
  quantity: 'Cantidad',
  phone: 'Telefono',
  address: 'Direccion',
  iva: 'IVA',
}

function formatFieldName(field: string): string {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
}

function PropertyDiff({ change }: { change: FieldChange }) {
  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '(vacio)'
    if (typeof val === 'object') return JSON.stringify(val, null, 2)
    if (typeof val === 'boolean') return val ? 'Si' : 'No'
    return String(val)
  }

  return (
    <div className="mb-3 pb-3 border-bottom">
      <div className="fw-medium mb-2">
        <i className="bi bi-arrow-right-circle me-1 text-primary" />
        {formatFieldName(change.field)}
      </div>
      <div className="row g-2">
        {change.oldValue !== undefined && change.oldValue !== null && (
          <div className="col-md-6">
            <div className="bg-danger-subtle p-2 rounded small">
              <div className="text-danger fw-medium mb-1">
                <i className="bi bi-dash-circle me-1" />
                Valor anterior
              </div>
              <code className="text-danger d-block" style={{ whiteSpace: 'pre-wrap' }}>
                {formatValue(change.oldValue)}
              </code>
            </div>
          </div>
        )}
        {change.newValue !== undefined && change.newValue !== null && (
          <div className="col-md-6">
            <div className="bg-success-subtle p-2 rounded small">
              <div className="text-success fw-medium mb-1">
                <i className="bi bi-plus-circle me-1" />
                Valor nuevo
              </div>
              <code className="text-success d-block" style={{ whiteSpace: 'pre-wrap' }}>
                {formatValue(change.newValue)}
              </code>
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
  const subjectName = getSubjectDisplayName(audit.subject)

  return (
    <div className="audit-detail">
      {/* Header Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          {/* Event Header */}
          <div className="d-flex align-items-center mb-4">
            <div
              className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center me-3`}
              style={{ width: '56px', height: '56px' }}
            >
              <i className={`bi ${icon} text-white fs-4`} />
            </div>
            <div>
              <h4 className="mb-1">
                <span className={`badge bg-${color} me-2`}>{label}</span>
                {formatAuditableType(audit.auditableType)}
              </h4>
              <div className="text-muted">
                {subjectName && (
                  <span className="fw-medium text-dark me-2">
                    {subjectName}
                  </span>
                )}
                <code className="small">ID: {audit.auditableId}</code>
              </div>
              <small className="text-muted">
                <i className="bi bi-clock me-1" />
                {formatDate(audit.createdAt)}
              </small>
            </div>
          </div>

          <hr />

          {/* User & Technical Info */}
          <div className="row g-4">
            {/* User Info */}
            <div className="col-md-6">
              <div className="card bg-light border-0">
                <div className="card-body">
                  <h6 className="text-muted mb-3">
                    <i className="bi bi-person-circle me-2" />
                    Usuario que realizo la accion
                  </h6>
                  {audit.causer ? (
                    <div>
                      <div className="fw-bold fs-5">{audit.causer.name}</div>
                      <div className="text-muted">{audit.causer.email}</div>
                      <small className="text-muted">ID: {audit.causer.id}</small>
                    </div>
                  ) : audit.userId ? (
                    <div>
                      <span className="text-muted">Usuario #{audit.userId}</span>
                      <small className="d-block text-muted">(Datos de usuario no disponibles)</small>
                    </div>
                  ) : (
                    <div className="fst-italic text-muted">
                      <i className="bi bi-robot me-1" />
                      Accion del sistema (automatica)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subject Info */}
            <div className="col-md-6">
              <div className="card bg-light border-0">
                <div className="card-body">
                  <h6 className="text-muted mb-3">
                    <i className="bi bi-box me-2" />
                    Entidad afectada
                  </h6>
                  <div>
                    <div className="fw-bold fs-5">{formatAuditableType(audit.auditableType)}</div>
                    {subjectName && (
                      <div className="text-dark">{subjectName}</div>
                    )}
                    <small className="text-muted">
                      ID: {audit.auditableId}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* IP Address */}
            {audit.ipAddress && (
              <div className="col-md-6">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-globe me-1" />
                  Direccion IP
                </h6>
                <code className="fs-6">{audit.ipAddress}</code>
              </div>
            )}

            {/* User Agent */}
            {audit.userAgent && (
              <div className="col-md-6">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-laptop me-1" />
                  Navegador / Dispositivo
                </h6>
                <small className="text-muted d-block" style={{ wordBreak: 'break-all' }}>
                  {audit.userAgent}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Changes Card */}
      {audit.changes.length > 0 && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">
              <i className="bi bi-journal-text me-2" />
              Cambios Realizados ({audit.changes.length} {audit.changes.length === 1 ? 'campo' : 'campos'})
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
          <div className="card-header bg-secondary text-white">
            <h6 className="mb-0">
              <i className="bi bi-code me-2" />
              Datos del Registro
            </h6>
          </div>
          <div className="card-body">
            {audit.oldValues && (
              <div className="mb-3">
                <h6 className="text-danger mb-2">
                  <i className="bi bi-dash-circle me-1" />
                  Valores Anteriores:
                </h6>
                <pre className="bg-danger-subtle p-3 rounded small mb-0" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(audit.oldValues, null, 2)}
                </pre>
              </div>
            )}
            {audit.newValues && (
              <div>
                <h6 className="text-success mb-2">
                  <i className="bi bi-plus-circle me-1" />
                  Valores Nuevos:
                </h6>
                <pre className="bg-success-subtle p-3 rounded small mb-0" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(audit.newValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No changes message */}
      {audit.changes.length === 0 && !audit.oldValues && !audit.newValues && (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-info-circle fs-1 d-block mb-3" />
            <p className="mb-0">No hay detalles de cambios registrados para esta accion.</p>
          </div>
        </div>
      )}
    </div>
  )
}
