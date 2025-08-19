/**
 * WAREHOUSE FORM MODAL
 * Modal con formulario para crear/editar warehouses
 * UI Simple y elegante con validación completa
 */

'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/ui/components/base/Modal'
import { Button } from '@/ui/components/base/Button'
import { Input, Textarea } from '@/ui/components/base/Input'
import type { WarehouseParsed, CreateWarehouseData, UpdateWarehouseData } from '../types'

interface WarehouseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData) => Promise<void>
  title: string
  isLoading: boolean
  initialData?: WarehouseParsed
}

export const WarehouseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  isLoading,
  initialData
}: WarehouseFormModalProps) => {
  const [formData, setFormData] = useState<CreateWarehouseData>({
    name: '',
    slug: '',
    description: '',
    code: '',
    warehouseType: 'main',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isActive: true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          slug: initialData.slug || '',
          description: initialData.description || '',
          code: initialData.code || '',
          warehouseType: initialData.warehouseType || 'main',
          address: initialData.address || '',
          city: initialData.city || '',
          state: initialData.state || '',
          country: initialData.country || '',
          postalCode: initialData.postalCode || '',
          isActive: initialData.isActive ?? true
        })
      } else {
        setFormData({
          name: '',
          slug: '',
          description: '',
          code: '',
          warehouseType: 'main',
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          isActive: true
        })
      }
      setErrors({})
      setSubmitError(null)
    }
  }, [isOpen, initialData])

  const handleInputChange = (field: keyof CreateWarehouseData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation (basic)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits'
    }

    // Capacity validation
    if (formData.maxCapacity && formData.maxCapacity < 0) {
      newErrors.maxCapacity = 'Capacity cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      onClose()
    } catch (error: unknown) {
      console.error('Form submission error:', error)
      
      // Handle validation errors from server
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { errors?: Array<{ field?: string; message?: string }> } } }
        if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
          const serverErrors: Record<string, string> = {}
          axiosError.response.data.errors.forEach((err: { field?: string; message?: string }) => {
            if (err.field) {
              serverErrors[err.field] = err.message || 'Validation error'
            }
          })
          setErrors(serverErrors)
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save warehouse'
        setSubmitError(errorMessage)
      }
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Modal show={isOpen} onHide={handleClose} title={title} size="large">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {submitError && (
            <div className="alert alert-danger mb-4">
              {submitError}
            </div>
          )}

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <Input
                  label="Name *"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  errorText={errors.name}
                  placeholder="Enter warehouse name"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status *</label>
                <select
                  className={`form-select ${errors.isActive ? 'is-invalid' : ''}`}
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                  disabled={isLoading}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                {errors.isActive && (
                  <div className="invalid-feedback">{errors.isActive}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <Textarea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              errorText={errors.description}
              placeholder="Enter warehouse description"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              errorText={errors.address}
              placeholder="Enter warehouse address"
              disabled={isLoading}
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  errorText={errors.phone}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  errorText={errors.email}
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <Input
              label="Capacity"
              type="number"
              value={formData.maxCapacity?.toString() || ''}
              onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
              errorText={errors.maxCapacity}
              placeholder="Enter warehouse capacity"
              disabled={isLoading}
              min="0"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {initialData ? 'Update' : 'Create'} Warehouse
          </Button>
        </div>
      </form>
    </Modal>
  )
}