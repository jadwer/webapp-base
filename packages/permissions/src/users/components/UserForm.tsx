'use client'

/**
 * Formulario de usuario (crear y editar).
 * - Password con toggle de visibilidad (patron ResetPasswordForm de @lwm/auth).
 * - Validacion en vivo de coincidencia password/confirmacion.
 * - Generador de contrasena segura (16 caracteres, crypto.getRandomValues).
 * - Roles multiples con checkboxes (relationship escribible en backend).
 * - Los 422 del backend se muestran SIEMPRE con detalle.
 */

import React, { useState } from 'react'
import { useRoleOptions } from '../hooks/useRoleOptions'
import { useUserMutations } from '../hooks/useUsers'
import { getUserValidationErrorMessages } from '../utils/jsonApiErrors'
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

  // Garantiza una de cada clase y completa con el alfabeto entero.
  const chars = [
    ...pick(upper, 1),
    ...pick(lower, 1),
    ...pick(digits, 1),
    ...pick(symbols, 1),
    ...pick(all, length - 4),
  ]

  // Mezcla Fisher-Yates con aleatoriedad criptografica.
  const rand = new Uint32Array(chars.length)
  crypto.getRandomValues(rand)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const isEdit = Boolean(user)
  const { roles, isLoading: rolesLoading } = useRoleOptions()
  const { createUser, updateUser } = useUserMutations()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [status, setStatus] = useState<UserStatus>(user?.status || 'active')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [roleIds, setRoleIds] = useState<string[]>(user?.roles.map((r) => r.id) || [])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationMessages, setValidationMessages] = useState<string[]>([])
  const [genericError, setGenericError] = useState<string | null>(null)

  // Validacion en vivo: solo cuando el usuario ya escribio en ambos campos.
  const passwordMismatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation
  const submitBlocked = isSubmitting || passwordMismatch

  const toggleRole = (roleId: string) => {
    setRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword()
    setPassword(generated)
    setPasswordConfirmation(generated)
    // Se muestran en claro para que el admin pueda copiarla.
    setShowPassword(true)
    setShowConfirmation(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (passwordMismatch) return

    setIsSubmitting(true)
    setValidationMessages([])
    setGenericError(null)

    try {
      const formData = {
        name,
        email,
        status,
        password: password || undefined,
        passwordConfirmation: passwordConfirmation || undefined,
        roleIds,
      }

      const result = user
        ? await updateUser(user.id, formData)
        : await createUser(formData)

      onSuccess?.(result)
    } catch (error) {
      // Un 422 SIEMPRE se muestra con el detalle de cada campo.
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
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary mb-1"
            onClick={handleGeneratePassword}
          >
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
        {passwordMismatch && (
          <div className="text-danger small mt-1">
            Las contraseñas no coinciden.
          </div>
        )}
      </div>

      <div className="mb-3">
        <span className="form-label d-block">Roles</span>
        {rolesLoading && (
          <div className="text-muted small">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Cargando roles...
          </div>
        )}
        {!rolesLoading && roles.length === 0 && (
          <div className="text-muted small">No hay roles disponibles.</div>
        )}
        <div className="d-flex flex-wrap gap-3">
          {roles.map((role) => (
            <div className="form-check" key={role.id}>
              <input
                id={`user-role-${role.id}`}
                type="checkbox"
                className="form-check-input"
                checked={roleIds.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
              <label htmlFor={`user-role-${role.id}`} className="form-check-label">
                {role.name}
              </label>
            </div>
          ))}
        </div>
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
