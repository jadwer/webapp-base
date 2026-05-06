/**
 * Organization Admin Page - Read-Only View
 *
 * Displays departments and positions for organizational structure reference
 */

'use client'

import React from 'react'
import { useDepartments, usePositions } from '../hooks'

export const OrganizationAdminPageReal: React.FC = () => {
  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { positions, isLoading: loadingPositions } = usePositions()

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-diagram-3 me-3" />
                Estructura Organizacional
              </h1>
              <p className="text-muted">
                Consulta de departamentos y puestos de la organización
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <i className="bi bi-building text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Total Departamentos</h6>
                  <h3 className="mb-0">{departments.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-briefcase text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Total Puestos</h6>
                  <h3 className="mb-0">{positions.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Two Columns */}
      <div className="row g-4">
        {/* Departments Column */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-building me-2" />
                Departamentos
              </h5>
            </div>
            <div className="card-body">
              {loadingDepartments ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                  <p className="mt-2 text-muted">Cargando departamentos...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2" />
                  No hay departamentos registrados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept: { id: string; name: string; description: string }) => (
                        <tr key={dept.id}>
                          <td>
                            <strong>{dept.name}</strong>
                          </td>
                          <td>
                            <span className="text-muted">
                              {dept.description || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Positions Column */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-briefcase me-2" />
                Puestos
              </h5>
            </div>
            <div className="card-body">
              {loadingPositions ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" />
                  <p className="mt-2 text-muted">Cargando puestos...</p>
                </div>
              ) : positions.length === 0 ? (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2" />
                  No hay puestos registrados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos: { id: string; title: string; description: string }) => (
                        <tr key={pos.id}>
                          <td>
                            <strong>{pos.title}</strong>
                          </td>
                          <td>
                            <span className="text-muted">
                              {pos.description || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2" />
            <strong>Nota:</strong> Esta es una vista de consulta de la estructura organizacional.
            Los departamentos y puestos se administran desde el módulo de Configuración del sistema.
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationAdminPageReal
