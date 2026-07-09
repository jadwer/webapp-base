/**
 * LOCATION FORM
 * Formulario para crear/editar warehouse locations
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import { useWarehouses } from '../hooks'
import type { WarehouseLocationParsed, CreateLocationData, UpdateLocationData } from '../types'

interface LocationFormProps {
  location?: WarehouseLocationParsed // For edit mode
  onSubmit: (data: CreateLocationData | UpdateLocationData) => Promise<void>
  isLoading?: boolean
}

export const LocationForm = memo<LocationFormProps>(({
  location,
  onSubmit,
  isLoading = false
}) => {
  const router = useRouter()
  
  // Fetch warehouses for selection
  const { warehouses } = useWarehouses()
  
  const [formData, setFormData] = useState<CreateLocationData>({
    name: location?.name || '',
    code: location?.code || '',
    description: location?.description || '',
    locationType: location?.locationType || 'rack',
    aisle: location?.aisle || '',
    rack: location?.rack || '',
    shelf: location?.shelf || '',
    level: location?.level || '',
    position: location?.position || '',
    barcode: location?.barcode || '',
    maxWeight: location?.maxWeight || undefined,
    maxVolume: location?.maxVolume || undefined,
    dimensions: location?.dimensions || '',
    isActive: location?.isActive ?? true,
    isPickable: location?.isPickable ?? true,
    isReceivable: location?.isReceivable ?? true,
    priority: location?.priority || 1,
    warehouseId: location?.warehouseId || '',
    metadata: location?.metadata || undefined
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Auto-generate code from hierarchical structure
  useEffect(() => {
    if (!location && formData.aisle && formData.rack) {
      const parts = [
        formData.aisle,
        formData.rack,
        formData.shelf,
        formData.level
      ].filter(Boolean)
      
      if (parts.length >= 2) {
        const generatedCode = parts.join('-')
        setFormData(prev => ({ 
          ...prev, 
          code: generatedCode,
          name: prev.name || `Location ${generatedCode}`
        }))
      }
    }
  }, [formData.aisle, formData.rack, formData.shelf, formData.level, location])
  
  const handleInputChange = useCallback((field: keyof CreateLocationData) => (
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
  }, [errors])
  
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required'
    }
    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Warehouse is required'
    }
    if (!formData.locationType) {
      newErrors.locationType = 'Location type is required'
    }
    
    // Numeric validations
    if (formData.maxWeight && formData.maxWeight <= 0) {
      newErrors.maxWeight = 'Max weight must be greater than 0'
    }
    if (formData.maxVolume && formData.maxVolume <= 0) {
      newErrors.maxVolume = 'Max volume must be greater than 0'
    }
    if (formData.priority && (formData.priority < 1 || formData.priority > 10)) {
      newErrors.priority = 'Priority must be between 1 and 10'
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
        const value = cleanData[key as keyof CreateLocationData]
        if (value === '' || value === undefined || value === null) {
          delete cleanData[key as keyof CreateLocationData]
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
            Location ${location ? 'actualizada' : 'creada'} correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        router.push('/dashboard/inventory/locations')
      }, 2000)
      
    } catch (error: unknown) {
      // Show error message
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving location'
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, location, router, validateForm])
  
  const selectedWarehouse = warehouses?.find(w => w.id === formData.warehouseId)
  
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                {location ? 'Edit Location' : 'Create Location'}
              </h2>
              <p className="text-muted mb-0">
                {location 
                  ? 'Update location information and settings'
                  : 'Add a new location to a warehouse'
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
                      placeholder="e.g., Zone A - Aisle 1 - Rack 1"
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
                      placeholder="e.g., A-1-1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Warehouse *</label>
                    <select
                      className={`form-select ${errors.warehouseId ? 'is-invalid' : ''}`}
                      value={formData.warehouseId}
                      onChange={handleInputChange('warehouseId')}
                      required
                    >
                      <option value="">Select a warehouse...</option>
                      {warehouses?.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                    {errors.warehouseId && (
                      <div className="invalid-feedback">{errors.warehouseId}</div>
                    )}
                    {selectedWarehouse && (
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1" />
                        {selectedWarehouse.address || 'No address specified'}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Location Type *</label>
                    <select
                      className="form-select"
                      value={formData.locationType}
                      onChange={handleInputChange('locationType')}
                      required
                    >
                      <option value="rack">Rack</option>
                      <option value="shelf">Shelf</option>
                      <option value="floor">Floor</option>
                      <option value="bin">Bin</option>
                      <option value="dock">Dock</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      placeholder="Optional description of the location..."
                    />
                  </div>
                  
                  {/* Hierarchical Location */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">
                      Hierarchical Position
                      <small className="text-muted ms-2">Define the physical location structure</small>
                    </h5>
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Aisle"
                      type="text"
                      value={formData.aisle}
                      onChange={handleInputChange('aisle')}
                      placeholder="A, B, C..."
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Rack"
                      type="text"
                      value={formData.rack}
                      onChange={handleInputChange('rack')}
                      placeholder="1, 2, 3..."
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Shelf"
                      type="text"
                      value={formData.shelf}
                      onChange={handleInputChange('shelf')}
                      placeholder="1, 2, 3..."
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Level"
                      type="text"
                      value={formData.level}
                      onChange={handleInputChange('level')}
                      placeholder="1, 2, 3..."
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Position"
                      type="text"
                      value={formData.position}
                      onChange={handleInputChange('position')}
                      placeholder="Left, Right, Center..."
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Barcode"
                      type="text"
                      value={formData.barcode}
                      onChange={handleInputChange('barcode')}
                      placeholder="Barcode for scanning"
                    />
                  </div>
                  
                  {/* Capacity Limits */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Capacity Limits</h5>
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Max Weight (kg)"
                      type="number"
                      value={formData.maxWeight?.toString() || ''}
                      onChange={handleInputChange('maxWeight')}
                      errorText={errors.maxWeight}
                      placeholder="1000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Max Volume (m³)"
                      type="number"
                      value={formData.maxVolume?.toString() || ''}
                      onChange={handleInputChange('maxVolume')}
                      errorText={errors.maxVolume}
                      placeholder="100"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Dimensions"
                      type="text"
                      value={formData.dimensions}
                      onChange={handleInputChange('dimensions')}
                      placeholder="2m x 1m x 3m"
                    />
                  </div>
                  
                  {/* Properties */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Properties & Settings</h5>
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Priority (1-10)"
                      type="number"
                      value={formData.priority?.toString() || ''}
                      onChange={handleInputChange('priority')}
                      errorText={errors.priority}
                      placeholder="1"
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label">Status & Capabilities</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange('isActive')}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active location
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isPickable"
                          checked={formData.isPickable}
                          onChange={handleInputChange('isPickable')}
                        />
                        <label className="form-check-label" htmlFor="isPickable">
                          Pickable
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isReceivable"
                          checked={formData.isReceivable}
                          onChange={handleInputChange('isReceivable')}
                        />
                        <label className="form-check-label" htmlFor="isReceivable">
                          Receivable
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Additional Metadata</h5>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Metadata (JSON)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.metadata ? JSON.stringify(formData.metadata, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? JSON.parse(e.target.value) : undefined
                          setFormData(prev => ({ ...prev, metadata: parsed }))
                        } catch {
                          // Invalid JSON, keep the string for now
                        }
                      }}
                      placeholder='{"storage_conditions": "dry", "special_handling": "fragile"}'
                    />
                    <div className="form-text">
                      Enter additional metadata as JSON (storage conditions, special handling, etc.)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer d-flex justify-content-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  buttonStyle="outline"
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
                  {location ? 'Update' : 'Create'} Location
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

LocationForm.displayName = 'LocationForm'