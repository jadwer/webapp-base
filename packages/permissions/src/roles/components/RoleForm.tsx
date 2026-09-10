'use client'

import { useState, useEffect, useRef } from 'react'
import { Role, RoleFormData } from '../types/role'
import { useRoleActions } from '../hooks/useRoles'
import { Button } from '@lwm/ui'
import { Input } from '@lwm/ui'
import { ToastNotifier, type ToastNotifierHandle } from '@lwm/ui'

interface RoleFormProps {
  role?: Role
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Form de DATOS del rol (nombre, guard, descripcion). La asignacion de
 * permisos vive en RolePermissionsEditor; este form no la toca (el
 * PATCH sin relationships no pisa los permisos existentes).
 */
export function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const { createRole, updateRole } = useRoleActions()
  const toastRef = useRef<ToastNotifierHandle>(null)

  const [formData, setFormData] = useState<RoleFormData>({
    name: role?.name || '',
    description: role?.description || '',
    guard_name: role?.guard_name || 'web',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        guard_name: role.guard_name,
      })
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (role) {
        await updateRole(role.id, formData)
        toastRef.current?.show('Rol actualizado correctamente', 'success', 6000)
      } else {
        await createRole(formData)
        toastRef.current?.show('Rol creado correctamente', 'success', 6000)
      }
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el rol'
      setError(errorMessage)
      toastRef.current?.show(errorMessage, 'error', 6000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre del rol *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Ej: admin, editor, viewer"
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="guard_name" className="form-label">
              Guard
            </label>
            <select
              id="guard_name"
              className="form-select"
              value={formData.guard_name}
              onChange={(e) => setFormData(prev => ({ ...prev, guard_name: e.target.value }))}
            >
              <option value="web">web</option>
              <option value="api">api</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Descripción
        </label>
        <textarea
          id="description"
          className="form-control"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="Descripción opcional del rol"
        />
      </div>

      <div className="d-flex gap-2">
        <Button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !formData.name.trim()}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Guardando...
            </>
          ) : (
            role ? 'Actualizar rol' : 'Crear rol'
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
      </div>
      
      <ToastNotifier ref={toastRef} />
    </form>
  )
}
