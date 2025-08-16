/**
 * INVENTORY MOVEMENT FORM
 * Formulario para crear/editar movimientos de inventario
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo, useCallback, useState, useEffect } from 'react'
import type { InventoryMovement, CreateInventoryMovementData, UpdateInventoryMovementData, Warehouse, Product, WarehouseLocation } from '../types'

interface InventoryMovementFormProps {
  movement?: InventoryMovement
  onSubmit: (data: CreateInventoryMovementData | UpdateInventoryMovementData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  warehouses: Warehouse[]
  products: Product[]
  locations: WarehouseLocation[]
}

export const InventoryMovementForm = memo<InventoryMovementFormProps>(({
  movement,
  onSubmit,
  onCancel,
  isLoading = false,
  warehouses,
  products,
  locations
}) => {
  console.log('🔄 [InventoryMovementForm] Rendering with movement', movement?.id || 'new')
  
  // Form state
  const [formData, setFormData] = useState({
    movementType: movement?.movementType || 'entry' as const,
    referenceType: movement?.referenceType || 'purchase',
    referenceId: movement?.referenceId?.toString() || '',
    movementDate: movement?.movementDate ? new Date(movement.movementDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    description: movement?.description || '',
    quantity: movement?.quantity?.toString() || '',
    unitCost: movement?.unitCost?.toString() || '',
    status: movement?.status || 'pending',
    productId: movement?.productId || '',
    warehouseId: movement?.warehouseId || '',
    locationId: movement?.locationId || '',
    destinationWarehouseId: movement?.destinationWarehouseId || '',
    destinationLocationId: movement?.destinationLocationId || '',
    batchInfo: JSON.stringify(movement?.batchInfo || {}, null, 2),
    metadata: JSON.stringify(movement?.metadata || {}, null, 2)
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableLocations, setAvailableLocations] = useState<WarehouseLocation[]>([])
  const [availableDestinationLocations, setAvailableDestinationLocations] = useState<WarehouseLocation[]>([])
  
  // Filter locations based on selected warehouse
  useEffect(() => {
    if (formData.warehouseId) {
      const filtered = locations.filter(location => location.warehouseId === formData.warehouseId)
      setAvailableLocations(filtered)
      // Reset location if not available in new warehouse
      if (!filtered.find(l => l.id === formData.locationId)) {
        setFormData(prev => ({ ...prev, locationId: '' }))
      }
    } else {
      setAvailableLocations([])
      setFormData(prev => ({ ...prev, locationId: '' }))
    }
  }, [formData.warehouseId, locations])
  
  // Filter destination locations based on selected destination warehouse
  useEffect(() => {
    if (formData.destinationWarehouseId) {
      const filtered = locations.filter(location => location.warehouseId === formData.destinationWarehouseId)
      setAvailableDestinationLocations(filtered)
      // Reset destination location if not available in new warehouse
      if (!filtered.find(l => l.id === formData.destinationLocationId)) {
        setFormData(prev => ({ ...prev, destinationLocationId: '' }))
      }
    } else {
      setAvailableDestinationLocations([])
      setFormData(prev => ({ ...prev, destinationLocationId: '' }))
    }
  }, [formData.destinationWarehouseId, locations])
  
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])
  
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.movementType) newErrors.movementType = 'Movement type is required'
    if (!formData.referenceType) newErrors.referenceType = 'Reference type is required'
    if (!formData.productId) newErrors.productId = 'Product is required'
    if (!formData.warehouseId) newErrors.warehouseId = 'Warehouse is required'
    if (!formData.quantity) newErrors.quantity = 'Quantity is required'
    if (!formData.movementDate) newErrors.movementDate = 'Movement date is required'
    
    // Numeric validations
    if (formData.quantity && isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a valid number'
    } else if (formData.quantity && Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    
    if (formData.unitCost && isNaN(Number(formData.unitCost))) {
      newErrors.unitCost = 'Unit cost must be a valid number'
    } else if (formData.unitCost && Number(formData.unitCost) < 0) {
      newErrors.unitCost = 'Unit cost cannot be negative'
    }
    
    // Transfer-specific validations
    if (formData.movementType === 'transfer') {
      if (!formData.destinationWarehouseId) {
        newErrors.destinationWarehouseId = 'Destination warehouse is required for transfers'
      }
      if (formData.warehouseId === formData.destinationWarehouseId) {
        newErrors.destinationWarehouseId = 'Destination warehouse must be different from source warehouse'
      }
    }
    
    // JSON validations
    if (formData.batchInfo) {
      try {
        JSON.parse(formData.batchInfo)
      } catch {
        newErrors.batchInfo = 'Batch info must be valid JSON'
      }
    }
    
    if (formData.metadata) {
      try {
        JSON.parse(formData.metadata)
      } catch {
        newErrors.metadata = 'Metadata must be valid JSON'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const submitData = {
        movementType: formData.movementType,
        referenceType: formData.referenceType,
        referenceId: formData.referenceId ? Number(formData.referenceId) : undefined,
        movementDate: formData.movementDate,
        description: formData.description || undefined,
        quantity: Number(formData.quantity),
        unitCost: formData.unitCost ? Number(formData.unitCost) : undefined,
        status: formData.status,
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        locationId: formData.locationId || undefined,
        destinationWarehouseId: formData.destinationWarehouseId || undefined,
        destinationLocationId: formData.destinationLocationId || undefined,
        batchInfo: formData.batchInfo ? JSON.parse(formData.batchInfo) : undefined,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : undefined
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }, [formData, onSubmit, validateForm])
  
  const getTotalValue = () => {
    const quantity = Number(formData.quantity) || 0
    const unitCost = Number(formData.unitCost) || 0
    return quantity * unitCost
  }
  
  const getMovementTypeOptions = () => [
    { value: 'entry', label: 'Entry', icon: 'bi-arrow-down-circle', color: 'text-success' },
    { value: 'exit', label: 'Exit', icon: 'bi-arrow-up-circle', color: 'text-danger' },
    { value: 'transfer', label: 'Transfer', icon: 'bi-arrow-left-right', color: 'text-info' },
    { value: 'adjustment', label: 'Adjustment', icon: 'bi-wrench', color: 'text-warning' }
  ]
  
  const getReferenceTypeOptions = () => [
    { value: 'purchase', label: 'Purchase Order' },
    { value: 'sale', label: 'Sales Order' },
    { value: 'adjustment', label: 'Stock Adjustment' },
    { value: 'transfer', label: 'Internal Transfer' },
    { value: 'return', label: 'Return' },
    { value: 'damage', label: 'Damage Report' },
    { value: 'count', label: 'Physical Count' }
  ]
  
  const getStatusOptions = () => [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]
  
  return (
    <form onSubmit={handleSubmit} className="inventory-movement-form">
      <div className="row g-4">
        {/* Movement Type & Reference */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-arrow-repeat me-2" />
                Movement Information
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Movement Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.movementType ? 'is-invalid' : ''}`}
                    value={formData.movementType}
                    onChange={(e) => handleInputChange('movementType', e.target.value)}
                    disabled={isLoading}
                  >
                    {getMovementTypeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.movementType && (
                    <div className="invalid-feedback">{errors.movementType}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Reference Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.referenceType ? 'is-invalid' : ''}`}
                    value={formData.referenceType}
                    onChange={(e) => handleInputChange('referenceType', e.target.value)}
                    disabled={isLoading}
                  >
                    {getReferenceTypeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.referenceType && (
                    <div className="invalid-feedback">{errors.referenceType}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Reference ID
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.referenceId ? 'is-invalid' : ''}`}
                    placeholder="External reference number..."
                    value={formData.referenceId}
                    onChange={(e) => handleInputChange('referenceId', e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.referenceId && (
                    <div className="invalid-feedback">{errors.referenceId}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Movement Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className={`form-control ${errors.movementDate ? 'is-invalid' : ''}`}
                    value={formData.movementDate}
                    onChange={(e) => handleInputChange('movementDate', e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.movementDate && (
                    <div className="invalid-feedback">{errors.movementDate}</div>
                  )}
                </div>
                
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe the inventory movement..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product & Quantity */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-box me-2" />
                Product & Quantity
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Product <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                    value={formData.productId}
                    onChange={(e) => handleInputChange('productId', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                  {errors.productId && (
                    <div className="invalid-feedback">{errors.productId}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={isLoading}
                  >
                    {getStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <div className="invalid-feedback">{errors.status}</div>
                  )}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.quantity && (
                    <div className="invalid-feedback">{errors.quantity}</div>
                  )}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Unit Cost
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${errors.unitCost ? 'is-invalid' : ''}`}
                      placeholder="0.00"
                      value={formData.unitCost}
                      onChange={(e) => handleInputChange('unitCost', e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.unitCost && (
                      <div className="invalid-feedback">{errors.unitCost}</div>
                    )}
                  </div>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Total Value
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="text"
                      className="form-control"
                      value={getTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Information */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-geo-alt me-2" />
                Location Information
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Warehouse <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.warehouseId ? 'is-invalid' : ''}`}
                    value={formData.warehouseId}
                    onChange={(e) => handleInputChange('warehouseId', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select a warehouse...</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                  {errors.warehouseId && (
                    <div className="invalid-feedback">{errors.warehouseId}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Location
                  </label>
                  <select
                    className={`form-select ${errors.locationId ? 'is-invalid' : ''}`}
                    value={formData.locationId}
                    onChange={(e) => handleInputChange('locationId', e.target.value)}
                    disabled={isLoading || !formData.warehouseId}
                  >
                    <option value="">Select a location...</option>
                    {availableLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                  {errors.locationId && (
                    <div className="invalid-feedback">{errors.locationId}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transfer Destination (only for transfers) */}
        {formData.movementType === 'transfer' && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-arrow-right me-2" />
                  Transfer Destination
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Destination Warehouse <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.destinationWarehouseId ? 'is-invalid' : ''}`}
                      value={formData.destinationWarehouseId}
                      onChange={(e) => handleInputChange('destinationWarehouseId', e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="">Select destination warehouse...</option>
                      {warehouses.filter(w => w.id !== formData.warehouseId).map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                    {errors.destinationWarehouseId && (
                      <div className="invalid-feedback">{errors.destinationWarehouseId}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Destination Location
                    </label>
                    <select
                      className={`form-select ${errors.destinationLocationId ? 'is-invalid' : ''}`}
                      value={formData.destinationLocationId}
                      onChange={(e) => handleInputChange('destinationLocationId', e.target.value)}
                      disabled={isLoading || !formData.destinationWarehouseId}
                    >
                      <option value="">Select destination location...</option>
                      {availableDestinationLocations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                    {errors.destinationLocationId && (
                      <div className="invalid-feedback">{errors.destinationLocationId}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Additional Information */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2" />
                Additional Information (Optional)
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Batch Information (JSON)
                  </label>
                  <textarea
                    className={`form-control ${errors.batchInfo ? 'is-invalid' : ''}`}
                    rows={6}
                    placeholder='{"batchNumber": "BATCH001", "expiryDate": "2025-12-31", "manufacturingDate": "2025-01-01"}'
                    value={formData.batchInfo}
                    onChange={(e) => handleInputChange('batchInfo', e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.batchInfo && (
                    <div className="invalid-feedback">{errors.batchInfo}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Metadata (JSON)
                  </label>
                  <textarea
                    className={`form-control ${errors.metadata ? 'is-invalid' : ''}`}
                    rows={6}
                    placeholder='{"notes": "Additional notes", "customField": "value"}'
                    value={formData.metadata}
                    onChange={(e) => handleInputChange('metadata', e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.metadata && (
                    <div className="invalid-feedback">{errors.metadata}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="col-12">
          <div className="d-flex justify-content-end gap-2">
            {onCancel && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-2" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2" />
                  {movement ? 'Update Movement' : 'Create Movement'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
})

InventoryMovementForm.displayName = 'InventoryMovementForm'