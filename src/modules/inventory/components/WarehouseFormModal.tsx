/**
 * WAREHOUSE FORM MODAL
 * Modal con formulario para crear/editar warehouses
 * UI Simple y elegante con validación completa
 */

'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/ui/components/base/Modal'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import type { Warehouse, CreateWarehouseData, UpdateWarehouseData } from '../types'

interface WarehouseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData) => Promise<void>
  title: string
  isLoading: boolean
  initialData?: Warehouse
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
    description: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
    capacity: 0
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          address: initialData.address || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          status: initialData.status || 'active',
          capacity: initialData.capacity || 0
        })
      } else {
        setFormData({
          name: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          status: 'active',
          capacity: 0
        })
      }
      setErrors({})
      setSubmitError(null)
    }
  }, [isOpen, initialData])

  const handleInputChange = (field: keyof CreateWarehouseData, value: string | number) => {
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
    if (formData.capacity && formData.capacity < 0) {
      newErrors.capacity = 'Capacity cannot be negative'
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
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      // Handle validation errors from server
      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        const serverErrors: Record<string, string> = {}
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message
          }
        })
        setErrors(serverErrors)
      } else {
        setSubmitError(error?.message || 'Failed to save warehouse')
      }
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
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
                  onChange={(value) => handleInputChange('name', value)}
                  error={errors.name}
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
                  className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                {errors.status && (
                  <div className="invalid-feedback">{errors.status}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <Input
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              error={errors.description}
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
              onChange={(value) => handleInputChange('address', value)}
              error={errors.address}
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
                  onChange={(value) => handleInputChange('phone', value)}
                  error={errors.phone}
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
                  onChange={(value) => handleInputChange('email', value)}
                  error={errors.email}
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
              value={formData.capacity.toString()}
              onChange={(value) => handleInputChange('capacity', parseInt(value) || 0)}
              error={errors.capacity}
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