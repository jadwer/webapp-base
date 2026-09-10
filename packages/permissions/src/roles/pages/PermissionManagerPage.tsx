'use client'

/**
 * Roles y Permisos en DOS TABS (decision Gabino 2026-09-10: la lista de
 * roles junto al editor daba sensacion de conexion rara; cada cosa a
 * ancho completo en su pestana):
 *  - Tab Roles: tabla CRUD de roles; elegir un rol salta a Permisos.
 *  - Tab Permisos: selector de rol + editor estilo Bind (bloques
 *    verticales por recurso, toggle maestro, labels del catalogo).
 */

import { useMemo, useState } from 'react'
import { Role } from '../types/role'
import { RoleForm } from '../components/RoleForm'
import { RolesTable } from '../components/RolesTable'
import { RolePermissionsEditor } from '../components/RolePermissionsEditor'
import { useRoles } from '../hooks/useRoles'
import { usePermissions } from '../hooks/usePermissions'
import { toast } from '@lwm/ui'

export default function PermissionManagerPage() {
  const { roles, isLoading: rolesLoading, mutate } = useRoles(['permissions'])
  const { permissions, isLoading: permissionsLoading } = usePermissions()

  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? roles[0] ?? null,
    [roles, selectedRoleId]
  )

  const handleRoleSelect = (role: Role) => {
    setSelectedRoleId(role.id)
    setActiveTab('permissions')
  }

  const handleSaved = async () => {
    toast.success('Permisos del rol guardados.')
    await mutate()
  }

  const isLoading = rolesLoading || permissionsLoading

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">
            <i className="bi bi-shield-fill-check me-2 text-primary"></i>
            Roles y Permisos
          </h1>
          <p className="text-muted mb-0">
            Administra los roles del sistema y sus permisos por módulo
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

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <i className="bi bi-people me-2"></i>
            Roles
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <i className="bi bi-toggles me-2"></i>
            Permisos
            {selectedRole && activeTab !== 'permissions' && (
              <span className="badge bg-secondary ms-2">{selectedRole.name}</span>
            )}
          </button>
        </li>
      </ul>

      {isLoading ? (
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" aria-label="Cargando" />
        </div>
      ) : activeTab === 'roles' ? (
        <RolesTable
          onRoleSelect={handleRoleSelect}
          selectedRole={selectedRole}
        />
      ) : (
        <>
          {/* Selector de rol de la pestana Permisos */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <label htmlFor="role-selector" className="form-label mb-0 text-muted">
              Rol:
            </label>
            <select
              id="role-selector"
              className="form-select form-select-sm w-auto"
              value={selectedRole?.id ?? ''}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              aria-label="Seleccionar rol"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.permissions?.length ?? 0} permisos)
                </option>
              ))}
            </select>
          </div>

          {selectedRole ? (
            <RolePermissionsEditor
              key={selectedRole.id}
              role={selectedRole}
              permissions={permissions}
              onSaved={handleSaved}
            />
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted py-5">
                <i className="bi bi-shield-lock d-block fs-1 mb-2" />
                Crea un rol para asignarle permisos.
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal crear rol (nombre, guard, descripcion) */}
      {showCreateForm && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear nuevo rol</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setShowCreateForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <RoleForm
                  onSuccess={() => { setShowCreateForm(false); mutate() }}
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
