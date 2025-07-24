'use client'

import { useState, useEffect } from 'react'
import { Permission, PermissionFormData } from '../types/permission'

interface PermissionFormProps {
  permission?: Permission | null
  onSubmit: (data: PermissionFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export default function PermissionForm({ 
  permission, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: PermissionFormProps) {
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    guard_name: 'api'
  })
  const [errors, setErrors] = useState<Partial<PermissionFormData>>({})

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        guard_name: permission.guard_name
      })
    } else {
      setFormData({
        name: '',
        guard_name: 'api'
      })
    }
    setErrors({})
  }, [permission])

  const validateForm = (): boolean => {
    const newErrors: Partial<PermissionFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.guard_name.trim()) {
      newErrors.guard_name = 'El guard es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error al guardar permiso:', error)
    }
  }

  const handleChange = (field: keyof PermissionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Nombre del Permiso <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="name"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
          placeholder="Ej: users.view, posts.create, etc."
          required
          disabled={isSubmitting}
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name}</div>
        )}
        <div className="form-text">
          Usa la convención <code>módulo.acción</code> (ej: users.index, roles.store)
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="guard_name" className="form-label">
          Guard Name <span className="text-danger">*</span>
        </label>
        <select
          id="guard_name"
          className={`form-select ${errors.guard_name ? 'is-invalid' : ''}`}
          value={formData.guard_name}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('guard_name', e.target.value)}
          required
          disabled={isSubmitting}
        >
          <option value="api">api</option>
          <option value="web">web</option>
        </select>
        {errors.guard_name && (
          <div className="invalid-feedback">{errors.guard_name}</div>
        )}
        <div className="form-text">
          Usa <code>api</code> para APIs REST y <code>web</code> para rutas web
        </div>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </span>
          )}
          {permission ? 'Actualizar' : 'Crear'} Permiso
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
