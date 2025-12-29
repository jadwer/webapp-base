'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LeadForm } from '@/modules/crm/components'
import { useLead } from '@/modules/crm'

interface EditLeadPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditLeadPage({ params }: EditLeadPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { lead, isLoading } = useLead(resolvedParams.id)

  const handleSuccess = () => {
    router.push('/dashboard/crm/leads')
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

  if (!lead) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Lead no encontrado
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
                Editar Lead
              </h1>
              <p className="text-muted mb-0">Modificar los datos del lead</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <LeadForm
                    initialData={{
                      title: lead.title,
                      status: lead.status,
                      rating: lead.rating,
                      source: lead.source,
                      companyName: lead.companyName,
                      contactPerson: lead.contactPerson,
                      email: lead.email,
                      phone: lead.phone,
                      estimatedValue: lead.estimatedValue,
                      estimatedCloseDate: lead.estimatedCloseDate,
                      notes: lead.notes,
                      userId: lead.userId,
                      contactId: lead.contactId,
                      pipelineStageId: lead.pipelineStageId,
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
