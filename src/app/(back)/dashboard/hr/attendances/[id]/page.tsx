'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface AttendanceViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AttendanceViewPage({ params }: AttendanceViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard/hr/attendances')
  }

  // TODO: Implement useAttendance hook to fetch single attendance
  // For now, show basic view structure

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
              title="Volver a asistencias"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-clock-history text-primary me-2" />
                Detalle de Asistencia
              </h1>
              <p className="text-muted mb-0">
                Registro #{resolvedParams.id}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2" />
                    Vista detallada del registro de asistencia #{resolvedParams.id}
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
