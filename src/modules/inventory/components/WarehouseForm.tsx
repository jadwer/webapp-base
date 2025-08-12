/**
 * 📦 WAREHOUSE FORM - INVENTORY MODULE
 * Formulario enterprise para crear/editar almacenes
 * 
 * Features:
 * - Validación en tiempo real con business rules
 * - Auto-generación de slug desde name
 * - Validación de código y slug únicos
 * - Loading states y error handling
 * - Responsive design
 * - Integration con mutations hooks
 */

'use client'

import React, { memo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useWarehousesMutations,
  useWarehouseCodeValidation,
  useWarehouseSlugValidation,
} from '../hooks'
import { generateSlugFromName, getWarehouseTypeLabel } from '../services'
import { WAREHOUSE_BUSINESS_RULES } from '../types'
import type { Warehouse, CreateWarehouseData, UpdateWarehouseData, WarehouseType } from '../types'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'

// ===== COMPONENT PROPS =====

interface WarehouseFormProps {
  warehouse?: Warehouse | null  // Para edición, null para creación
  onSuccess?: (warehouse: Warehouse) => void
  onCancel?: () => void
  className?: string
  showCancelButton?: boolean
  autoRedirect?: boolean  // Auto-redirect después de success
}

// ===== FORM DATA INTERFACE =====

interface FormData {
  // Básicos
  name: string
  code: string
  slug: string
  description: string
  warehouseType: WarehouseType
  
  // Ubicación física
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  
  // Contacto
  phone: string
  email: string
  managerName: string
  
  // Capacidad
  maxCapacity: string  // String para input, se convierte a number
  capacityUnit: string
  operatingHours: string
  
  // Estado
  isActive: boolean
}

// ===== VALIDATION STATE =====

interface ValidationState {
  errors: Record<string, string>
  isValid: boolean
  touched: Record<string, boolean>
}

// ===== DEFAULT FORM DATA =====

const getDefaultFormData = (warehouse?: Warehouse | null): FormData => ({
  name: warehouse?.name || '',
  code: warehouse?.code || '',
  slug: warehouse?.slug || '',
  description: warehouse?.description || '',
  warehouseType: warehouse?.warehouseType || 'main',
  
  address: warehouse?.address || '',
  city: warehouse?.city || '',
  state: warehouse?.state || '',
  country: warehouse?.country || '',
  postalCode: warehouse?.postalCode || '',
  
  phone: warehouse?.phone || '',
  email: warehouse?.email || '',
  managerName: warehouse?.managerName || '',
  
  maxCapacity: warehouse?.maxCapacity?.toString() || '',
  capacityUnit: warehouse?.capacityUnit || '',
  operatingHours: warehouse?.operatingHours || '',
  
  isActive: warehouse?.isActive ?? true,
})

// ===== MAIN COMPONENT =====

const WarehouseForm: React.FC<WarehouseFormProps> = memo(({
  warehouse = null,
  onSuccess,
  onCancel,
  className = '',
  showCancelButton = true,
  autoRedirect = true,
}) => {
  
  // ===== STATE =====
  
  const [formData, setFormData] = useState<FormData>(() => getDefaultFormData(warehouse))
  const [validation, setValidation] = useState<ValidationState>({
    errors: {},
    isValid: false,
    touched: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!warehouse) // Auto en modo create
  
  // ===== HOOKS =====
  
  const router = useRouter()
  const mutations = useWarehousesMutations()
  
  // Validación en tiempo real
  const codeValidation = useWarehouseCodeValidation(
    formData.code, 
    warehouse?.id
  )
  const slugValidation = useWarehouseSlugValidation(
    formData.slug, 
    warehouse?.id
  )
  
  // ===== HANDLERS =====
  
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-generar slug cuando cambia el name (solo en modo create o si auto está habilitado)
      if (field === 'name' && autoGenerateSlug && typeof value === 'string') {
        newData.slug = generateSlugFromName(value)
      }
      
      return newData
    })
    
    // Marcar campo como touched
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true }
    }))
  }, [autoGenerateSlug])
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Preparar data para API
      const apiData: CreateWarehouseData | UpdateWarehouseData = {
        ...(warehouse ? { id: warehouse.id } : {}),
        name: formData.name.trim(),
        code: formData.code.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        warehouseType: formData.warehouseType,
        
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        managerName: formData.managerName.trim() || undefined,
        
        maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
        capacityUnit: formData.capacityUnit.trim() || undefined,
        operatingHours: formData.operatingHours.trim() || undefined,
        
        isActive: formData.isActive,
      }
      
      // Ejecutar mutation
      const result = warehouse 
        ? await mutations.update.mutate(apiData as UpdateWarehouseData)
        : await mutations.create.mutate(apiData as CreateWarehouseData)
      
      // Success callback
      if (onSuccess) {
        onSuccess(result)
      }
      
      // Auto-redirect si está habilitado
      if (autoRedirect) {
        router.push('/dashboard/inventory/warehouses')
      }
      
    } catch (error: any) {
      // Error ya manejado por mutation hook con toast
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    formData, 
    warehouse, 
    isSubmitting, 
    mutations, 
    onSuccess, 
    autoRedirect, 
    router
  ])
  
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    } else if (autoRedirect) {
      router.back()
    }
  }, [onCancel, autoRedirect, router])
  
  // ===== VALIDATION =====
  
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    
    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    } else if (formData.name.length > WAREHOUSE_BUSINESS_RULES.NAME_MAX_LENGTH) {
      errors.name = `Máximo ${WAREHOUSE_BUSINESS_RULES.NAME_MAX_LENGTH} caracteres`
    }
    
    if (!formData.code.trim()) {
      errors.code = 'El código es requerido'
    } else if (formData.code.length > WAREHOUSE_BUSINESS_RULES.CODE_MAX_LENGTH) {
      errors.code = `Máximo ${WAREHOUSE_BUSINESS_RULES.CODE_MAX_LENGTH} caracteres`
    }
    
    if (!formData.slug.trim()) {
      errors.slug = 'El slug es requerido'
    }
    
    // Email validation
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Formato de email inválido'
    }
    
    // Capacity validation
    if (formData.maxCapacity) {
      const capacity = Number(formData.maxCapacity)
      if (isNaN(capacity) || capacity < 0) {
        errors.maxCapacity = 'La capacidad debe ser un número positivo'
      }
    }
    
    // External validations
    if (codeValidation.isInvalid) {
      errors.code = 'Este código ya está en uso'
    }
    
    if (slugValidation.isInvalid) {
      errors.slug = 'Este slug ya está en uso'
    }
    
    const isValid = Object.keys(errors).length === 0 && 
                   !codeValidation.isChecking && 
                   !slugValidation.isChecking
    
    setValidation({ errors, isValid, touched: validation.touched })
    
    return isValid
  }, [formData, codeValidation, slugValidation, validation.touched])
  
  // ===== EFFECTS =====
  
  // Validar form cuando cambian los datos
  useEffect(() => {
    validateForm()
  }, [validateForm])
  
  // ===== UTILITIES =====
  
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  function getFieldError(field: string): string | undefined {
    return validation.touched[field] ? validation.errors[field] : undefined
  }
  
  function getFieldValidationState(field: string): 'valid' | 'invalid' | undefined {
    if (!validation.touched[field]) return undefined
    return validation.errors[field] ? 'invalid' : 'valid'
  }
  
  // ===== RENDER =====
  
  return (
    <div className={`warehouse-form ${className}`}>
      <form onSubmit={handleSubmit} noValidate>
        
        {/* Basic Information */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Información Básica
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              
              {/* Name */}
              <div className="col-md-6">
                <label className="form-label">
                  Nombre del Almacén <span className="text-danger">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="Ej: Almacén Central"
                  leftIcon="bi-building"
                  error={getFieldError('name')}
                  validationState={getFieldValidationState('name')}
                  maxLength={WAREHOUSE_BUSINESS_RULES.NAME_MAX_LENGTH}
                  required
                />
              </div>
              
              {/* Code */}
              <div className="col-md-3">
                <label className="form-label">
                  Código <span className="text-danger">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(value) => handleInputChange('code', value.toUpperCase())}
                  placeholder="WH001"
                  leftIcon="bi-hash"
                  error={getFieldError('code')}
                  validationState={getFieldValidationState('code')}
                  maxLength={WAREHOUSE_BUSINESS_RULES.CODE_MAX_LENGTH}
                  required
                />
                {codeValidation.isChecking && (
                  <div className="form-text">
                    <i className="bi bi-arrow-clockwise spin me-1"></i>
                    Verificando disponibilidad...
                  </div>
                )}
              </div>
              
              {/* Warehouse Type */}
              <div className="col-md-3">
                <label className="form-label">
                  Tipo de Almacén <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${getFieldValidationState('warehouseType') === 'invalid' ? 'is-invalid' : ''}`}
                  value={formData.warehouseType}
                  onChange={(e) => handleInputChange('warehouseType', e.target.value as WarehouseType)}
                  required
                >
                  {WAREHOUSE_BUSINESS_RULES.VALID_WAREHOUSE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {getWarehouseTypeLabel(type)}
                    </option>
                  ))}
                </select>
                {getFieldError('warehouseType') && (
                  <div className="invalid-feedback">{getFieldError('warehouseType')}</div>
                )}
              </div>
              
              {/* Slug */}
              <div className="col-md-6">
                <label className="form-label">
                  Slug <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <Input
                    type="text"
                    value={formData.slug}
                    onChange={(value) => handleInputChange('slug', value.toLowerCase())}
                    placeholder="almacen-central"
                    leftIcon="bi-link-45deg"
                    error={getFieldError('slug')}
                    validationState={getFieldValidationState('slug')}
                    disabled={autoGenerateSlug}
                    required
                  />
                  <button
                    type="button"
                    className={`btn btn-outline-secondary ${autoGenerateSlug ? 'active' : ''}`}
                    onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                    title={autoGenerateSlug ? 'Desactivar auto-generación' : 'Activar auto-generación'}
                  >
                    <i className="bi bi-magic"></i>
                  </button>
                </div>
                {slugValidation.isChecking && (
                  <div className="form-text">
                    <i className="bi bi-arrow-clockwise spin me-1"></i>
                    Verificando disponibilidad...
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="col-md-6">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del almacén..."
                  rows={3}
                  maxLength={WAREHOUSE_BUSINESS_RULES.DESCRIPTION_MAX_LENGTH}
                />
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Location Information */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-geo-alt me-2"></i>
              Ubicación Física
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              
              {/* Address */}
              <div className="col-12">
                <label className="form-label">Dirección</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(value) => handleInputChange('address', value)}
                  placeholder="Calle, número, colonia..."
                  leftIcon="bi-house"
                />
              </div>
              
              {/* City, State, Country */}
              <div className="col-md-4">
                <label className="form-label">Ciudad</label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(value) => handleInputChange('city', value)}
                  placeholder="Ciudad"
                  leftIcon="bi-building"
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Estado/Provincia</label>
                <Input
                  type="text"
                  value={formData.state}
                  onChange={(value) => handleInputChange('state', value)}
                  placeholder="Estado"
                  leftIcon="bi-map"
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">País</label>
                <Input
                  type="text"
                  value={formData.country}
                  onChange={(value) => handleInputChange('country', value)}
                  placeholder="País"
                  leftIcon="bi-globe"
                />
              </div>
              
              {/* Postal Code */}
              <div className="col-md-3">
                <label className="form-label">Código Postal</label>
                <Input
                  type="text"
                  value={formData.postalCode}
                  onChange={(value) => handleInputChange('postalCode', value)}
                  placeholder="12345"
                  leftIcon="bi-mailbox"
                />
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-person-lines-fill me-2"></i>
              Información de Contacto
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              
              {/* Manager Name */}
              <div className="col-md-4">
                <label className="form-label">Gerente/Responsable</label>
                <Input
                  type="text"
                  value={formData.managerName}
                  onChange={(value) => handleInputChange('managerName', value)}
                  placeholder="Nombre completo"
                  leftIcon="bi-person"
                />
              </div>
              
              {/* Phone */}
              <div className="col-md-4">
                <label className="form-label">Teléfono</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="+52 55 1234 5678"
                  leftIcon="bi-telephone"
                />
              </div>
              
              {/* Email */}
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="almacen@empresa.com"
                  leftIcon="bi-envelope"
                  error={getFieldError('email')}
                  validationState={getFieldValidationState('email')}
                />
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Capacity & Operations */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-speedometer me-2"></i>
              Capacidad y Operaciones
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              
              {/* Max Capacity */}
              <div className="col-md-4">
                <label className="form-label">Capacidad Máxima</label>
                <Input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(value) => handleInputChange('maxCapacity', value)}
                  placeholder="1000"
                  leftIcon="bi-box"
                  min="0"
                  error={getFieldError('maxCapacity')}
                  validationState={getFieldValidationState('maxCapacity')}
                />
              </div>
              
              {/* Capacity Unit */}
              <div className="col-md-4">
                <label className="form-label">Unidad de Capacidad</label>
                <Input
                  type="text"
                  value={formData.capacityUnit}
                  onChange={(value) => handleInputChange('capacityUnit', value)}
                  placeholder="m³, ton, pallets, etc."
                  leftIcon="bi-rulers"
                />
              </div>
              
              {/* Operating Hours */}
              <div className="col-md-4">
                <label className="form-label">Horario de Operación</label>
                <Input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(value) => handleInputChange('operatingHours', value)}
                  placeholder="Lun-Vie 8:00-18:00"
                  leftIcon="bi-clock"
                />
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-toggle-on me-2"></i>
              Estado
            </h6>
          </div>
          <div className="card-body">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isActive">
                <strong>Almacén Activo</strong>
                <div className="text-muted small">
                  Los almacenes inactivos no permiten nuevas operaciones de inventario
                </div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-end">
          {showCancelButton && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            disabled={!validation.isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-arrow-clockwise spin me-2"></i>
                {warehouse ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${warehouse ? 'check-lg' : 'plus-lg'} me-2`}></i>
                {warehouse ? 'Actualizar Almacén' : 'Crear Almacén'}
              </>
            )}
          </Button>
        </div>
        
      </form>
    </div>
  )
})

// ===== COMPONENT OPTIMIZATION =====

WarehouseForm.displayName = 'WarehouseForm'

// ===== STYLES =====

const styles = `
.warehouse-form .card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.warehouse-form .card-title {
  color: #495057;
  font-weight: 600;
}

.warehouse-form .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.warehouse-form .form-text {
  font-size: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .warehouse-form .d-flex.gap-3 {
    flex-direction: column;
  }
  
  .warehouse-form .d-flex.gap-3 > * {
    width: 100%;
  }
}
`

// Inject styles (en producción esto iría en un archivo .module.scss)
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-component="warehouse-form"]')
  if (!existingStyle) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-component', 'warehouse-form')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default WarehouseForm