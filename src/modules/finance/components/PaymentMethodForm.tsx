'use client'

/**
 * Payment Method Form Component
 * Create and edit payment methods
 * Features: Validation, error handling, code uniqueness
 */

import React, { useState, useEffect } from 'react'
import { usePaymentMethod, usePaymentMethodMutations } from '../hooks'
import { PaymentMethodForm as PaymentMethodFormType } from '../types'

interface PaymentMethodFormProps {
  methodId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  methodId,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!methodId
  const { method, isLoading: isLoadingMethod } = usePaymentMethod(methodId || null)
  const { createMethod, updateMethod } = usePaymentMethodMutations()

  const [formData, setFormData] = useState<PaymentMethodFormType>({
    name: '',
    code: '',
    description: '',
    requiresReference: false,
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing data when editing
  useEffect(() => {
    if (method && isEditing) {
      setFormData({
        name: method.name,
        code: method.code,
        description: method.description || '',
        requiresReference: method.requiresReference,
        isActive: method.isActive
      })
    }
  }, [method, isEditing])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido'
    } else if (formData.code.length > 20) {
      newErrors.code = 'El código no puede exceder 20 caracteres'
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      if (isEditing && methodId) {
        await updateMethod(methodId, formData)
        showToast('Método de pago actualizado correctamente', 'success')
      } else {
        await createMethod(formData)
        showToast('Método de pago creado correctamente', 'success')
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error submitting payment method:', error)

      // Handle duplicate code error
      if (error.response?.status === 422 || error.response?.status === 409) {
        const errorMessage = error.response?.data?.errors?.[0]?.detail || ''
        if (errorMessage.toLowerCase().includes('code') || errorMessage.toLowerCase().includes('código')) {
          setErrors({ code: 'Este código ya está en uso' })
        } else {
          setErrors({ submit: errorMessage || 'Error de validación' })
        }
      } else {
        setErrors({
          submit: error.response?.data?.errors?.[0]?.detail || 'Error al guardar el método de pago'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`
    toast.style.zIndex = '9999'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  if (isLoadingMethod && isEditing) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                {isEditing ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
              </h4>
            </div>
            <div className="card-body">
              {errors.submit && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Transferencia Bancaria"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                  <div className="form-text">
                    Nombre descriptivo del método de pago (máx. 100 caracteres)
                  </div>
                </div>

                {/* Code */}
                <div className="mb-3">
                  <label htmlFor="code" className="form-label">
                    Código <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: TRANSFER"
                    disabled={isSubmitting}
                    style={{ fontFamily: 'monospace' }}
                  />
                  {errors.code && (
                    <div className="invalid-feedback">{errors.code}</div>
                  )}
                  <div className="form-text">
                    Código único en MAYÚSCULAS (máx. 20 caracteres). Solo letras, números, guiones y guiones bajos.
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción opcional del método de pago"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                  <div className="form-text">
                    Descripción opcional (máx. 500 caracteres)
                  </div>
                </div>

                {/* Requires Reference */}
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="requiresReference"
                      className="form-check-input"
                      checked={formData.requiresReference}
                      onChange={(e) => setFormData({ ...formData, requiresReference: e.target.checked })}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="requiresReference" className="form-check-label">
                      Requiere número de referencia
                    </label>
                  </div>
                  <div className="form-text ms-4">
                    Activar si este método de pago requiere un número de referencia obligatorio
                  </div>
                </div>

                {/* Is Active */}
                <div className="mb-4">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="isActive"
                      className="form-check-input"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="isActive" className="form-check-label">
                      Activo
                    </label>
                  </div>
                  <div className="form-text ms-4">
                    Solo los métodos activos estarán disponibles para su uso
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-2">
                  {onCancel && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        {isEditing ? 'Actualizar' : 'Crear'} Método
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Card */}
          <div className="card mt-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información sobre Métodos de Pago
              </h6>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li>El <strong>código</strong> debe ser único en el sistema</li>
                <li>Usa códigos descriptivos en MAYÚSCULAS (Ej: TRANSFER, CASH, CARD)</li>
                <li>Activa "Requiere referencia" para métodos como transferencias bancarias</li>
                <li>Los métodos inactivos no aparecerán en formularios de pago</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
