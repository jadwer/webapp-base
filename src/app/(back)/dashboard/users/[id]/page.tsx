'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface UserViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserViewPage({ params }: UserViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/dashboard/users/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/users')
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
              title="Volver a usuarios"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-person text-primary me-2" />
                Detalle de Usuario
              </h1>
              <p className="text-muted mb-0">
                Usuario #{resolvedParams.id}
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
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2" />
                    Vista detallada del usuario #{resolvedParams.id}
                  </div>
                  <button className="btn btn-secondary" onClick={handleBack}>
                    Volver a la lista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
