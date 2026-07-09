'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLead } from '@/modules/crm'

interface LeadViewPageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  new: { class: 'bg-primary', label: 'Nuevo' },
  contacted: { class: 'bg-info', label: 'Contactado' },
  qualified: { class: 'bg-success', label: 'Calificado' },
  unqualified: { class: 'bg-secondary', label: 'No Calificado' },
  converted: { class: 'bg-warning text-dark', label: 'Convertido' },
}

const RATING_BADGES: Record<string, { class: string; label: string }> = {
  hot: { class: 'bg-danger', label: 'Caliente' },
  warm: { class: 'bg-warning text-dark', label: 'Tibio' },
  cold: { class: 'bg-info', label: 'Frio' },
}

export default function LeadViewPage({ params }: LeadViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { lead, isLoading } = useLead(resolvedParams.id)

  const handleEdit = () => {
    router.push(`/dashboard/crm/leads/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/crm/leads')
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

  if (!lead) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Lead no encontrado
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a leads
        </button>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[lead.status] || STATUS_BADGES.new
  const ratingBadge = RATING_BADGES[lead.rating] || RATING_BADGES.warm

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
              title="Volver a leads"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-person text-primary me-2" />
                {lead.title}
              </h1>
              <p className="text-muted mb-0">
                <span className={`badge ${statusBadge.class} me-2`}>{statusBadge.label}</span>
                <span className={`badge ${ratingBadge.class}`}>{ratingBadge.label}</span>
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
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-building me-2" />
                    Informacion de Contacto
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {lead.companyName && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Empresa</h6>
                        <p className="fs-5 mb-0">{lead.companyName}</p>
                      </div>
                    )}
                    {lead.contactPerson && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Persona de Contacto</h6>
                        <p className="fs-5 mb-0">{lead.contactPerson}</p>
                      </div>
                    )}
                    {lead.email && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Email</h6>
                        <p className="fs-5 mb-0">
                          <a href={`mailto:${lead.email}`}>{lead.email}</a>
                        </p>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Telefono</h6>
                        <p className="fs-5 mb-0">
                          <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                        </p>
                      </div>
                    )}
                    {lead.source && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Fuente</h6>
                        <p className="fs-5 mb-0">{lead.source}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-currency-dollar me-2" />
                    Informacion Comercial
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Valor Estimado</h6>
                      <p className="fs-4 mb-0 fw-bold text-success">
                        ${(lead.estimatedValue || 0).toLocaleString()}
                      </p>
                    </div>
                    {lead.estimatedCloseDate && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Fecha Estimada de Cierre</h6>
                        <p className="fs-5 mb-0">
                          {new Date(lead.estimatedCloseDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-journal-text me-2" />
                      Notas
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{lead.notes}</p>
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
