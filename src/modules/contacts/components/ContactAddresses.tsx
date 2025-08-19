/**
 * CONTACT ADDRESSES COMPONENT
 * Gestión de direcciones de contacto (facturación, envío, principal, otras)
 * Incluye funcionalidad CRUD completa
 */

'use client'

import React, { useState } from 'react'
import { Input } from '@/ui/components/base/Input'
import { Button } from '@/ui/components/base/Button'
import type { ContactAddress } from '../types'

interface ContactAddressesProps {
  contactId?: string
  addresses: ContactAddress[]
  onAddAddress: (address: Omit<ContactAddress, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => void
  onUpdateAddress: (id: string, address: Partial<ContactAddress>) => void
  onDeleteAddress: (id: string) => void
  isLoading?: boolean
  className?: string
}

interface AddressFormData {
  addressType: 'billing' | 'shipping' | 'main' | 'other'
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault: boolean
}

const initialAddressForm: AddressFormData = {
  addressType: 'main',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'México',
  postalCode: '',
  isDefault: false
}

export const ContactAddresses: React.FC<ContactAddressesProps> = ({
  contactId,
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  isLoading = false,
  className = ''
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [formData, setFormData] = useState<AddressFormData>(initialAddressForm)

  const addressTypeLabels = {
    main: 'Principal',
    billing: 'Facturación',
    shipping: 'Envío',
    other: 'Otra'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingAddress) {
      // Update existing address
      onUpdateAddress(editingAddress, formData)
      setEditingAddress(null)
    } else {
      // Add new address
      onAddAddress(formData)
      setShowAddForm(false)
    }
    
    setFormData(initialAddressForm)
  }

  const handleEdit = (address: ContactAddress) => {
    setFormData({
      addressType: address.addressType,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    })
    setEditingAddress(address.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingAddress(null)
    setFormData(initialAddressForm)
  }

  const updateField = <K extends keyof AddressFormData>(field: K, value: AddressFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={`contact-addresses ${className}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Direcciones
          </h5>
          <p className="text-muted small mb-0">
            Gestiona las direcciones de facturación, envío y contacto
          </p>
        </div>
        {!showAddForm && (
          <Button 
            variant="primary" 
            size="small"
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Agregar Dirección
          </Button>
        )}
      </div>

      {/* Existing Addresses List */}
      {addresses.length > 0 && (
        <div className="mb-4">
          <div className="row g-3">
            {addresses.map((address) => (
              <div key={address.id} className="col-md-6">
                <div className={`card h-100 ${address.isDefault ? 'border-primary' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <span className={`badge ${
                          address.addressType === 'main' ? 'bg-primary' :
                          address.addressType === 'billing' ? 'bg-success' :
                          address.addressType === 'shipping' ? 'bg-info' : 'bg-secondary'
                        } me-2`}>
                          {addressTypeLabels[address.addressType]}
                        </span>
                        {address.isDefault && (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-star-fill me-1"></i>
                            Por defecto
                          </span>
                        )}
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(address)}
                          disabled={isLoading}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onDeleteAddress(address.id)}
                          disabled={isLoading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="address-details">
                      <div className="mb-1">
                        <strong>{address.addressLine1}</strong>
                      </div>
                      {address.addressLine2 && (
                        <div className="mb-1 text-muted small">
                          {address.addressLine2}
                        </div>
                      )}
                      <div className="text-muted small">
                        {address.city}, {address.state}
                      </div>
                      <div className="text-muted small">
                        {address.country} - {address.postalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="card-title mb-0">
              <i className="bi bi-plus-circle me-2"></i>
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Address Type & Default */}
                <div className="col-md-6">
                  <label htmlFor="addressType" className="form-label">
                    Tipo de dirección <span className="text-danger">*</span>
                  </label>
                  <select
                    id="addressType"
                    className="form-select"
                    value={formData.addressType}
                    onChange={(e) => updateField('addressType', e.target.value as any)}
                    disabled={isLoading}
                    required
                  >
                    <option value="main">Principal</option>
                    <option value="billing">Facturación</option>
                    <option value="shipping">Envío</option>
                    <option value="other">Otra</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => updateField('isDefault', e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="isDefault">
                      Establecer como dirección por defecto
                    </label>
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="col-12">
                  <label htmlFor="addressLine1" className="form-label">
                    Dirección <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => updateField('addressLine1', e.target.value)}
                    disabled={isLoading}
                    placeholder="Calle, número, colonia..."
                    required
                  />
                </div>

                {/* Address Line 2 */}
                <div className="col-12">
                  <label htmlFor="addressLine2" className="form-label">
                    Dirección 2 (opcional)
                  </label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => updateField('addressLine2', e.target.value)}
                    disabled={isLoading}
                    placeholder="Referencias, interior, etc."
                  />
                </div>

                {/* City, State, Postal Code */}
                <div className="col-md-4">
                  <label htmlFor="city" className="form-label">
                    Ciudad <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Guadalajara"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="state" className="form-label">
                    Estado <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Jalisco"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="postalCode" className="form-label">
                    Código postal <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    disabled={isLoading}
                    placeholder="12345"
                    required
                  />
                </div>

                {/* Country */}
                <div className="col-md-12">
                  <label htmlFor="country" className="form-label">
                    País <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="col-12">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      <i className="bi bi-check-lg me-1"></i>
                      {editingAddress ? 'Actualizar' : 'Agregar'} Dirección
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !showAddForm && (
        <div className="text-center py-5">
          <i className="bi bi-geo-alt text-muted mb-3" style={{ fontSize: '3rem' }}></i>
          <h6 className="text-muted">No hay direcciones registradas</h6>
          <p className="text-muted small">
            Agrega direcciones de facturación, envío o contacto para este cliente/proveedor
          </p>
        </div>
      )}
    </div>
  )
}