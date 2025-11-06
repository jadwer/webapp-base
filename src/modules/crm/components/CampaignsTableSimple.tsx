/**
 * Campaigns Table - Simple Implementation
 */

'use client'

import React from 'react'
import type { Campaign } from '../types'

interface CampaignsTableSimpleProps {
  campaigns: Campaign[]
  onView?: (campaign: Campaign) => void
  onEdit?: (campaign: Campaign) => void
  onDelete?: (campaign: Campaign) => void
}

const getTypeBadge = (type: string) => {
  const badges = {
    email: { class: 'bg-primary', icon: 'bi-envelope', label: 'Email' },
    social_media: { class: 'bg-info', icon: 'bi-share', label: 'Redes Sociales' },
    event: { class: 'bg-warning', icon: 'bi-calendar-event', label: 'Evento' },
    webinar: { class: 'bg-purple', icon: 'bi-camera-video', label: 'Webinar' },
    direct_mail: { class: 'bg-secondary', icon: 'bi-mailbox', label: 'Correo Directo' },
    telemarketing: { class: 'bg-dark', icon: 'bi-telephone', label: 'Telemarketing' },
  }
  return badges[type as keyof typeof badges] || badges.email
}

const getStatusBadge = (status: string) => {
  const badges = {
    planning: { class: 'bg-secondary', label: 'Planeación' },
    active: { class: 'bg-success', label: 'Activa' },
    paused: { class: 'bg-warning', label: 'Pausada' },
    completed: { class: 'bg-primary', label: 'Completada' },
    cancelled: { class: 'bg-danger', label: 'Cancelada' },
  }
  return badges[status as keyof typeof badges] || badges.planning
}

const calculateROI = (revenue: number, cost: number): number => {
  if (cost === 0) return 0
  return ((revenue - cost) / cost) * 100
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const CampaignsTableSimple = ({
  campaigns,
  onView,
  onEdit,
  onDelete,
}: CampaignsTableSimpleProps) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-megaphone" style={{ fontSize: '3rem', opacity: 0.3 }} />
          <p className="text-muted mt-3 mb-0">No hay campañas registradas</p>
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
              <th>Nombre</th>
              <th style={{ width: '120px' }}>Tipo</th>
              <th style={{ width: '120px' }}>Estado</th>
              <th style={{ width: '180px' }}>Fechas</th>
              <th style={{ width: '140px' }} className="text-end">Presupuesto</th>
              <th style={{ width: '140px' }} className="text-end">Costo Real</th>
              <th style={{ width: '120px' }} className="text-end">ROI</th>
              <th style={{ width: '200px' }} className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const typeBadge = getTypeBadge(campaign.type)
              const statusBadge = getStatusBadge(campaign.status)
              const roi = calculateROI(
                campaign.actualRevenue || 0,
                campaign.actualCost || 0
              )

              return (
                <tr key={campaign.id}>
                  <td>
                    <div>
                      <strong>{campaign.name}</strong>
                      {campaign.description && (
                        <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                          {campaign.description}
                        </div>
                      )}
                      {campaign.targetAudience && (
                        <div className="text-muted small">
                          <i className="bi bi-people me-1" />
                          {campaign.targetAudience}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${typeBadge.class}`}>
                      <i className={`bi ${typeBadge.icon} me-1`} />
                      {typeBadge.label}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td>
                    <div className="small">
                      <div>
                        <i className="bi bi-calendar-check me-1" />
                        {formatDate(campaign.startDate)}
                      </div>
                      {campaign.endDate && (
                        <div className="text-muted">
                          <i className="bi bi-calendar-x me-1" />
                          {formatDate(campaign.endDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-end">
                    {campaign.budget !== undefined && campaign.budget !== null ? (
                      <span className="text-primary fw-bold">
                        ${campaign.budget.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-end">
                    {campaign.actualCost !== undefined && campaign.actualCost !== null ? (
                      <span className="text-danger fw-bold">
                        ${campaign.actualCost.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-end">
                    {roi !== 0 ? (
                      <span className={`badge ${roi > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm" role="group">
                      {onView && (
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => onView(campaign)}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => onEdit(campaign)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => onDelete(campaign)}
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
