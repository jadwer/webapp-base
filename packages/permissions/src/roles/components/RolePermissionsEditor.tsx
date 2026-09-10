'use client'

/**
 * Editor de permisos de un rol, estilo Bind ERP: navegacion por modulo
 * de negocio, dentro un bloque por recurso con toggle maestro
 * (indeterminado si el grupo esta parcial) y una fila por permiso con
 * switch + nombre legible + descripcion (campos del catalogo backend;
 * el string tecnico nunca se muestra como texto principal).
 *
 * El guardado usa el PATCH del rol con la relationship `permissions`
 * (unico canal de sync que soporta el backend).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Permission, Role } from '../types/role'
import { rolesService } from '../services/rolesService'

interface RolePermissionsEditorProps {
  role: Role
  permissions: Permission[]
  onSaved?: (permissionIds: number[]) => void
}

interface ResourceGroup {
  resource: string
  label: string
  permissions: Permission[]
}

interface ModuleGroup {
  module: string
  label: string
  resources: ResourceGroup[]
  total: number
}

const permissionLabel = (p: Permission) => p.label || p.name
const permissionResource = (p: Permission) => p.resource || p.name.split('.').slice(0, -1).join('.') || p.name
const permissionModule = (p: Permission) => p.module || 'general'

function buildModuleGroups(permissions: Permission[]): ModuleGroup[] {
  const byModule = new Map<string, { label: string; byResource: Map<string, ResourceGroup> }>()

  for (const permission of permissions) {
    const moduleKey = permissionModule(permission)
    if (!byModule.has(moduleKey)) {
      byModule.set(moduleKey, {
        label: permission.moduleLabel || moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
        byResource: new Map(),
      })
    }
    const moduleEntry = byModule.get(moduleKey)!

    const resourceKey = permissionResource(permission)
    if (!moduleEntry.byResource.has(resourceKey)) {
      moduleEntry.byResource.set(resourceKey, {
        resource: resourceKey,
        label: permission.resourceLabel || resourceKey,
        permissions: [],
      })
    }
    moduleEntry.byResource.get(resourceKey)!.permissions.push(permission)
  }

  return Array.from(byModule.entries())
    .map(([module, entry]) => {
      const resources = Array.from(entry.byResource.values())
        .sort((a, b) => a.label.localeCompare(b.label, 'es'))
      return {
        module,
        label: entry.label,
        resources,
        total: resources.reduce((sum, r) => sum + r.permissions.length, 0),
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

/** Switch maestro con soporte de estado indeterminado (grupo parcial). */
function MasterSwitch({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
  ariaLabel: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <div className="form-check form-switch mb-0">
      <input
        ref={ref}
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </div>
  )
}

export function RolePermissionsEditor({ role, permissions, onSaved }: RolePermissionsEditorProps) {
  const initialIds = useMemo(
    () => new Set((role.permissions ?? []).map((p) => p.id)),
    [role]
  )
  const [selected, setSelected] = useState<Set<number>>(initialIds)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cambiar de rol resetea la seleccion al estado persistido.
  useEffect(() => {
    setSelected(new Set((role.permissions ?? []).map((p) => p.id)))
    setError(null)
  }, [role])

  const groups = useMemo(() => buildModuleGroups(permissions), [permissions])

  useEffect(() => {
    if (groups.length > 0 && (activeModule === null || !groups.some((g) => g.module === activeModule))) {
      setActiveModule(groups[0].module)
    }
  }, [groups, activeModule])

  const searchTerm = search.trim().toLowerCase()
  const matchesSearch = (p: Permission) =>
    searchTerm === '' ||
    permissionLabel(p).toLowerCase().includes(searchTerm) ||
    (p.description ?? '').toLowerCase().includes(searchTerm) ||
    p.name.toLowerCase().includes(searchTerm)

  // Con busqueda activa se muestran TODOS los modulos con coincidencias;
  // sin busqueda, solo el modulo activo.
  const visibleGroups = useMemo(() => {
    const source = searchTerm === '' ? groups.filter((g) => g.module === activeModule) : groups
    return source
      .map((g) => ({
        ...g,
        resources: g.resources
          .map((r) => ({ ...r, permissions: r.permissions.filter(matchesSearch) }))
          .filter((r) => r.permissions.length > 0),
      }))
      .filter((g) => g.resources.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, activeModule, searchTerm])

  const selectedCountByModule = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const g of groups) {
      counts[g.module] = g.resources.reduce(
        (sum, r) => sum + r.permissions.filter((p) => selected.has(p.id)).length,
        0
      )
    }
    return counts
  }, [groups, selected])

  const isDirty = useMemo(() => {
    if (selected.size !== initialIds.size) return true
    for (const id of selected) if (!initialIds.has(id)) return true
    return false
  }, [selected, initialIds])

  const togglePermission = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleResource = (group: ResourceGroup) => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = group.permissions.every((p) => next.has(p.id))
      for (const p of group.permissions) {
        if (allSelected) next.delete(p.id)
        else next.add(p.id)
      }
      return next
    })
  }

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
    <div className="card" data-testid="role-permissions-editor">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h6 className="mb-0">
            Permisos del rol <span className="fw-bold">{role.name}</span>
          </h6>
          <small className="text-muted">
            {selected.size} de {permissions.length} permisos activos
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ width: '260px' }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar permiso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar permiso"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
            ) : (
              <i className="bi bi-save me-1" />
            )}
            Guardar cambios
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger m-3 mb-0" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />{error}
        </div>
      )}

      <div className="card-body p-0">
        <div className="row g-0">
          {/* Navegacion por modulo */}
          <div className="col-lg-3 border-end">
            <div className="list-group list-group-flush" role="tablist">
              {groups.map((g) => (
                <button
                  key={g.module}
                  type="button"
                  role="tab"
                  aria-selected={searchTerm === '' && activeModule === g.module}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                    searchTerm === '' && activeModule === g.module ? 'active' : ''
                  }`}
                  onClick={() => { setSearch(''); setActiveModule(g.module) }}
                >
                  <span>{g.label}</span>
                  <span className={`badge rounded-pill ${selectedCountByModule[g.module] > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                    {selectedCountByModule[g.module]}/{g.total}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bloques por recurso */}
          <div className="col-lg-9">
            <div className="p-3" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {visibleGroups.length === 0 && (
                <p className="text-muted mb-0">Sin permisos que coincidan con la búsqueda.</p>
              )}
              {visibleGroups.map((g) => (
                <div key={g.module} className="mb-4">
                  {searchTerm !== '' && (
                    <h6 className="text-uppercase text-muted small mb-2">{g.label}</h6>
                  )}
                  {g.resources.map((r) => {
                    const selectedInGroup = r.permissions.filter((p) => selected.has(p.id)).length
                    const allSelected = selectedInGroup === r.permissions.length
                    const someSelected = selectedInGroup > 0 && !allSelected
                    return (
                      <div key={r.resource} className="border rounded mb-3">
                        <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light rounded-top">
                          <MasterSwitch
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={() => toggleResource(r)}
                            ariaLabel={`Activar todos los permisos de ${r.label}`}
                          />
                          <span className="fw-semibold">{r.label}</span>
                          <span className="text-muted small ms-auto">
                            {selectedInGroup}/{r.permissions.length}
                          </span>
                        </div>
                        <ul className="list-unstyled mb-0">
                          {r.permissions.map((p) => (
                            <li key={p.id} className="d-flex align-items-start gap-2 px-3 py-2 border-top">
                              <div className="form-check form-switch mb-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id={`perm-${p.id}`}
                                  checked={selected.has(p.id)}
                                  onChange={() => togglePermission(p.id)}
                                />
                              </div>
                              <label htmlFor={`perm-${p.id}`} className="flex-grow-1" style={{ cursor: 'pointer' }}>
                                <span className="d-block">{permissionLabel(p)}</span>
                                {p.description && (
                                  <span className="d-block text-muted small">{p.description}</span>
                                )}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
