'use client'

/**
 * Editor de permisos de un rol (plantilla). La lista y los toggles viven en
 * PermissionsChecklist (compartido con la pestana de permisos del usuario);
 * aqui solo el estado persistido y el guardado, que usa el PATCH del rol con
 * la relationship `permissions` (unico canal de sync que soporta el backend).
 */

import React, { useEffect, useMemo, useState } from 'react'
import type { Permission, Role } from '../types/role'
import { rolesService } from '../services/rolesService'
import { PermissionsChecklist } from './PermissionsChecklist'

interface RolePermissionsEditorProps {
  role: Role
  permissions: Permission[]
  onSaved?: (permissionIds: number[]) => void
}

export function RolePermissionsEditor({ role, permissions, onSaved }: RolePermissionsEditorProps) {
  const initialIds = useMemo(() => new Set((role.permissions ?? []).map((p) => p.id)), [role])
  const [selected, setSelected] = useState<Set<number>>(initialIds)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cambiar de rol resetea la seleccion al estado persistido.
  useEffect(() => {
    setSelected(new Set((role.permissions ?? []).map((p) => p.id)))
    setError(null)
  }, [role])

  const isDirty = useMemo(() => {
    if (selected.size !== initialIds.size) return true
    for (const id of selected) if (!initialIds.has(id)) return true
    return false
  }, [selected, initialIds])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const ids = Array.from(selected).sort((a, b) => a - b)
      await rolesService.update(role.id, {
        name: role.name,
        description: role.description,
        guard_name: role.guard_name,
        permissions: ids,
      })
      onSaved?.(ids)
    } catch {
      setError('No se pudieron guardar los permisos. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="role-permissions-editor">
      {error && (
        <div className="alert alert-danger mb-2" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />{error}
        </div>
      )}
      <PermissionsChecklist
        permissions={permissions}
        selected={selected}
        onChange={setSelected}
        title={<>Permisos de la plantilla <span className="fw-bold">{role.name}</span></>}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
            ) : (
              <i className="bi bi-save me-1" />
            )}
            Guardar cambios
          </button>
        }
      />
    </div>
  )
}
