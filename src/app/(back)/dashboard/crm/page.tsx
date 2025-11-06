'use client'

import Link from 'next/link'
import { usePipelineStages, useLeads, useCampaigns } from '@/modules/crm'

export default function CRMPage() {
  const { pipelineStages, isLoading: loadingStages } = usePipelineStages()
  const { leads, isLoading: loadingLeads } = useLeads()
  const { campaigns, isLoading: loadingCampaigns } = useCampaigns()

  // Calculate metrics
  const activeStages = pipelineStages.filter(s => s.isActive).length
  const hotLeads = leads.filter(l => l.rating === 'hot').length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalLeadValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-people-fill me-3" />
                CRM - Customer Relationship Management
              </h1>
              <p className="text-muted">
                Gestión de relaciones con clientes, leads y campañas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <i className="bi bi-funnel text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Etapas Pipeline</h6>
                  <h3 className="mb-0">
                    {loadingStages ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      `${activeStages}/${pipelineStages.length}`
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded p-3">
                    <i className="bi bi-fire text-danger" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Leads Calientes</h6>
                  <h3 className="mb-0">
                    {loadingLeads ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      hotLeads
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-megaphone text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Campañas Activas</h6>
                  <h3 className="mb-0">
                    {loadingCampaigns ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      activeCampaigns
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-currency-dollar text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Valor Pipeline</h6>
                  <h3 className="mb-0">
                    {loadingLeads ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      `$${totalLeadValue.toLocaleString()}`
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-funnel text-primary" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Pipeline Stages</h5>
                  <p className="text-muted small mb-0">
                    Gestiona las etapas del proceso de ventas
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total de etapas</span>
                  <strong>{loadingStages ? '...' : pipelineStages.length}</strong>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Etapas activas</span>
                  <strong className="text-success">{loadingStages ? '...' : activeStages}</strong>
                </div>
              </div>
              <Link
                href="/dashboard/crm/pipeline-stages"
                className="btn btn-outline-primary w-100"
              >
                Ver Etapas del Pipeline
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-danger bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-person-badge text-danger" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Leads</h5>
                  <p className="text-muted small mb-0">
                    Gestiona oportunidades de negocio
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total de leads</span>
                  <strong>{loadingLeads ? '...' : leads.length}</strong>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Leads calientes</span>
                  <strong className="text-danger">{loadingLeads ? '...' : hotLeads}</strong>
                </div>
              </div>
              <Link
                href="/dashboard/crm/leads"
                className="btn btn-outline-primary w-100"
              >
                Ver Leads
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-megaphone text-success" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Campañas</h5>
                  <p className="text-muted small mb-0">
                    Gestiona campañas de marketing
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total de campañas</span>
                  <strong>{loadingCampaigns ? '...' : campaigns.length}</strong>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Campañas activas</span>
                  <strong className="text-success">{loadingCampaigns ? '...' : activeCampaigns}</strong>
                </div>
              </div>
              <Link
                href="/dashboard/crm/campaigns"
                className="btn btn-outline-primary w-100"
              >
                Ver Campañas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
