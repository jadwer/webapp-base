'use client'

import { useState } from 'react'
import { Role } from '../types/role'
import { RolesTable } from '../components/RolesTable'
import { RoleForm } from '../components/RoleForm'
import { useRoleStats } from '../hooks/useRoles'
import { ApiTestComponent } from '../components/ApiTestComponent'

export default function RolesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const { stats, isLoading: statsLoading } = useRoleStats()

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-shield-fill-check me-2 text-primary"></i>
                Gestión de Roles
              </h1>
              <p className="text-muted mb-0">
                Administra los roles y permisos del sistema
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Nuevo Rol
            </button>
          </div>
        </div>
      </div>

      {/* Componente de prueba API */}
      <div className="row mb-4">
        <div className="col-12">
          <ApiTestComponent />
        </div>
      </div>

      {/* Estadísticas */}
      {!statsLoading && stats && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-md bg-primary bg-gradient">
                      <i className="bi bi-people-fill"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3 text-start">
                    <h5 className="card-title mb-0">{stats.total}</h5>
                    <p className="card-text text-muted small mb-0">Total de roles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-md bg-success bg-gradient">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3 text-start">
                    <h5 className="card-title mb-0">{stats.withPermissions}</h5>
                    <p className="card-text text-muted small mb-0">Con permisos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-md bg-warning bg-gradient">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3 text-start">
                    <h5 className="card-title mb-0">{stats.withoutPermissions}</h5>
                    <p className="card-text text-muted small mb-0">Sin permisos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Lista de roles */}
        <div className={selectedRole ? 'col-lg-8' : 'col-12'}>
          <RolesTable
            onRoleSelect={handleRoleSelect}
            selectedRole={selectedRole}
          />
        </div>

        {/* Panel de detalles del rol seleccionado */}
        {selectedRole && (
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0">Detalles del rol</h6>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedRole(null)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="fw-bold">{selectedRole.name}</h6>
                  {selectedRole.description && (
                    <p className="text-muted small mb-2">{selectedRole.description}</p>
                  )}
                  <span className="badge bg-secondary">{selectedRole.guard_name}</span>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold mb-2">
                    Permisos ({selectedRole.permissions?.length || 0})
                  </h6>
                  {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                    <div className="row">
                      {selectedRole.permissions.map((permission) => (
                        <div key={permission.id} className="col-12 mb-1">
                          <small className="badge bg-light text-dark">
                            {permission.name}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small">No tiene permisos asignados</p>
                  )}
                </div>

                <div className="small text-muted">
                  <strong>Creado:</strong> {new Date(selectedRole.created_at).toLocaleString()}
                  <br />
                  <strong>Actualizado:</strong> {new Date(selectedRole.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear rol */}
      {showCreateForm && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear nuevo rol</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <RoleForm
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
