/**
 * HR Index Page - Main landing page for Human Resources
 */

'use client'

import Link from 'next/link'
import { useEmployees, useAttendances, useLeaves, usePayrollPeriods } from '../hooks'

export const HRIndexPage = () => {
  const { employees, isLoading: loadingEmployees } = useEmployees()
  const { attendances, isLoading: loadingAttendances } = useAttendances()
  const { leaves, isLoading: loadingLeaves } = useLeaves()
  const { payrollPeriods, isLoading: loadingPayroll } = usePayrollPeriods()

  // Calculate metrics
  const activeEmployees = employees.filter(e => e.status === 'active').length
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length
  const draftPayrolls = payrollPeriods.filter(p => p.status === 'draft').length

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-people-fill me-3" />
                Recursos Humanos
              </h1>
              <p className="text-muted">
                Gestión de empleados, asistencia, permisos y nómina
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
                    <i className="bi bi-person-badge text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Empleados Activos</h6>
                  <h3 className="mb-0">
                    {loadingEmployees ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      activeEmployees
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
                    <i className="bi bi-clock-history text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Registros Asistencia</h6>
                  <h3 className="mb-0">
                    {loadingAttendances ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      attendances.length
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
                  <div className="bg-warning bg-opacity-10 rounded p-3">
                    <i className="bi bi-calendar-x text-warning" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Permisos Pendientes</h6>
                  <h3 className="mb-0">
                    {loadingLeaves ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      pendingLeaves
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
                  <div className="bg-info bg-opacity-10 rounded p-3">
                    <i className="bi bi-cash-stack text-info" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Nóminas Borrador</h6>
                  <h3 className="mb-0">
                    {loadingPayroll ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      draftPayrolls
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-people text-primary" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Empleados</h5>
                  <p className="text-muted small mb-0">
                    Gestiona la información de empleados
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total empleados</span>
                  <strong>{loadingEmployees ? '...' : employees.length}</strong>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Activos</span>
                  <strong className="text-success">{loadingEmployees ? '...' : activeEmployees}</strong>
                </div>
              </div>
              <Link
                href="/dashboard/hr/employees"
                className="btn btn-outline-primary w-100"
              >
                Ver Empleados
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-clock-history text-success" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Asistencia</h5>
                  <p className="text-muted small mb-0">
                    Tracking de asistencia y horas
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Registros totales</span>
                  <strong>{loadingAttendances ? '...' : attendances.length}</strong>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Auto-cálculo de horas</span>
                  <strong className="text-success">Activo</strong>
                </div>
              </div>
              <Link
                href="/dashboard/hr/attendances"
                className="btn btn-outline-success w-100"
              >
                Ver Asistencia
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-warning bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-calendar-check text-warning" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Permisos</h5>
                  <p className="text-muted small mb-0">
                    Gestión de vacaciones y permisos
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Total solicitudes</span>
                  <strong>{loadingLeaves ? '...' : leaves.length}</strong>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Pendientes</span>
                  <strong className="text-warning">{loadingLeaves ? '...' : pendingLeaves}</strong>
                </div>
              </div>
              <Link
                href="/dashboard/hr/leaves"
                className="btn btn-outline-warning w-100"
              >
                Ver Permisos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-info bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-cash-stack text-info" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Nómina</h5>
                  <p className="text-muted small mb-0">
                    Procesar nómina y pagos
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Auto-cálculo de totales
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Integración con Contabilidad
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/hr/payroll"
                className="btn btn-outline-info w-100"
              >
                Ver Nómina
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-secondary bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-building text-secondary" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Organización</h5>
                  <p className="text-muted small mb-0">
                    Departamentos y puestos
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-diagram-3 text-muted me-2" />
                    Departamentos
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-briefcase text-muted me-2" />
                    Puestos
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/hr/organization"
                className="btn btn-outline-secondary w-100"
              >
                Ver Organización
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
