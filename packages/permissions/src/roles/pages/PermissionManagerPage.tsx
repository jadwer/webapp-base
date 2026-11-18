'use client'

/**
 * Roles y Permisos en DOS TABS (decision Gabino 2026-09-10: la lista de
 * roles junto al editor daba sensacion de conexion rara; cada cosa a
 * ancho completo en su pestana):
 *  - Tab Roles: tabla CRUD de roles; elegir un rol salta a Permisos.
 *  - Tab Permisos: selector de rol + editor estilo Bind (bloques
 *    verticales por recurso, toggle maestro, labels del catalogo).
 *
 * Piel del rediseno (Figma "Diseno final - Roles y permisos", 2026-11-18): titulo,
 * buscador, tarjetas Total, Con permisos y Sin permisos, tabla Lw.
 */

import { useMemo, useState } from 'react'
import { Role } from '../types/role'
import { RoleForm } from '../components/RoleForm'
import { RolesTable } from '../components/RolesTable'
import { RolePermissionsEditor } from '../components/RolePermissionsEditor'
import { useRoles } from '../hooks/useRoles'
import { usePermissions } from '../hooks/usePermissions'
import { toast, LwSurface, LwPageTitle, LwKpiCard } from '@lwm/ui'
import { roleDisplayName } from '../components/RolesTable'

export default function PermissionManagerPage() {
  const { roles, isLoading: rolesLoading, mutate } = useRoles(['permissions'])
  const { permissions, isLoading: permissionsLoading } = usePermissions()

  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [search, setSearch] = useState('')
  const withPermissions = roles.filter((r) => (r.permissions?.length ?? 0) > 0).length

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
      <LwSurface>
      <LwPageTitle
        title="Gestión de roles"
        subtitle={<>Administra los roles y permisos del sistema. <span className="small text-muted d-block">Cada rol es una plantilla: al dar de alta un usuario precarga sus permisos y después se ajustan solo para ese usuario. Editar un rol no cambia a los usuarios ya creados.</span></>}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo rol
          </button>
        }
      />

      <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
        <div className="col"><LwKpiCard label="Total de roles" value={rolesLoading ? '--' : roles.length} icon="bi-person-badge" highlight isLoading={rolesLoading} /></div>
        <div className="col"><LwKpiCard label="Con permisos" value={rolesLoading ? '--' : withPermissions} icon="bi-shield-check" isLoading={rolesLoading} /></div>
        <div className="col"><LwKpiCard label="Sin permisos" value={rolesLoading ? '--' : roles.length - withPermissions} icon="bi-shield-exclamation" isLoading={rolesLoading} /></div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            Permisos
            {selectedRole && activeTab !== 'permissions' && (
              <span className="small text-muted ms-2">({roleDisplayName(selectedRole)})</span>
            )}
          </button>
        </li>
      </ul>

      {isLoading ? (
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" aria-label="Cargando" />
        </div>
      ) : activeTab === 'roles' ? (
        <>
          <div className="row mb-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input type="search" className="form-control border-start-0" placeholder="Buscar rol..." aria-label="Buscar rol" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <RolesTable
            onRoleSelect={handleRoleSelect}
            selectedRole={selectedRole}
            search={search}
          />
        </>
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
                  {roleDisplayName(role)} ({role.permissions?.length ?? 0} permisos)
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
        <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg">
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
      </LwSurface>
    </div>
  )
}
