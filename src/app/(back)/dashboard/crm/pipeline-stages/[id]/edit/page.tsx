'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { PipelineStageForm } from '@/modules/crm/components'
import { usePipelineStage } from '@/modules/crm'

interface EditPipelineStagePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPipelineStagePage({ params }: EditPipelineStagePageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { pipelineStage, isLoading } = usePipelineStage(resolvedParams.id)

  const handleSuccess = () => {
    router.push('/dashboard/crm/pipeline-stages')
  }

  const handleCancel = () => {
    router.back()
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
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
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
              onClick={handleCancel}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-pencil-square text-warning me-2" />
                Editar Etapa
              </h1>
              <p className="text-muted mb-0">Modificar los datos de la etapa del pipeline</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <PipelineStageForm
                    initialData={{
                      name: pipelineStage.name,
                      stageType: pipelineStage.stageType,
                      probability: pipelineStage.probability,
                      sortOrder: pipelineStage.sortOrder,
                      isActive: pipelineStage.isActive,
                      isClosedWon: pipelineStage.isClosedWon,
                      isClosedLost: pipelineStage.isClosedLost,
                    }}
                    onSubmit={async () => handleSuccess()}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
