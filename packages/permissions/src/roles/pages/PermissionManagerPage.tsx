'use client'

/**
 * Vista FUSIONADA de roles y permisos (rediseno 2026-09, estilo Bind):
 * lista de roles a la izquierda, editor de permisos por modulo/recurso
 * a la derecha. Sustituye a la dupla Permission Manager + Roles que
 * duplicaba informacion (observacion del disenador y del cliente).
 */

import { useMemo, useRef, useState } from 'react'
import { Role } from '../types/role'
import { RoleForm } from '../components/RoleForm'
import { RolePermissionsEditor } from '../components/RolePermissionsEditor'
import { useRoles } from '../hooks/useRoles'
import { useRoleActions } from '../hooks/useRoles'
import { usePermissions } from '../hooks/usePermissions'
import { ConfirmModal, toast, type ConfirmModalHandle } from '@lwm/ui'

export default function PermissionManagerPage() {
  const { roles, isLoading: rolesLoading, mutate } = useRoles(['permissions'])
  const { permissions, isLoading: permissionsLoading } = usePermissions()
  const { deleteRole } = useRoleActions()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [formRole, setFormRole] = useState<Role | null>(null)
  const [showForm, setShowForm] = useState(false)

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? roles[0] ?? null,
    [roles, selectedRoleId]
  )

  const handleSaved = async () => {
    toast.success('Permisos del rol guardados.')
    await mutate()
  }

  const handleDelete = async (role: Role) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el rol "${role.name}"? Los usuarios con este rol perderán sus permisos asociados.`,
      { title: 'Eliminar rol', confirmVariant: 'danger' }
    )
    if (!confirmed) return
    try {
      await deleteRole(role.id)
      toast.success(`Rol "${role.name}" eliminado.`)
      if (selectedRoleId === role.id) setSelectedRoleId(null)
    } catch {
      toast.error('No se pudo eliminar el rol. Verifica que no esté en uso.')
    }
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
            Selecciona un rol y activa los permisos por módulo
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setFormRole(null); setShowForm(true) }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Rol
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" aria-label="Cargando" />
        </div>
      ) : (
        <div className="row g-3">
          {/* Lista de roles */}
          <div className="col-lg-3">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Roles ({roles.length})</h6>
              </div>
              <div className="list-group list-group-flush">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                      selectedRole?.id === role.id ? 'active' : ''
                    }`}
                    role="button"
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <div className="flex-grow-1">
                      <span className="d-block fw-semibold">{role.name}</span>
                      <small className={selectedRole?.id === role.id ? '' : 'text-muted'}>
                        {role.permissions?.length ?? 0} permisos
                      </small>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedRole?.id === role.id ? 'btn-light' : 'btn-outline-secondary'}`}
                      title={`Editar datos del rol ${role.name}`}
                      aria-label={`Editar datos del rol ${role.name}`}
                      onClick={(e) => { e.stopPropagation(); setFormRole(role); setShowForm(true) }}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedRole?.id === role.id ? 'btn-light' : 'btn-outline-danger'}`}
                      title={`Eliminar rol ${role.name}`}
                      aria-label={`Eliminar rol ${role.name}`}
                      onClick={(e) => { e.stopPropagation(); handleDelete(role) }}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor de permisos del rol seleccionado */}
          <div className="col-lg-9">
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
          </div>
        </div>
      )}

      {/* Modal crear/editar datos del rol (nombre, guard, descripcion) */}
      {showForm && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{formRole ? `Editar rol ${formRole.name}` : 'Crear nuevo rol'}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <RoleForm
                  role={formRole ?? undefined}
                  onSuccess={() => { setShowForm(false); mutate() }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
