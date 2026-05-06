'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCampaign } from '@/modules/crm'

interface CampaignViewPageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  planning: { class: 'bg-secondary', label: 'Planeacion' },
  active: { class: 'bg-success', label: 'Activa' },
  paused: { class: 'bg-warning text-dark', label: 'Pausada' },
  completed: { class: 'bg-info', label: 'Completada' },
  cancelled: { class: 'bg-danger', label: 'Cancelada' },
}

const TYPE_LABELS: Record<string, string> = {
  email: 'Email Marketing',
  social_media: 'Redes Sociales',
  event: 'Evento',
  webinar: 'Webinar',
  direct_mail: 'Correo Directo',
  telemarketing: 'Telemarketing',
}

export default function CampaignViewPage({ params }: CampaignViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { campaign, isLoading } = useCampaign(resolvedParams.id)

  const handleEdit = () => {
    router.push(`/dashboard/crm/campaigns/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/crm/campaigns')
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Campana no encontrada
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a campanas
        </button>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[campaign.status] || STATUS_BADGES.planning
  const roi = campaign.actualCost && campaign.actualCost > 0
    ? (((campaign.actualRevenue || 0) - campaign.actualCost) / campaign.actualCost * 100).toFixed(1)
    : null

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver a campanas"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-megaphone text-primary me-2" />
                {campaign.name}
              </h1>
              <p className="text-muted mb-0">
                <span className={`badge ${statusBadge.class} me-2`}>{statusBadge.label}</span>
                <span className="badge bg-outline-secondary">{TYPE_LABELS[campaign.type] || campaign.type}</span>
              </p>
            </div>
            <button className="btn btn-warning" onClick={handleEdit}>
              <i className="bi bi-pencil me-2" />
              Editar
            </button>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              {/* Dates */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-calendar me-2" />
                    Fechas
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Fecha de Inicio</h6>
                      <p className="fs-5 mb-0">{new Date(campaign.startDate).toLocaleDateString()}</p>
                    </div>
                    {campaign.endDate && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Fecha de Fin</h6>
                        <p className="fs-5 mb-0">{new Date(campaign.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-currency-dollar me-2" />
                    Informacion Financiera
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6 col-lg-3">
                      <h6 className="text-muted mb-1">Presupuesto</h6>
                      <p className="fs-5 mb-0">${(campaign.budget || 0).toLocaleString()}</p>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <h6 className="text-muted mb-1">Costo Real</h6>
                      <p className="fs-5 mb-0">${(campaign.actualCost || 0).toLocaleString()}</p>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <h6 className="text-muted mb-1">Ingreso Esperado</h6>
                      <p className="fs-5 mb-0">${(campaign.expectedRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <h6 className="text-muted mb-1">Ingreso Real</h6>
                      <p className="fs-5 mb-0 text-success fw-bold">${(campaign.actualRevenue || 0).toLocaleString()}</p>
                    </div>
                    {roi !== null && (
                      <div className="col-12">
                        <h6 className="text-muted mb-1">ROI</h6>
                        <p className={`fs-4 mb-0 fw-bold ${parseFloat(roi) >= 0 ? 'text-success' : 'text-danger'}`}>
                          {parseFloat(roi) >= 0 ? '+' : ''}{roi}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              {campaign.targetAudience && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-people me-2" />
                      Audiencia Objetivo
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="mb-0">{campaign.targetAudience}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {campaign.description && (
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-journal-text me-2" />
                      Descripcion
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{campaign.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
