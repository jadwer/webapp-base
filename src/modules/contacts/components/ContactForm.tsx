/**
 * CONTACT FORM
 * Formulario básico para crear/editar contactos
 * Siguiendo patrón simple del blueprint
 */

'use client'

import React, { useState } from 'react'
import { Input } from '@/ui/components/base/Input'
import { Button } from '@/ui/components/base/Button'
import type { ContactFormData, ContactParsed } from '../types'

interface ContactFormProps {
  contact?: ContactParsed
  onSubmit: (data: ContactFormData) => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    contactType: contact?.contactType || 'company',
    name: contact?.name || '',
    legalName: contact?.legalName || '',
    taxId: contact?.taxId || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    website: contact?.website || '',
    status: contact?.status || 'active',
    isCustomer: contact?.isCustomer || false,
    isSupplier: contact?.isSupplier || false,
    creditLimit: contact?.creditLimit || undefined,
    classification: contact?.classification || '',
    paymentTerms: contact?.paymentTerms || undefined,
    notes: contact?.notes || '',
    metadata: contact?.metadata || {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    // RFC/Tax ID validation
    if (formData.taxId && formData.taxId.trim()) {
      const taxId = formData.taxId.trim().toUpperCase()
      
      // Length validation (max 13 characters)
      if (taxId.length > 13) {
        newErrors.taxId = 'El RFC no puede tener más de 13 caracteres'
      }
      // Format validation for Mexican RFC
      else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(taxId)) {
        newErrors.taxId = 'Formato de RFC inválido (ej. ABC123456XYZ o ABCD123456XYZ)'
      }
    }
    
    if (!formData.isCustomer && !formData.isSupplier) {
      newErrors.type = 'Debe ser cliente, proveedor o ambos'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    
    // Clean up form data - convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      legalName: formData.legalName?.trim() || undefined,
      taxId: formData.taxId?.trim() ? formData.taxId.trim().toUpperCase() : undefined,
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      website: formData.website?.trim() || undefined,
      classification: formData.classification?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      creditLimit: formData.creditLimit || undefined,
      paymentTerms: formData.paymentTerms || undefined
    }
    
    onSubmit(cleanedData)
  }

  const updateField = <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="row g-3">
        {/* Basic Information */}
        <div className="col-12">
          <h5 className="mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Información básica
          </h5>
        </div>

        {/* Contact Type */}
        <div className="col-md-6">
          <label htmlFor="contactType" className="form-label">
            Tipo de contacto <span className="text-danger">*</span>
          </label>
          <select
            id="contactType"
            className="form-select"
            value={formData.contactType}
            onChange={(e) => updateField('contactType', e.target.value as 'person' | 'company')}
            disabled={isLoading}
          >
            <option value="company">Empresa</option>
            <option value="person">Persona física</option>
          </select>
        </div>

        {/* Status */}
        <div className="col-md-6">
          <label htmlFor="status" className="form-label">
            Estado <span className="text-danger">*</span>
          </label>
          <select
            id="status"
            className="form-select"
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value as 'active' | 'inactive' | 'suspended')}
            disabled={isLoading}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>

        {/* Name */}
        <div className="col-md-6">
          <label htmlFor="name" className="form-label">
            {formData.contactType === 'company' ? 'Nombre comercial' : 'Nombre completo'} <span className="text-danger">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            errorText={errors.name}
            disabled={isLoading}
            placeholder={formData.contactType === 'company' ? 'Ej. Acme Corp' : 'Ej. Juan Pérez'}
          />
        </div>

        {/* Legal Name */}
        <div className="col-md-6">
          <label htmlFor="legalName" className="form-label">
            {formData.contactType === 'company' ? 'Razón social' : 'Nombre legal'}
          </label>
          <Input
            id="legalName"
            type="text"
            value={formData.legalName}
            onChange={(e) => updateField('legalName', e.target.value)}
            disabled={isLoading}
            placeholder={formData.contactType === 'company' ? 'Ej. Acme Corporation S.A. de C.V.' : 'Nombre completo legal'}
          />
        </div>

        {/* Tax ID */}
        <div className="col-md-6">
          <label htmlFor="taxId" className="form-label">
            {formData.contactType === 'company' ? 'RFC / Tax ID' : 'RFC / CURP'}
          </label>
          <Input
            id="taxId"
            type="text"
            value={formData.taxId}
            onChange={(e) => updateField('taxId', e.target.value.toUpperCase())}
            errorText={errors.taxId}
            disabled={isLoading}
            placeholder={formData.contactType === 'company' ? 'ACM123456ABC (máx. 13 caracteres)' : 'PERJ800101HDFLRN01'}
            maxLength={13}
          />
          {formData.taxId && formData.taxId.length > 0 && (
            <div className="form-text">
              <small className={formData.taxId.length <= 13 ? 'text-muted' : 'text-danger'}>
                {formData.taxId.length}/13 caracteres
              </small>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            errorText={errors.email}
            disabled={isLoading}
            placeholder="contacto@ejemplo.com"
            leftIcon="bi-envelope"
          />
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label htmlFor="phone" className="form-label">
            Teléfono
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            disabled={isLoading}
            placeholder="+52 55 1234 5678"
            leftIcon="bi-telephone"
          />
        </div>

        {/* Website */}
        <div className="col-md-6">
          <label htmlFor="website" className="form-label">
            Sitio web
          </label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => updateField('website', e.target.value)}
            disabled={isLoading}
            placeholder="https://ejemplo.com"
            leftIcon="bi-globe"
          />
        </div>

        {/* Classification */}
        <div className="col-12">
          <h5 className="mb-3 mt-4">
            <i className="bi bi-tags me-2"></i>
            Clasificación
          </h5>
        </div>

        {/* Is Customer/Supplier */}
        <div className="col-12">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isCustomer"
                  checked={formData.isCustomer}
                  onChange={(e) => updateField('isCustomer', e.target.checked)}
                  disabled={isLoading}
                />
                <label className="form-check-label" htmlFor="isCustomer">
                  <i className="bi bi-person-check me-1"></i>
                  Es cliente
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isSupplier"
                  checked={formData.isSupplier}
                  onChange={(e) => updateField('isSupplier', e.target.checked)}
                  disabled={isLoading}
                />
                <label className="form-check-label" htmlFor="isSupplier">
                  <i className="bi bi-building me-1"></i>
                  Es proveedor
                </label>
              </div>
            </div>
          </div>
          {errors.type && (
            <div className="text-danger small mt-1">{errors.type}</div>
          )}
        </div>

        {/* Classification */}
        <div className="col-md-6">
          <label htmlFor="classification" className="form-label">
            Clasificación
          </label>
          <select
            id="classification"
            className="form-select"
            value={formData.classification}
            onChange={(e) => updateField('classification', e.target.value)}
            disabled={isLoading}
          >
            <option value="">Sin clasificación</option>
            <option value="basic">Básico</option>
            <option value="standard">Estándar</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Payment Terms */}
        <div className="col-md-6">
          <label htmlFor="paymentTerms" className="form-label">
            Términos de pago (días)
          </label>
          <Input
            id="paymentTerms"
            type="number"
            min="0"
            value={formData.paymentTerms?.toString() || ''}
            onChange={(e) => updateField('paymentTerms', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isLoading}
            placeholder="30"
          />
        </div>

        {/* Credit Limit */}
        {formData.isCustomer && (
          <div className="col-md-6">
            <label htmlFor="creditLimit" className="form-label">
              Límite de crédito
            </label>
            <Input
              id="creditLimit"
              type="number"
              min="0"
              step="0.01"
              value={formData.creditLimit?.toString() || ''}
              onChange={(e) => updateField('creditLimit', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={isLoading}
              placeholder="0.00"
              leftIcon="bi-currency-dollar"
            />
          </div>
        )}

        {/* Notes */}
        <div className="col-12">
          <label htmlFor="notes" className="form-label">
            Notas adicionales
          </label>
          <textarea
            id="notes"
            className="form-control"
            rows={3}
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            disabled={isLoading}
            placeholder="Información adicional sobre el contacto..."
          />
        </div>

        {/* Form Actions */}
        <div className="col-12">
          <div className="d-flex gap-2 justify-content-end pt-3 border-top">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading && <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>}
              {contact ? 'Actualizar contacto' : 'Crear contacto'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}