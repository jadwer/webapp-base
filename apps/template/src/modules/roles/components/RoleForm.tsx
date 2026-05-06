'use client'

import { useState, useEffect, useRef } from 'react'
import { Role, RoleFormData } from '../types/role'
import { useRoleActions } from '../hooks/useRoles'
import { usePermissions } from '../hooks/usePermissions'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import ToastNotifier, { ToastNotifierHandle } from '@/ui/ToastNotifier'

interface RoleFormProps {
  role?: Role
  onSuccess?: () => void
  onCancel?: () => void
}

export function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const { createRole, updateRole } = useRoleActions()
  const { permissions, isLoading: loadingPermissions } = usePermissions()
  const toastRef = useRef<ToastNotifierHandle>(null)
  
  const [formData, setFormData] = useState<RoleFormData>({
    name: role?.name || '',
    description: role?.description || '',
    guard_name: role?.guard_name || 'web',
    permissions: role?.permissions?.map(p => p.id) || []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        guard_name: role.guard_name,
        permissions: role.permissions?.map(p => p.id) || []
      })
    }
  }, [role])

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...(prev.permissions || []), permissionId]
    }))
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

      <div className="mb-3">
        <label className="form-label">Permisos</label>
        
        <div className="mb-2">
          <Input
            type="text"
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loadingPermissions ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredPermissions.length === 0 ? (
              <p className="text-muted mb-0">No se encontraron permisos</p>
            ) : (
              <div className="row">
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="col-md-6 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={formData.permissions?.includes(permission.id) || false}
                        onChange={() => handlePermissionToggle(permission.id)}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`permission-${permission.id}`}
                      >
                        {permission.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <small className="form-text text-muted">
          {formData.permissions?.length || 0} permisos seleccionados
        </small>
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
