'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAudit, AuditDetail } from '@/modules/audit'

interface AuditViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AuditViewPage({ params }: AuditViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { audit, isLoading, isError } = useAudit(resolvedParams.id)

  const handleBack = () => {
    router.push('/dashboard/audit')
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

  if (isError || !audit) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Registro de auditoria no encontrado
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
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
              onClick={handleBack}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-clipboard-data text-primary me-2" />
                Detalle de Auditoria
              </h1>
              <p className="text-muted mb-0">Registro #{audit.id}</p>
            </div>
          </div>

          {/* Detail */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <AuditDetail audit={audit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
