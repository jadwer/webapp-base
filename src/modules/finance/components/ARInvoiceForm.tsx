/**
 * AR INVOICE FORM COMPONENT
 * Form for creating/editing AR invoices following Phase 1 requirements
 * Similar to AP Invoice but for customers instead of suppliers
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import type { ARInvoiceForm, ARInvoice } from '../types'

interface ARInvoiceFormProps {
  initialData?: ARInvoice | null
  onSubmit: (data: ARInvoiceForm) => void
  onCancel: () => void
  isLoading?: boolean
  customers?: Array<{ id: string; name: string }> // Contacts with isCustomer=1
}

export const ARInvoiceFormComponent = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  customers = []
}: ARInvoiceFormProps) => {
  const [formData, setFormData] = useState<ARInvoiceForm>({
    contactId: initialData?.contactId || 0,
    invoiceNumber: initialData?.invoiceNumber || '',
    invoiceDate: initialData?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    currency: initialData?.currency || 'MXN',
    subtotal: initialData?.subtotal || 0,
    taxTotal: initialData?.taxTotal || 0,
    total: initialData?.total || 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ARInvoiceForm, value: string | number) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-calculate total when subtotal or taxTotal changes
    if (field === 'subtotal' || field === 'taxTotal') {
      newFormData.total = newFormData.subtotal + newFormData.taxTotal
    }
    
    setFormData(newFormData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contactId) {
      newErrors.contactId = 'Debe seleccionar un cliente'
    }
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'El número de factura es obligatorio'
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'La fecha de factura es obligatoria'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es obligatoria'
    }
    if (formData.subtotal <= 0) {
      newErrors.subtotal = 'El subtotal debe ser mayor a cero'
    }
    if (formData.total <= 0) {
      newErrors.total = 'El total debe ser mayor a cero'
    }

    // Validate due date is after invoice date
    if (formData.invoiceDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.invoiceDate)) {
        newErrors.dueDate = 'La fecha de vencimiento debe ser posterior a la fecha de factura'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      {/* Customer Selection */}
      <div className="col-md-6">
        <label htmlFor="contactId" className="form-label">
          Cliente <span className="text-danger">*</span>
        </label>
        <select
          id="contactId"
          className={`form-select ${errors.contactId ? 'is-invalid' : ''}`}
          value={formData.contactId}
          onChange={(e) => handleInputChange('contactId', parseInt(e.target.value))}
          disabled={isLoading}
        >
          <option value="0">Seleccionar cliente...</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        {errors.contactId && (
          <div className="invalid-feedback">{errors.contactId}</div>
        )}
      </div>

      {/* Invoice Number */}
      <div className="col-md-6">
        <label htmlFor="invoiceNumber" className="form-label">
          Número de Factura <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="invoiceNumber"
          className={`form-control ${errors.invoiceNumber ? 'is-invalid' : ''}`}
          value={formData.invoiceNumber}
          onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
          disabled={isLoading}
          placeholder="INV-001"
        />
        {errors.invoiceNumber && (
          <div className="invalid-feedback">{errors.invoiceNumber}</div>
        )}
      </div>

      {/* Invoice Date */}
      <div className="col-md-4">
        <label htmlFor="invoiceDate" className="form-label">
          Fecha de Factura <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          id="invoiceDate"
          className={`form-control ${errors.invoiceDate ? 'is-invalid' : ''}`}
          value={formData.invoiceDate}
          onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
          disabled={isLoading}
        />
        {errors.invoiceDate && (
          <div className="invalid-feedback">{errors.invoiceDate}</div>
        )}
      </div>

      {/* Due Date */}
      <div className="col-md-4">
        <label htmlFor="dueDate" className="form-label">
          Fecha de Vencimiento <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          id="dueDate"
          className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
          value={formData.dueDate}
          onChange={(e) => handleInputChange('dueDate', e.target.value)}
          disabled={isLoading}
        />
        {errors.dueDate && (
          <div className="invalid-feedback">{errors.dueDate}</div>
        )}
      </div>

      {/* Currency */}
      <div className="col-md-4">
        <label htmlFor="currency" className="form-label">
          Moneda
        </label>
        <select
          id="currency"
          className="form-select"
          value={formData.currency}
          onChange={(e) => handleInputChange('currency', e.target.value)}
          disabled={isLoading}
        >
          <option value="MXN">MXN - Peso Mexicano</option>
          <option value="USD">USD - Dólar Americano</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </div>

      {/* Financial Amounts */}
      <div className="col-md-4">
        <label htmlFor="subtotal" className="form-label">
          Subtotal <span className="text-danger">*</span>
        </label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            id="subtotal"
            className={`form-control ${errors.subtotal ? 'is-invalid' : ''}`}
            value={formData.subtotal}
            onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
            disabled={isLoading}
            min="0"
            step="0.01"
          />
          {errors.subtotal && (
            <div className="invalid-feedback">{errors.subtotal}</div>
          )}
        </div>
      </div>

      <div className="col-md-4">
        <label htmlFor="taxTotal" className="form-label">
          Impuestos
        </label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            id="taxTotal"
            className="form-control"
            value={formData.taxTotal}
            onChange={(e) => handleInputChange('taxTotal', parseFloat(e.target.value) || 0)}
            disabled={isLoading}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="col-md-4">
        <label htmlFor="total" className="form-label">
          Total <span className="text-danger">*</span>
        </label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            id="total"
            className={`form-control ${errors.total ? 'is-invalid' : ''}`}
            value={formData.total}
            onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
            disabled={isLoading}
            min="0"
            step="0.01"
          />
          {errors.total && (
            <div className="invalid-feedback">{errors.total}</div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="col-12">
        <hr />
        <div className="d-flex gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {initialData ? 'Actualizar' : 'Crear'} Factura
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  )
}