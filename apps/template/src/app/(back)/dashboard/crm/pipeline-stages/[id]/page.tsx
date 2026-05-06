'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStage } from '@/modules/crm'

interface PipelineStageViewPageProps {
  params: Promise<{
    id: string
  }>
}

const STAGE_TYPE_LABELS: Record<string, string> = {
  lead: 'Lead',
  opportunity: 'Oportunidad',
}

export default function PipelineStageViewPage({ params }: PipelineStageViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { pipelineStage, isLoading } = usePipelineStage(resolvedParams.id)

  const handleEdit = () => {
    router.push(`/dashboard/crm/pipeline-stages/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/crm/pipeline-stages')
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

  if (!pipelineStage) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Etapa no encontrada
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a etapas
        </button>
      </div>
    )
  }

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
              title="Volver a etapas"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-kanban text-primary me-2" />
                {pipelineStage.name}
              </h1>
              <p className="text-muted mb-0">
                <span className={`badge ${pipelineStage.isActive ? 'bg-success' : 'bg-secondary'} me-2`}>
                  {pipelineStage.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <span className="badge bg-outline-primary">
                  {STAGE_TYPE_LABELS[pipelineStage.stageType] || pipelineStage.stageType}
                </span>
              </p>
            </div>
            <button className="btn btn-warning" onClick={handleEdit}>
              <i className="bi bi-pencil me-2" />
              Editar
            </button>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Nombre</h6>
                      <p className="fs-5 mb-0">{pipelineStage.name}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Tipo de Etapa</h6>
                      <p className="fs-5 mb-0">
                        {STAGE_TYPE_LABELS[pipelineStage.stageType] || pipelineStage.stageType}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Probabilidad</h6>
                      <p className="fs-4 mb-0">
                        <span className="badge bg-info fs-5">{pipelineStage.probability}%</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Orden</h6>
                      <p className="fs-5 mb-0">{pipelineStage.sortOrder}</p>
                    </div>
                    <div className="col-12">
                      <hr />
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Estado</h6>
                      <p className="fs-5 mb-0">
                        {pipelineStage.isActive ? (
                          <span className="text-success">
                            <i className="bi bi-check-circle me-1" />
                            Activa
                          </span>
                        ) : (
                          <span className="text-muted">
                            <i className="bi bi-x-circle me-1" />
                            Inactiva
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Tipo de Cierre</h6>
                      <p className="fs-5 mb-0">
                        {pipelineStage.isClosedWon && (
                          <span className="text-success">
                            <i className="bi bi-trophy me-1" />
                            Cerrada Ganada
                          </span>
                        )}
                        {pipelineStage.isClosedLost && (
                          <span className="text-danger">
                            <i className="bi bi-x-circle me-1" />
                            Cerrada Perdida
                          </span>
                        )}
                        {!pipelineStage.isClosedWon && !pipelineStage.isClosedLost && (
                          <span className="text-muted">
                            <i className="bi bi-arrow-right me-1" />
                            En Progreso
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
