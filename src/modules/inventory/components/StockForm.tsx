/**
 * STOCK FORM
 * Formulario para crear/editar stock entries
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import { useWarehouses, useLocations } from '../hooks'
import type { Stock, CreateStockData, UpdateStockData, Warehouse, WarehouseLocation } from '../types'

interface StockFormProps {
  stock?: Stock // For edit mode
  onSubmit: (data: CreateStockData | UpdateStockData) => Promise<void>
  isLoading?: boolean
}

export const StockForm = memo<StockFormProps>(({
  stock,
  onSubmit,
  isLoading = false
}) => {
  console.log('🔄 [StockForm] Rendering', stock ? 'edit' : 'create', 'mode')
  
  const router = useRouter()
  
  // Fetch warehouses and locations
  const { warehouses } = useWarehouses()
  const { locations } = useLocations({
    filters: { warehouseId: undefined }, // Get all locations initially
    include: ['warehouse']
  })
  
  const [formData, setFormData] = useState<CreateStockData>({
    quantity: stock?.quantity || 0,
    reservedQuantity: stock?.reservedQuantity || 0,
    availableQuantity: stock?.availableQuantity || 0,
    minimumStock: stock?.minimumStock || undefined,
    maximumStock: stock?.maximumStock || undefined,
    reorderPoint: stock?.reorderPoint || undefined,
    unitCost: stock?.unitCost || undefined,
    totalValue: stock?.totalValue || undefined,
    status: stock?.status || 'active',
    lastMovementDate: stock?.lastMovementDate || '',
    lastMovementType: stock?.lastMovementType || '',
    batchInfo: stock?.batchInfo || undefined,
    metadata: stock?.metadata || undefined,
    productId: stock?.productId || '',
    warehouseId: stock?.warehouseId || '',
    warehouseLocationId: stock?.warehouseLocationId || ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Filter locations by selected warehouse
  const filteredLocations = React.useMemo(() => {
    if (!formData.warehouseId || !locations) return []
    return locations.filter(location => location.warehouseId === formData.warehouseId)
  }, [formData.warehouseId, locations])
  
  // Auto-calculate values when relevant fields change
  useEffect(() => {
    // Auto-calculate available quantity
    const available = formData.quantity - formData.reservedQuantity
    if (available !== formData.availableQuantity) {
      setFormData(prev => ({ ...prev, availableQuantity: Math.max(0, available) }))
    }
  }, [formData.quantity, formData.reservedQuantity])
  
  useEffect(() => {
    // Auto-calculate total value
    if (formData.unitCost && formData.quantity) {
      const totalValue = formData.unitCost * formData.quantity
      if (totalValue !== formData.totalValue) {
        setFormData(prev => ({ ...prev, totalValue }))
      }
    }
  }, [formData.unitCost, formData.quantity])
  
  // Clear location when warehouse changes
  useEffect(() => {
    if (formData.warehouseId && formData.warehouseLocationId) {
      const locationExists = filteredLocations.some(loc => loc.id === formData.warehouseLocationId)
      if (!locationExists) {
        setFormData(prev => ({ ...prev, warehouseLocationId: '' }))
      }
    }
  }, [formData.warehouseId, formData.warehouseLocationId, filteredLocations])
  
  const handleInputChange = useCallback((field: keyof CreateStockData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number'
      ? e.target.value ? parseFloat(e.target.value) : 0
      : e.target.value
    
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.productId) {
      newErrors.productId = 'Product is required'
    }
    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Warehouse is required'
    }
    if (!formData.warehouseLocationId) {
      newErrors.warehouseLocationId = 'Location is required'
    }
    
    // Numeric validations
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative'
    }
    if (formData.reservedQuantity < 0) {
      newErrors.reservedQuantity = 'Reserved quantity cannot be negative'
    }
    if (formData.reservedQuantity > formData.quantity) {
      newErrors.reservedQuantity = 'Reserved quantity cannot exceed total quantity'
    }
    if (formData.minimumStock && formData.minimumStock < 0) {
      newErrors.minimumStock = 'Minimum stock cannot be negative'
    }
    if (formData.maximumStock && formData.maximumStock < formData.quantity) {
      newErrors.maximumStock = 'Maximum stock should be greater than current quantity'
    }
    if (formData.unitCost && formData.unitCost < 0) {
      newErrors.unitCost = 'Unit cost cannot be negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Clean up data - remove undefined values
      const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key as keyof CreateStockData] = value
        }
        return acc
      }, {} as CreateStockData)
      
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
            Stock ${stock ? 'actualizado' : 'creado'} correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        router.push('/dashboard/inventory/stock')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error submitting stock:', error)
      
      // Show error message
      const message = error.response?.data?.message || 'Error saving stock'
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
  }, [formData, onSubmit, stock, router])
  
  const selectedWarehouse = warehouses?.find(w => w.id === formData.warehouseId)
  const selectedLocation = filteredLocations?.find(l => l.id === formData.warehouseLocationId)
  
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                {stock ? 'Edit Stock Entry' : 'Create Stock Entry'}
              </h2>
              <p className="text-muted mb-0">
                {stock 
                  ? 'Update stock levels and information'
                  : 'Add new stock entry for a product in a specific location'
                }
              </p>
            </div>
            <Button
              variant="outline-secondary"
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
                  
                  <div className="col-md-4">
                    <Input
                      label="Product ID *"
                      type="text"
                      value={formData.productId}
                      onChange={handleInputChange('productId')}
                      error={errors.productId}
                      placeholder="Product ID"
                      required
                      helpText="Enter the product ID to associate with this stock"
                    />
                  </div>
                  
                  <div className="col-md-4">
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
                  
                  <div className="col-md-4">
                    <label className="form-label">Location *</label>
                    <select
                      className={`form-select ${errors.warehouseLocationId ? 'is-invalid' : ''}`}
                      value={formData.warehouseLocationId}
                      onChange={handleInputChange('warehouseLocationId')}
                      required
                      disabled={!formData.warehouseId}
                    >
                      <option value="">
                        {formData.warehouseId ? 'Select a location...' : 'Select warehouse first'}
                      </option>
                      {filteredLocations?.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                    {errors.warehouseLocationId && (
                      <div className="invalid-feedback">{errors.warehouseLocationId}</div>
                    )}
                    {selectedLocation && (
                      <div className="form-text">
                        <i className="bi bi-geo-alt me-1" />
                        Type: {selectedLocation.locationType}
                        {selectedLocation.isPickable && <span className="badge bg-primary ms-2">Pickable</span>}
                        {selectedLocation.isReceivable && <span className="badge bg-info ms-1">Receivable</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Quantity Information */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Quantity Information</h5>
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Total Quantity *"
                      type="number"
                      value={formData.quantity.toString()}
                      onChange={handleInputChange('quantity')}
                      error={errors.quantity}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Reserved Quantity"
                      type="number"
                      value={formData.reservedQuantity.toString()}
                      onChange={handleInputChange('reservedQuantity')}
                      error={errors.reservedQuantity}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      helpText="Quantity reserved for pending orders"
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <Input
                      label="Available Quantity"
                      type="number"
                      value={formData.availableQuantity.toString()}
                      onChange={handleInputChange('availableQuantity')}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      helpText="Calculated: Total - Reserved"
                      disabled
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange('status')}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="low">Low Stock</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>
                  
                  {/* Stock Levels */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Stock Level Controls</h5>
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Minimum Stock"
                      type="number"
                      value={formData.minimumStock?.toString() || ''}
                      onChange={handleInputChange('minimumStock')}
                      error={errors.minimumStock}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      helpText="Alert when stock falls below this level"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Maximum Stock"
                      type="number"
                      value={formData.maximumStock?.toString() || ''}
                      onChange={handleInputChange('maximumStock')}
                      error={errors.maximumStock}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      helpText="Maximum capacity for this location"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Reorder Point"
                      type="number"
                      value={formData.reorderPoint?.toString() || ''}
                      onChange={handleInputChange('reorderPoint')}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      helpText="Trigger automatic reordering"
                    />
                  </div>
                  
                  {/* Cost Information */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Cost Information</h5>
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Unit Cost"
                      type="number"
                      value={formData.unitCost?.toString() || ''}
                      onChange={handleInputChange('unitCost')}
                      error={errors.unitCost}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      leftIcon="bi-currency-dollar"
                      helpText="Cost per unit"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Total Value"
                      type="number"
                      value={formData.totalValue?.toString() || ''}
                      onChange={handleInputChange('totalValue')}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      leftIcon="bi-currency-dollar"
                      helpText="Calculated: Unit Cost × Quantity"
                      disabled
                    />
                  </div>
                  
                  {/* Movement Information */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Last Movement Information</h5>
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Last Movement Date"
                      type="datetime-local"
                      value={formData.lastMovementDate}
                      onChange={handleInputChange('lastMovementDate')}
                      helpText="Date of the last stock movement (usually auto-calculated)"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Last Movement Type</label>
                    <select
                      className="form-select"
                      value={formData.lastMovementType}
                      onChange={handleInputChange('lastMovementType')}
                    >
                      <option value="">No movement</option>
                      <option value="in">In</option>
                      <option value="out">Out</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="transfer">Transfer</option>
                    </select>
                    <div className="form-text">
                      Type of the last stock movement (usually auto-calculated)
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="col-12 mt-4">
                    <h5 className="card-title border-bottom pb-2">Additional Information</h5>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Batch Information (JSON)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.batchInfo ? JSON.stringify(formData.batchInfo, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? JSON.parse(e.target.value) : undefined
                          setFormData(prev => ({ ...prev, batchInfo: parsed }))
                        } catch {
                          // Invalid JSON, keep the string for now
                        }
                      }}
                      placeholder='{"batchNumber": "BATCH-001", "expiryDate": "2025-12-31", "manufacturingDate": "2025-01-01"}'
                    />
                    <div className="form-text">
                      Enter batch information as JSON (batch numbers, expiry dates, etc.)
                    </div>
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
                      placeholder='{"temperature": "room", "humidity": "50%", "notes": "Handle with care"}'
                    />
                    <div className="form-text">
                      Enter additional metadata as JSON (storage conditions, notes, etc.)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer d-flex justify-content-end gap-2">
                <Button
                  type="button"
                  variant="outline-secondary"
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
                  {stock ? 'Update' : 'Create'} Stock Entry
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

StockForm.displayName = 'StockForm'