/**
 * PRODUCT BATCH FORM
 * Formulario para crear/editar lotes de productos
 * Patrón basado en el éxito del módulo Inventory
 */

'use client'

import React, { memo, useCallback, useState, useEffect } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import type { 
  ProductBatch, 
  ParsedProductBatch, 
  CreateProductBatchRequest, 
  UpdateProductBatchRequest,
  ProductBatchStatus
} from '../types'
import type { Product } from '@/modules/products/types'
import type { WarehouseParsed, WarehouseLocationParsed } from '../types'

interface ProductBatchFormProps {
  productBatch?: ProductBatch | ParsedProductBatch
  onSubmit: (data: CreateProductBatchRequest | UpdateProductBatchRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  products: Product[]
  warehouses: WarehouseParsed[]
  locations: WarehouseLocationParsed[]
}

export const ProductBatchForm = memo<ProductBatchFormProps>(({
  productBatch,
  onSubmit,
  onCancel,
  isLoading = false,
  products,
  warehouses,
  locations
}) => {
  // Form state
  const [formData, setFormData] = useState({
    batchNumber: productBatch?.batchNumber || '',
    lotNumber: productBatch?.lotNumber || '',
    manufacturingDate: productBatch?.manufacturingDate 
      ? new Date(productBatch.manufacturingDate).toISOString().slice(0, 10) 
      : '',
    expirationDate: productBatch?.expirationDate 
      ? new Date(productBatch.expirationDate).toISOString().slice(0, 10) 
      : '',
    bestBeforeDate: productBatch?.bestBeforeDate 
      ? new Date(productBatch.bestBeforeDate).toISOString().slice(0, 10) 
      : '',
    initialQuantity: productBatch?.initialQuantity?.toString() || '',
    currentQuantity: productBatch?.currentQuantity?.toString() || '',
    unitCost: productBatch?.unitCost?.toString() || '',
    status: (productBatch?.status || 'active') as ProductBatchStatus,
    supplierName: productBatch?.supplierName || '',
    supplierBatch: productBatch?.supplierBatch || '',
    qualityNotes: productBatch?.qualityNotes || '',
    productId: productBatch?.product?.id || '',
    warehouseId: productBatch?.warehouse?.id || '',
    warehouseLocationId: productBatch?.warehouseLocation?.id || '',
    testResults: JSON.stringify(productBatch?.testResults || {}, null, 2),
    certifications: JSON.stringify(productBatch?.certifications || {}, null, 2),
    metadata: JSON.stringify(productBatch?.metadata || {}, null, 2)
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableLocations, setAvailableLocations] = useState<WarehouseLocationParsed[]>([])

  // Filter locations by warehouse
  useEffect(() => {
    if (formData.warehouseId && locations?.length > 0) {
      // TEMPORAL: Filter client-side until backend supports warehouseId filter
      const filtered = locations.filter((location, index) => {
        // Simple grouping by index for demo - should be based on real warehouseId from backend
        const warehouseId = String(Math.floor(index / 10) + 1)
        return warehouseId === String(formData.warehouseId)
      })

      setAvailableLocations(filtered)
    } else {
      setAvailableLocations([])
    }
  }, [formData.warehouseId, locations])

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Número de lote es requerido'
    }

    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = 'Fecha de fabricación es requerida'
    }

    if (!formData.expirationDate) {
      newErrors.expirationDate = 'Fecha de vencimiento es requerida'
    }

    if (formData.manufacturingDate && formData.expirationDate) {
      if (new Date(formData.manufacturingDate) >= new Date(formData.expirationDate)) {
        newErrors.expirationDate = 'Fecha de vencimiento debe ser posterior a la fabricación'
      }
    }

    if (!formData.initialQuantity || parseFloat(formData.initialQuantity) <= 0) {
      newErrors.initialQuantity = 'Cantidad inicial debe ser mayor a 0'
    }

    if (!formData.currentQuantity || parseFloat(formData.currentQuantity) < 0) {
      newErrors.currentQuantity = 'Cantidad actual no puede ser negativa'
    }

    if (formData.initialQuantity && formData.currentQuantity) {
      if (parseFloat(formData.currentQuantity) > parseFloat(formData.initialQuantity)) {
        newErrors.currentQuantity = 'Cantidad actual no puede exceder la inicial'
      }
    }

    if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
      newErrors.unitCost = 'Costo unitario debe ser mayor a 0'
    }

    if (!formData.productId) {
      newErrors.productId = 'Producto es requerido'
    }

    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Almacén es requerido'
    }

    // Validate JSON fields
    try {
      JSON.parse(formData.testResults)
    } catch {
      newErrors.testResults = 'Formato JSON inválido'
    }

    try {
      JSON.parse(formData.certifications)
    } catch {
      newErrors.certifications = 'Formato JSON inválido'
    }

    try {
      JSON.parse(formData.metadata)
    } catch {
      newErrors.metadata = 'Formato JSON inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData: CreateProductBatchRequest | UpdateProductBatchRequest = {
        batchNumber: formData.batchNumber.trim(),
        lotNumber: formData.lotNumber.trim() || undefined,
        manufacturingDate: formData.manufacturingDate,
        expirationDate: formData.expirationDate,
        bestBeforeDate: formData.bestBeforeDate || undefined,
        initialQuantity: parseFloat(formData.initialQuantity),
        currentQuantity: parseFloat(formData.currentQuantity),
        unitCost: parseFloat(formData.unitCost),
        status: formData.status,
        supplierName: formData.supplierName.trim() || undefined,
        supplierBatch: formData.supplierBatch.trim() || undefined,
        qualityNotes: formData.qualityNotes.trim() || undefined,
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        warehouseLocationId: formData.warehouseLocationId || undefined,
        testResults: formData.testResults.trim() ? JSON.parse(formData.testResults) : undefined,
        certifications: formData.certifications.trim() ? JSON.parse(formData.certifications) : undefined,
        metadata: formData.metadata.trim() ? JSON.parse(formData.metadata) : undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('❌ [ProductBatchForm] Submit error:', error)
    }
  }, [formData, validateForm, onSubmit])

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {productBatch ? 'Editar Lote de Producto' : 'Crear Nuevo Lote'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Basic Information */}
                  <div className="col-12">
                    <h6 className="text-muted mb-3">Información Básica</h6>
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Número de Lote *"
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      errorText={errors.batchNumber}
                      disabled={isLoading}
                      placeholder="BATCH-202505-001"
                    />
                  </div>

                  <div className="col-md-6">
                    <Input
                      label="Número de Lot"
                      id="lotNumber"
                      value={formData.lotNumber}
                      onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                      errorText={errors.lotNumber}
                      disabled={isLoading}
                      placeholder="LOT24321196"
                    />
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Fecha de Fabricación *"
                      id="manufacturingDate"
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
                      errorText={errors.manufacturingDate}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Fecha de Vencimiento *"
                      id="expirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                      errorText={errors.expirationDate}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Mejor Antes De"
                      id="bestBeforeDate"
                      type="date"
                      value={formData.bestBeforeDate}
                      onChange={(e) => handleInputChange('bestBeforeDate', e.target.value)}
                      errorText={errors.bestBeforeDate}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Quantities */}
                  <div className="col-12 mt-4">
                    <h6 className="text-muted mb-3">Cantidades</h6>
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Cantidad Inicial *"
                      id="initialQuantity"
                      type="number"
                      value={formData.initialQuantity}
                      onChange={(e) => handleInputChange('initialQuantity', e.target.value)}
                      errorText={errors.initialQuantity}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Cantidad Actual *"
                      id="currentQuantity"
                      type="number"
                      value={formData.currentQuantity}
                      onChange={(e) => handleInputChange('currentQuantity', e.target.value)}
                      errorText={errors.currentQuantity}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Costo Unitario *"
                      id="unitCost"
                      type="number"
                      value={formData.unitCost}
                      onChange={(e) => handleInputChange('unitCost', e.target.value)}
                      errorText={errors.unitCost}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Relationships */}
                  <div className="col-12 mt-4">
                    <h6 className="text-muted mb-3">Ubicación</h6>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="productId" className="form-label">Producto *</label>
                      <select
                        id="productId"
                        className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                        value={formData.productId}
                        onChange={(e) => handleInputChange('productId', e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Seleccionar producto...</option>
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
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="warehouseId" className="form-label">Almacén *</label>
                      <select
                        id="warehouseId"
                        className={`form-select ${errors.warehouseId ? 'is-invalid' : ''}`}
                        value={formData.warehouseId}
                        onChange={(e) => handleInputChange('warehouseId', e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Seleccionar almacén...</option>
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
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="warehouseLocationId" className="form-label">Ubicación</label>
                      <select
                        id="warehouseLocationId"
                        className="form-select"
                        value={formData.warehouseLocationId}
                        onChange={(e) => handleInputChange('warehouseLocationId', e.target.value)}
                        disabled={isLoading || !formData.warehouseId}
                      >
                        <option value="">Seleccionar ubicación...</option>
                        {availableLocations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name} ({location.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status and Supplier */}
                  <div className="col-12 mt-4">
                    <h6 className="text-muted mb-3">Estado y Proveedor</h6>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Estado</label>
                      <select
                        id="status"
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="active">Activo</option>
                        <option value="quarantine">Cuarentena</option>
                        <option value="expired">Vencido</option>
                        <option value="recalled">Retirado</option>
                        <option value="consumed">Consumido</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Nombre del Proveedor"
                      id="supplierName"
                      value={formData.supplierName}
                      onChange={(e) => handleInputChange('supplierName', e.target.value)}
                      disabled={isLoading}
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="col-md-4">
                    <Input
                      label="Lote del Proveedor"
                      id="supplierBatch"
                      value={formData.supplierBatch}
                      onChange={(e) => handleInputChange('supplierBatch', e.target.value)}
                      disabled={isLoading}
                      placeholder="SUP52779610"
                    />
                  </div>

                  {/* Quality Notes */}
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="qualityNotes" className="form-label">Notas de Calidad</label>
                      <textarea
                        id="qualityNotes"
                        className="form-control"
                        rows={3}
                        value={formData.qualityNotes}
                        onChange={(e) => handleInputChange('qualityNotes', e.target.value)}
                        disabled={isLoading}
                        placeholder="Observaciones sobre la calidad del lote..."
                      />
                    </div>
                  </div>

                  {/* JSON Fields */}
                  <div className="col-12 mt-4">
                    <h6 className="text-muted mb-3">Información Adicional (JSON)</h6>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="testResults" className="form-label">Resultados de Pruebas</label>
                      <textarea
                        id="testResults"
                        className={`form-control ${errors.testResults ? 'is-invalid' : ''}`}
                        rows={4}
                        value={formData.testResults}
                        onChange={(e) => handleInputChange('testResults', e.target.value)}
                        disabled={isLoading}
                        placeholder='{"ph": 7.2, "moisture": 6.5, "quality_grade": "A"}'
                      />
                      {errors.testResults && (
                        <div className="invalid-feedback">{errors.testResults}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="certifications" className="form-label">Certificaciones</label>
                      <textarea
                        id="certifications"
                        className={`form-control ${errors.certifications ? 'is-invalid' : ''}`}
                        rows={4}
                        value={formData.certifications}
                        onChange={(e) => handleInputChange('certifications', e.target.value)}
                        disabled={isLoading}
                        placeholder='{"HACCP": true, "ISO9001": true, "Organic": false}'
                      />
                      {errors.certifications && (
                        <div className="invalid-feedback">{errors.certifications}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="metadata" className="form-label">Metadatos</label>
                      <textarea
                        id="metadata"
                        className={`form-control ${errors.metadata ? 'is-invalid' : ''}`}
                        rows={4}
                        value={formData.metadata}
                        onChange={(e) => handleInputChange('metadata', e.target.value)}
                        disabled={isLoading}
                        placeholder='{"inspector": "John Doe", "temperature_log": "maintained"}'
                      />
                      {errors.metadata && (
                        <div className="invalid-feedback">{errors.metadata}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex gap-2 justify-content-end">
                      {onCancel && (
                        <Button
                          variant="secondary"
                          onClick={onCancel}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Guardando...' : productBatch ? 'Actualizar' : 'Crear'} Lote
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

ProductBatchForm.displayName = 'ProductBatchForm'