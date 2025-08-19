/**
 * WAREHOUSE FORM
 * Formulario para crear/editar warehouses
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import type { WarehouseParsed, CreateWarehouseData, UpdateWarehouseData } from '../types'
import { handleComponentError } from '../types/errors'

interface WarehouseFormProps {
  warehouse?: WarehouseParsed // For edit mode
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData) => Promise<void>
  isLoading?: boolean
}

export const WarehouseForm = memo<WarehouseFormProps>(({
  warehouse,
  onSubmit,
  isLoading = false
}) => {
  console.log('🔄 [WarehouseForm] Rendering', warehouse ? 'edit' : 'create', 'mode')
  
  const router = useRouter()
  const [formData, setFormData] = useState<CreateWarehouseData>({
    name: warehouse?.name || '',
    slug: warehouse?.slug || '',
    description: warehouse?.description || '',
    code: warehouse?.code || '',
    warehouseType: warehouse?.warehouseType || 'main',
    address: warehouse?.address || '',
    city: warehouse?.city || '',
    state: warehouse?.state || '',
    country: warehouse?.country || '',
    postalCode: warehouse?.postalCode || '',
    phone: warehouse?.phone || '',
    email: warehouse?.email || '',
    managerName: warehouse?.managerName || '',
    maxCapacity: warehouse?.maxCapacity || undefined,
    capacityUnit: warehouse?.capacityUnit || 'm3',
    isActive: warehouse?.isActive ?? true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleInputChange = useCallback((field: keyof CreateWarehouseData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.type === 'number'
      ? e.target.value ? parseFloat(e.target.value) : undefined
      : e.target.value
    
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string' && !warehouse) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [errors, warehouse])
  
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required'
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    // Phone validation (basic)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone should be at least 10 characters'
    }
    
    // Capacity validation
    if (formData.maxCapacity && formData.maxCapacity <= 0) {
      newErrors.maxCapacity = 'Capacity must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Clean up data - remove empty strings and undefined values
      const cleanData = {...formData}
      
      // Remove empty values
      Object.keys(cleanData).forEach(key => {
        const value = cleanData[key as keyof CreateWarehouseData]
        if (value === '' || value === undefined || value === null) {
          delete cleanData[key as keyof CreateWarehouseData]
        }
      })
      
      await onSubmit(cleanData)
      
      // Show success message
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-success text-white">
            <strong class="me-auto">Éxito</strong>
          </div>
          <div class="toast-body">
            Warehouse ${warehouse ? 'actualizado' : 'creado'} correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        router.push('/dashboard/inventory/warehouses')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error submitting warehouse:', error)
      
      // Handle error with proper typing
      const errorResult = handleComponentError(error)
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
          </div>
          <div class="toast-body">
            ${errorResult.message}
            ${errorResult.details ? '<br><small>' + errorResult.details.join(', ') + '</small>' : ''}
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, warehouse, router, validateForm])
  
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                {warehouse ? 'Edit Warehouse' : 'Create Warehouse'}
              </h2>
              <p className="text-muted mb-0">
                {warehouse 
                  ? 'Update warehouse information and settings'
                  : 'Add a new warehouse to your inventory system'
                }
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.back()}
            >
              <i className="bi bi-arrow-left me-2" />
              Back
            </Button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-body">
                <div className="row g-3">
                  {/* Basic Information */}
                  <div className="col-12">
                    <h5 className="card-title border-bottom pb-2">Basic Information</h5>
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Name *"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      errorText={errors.name}
                      placeholder="e.g., Main Warehouse"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Code *"
                      type="text"
                      value={formData.code}
                      onChange={handleInputChange('code')}
                      errorText={errors.code}
                      placeholder="e.g., WH-001"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Slug *"
                      type="text"
                      value={formData.slug}
                      onChange={handleInputChange('slug')}
                      errorText={errors.slug}
                      placeholder="e.g., main-warehouse"
                      helpText="URL-friendly version of the name"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Warehouse Type *</label>
                    <select
                      className="form-select"
                      value={formData.warehouseType}
                      onChange={handleInputChange('warehouseType')}
                      required
                    >
                      <option value="main">Principal</option>
                      <option value="secondary">Secundario</option>
                      <option value="distribution">Distribución</option>
                      <option value="returns">Devoluciones</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      placeholder="Optional description of the warehouse..."
                    />
                  </div>
                  
                  {/* Location */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Location</h5>
                  </div>
                  
                  <div className="col-12">
                    <Input
                      label="Address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange('address')}
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="City"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange('city')}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="State"
                      type="text"
                      value={formData.state}
                      onChange={handleInputChange('state')}
                      placeholder="State/Province"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Postal Code"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleInputChange('postalCode')}
                      placeholder="Postal Code"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Country"
                      type="text"
                      value={formData.country}
                      onChange={handleInputChange('country')}
                      placeholder="Country"
                    />
                  </div>
                  
                  {/* Contact Information */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Contact Information</h5>
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Manager Name"
                      type="text"
                      value={formData.managerName}
                      onChange={handleInputChange('managerName')}
                      placeholder="Manager full name"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      errorText={errors.phone}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      errorText={errors.email}
                      placeholder="warehouse@company.com"
                    />
                  </div>
                  
                  {/* Capacity */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Capacity</h5>
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Max Capacity"
                      type="number"
                      value={formData.maxCapacity?.toString() || ''}
                      onChange={handleInputChange('maxCapacity')}
                      errorText={errors.maxCapacity}
                      placeholder="10000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Capacity Unit</label>
                    <select
                      className="form-select"
                      value={formData.capacityUnit}
                      onChange={handleInputChange('capacityUnit')}
                    >
                      <option value="m3">Cubic Meters (m³)</option>
                      <option value="ft3">Cubic Feet (ft³)</option>
                      <option value="m2">Square Meters (m²)</option>
                      <option value="ft2">Square Feet (ft²)</option>
                      <option value="pallets">Pallets</option>
                      <option value="containers">Containers</option>
                    </select>
                  </div>
                  
                  {/* Status */}
                  <div className="col-12 mt-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange('isActive')}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active warehouse
                      </label>
                      <div className="form-text">
                        Only active warehouses will be available for operations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer d-flex justify-content-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isLoading}
                >
                  {warehouse ? 'Update' : 'Create'} Warehouse
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

WarehouseForm.displayName = 'WarehouseForm'