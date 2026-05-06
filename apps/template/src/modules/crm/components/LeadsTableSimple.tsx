/**
 * Leads Table - Simple Implementation
 */

'use client'

import React from 'react'
import type { Lead } from '../types'

interface LeadsTableSimpleProps {
  leads: Lead[]
  onView?: (lead: Lead) => void
  onEdit?: (lead: Lead) => void
  onDelete?: (lead: Lead) => void
}

const getRatingBadge = (rating: string) => {
  const badges = {
    hot: { class: 'bg-danger', icon: 'bi-fire', label: 'Caliente' },
    warm: { class: 'bg-warning', icon: 'bi-sun', label: 'Tibio' },
    cold: { class: 'bg-info', icon: 'bi-snow', label: 'Frío' },
  }
  return badges[rating as keyof typeof badges] || badges.warm
}

const getStatusBadge = (status: string) => {
  const badges = {
    new: { class: 'bg-primary', label: 'Nuevo' },
    contacted: { class: 'bg-info', label: 'Contactado' },
    qualified: { class: 'bg-warning', label: 'Calificado' },
    proposal: { class: 'bg-purple', label: 'Propuesta' },
    negotiation: { class: 'bg-orange', label: 'Negociación' },
    converted: { class: 'bg-success', label: 'Convertido' },
    lost: { class: 'bg-danger', label: 'Perdido' },
  }
  return badges[status as keyof typeof badges] || badges.new
}

export const LeadsTableSimple = ({
  leads,
  onView,
  onEdit,
  onDelete,
}: LeadsTableSimpleProps) => {
  if (!leads || leads.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-person-badge" style={{ fontSize: '3rem', opacity: 0.3 }} />
          <p className="text-muted mt-3 mb-0">No hay leads registrados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Título</th>
              <th style={{ width: '150px' }}>Empresa</th>
              <th style={{ width: '120px' }}>Rating</th>
              <th style={{ width: '130px' }}>Estado</th>
              <th style={{ width: '120px' }}>Valor Est.</th>
              <th style={{ width: '150px' }}>Etapa</th>
              <th style={{ width: '200px' }} className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const ratingBadge = getRatingBadge(lead.rating)
              const statusBadge = getStatusBadge(lead.status)

              return (
                <tr key={lead.id}>
                  <td>
                    <div>
                      <strong>{lead.title}</strong>
                      {lead.email && (
                        <div className="text-muted small">
                          <i className="bi bi-envelope me-1" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {lead.companyName && (
                      <div className="text-muted small">
                        <i className="bi bi-building me-1" />
                        {lead.companyName}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${ratingBadge.class}`}>
                      <i className={`bi ${ratingBadge.icon} me-1`} />
                      {ratingBadge.label}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td>
                    {lead.estimatedValue !== undefined && lead.estimatedValue !== null && (
                      <span className="text-success fw-bold">
                        ${lead.estimatedValue.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td>
                    {lead.pipelineStage && (
                      <div className="d-flex align-items-center gap-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(lead.pipelineStage as any).color && (
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                              backgroundColor: (lead.pipelineStage as any).color,
                              borderRadius: '50%'
                            }}
                          />
                        )}
                        <span className="small">{lead.pipelineStage.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm" role="group">
                      {onView && (
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => onView(lead)}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => onEdit(lead)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => onDelete(lead)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
