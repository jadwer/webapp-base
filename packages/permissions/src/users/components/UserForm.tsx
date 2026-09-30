'use client'

/**
 * Formulario de usuario (crear y editar) en dos pestanas.
 *
 * Datos: nombre, correo, estado, contrasena (toggle de visibilidad,
 * validacion en vivo, generador seguro) y sucursales (principal + con
 * acceso).
 *
 * Permisos (2026-09-24, decision A de Gabino: rol = plantilla): roles de
 * sistema (god, admin, customer) + select de plantilla que PRECARGA sus
 * permisos + checklist estilo Permission Manager para agregar o quitar. Al
 * guardar, el usuario queda con esa lista como permisos directos
 * (PUT /users/{id}/access). En edicion la pestana arranca con los permisos
 * EFECTIVOS del usuario, asi los usuarios previos se convierten sin ganar ni
 * perder acceso.
 *
 * Los 422 del backend se muestran SIEMPRE con detalle.
 */

import React, { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { useUserMutations } from '../hooks/useUsers'
import { getUserValidationErrorMessages } from '../utils/jsonApiErrors'
import { accessService, SYSTEM_ROLES, SYSTEM_ROLE_LABELS } from '../services/accessService'
import { useBranches } from '@lwm/auth'
import { useRoles } from '../../roles/hooks/useRoles'
import { usePermissions } from '../../roles/hooks/usePermissions'
import { PermissionsChecklist } from '../../roles/components/PermissionsChecklist'
import type { User, UserStatus } from '../types/user'

interface UserFormProps {
  /** Usuario existente = modo edicion; ausente = modo creacion. */
  user?: User
  onSuccess?: (user: User) => void
  onCancel?: () => void
}

const STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'banned', label: 'Bloqueado' },
]

/**
 * Genera una contrasena de 16 caracteres con al menos una mayuscula,
 * una minuscula, un digito y un simbolo, usando crypto.getRandomValues.
 */
export const generateSecurePassword = (length = 16): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*+-_=?'
  const all = upper + lower + digits + symbols

  const pick = (charset: string, count: number): string[] => {
    const values = new Uint32Array(count)
    crypto.getRandomValues(values)
    return Array.from(values, (v) => charset[v % charset.length])
  }

  const chars = [
    ...pick(upper, 1),
    ...pick(lower, 1),
    ...pick(digits, 1),
    ...pick(symbols, 1),
    ...pick(all, length - 4),
  ]

  const rand = new Uint32Array(chars.length)
  crypto.getRandomValues(rand)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

/** Errores del endpoint de acceso (validacion Laravel, no JSON:API). */
export const getAccessErrorMessages = (error: unknown): string[] => {
  const res = (error as { response?: { status?: number; data?: { errors?: Record<string, string[] | string> } } })
    ?.response
  if (res?.status !== 422 || !res.data?.errors) return []
  return Object.values(res.data.errors).flatMap((v) => (Array.isArray(v) ? v : [v]))
}

const sameSet = (a: Set<number>, b: Set<number>) => a.size === b.size && [...a].every((x) => b.has(x))

type Tab = 'data' | 'permissions'

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const isEdit = Boolean(user)
  const { createUser, updateUser } = useUserMutations()
  const { branches, isLoading: branchesLoading } = useBranches()
  const { roles: allRoles, isLoading: rolesLoading } = useRoles(['permissions'])
  const { permissions, isLoading: permissionsLoading } = usePermissions()
  const { data: access, isLoading: accessLoading } = useSWR(
    user ? ['user-access', user.id] : null,
    () => accessService.get(user!.id),
    { revalidateOnFocus: false }
  )

  const [tab, setTab] = useState<Tab>('data')

  // Datos
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [status, setStatus] = useState<UserStatus>(user?.status || 'active')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [branchId, setBranchId] = useState<string>(user?.branchId || '')
  const [branchIds, setBranchIds] = useState<string[]>(user?.branchIds || [])

  // Permisos
  const [systemRoles, setSystemRoles] = useState<string[]>([])
  const [template, setTemplate] = useState<string>('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [accessReady, setAccessReady] = useState(!isEdit)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationMessages, setValidationMessages] = useState<string[]>([])
  const [genericError, setGenericError] = useState<string | null>(null)

  // Plantillas = roles que no son de sistema.
  const templates = useMemo(
    () => (allRoles ?? []).filter((r) => !(SYSTEM_ROLES as readonly string[]).includes(r.name)),
    [allRoles]
  )
  const templatePermissions = useMemo(() => {
    const role = templates.find((r) => r.name === template)
    return role ? new Set((role.permissions ?? []).map((p) => p.id)) : undefined
  }, [templates, template])

  // Edicion: arrancar con el acceso efectivo del usuario (decision 2).
  useEffect(() => {
    if (!access) return
    setSystemRoles(access.systemRoles)
    setTemplate(access.permissionTemplate || access.templateRoles[0] || '')
    setSelected(new Set(access.effectivePermissionIds))
    setAccessReady(true)
  }, [access])

  const passwordMismatch = passwordConfirmation.length > 0 && password !== passwordConfirmation
  const submitBlocked = isSubmitting || passwordMismatch || !accessReady

  const toggleBranch = (id: string) => {
    setBranchIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }

  const toggleSystemRole = (role: string) => {
    setSystemRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const handleTemplateChange = (next: string) => {
    const nextPermissions = next ? templates.find((r) => r.name === next)?.permissions ?? [] : []
    const customized = templatePermissions ? !sameSet(selected, templatePermissions) : selected.size > 0
    if (customized && !window.confirm('Cambiar la plantilla reemplaza los permisos marcados. ¿Continuar?')) {
      return
    }
    setTemplate(next)
    setSelected(new Set(nextPermissions.map((p) => p.id)))
  }

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword()
    setPassword(generated)
    setPasswordConfirmation(generated)
    setShowPassword(true)
    setShowConfirmation(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (passwordMismatch) return

    setIsSubmitting(true)
    setValidationMessages([])
    setGenericError(null)

    let saved: User
    try {
      const formData = {
        name,
        email,
        status,
        password: password || undefined,
        passwordConfirmation: passwordConfirmation || undefined,
        // Vacio = el backend asigna la Matriz. La principal siempre cuenta como acceso.
        branchId: branchId || null,
        branchIds: branchId && !branchIds.includes(branchId) ? [...branchIds, branchId] : branchIds,
      }
      saved = user ? await updateUser(user.id, formData) : await createUser(formData)
    } catch (error) {
      const details = getUserValidationErrorMessages(error)
      if (details.length > 0) {
        setValidationMessages(details)
      } else {
        setGenericError(
          isEdit
            ? 'Error al actualizar el usuario. Por favor intenta de nuevo.'
            : 'Error al crear el usuario. Por favor intenta de nuevo.'
        )
      }
      setTab('data')
      setIsSubmitting(false)
      return
    }

    try {
      await accessService.put(saved.id, {
        systemRoles,
        template: template || null,
        permissionIds: Array.from(selected).sort((a, b) => a - b),
      })
      onSuccess?.(saved)
    } catch (error) {
      const details = getAccessErrorMessages(error)
      setValidationMessages(
        details.length > 0
          ? details
          : ['El usuario se guardó, pero no se pudieron guardar sus permisos. Intenta de nuevo.']
      )
      setTab('permissions')
    } finally {
      setIsSubmitting(false)
    }
  }

  const permissionsLoadingAny = rolesLoading || permissionsLoading || (isEdit && accessLoading)

  return (
    <form onSubmit={handleSubmit}>
      {validationMessages.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <strong>No se pudo guardar el usuario. Corrige lo siguiente:</strong>
          <ul className="mb-0 mt-2">
            {validationMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {genericError && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {genericError}
        </div>
      )}

      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'data'}
            className={`nav-link ${tab === 'data' ? 'active' : ''}`}
            onClick={() => setTab('data')}
          >
            <i className="bi bi-person me-1" aria-hidden="true" />
            Datos
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'permissions'}
            className={`nav-link ${tab === 'permissions' ? 'active' : ''}`}
            onClick={() => setTab('permissions')}
          >
            <i className="bi bi-shield-lock me-1" aria-hidden="true" />
            Permisos
            <span className="badge bg-secondary ms-2">{selected.size}</span>
          </button>
        </li>
      </ul>

      <div hidden={tab !== 'data'}>
        <div className="mb-3">
          <label htmlFor="user-name" className="form-label">Nombre</label>
          <input
            id="user-name"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="user-email" className="form-label">Correo electrónico</label>
          <input
            id="user-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="user-status" className="form-label">Estado</label>
          <select
            id="user-status"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label htmlFor="user-password" className="form-label mb-0">Contraseña</label>
            <button type="button" className="btn btn-sm btn-outline-secondary mb-1" onClick={handleGeneratePassword}>
              <i className="bi bi-magic me-1"></i>
              Generar contraseña segura
            </button>
          </div>
          <div className="input-group">
            <input
              id="user-password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? '(Dejar vacío si no cambia)' : 'Mínimo 8 caracteres'}
              required={!isEdit}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="user-password-confirmation" className="form-label">
            Confirmar contraseña
          </label>
          <div className="input-group">
            <input
              id="user-password-confirmation"
              type={showConfirmation ? 'text' : 'password'}
              className={`form-control ${passwordMismatch ? 'is-invalid' : ''}`}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder={isEdit ? '(Dejar vacío si no cambia)' : 'Repite la contraseña'}
              required={!isEdit}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowConfirmation(!showConfirmation)}
              aria-label={showConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <i className={`bi ${showConfirmation ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
          {passwordMismatch && <div className="text-danger small mt-1">Las contraseñas no coinciden.</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="user-branch" className="form-label">Sucursal principal</label>
          <select
            id="user-branch"
            className="form-select"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            disabled={branchesLoading}
          >
            <option value="">{branchesLoading ? 'Cargando sucursales...' : 'Principal de la empresa (Matriz)'}</option>
            {branches
              .filter((b) => b.isActive || b.id === branchId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.isMain ? ' (principal)' : ''}
                </option>
              ))}
          </select>
        </div>

        {branches.length > 1 && (
          <div className="mb-3">
            <span className="form-label d-block">Sucursales con acceso</span>
            <div className="d-flex flex-wrap gap-3">
              {branches
                .filter((b) => b.isActive)
                .map((b) => (
                  <div className="form-check" key={b.id}>
                    <input
                      id={`user-branch-access-${b.id}`}
                      type="checkbox"
                      className="form-check-input"
                      checked={branchIds.includes(b.id) || b.id === branchId}
                      disabled={b.id === branchId}
                      onChange={() => toggleBranch(b.id)}
                    />
                    <label htmlFor={`user-branch-access-${b.id}`} className="form-check-label">
                      {b.name}
                    </label>
                  </div>
                ))}
            </div>
            <div className="form-text">
              La sucursal principal siempre tiene acceso. Sin permisos de administrador, el usuario solo ve los documentos
              de estas sucursales.
            </div>
          </div>
        )}
      </div>

      <div hidden={tab !== 'permissions'}>
        {permissionsLoadingAny ? (
          <div className="text-muted">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Cargando permisos...
          </div>
        ) : (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <label htmlFor="user-template" className="form-label">Plantilla de permisos</label>
                <select
                  id="user-template"
                  className="form-select"
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Sin plantilla</option>
                  {templates.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({(r.permissions ?? []).length} permisos)
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  La plantilla solo precarga permisos. Lo que ajustes abajo queda solo para este usuario.
                </div>
              </div>
              <div className="col-md-7">
                <span className="form-label d-block">Roles de sistema</span>
                <div className="d-flex flex-wrap gap-3">
                  {SYSTEM_ROLES.map((role) => (
                    <div className="form-check" key={role}>
                      <input
                        id={`user-system-role-${role}`}
                        type="checkbox"
                        className="form-check-input"
                        checked={systemRoles.includes(role)}
                        onChange={() => toggleSystemRole(role)}
                      />
                      <label htmlFor={`user-system-role-${role}`} className="form-check-label">
                        {SYSTEM_ROLE_LABELS[role]}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="form-text">Superadministrador y Administrador tienen acceso a todo sin importar la lista.</div>
              </div>
            </div>

            <PermissionsChecklist
              permissions={permissions ?? []}
              selected={selected}
              onChange={setSelected}
              highlight={templatePermissions}
              title={template ? <>Permisos (plantilla <span className="fw-bold">{template}</span>)</> : 'Permisos'}
              testId="user-permissions-checklist"
            />
          </>
        )}
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={submitBlocked}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : isEdit ? (
            'Guardar cambios'
          ) : (
            'Crear usuario'
          )}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
