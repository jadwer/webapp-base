'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEmployee } from '@/modules/hr'

interface EmployeeViewPageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  active: { class: 'bg-success', label: 'Activo' },
  inactive: { class: 'bg-secondary', label: 'Inactivo' },
  on_leave: { class: 'bg-warning text-dark', label: 'En Licencia' },
  terminated: { class: 'bg-danger', label: 'Terminado' },
}

export default function EmployeeViewPage({ params }: EmployeeViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { employee, isLoading } = useEmployee(resolvedParams.id)

  const handleEdit = () => {
    router.push(`/dashboard/hr/employees/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/hr/employees')
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

  if (!employee) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Empleado no encontrado
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a empleados
        </button>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[employee.status] || STATUS_BADGES.active

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
              title="Volver a empleados"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-person-badge text-primary me-2" />
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted mb-0">
                <span className={`badge ${statusBadge.class} me-2`}>{statusBadge.label}</span>
                {employee.employeeCode && (
                  <span className="badge bg-outline-secondary">#{employee.employeeCode}</span>
                )}
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
              {/* Personal Info */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-person me-2" />
                    Informacion Personal
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Nombre Completo</h6>
                      <p className="fs-5 mb-0">{employee.firstName} {employee.lastName}</p>
                    </div>
                    {employee.email && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Email</h6>
                        <p className="fs-5 mb-0">
                          <a href={`mailto:${employee.email}`}>{employee.email}</a>
                        </p>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Telefono</h6>
                        <p className="fs-5 mb-0">
                          <a href={`tel:${employee.phone}`}>{employee.phone}</a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Employment Info */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-briefcase me-2" />
                    Informacion Laboral
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {employee.hireDate && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Fecha de Contratacion</h6>
                        <p className="fs-5 mb-0">{new Date(employee.hireDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {employee.salary && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Salario</h6>
                        <p className="fs-5 mb-0 fw-bold text-success">
                          ${employee.salary.toLocaleString()}
                        </p>
                      </div>
                    )}
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
