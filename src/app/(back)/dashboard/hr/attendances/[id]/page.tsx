'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import axiosClient from '@/lib/axiosClient'
import type { Attendance } from '@/modules/hr'

interface AttendanceViewPageProps {
  params: Promise<{
    id: string
  }>
}

// Simple hook to fetch single attendance
const useAttendance = (id: string) => {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/attendances/${id}` : null,
    async (url: string) => {
      const response = await axiosClient.get(`${url}?include=employee`)
      return response.data
    }
  )

  // Transform JSON:API response to Attendance type
  const attendance: Attendance | null = data?.data ? {
    id: data.data.id,
    employeeId: data.data.attributes?.employeeId || data.data.attributes?.employee_id || 0,
    date: data.data.attributes?.date || data.data.attributes?.attendanceDate || data.data.attributes?.attendance_date || '',
    checkIn: data.data.attributes?.checkIn || data.data.attributes?.check_in || '',
    checkOut: data.data.attributes?.checkOut || data.data.attributes?.check_out,
    status: data.data.attributes?.status || 'present',
    hoursWorked: data.data.attributes?.hoursWorked || data.data.attributes?.hours_worked || 0,
    overtimeHours: data.data.attributes?.overtimeHours || data.data.attributes?.overtime_hours || 0,
    notes: data.data.attributes?.notes,
    createdAt: data.data.attributes?.createdAt || data.data.attributes?.created_at || '',
    updatedAt: data.data.attributes?.updatedAt || data.data.attributes?.updated_at || '',
    employee: data.included?.find((item: { type: string }) => item.type === 'employees'),
  } : null

  return { attendance, isLoading, error }
}

export default function AttendanceViewPage({ params }: AttendanceViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { attendance, isLoading, error } = useAttendance(resolvedParams.id)

  const handleBack = () => {
    router.push('/dashboard/hr/attendances')
  }

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '-'
    return time.substring(0, 5) // HH:MM format
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string | undefined) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      present: { class: 'bg-success', label: 'Presente' },
      absent: { class: 'bg-danger', label: 'Ausente' },
      late: { class: 'bg-warning text-dark', label: 'Tarde' },
      half_day: { class: 'bg-info', label: 'Medio dia' },
      on_leave: { class: 'bg-secondary', label: 'Con permiso' },
    }
    const statusInfo = statusMap[status || ''] || { class: 'bg-secondary', label: status || 'Desconocido' }
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
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

  if (error || !attendance) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el registro de asistencia
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a la lista
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
            {getStatusBadge(attendance.status)}
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  {/* Date Info */}
                  <div className="mb-4 pb-3 border-bottom">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-calendar-date me-2" />
                      Informacion de Fecha
                    </h5>
                    <p className="mb-0 fs-5">{formatDate(attendance.date)}</p>
                  </div>

                  {/* Time Info */}
                  <div className="mb-4 pb-3 border-bottom">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-clock me-2" />
                      Registro de Tiempo
                    </h5>
                    <div className="row">
                      <div className="col-6">
                        <div className="text-muted small">Entrada</div>
                        <div className="fs-4 fw-bold text-success">
                          {formatTime(attendance.checkIn)}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted small">Salida</div>
                        <div className="fs-4 fw-bold text-danger">
                          {formatTime(attendance.checkOut)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hours Info */}
                  <div className="mb-4 pb-3 border-bottom">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-hourglass-split me-2" />
                      Horas Trabajadas
                    </h5>
                    <div className="row">
                      <div className="col-6">
                        <div className="text-muted small">Horas normales</div>
                        <div className="fs-4 fw-bold">
                          {attendance.hoursWorked?.toFixed(2) || '0.00'} hrs
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted small">Horas extra</div>
                        <div className="fs-4 fw-bold text-warning">
                          {attendance.overtimeHours?.toFixed(2) || '0.00'} hrs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {attendance.notes && (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-chat-left-text me-2" />
                        Notas
                      </h5>
                      <p className="mb-0">{attendance.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-4 pt-3 border-top">
                    <button className="btn btn-secondary" onClick={handleBack}>
                      <i className="bi bi-arrow-left me-1" />
                      Volver a la lista
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => router.push(`/dashboard/hr/attendances/${resolvedParams.id}/edit`)}
                    >
                      <i className="bi bi-pencil me-1" />
                      Editar
                    </button>
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
