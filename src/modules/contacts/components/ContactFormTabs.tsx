/**
 * CONTACT FORM WITH TABS
 * Sistema completo de gestión de contactos con pestañas
 * Incluye: Datos básicos, Direcciones, Documentos y Personas de contacto
 */

'use client'

import React, { useState } from 'react'
import { ContactAddresses } from './ContactAddresses'
import { ContactDocuments } from './ContactDocuments'
import { ContactPeople } from './ContactPeople'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import { useContactAddresses, useContactDocuments, useContactPeople } from '../hooks'
import { contactAddressesService, contactPeopleService, contactDocumentsService } from '../services'
import { useAuth } from '@/modules/auth'
import type { 
  ContactFormData, 
  ContactParsed, 
  ContactAddress, 
  ContactDocument, 
  ContactPerson 
} from '../types'

interface ContactFormTabsProps {
  contact?: ContactParsed
  onSubmit: (data: ContactFormData) => Promise<ContactParsed | void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

type TabType = 'basic' | 'addresses' | 'documents' | 'people'

// Local document type that includes the actual File object
interface LocalContactDocument extends ContactDocument {
  file?: File // Only for local documents pending upload
}

export const ContactFormTabs: React.FC<ContactFormTabsProps> = ({
  contact,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const { user } = useAuth()
  
  // Estado controlado para los datos básicos del contacto (persistente entre pestañas)
  const [formData, setFormData] = useState<ContactFormData>(() => ({
    contactType: contact?.contactType || 'company',
    name: contact?.name || '',
    legalName: contact?.legalName || '',
    taxId: contact?.taxId || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    website: contact?.website || '',
    status: contact?.status || 'active',
    isCustomer: contact?.isCustomer || false,
    isSupplier: contact?.isSupplier || false,
    creditLimit: contact?.creditLimit || undefined,
    classification: contact?.classification || '',
    paymentTerms: contact?.paymentTerms || undefined,
    notes: contact?.notes || '',
    metadata: contact?.metadata || {}
  }))

  // Update form data when contact prop changes (for edit mode)
  React.useEffect(() => {
    if (contact) {
      setFormData({
        contactType: contact.contactType || 'company',
        name: contact.name || '',
        legalName: contact.legalName || '',
        taxId: contact.taxId || '',
        email: contact.email || '',
        phone: contact.phone || '',
        website: contact.website || '',
        status: contact.status || 'active',
        isCustomer: contact.isCustomer || false,
        isSupplier: contact.isSupplier || false,
        creditLimit: contact.creditLimit || undefined,
        classification: contact.classification || '',
        paymentTerms: contact.paymentTerms || undefined,
        notes: contact.notes || '',
        metadata: contact.metadata || {}
      })
    }
  }, [contact])
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Cargar entidades relacionadas desde la API (solo en modo edit)
  const { 
    addresses: apiAddresses
  } = useContactAddresses(contact?.id)
  
  const { 
    documents: apiDocuments
  } = useContactDocuments(contact?.id)
  
  const { 
    people: apiPeople
  } = useContactPeople(contact?.id)
  
  // Estados locales para las entidades relacionadas (para crear/editar)
  const [localAddresses, setLocalAddresses] = useState<ContactAddress[]>([])
  const [localDocuments, setLocalDocuments] = useState<LocalContactDocument[]>([])
  const [localPeople, setLocalPeople] = useState<ContactPerson[]>([])
  const [, setIsSubmitting] = useState(false)
  
  // Combinar datos de API con datos locales
  const addresses = [...(apiAddresses || []), ...localAddresses]
  const documents = [...(apiDocuments || []), ...localDocuments]
  const people = [...(apiPeople || []), ...localPeople]

  const tabs = [
    {
      id: 'basic' as TabType,
      label: 'Datos Básicos',
      icon: 'bi-person-circle',
      count: null
    },
    {
      id: 'addresses' as TabType,
      label: 'Direcciones',
      icon: 'bi-geo-alt-fill',
      count: addresses.length
    },
    {
      id: 'documents' as TabType,
      label: 'Documentos',
      icon: 'bi-file-earmark-text-fill',
      count: documents.length
    },
    {
      id: 'people' as TabType,
      label: 'Personas',
      icon: 'bi-people-fill',
      count: people.length
    }
  ]

  // Form field update handler
  const updateField = <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Basic contact data validation and submission
  const handleBasicDataSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    // RFC/Tax ID validation
    if (formData.taxId && formData.taxId.trim()) {
      const taxId = formData.taxId.trim().toUpperCase()
      if (taxId.length > 13) {
        newErrors.taxId = 'El RFC no puede tener más de 13 caracteres'
      } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(taxId)) {
        newErrors.taxId = 'Formato de RFC inválido (ej. ABC123456XYZ o ABCD123456XYZ)'
      }
    }
    
    if (!formData.isCustomer && !formData.isSupplier) {
      newErrors.type = 'Debe ser cliente, proveedor o ambos'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }
    
    setFormErrors({})
  }

  const handleFinalSubmit = () => {
    if (!formData.name.trim()) {
      alert('Por favor completa los datos básicos del contacto primero')
      setActiveTab('basic')
      return
    }
    
    // Clean up form data - convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      legalName: formData.legalName?.trim() || undefined,
      taxId: formData.taxId?.trim() ? formData.taxId.trim().toUpperCase() : undefined,
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      website: formData.website?.trim() || undefined,
      classification: formData.classification?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      creditLimit: formData.creditLimit || undefined,
      paymentTerms: formData.paymentTerms || undefined
    }

    // Submit complete contact with related entities
    handleCompleteSubmit(cleanedData)
  }

  const handleCompleteSubmit = async (contactData: ContactFormData) => {
    try {
      setIsSubmitting(true)

      // First create the contact
      const result = await onSubmit(contactData)

      // If we have a contact ID, create related entities
      if (result?.id) {
        const createdContact = result

        // Create addresses
        if (localAddresses.length > 0) {
          for (const address of localAddresses) {
            try {
              const addressData = {
                contactId: parseInt(createdContact.id),
                addressType: address.addressType,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                country: address.country,
                postalCode: address.postalCode,
                isDefault: address.isDefault
              }
              await contactAddressesService.create(addressData)
            } catch {
              // error handled silently
            }
          }
        }

        // Create people
        if (localPeople.length > 0) {
          for (const person of localPeople) {
            try {
              const personData = {
                contactId: parseInt(createdContact.id),
                name: person.name,
                position: person.position,
                department: person.department,
                email: person.email,
                phone: person.phone,
                mobile: person.mobile,
                isPrimary: person.isPrimary
              }
              await contactPeopleService.create(personData)
            } catch {
              // error handled silently
            }
          }
        }

        // Upload documents
        if (localDocuments.length > 0) {
          for (const document of localDocuments) {
            try {
              if (document.file) {
                await contactDocumentsService.upload(
                  document.file,
                  createdContact.id,
                  document.documentType,
                  document.notes
                )
              }
            } catch (error: unknown) {
              // Continue with other documents even if one fails
              const errorMessage = typeof error === 'object' && error !== null && 'response' in error
                ? String((error as Record<string, unknown>).response)
                : error instanceof Error ? error.message : String(error)
              alert(`Error subiendo ${document.originalFilename}: ${errorMessage}`)
            }
          }
        }

        // Invalidate SWR cache for the created contact to ensure fresh data on view
        const { mutate } = await import('swr')

        // Invalidate the specific contact with includes
        mutate(['contact', createdContact.id, ['contactAddresses', 'contactDocuments', 'contactPeople']])

        // Also invalidate general contact cache
        mutate(key => Array.isArray(key) && key[0] === 'contact' && key[1] === createdContact.id)
      }

    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Address handlers
  const handleAddAddress = (address: Omit<ContactAddress, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => {
    const newAddress: ContactAddress = {
      id: `temp-${Date.now()}`,
      contactId: parseInt(contact?.id || '0'),
      ...address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setLocalAddresses(prev => [...prev, newAddress])
  }

  const handleUpdateAddress = async (id: string, updatedAddress: Partial<ContactAddress>) => {
    // Check if it's a local address (temp ID) or API address
    if (id.startsWith('temp-')) {
      setLocalAddresses(prev => prev.map(addr =>
        addr.id === id ? { ...addr, ...updatedAddress } : addr
      ))
    } else {
      // Call API to update existing address
      try {
        await contactAddressesService.update(id, updatedAddress)
      } catch {
        alert('Error al actualizar la direccion')
      }
    }
  }

  const handleDeleteAddress = async (id: string) => {
    // Check if it's a local address (temp ID) or API address
    if (id.startsWith('temp-')) {
      setLocalAddresses(prev => prev.filter(addr => addr.id !== id))
    } else {
      // Call API to delete existing address
      try {
        await contactAddressesService.delete(id)
      } catch {
        alert('Error al eliminar la direccion')
      }
    }
  }

  // Document handlers
  const handleUploadDocument = async (file: File, documentType: string, notes?: string) => {
    // Store document locally with the File object for later upload
    const newDocument: LocalContactDocument = {
      id: `temp-${Date.now()}`,
      contactId: parseInt(contact?.id || '0'),
      documentType: documentType as ContactDocument['documentType'],
      filePath: `/uploads/${file.name}`,
      originalFilename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      uploadedBy: user?.id ? parseInt(user.id) : 1, // Get from current user
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      file: file // Store the actual File object for upload
    }

    setLocalDocuments(prev => [...prev, newDocument])
  }

  const handleDownloadDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id)
    if (document) {
      // Aquí iría la lógica real de descarga
      alert(`Descargando: ${document.originalFilename}`)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    // Check if it's a local document (temp ID) or API document
    if (id.startsWith('temp-')) {
      setLocalDocuments(prev => prev.filter(doc => doc.id !== id))
    } else {
      // Call API to delete existing document
      try {
        await contactDocumentsService.delete(id)
      } catch {
        alert('Error al eliminar el documento')
      }
    }
  }

  const handleVerifyDocument = async (id: string) => {
    // Check if it's a local document (temp ID) or API document
    if (id.startsWith('temp-')) {
      setLocalDocuments(prev => prev.map(doc =>
        doc.id === id
          ? { ...doc, verifiedAt: new Date().toISOString(), verifiedBy: 1 }
          : doc
      ))
    } else {
      // Call API to verify existing document
      try {
        await contactDocumentsService.verify(id)
      } catch {
        alert('Error al verificar el documento')
      }
    }
  }

  // People handlers
  const handleAddPerson = (person: Omit<ContactPerson, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => {
    const newPerson: ContactPerson = {
      id: `temp-${Date.now()}`,
      contactId: parseInt(contact?.id || '0'),
      ...person,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setLocalPeople(prev => [...prev, newPerson])
  }

  const handleUpdatePerson = async (id: string, updatedPerson: Partial<ContactPerson>) => {
    // Check if it's a local person (temp ID) or API person
    if (id.startsWith('temp-')) {
      setLocalPeople(prev => prev.map(person =>
        person.id === id ? { ...person, ...updatedPerson } : person
      ))
    } else {
      // Call API to update existing person
      try {
        await contactPeopleService.update(id, updatedPerson)
      } catch {
        alert('Error al actualizar la persona')
      }
    }
  }

  const handleDeletePerson = async (id: string) => {
    // Check if it's a local person (temp ID) or API person
    if (id.startsWith('temp-')) {
      setLocalPeople(prev => prev.filter(person => person.id !== id))
    } else {
      // Call API to delete existing person
      try {
        await contactPeopleService.delete(id)
      } catch {
        alert('Error al eliminar la persona')
      }
    }
  }

  return (
    <div className={`contact-form-tabs ${className}`}>
      {/* Navigation Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item" role="presentation">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                type="button"
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                disabled={isLoading}
              >
                <i className={tab.icon} aria-hidden="true"></i>
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="badge bg-primary rounded-pill ms-1">
                    {tab.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Basic Contact Form - Controlled */}
        <div className={`tab-pane fade ${activeTab === 'basic' ? 'show active' : ''}`}>
          {activeTab === 'basic' && (
            <form onSubmit={handleBasicDataSubmit}>
              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-12">
                  <h5 className="mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Información básica
                  </h5>
                </div>

                {/* Contact Type */}
                <div className="col-md-6">
                  <label htmlFor="contactType" className="form-label">
                    Tipo de contacto <span className="text-danger">*</span>
                  </label>
                  <select
                    id="contactType"
                    className="form-select"
                    value={formData.contactType}
                    onChange={(e) => updateField('contactType', e.target.value as 'individual' | 'company')}
                    disabled={isLoading}
                  >
                    <option value="company">Empresa</option>
                    <option value="individual">Persona física</option>
                  </select>
                </div>

                {/* Status */}
                <div className="col-md-6">
                  <label htmlFor="status" className="form-label">
                    Estado <span className="text-danger">*</span>
                  </label>
                  <select
                    id="status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value as 'active' | 'inactive' | 'suspended')}
                    disabled={isLoading}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                {/* Name */}
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    {formData.contactType === 'company' ? 'Nombre comercial' : 'Nombre completo'} <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    errorText={formErrors.name}
                    disabled={isLoading}
                    placeholder={formData.contactType === 'company' ? 'Ej. Acme Corp' : 'Ej. Juan Pérez'}
                  />
                </div>

                {/* Legal Name */}
                <div className="col-md-6">
                  <label htmlFor="legalName" className="form-label">
                    {formData.contactType === 'company' ? 'Razón social' : 'Nombre legal'}
                  </label>
                  <Input
                    id="legalName"
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => updateField('legalName', e.target.value)}
                    disabled={isLoading}
                    placeholder={formData.contactType === 'company' ? 'Ej. Acme Corporation S.A. de C.V.' : 'Nombre completo legal'}
                  />
                </div>

                {/* Tax ID */}
                <div className="col-md-6">
                  <label htmlFor="taxId" className="form-label">
                    {formData.contactType === 'company' ? 'RFC / Tax ID' : 'RFC / CURP'}
                  </label>
                  <Input
                    id="taxId"
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => updateField('taxId', e.target.value.toUpperCase())}
                    errorText={formErrors.taxId}
                    disabled={isLoading}
                    placeholder={formData.contactType === 'company' ? 'ACM123456ABC (máx. 13 caracteres)' : 'PERJ800101HDFLRN01'}
                    maxLength={13}
                  />
                  {formData.taxId && formData.taxId.length > 0 && (
                    <div className="form-text">
                      <small className={formData.taxId.length <= 13 ? 'text-muted' : 'text-danger'}>
                        {formData.taxId.length}/13 caracteres
                      </small>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    errorText={formErrors.email}
                    disabled={isLoading}
                    placeholder="contacto@ejemplo.com"
                    leftIcon="bi-envelope"
                  />
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label">
                    Teléfono
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    disabled={isLoading}
                    placeholder="+52 55 1234 5678"
                    leftIcon="bi-telephone"
                  />
                </div>

                {/* Website */}
                <div className="col-md-6">
                  <label htmlFor="website" className="form-label">
                    Sitio web
                  </label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    disabled={isLoading}
                    placeholder="https://ejemplo.com"
                    leftIcon="bi-globe"
                  />
                </div>

                {/* Classification Section */}
                <div className="col-12">
                  <h5 className="mb-3 mt-4">
                    <i className="bi bi-tags me-2"></i>
                    Clasificación
                  </h5>
                </div>

                {/* Is Customer/Supplier */}
                <div className="col-12">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isCustomer"
                          checked={formData.isCustomer}
                          onChange={(e) => updateField('isCustomer', e.target.checked)}
                          disabled={isLoading}
                        />
                        <label className="form-check-label" htmlFor="isCustomer">
                          <i className="bi bi-person-check me-1"></i>
                          Es cliente
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isSupplier"
                          checked={formData.isSupplier}
                          onChange={(e) => updateField('isSupplier', e.target.checked)}
                          disabled={isLoading}
                        />
                        <label className="form-check-label" htmlFor="isSupplier">
                          <i className="bi bi-building me-1"></i>
                          Es proveedor
                        </label>
                      </div>
                    </div>
                  </div>
                  {formErrors.type && (
                    <div className="text-danger small mt-1">{formErrors.type}</div>
                  )}
                </div>

                {/* Classification */}
                <div className="col-md-6">
                  <label htmlFor="classification" className="form-label">
                    Clasificación
                  </label>
                  <select
                    id="classification"
                    className="form-select"
                    value={formData.classification}
                    onChange={(e) => updateField('classification', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Sin clasificación</option>
                    <option value="basic">Básico</option>
                    <option value="standard">Estándar</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                {/* Payment Terms */}
                <div className="col-md-6">
                  <label htmlFor="paymentTerms" className="form-label">
                    Términos de pago (días)
                  </label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="0"
                    value={formData.paymentTerms?.toString() || ''}
                    onChange={(e) => updateField('paymentTerms', e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                    placeholder="30"
                  />
                </div>

                {/* Credit Limit */}
                {formData.isCustomer && (
                  <div className="col-md-6">
                    <label htmlFor="creditLimit" className="form-label">
                      Límite de crédito
                    </label>
                    <Input
                      id="creditLimit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.creditLimit?.toString() || ''}
                      onChange={(e) => updateField('creditLimit', e.target.value ? parseFloat(e.target.value) : undefined)}
                      disabled={isLoading}
                      placeholder="0.00"
                      leftIcon="bi-currency-dollar"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="col-12">
                  <label htmlFor="notes" className="form-label">
                    Notas adicionales
                  </label>
                  <textarea
                    id="notes"
                    className="form-control"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    disabled={isLoading}
                    placeholder="Información adicional sobre el contacto..."
                  />
                </div>

                {/* Form Actions */}
                <div className="col-12">
                  <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onCancel}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading && <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>}
                      Validar datos básicos
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Show saved data indicator */}
          {formData.name.trim() && (
            <div className="mt-3 p-2 bg-success-subtle border border-success-subtle rounded">
              <small className="text-success">
                <i className="bi bi-check-circle me-1"></i>
                Datos básicos: <strong>{formData.name}</strong>
                {formData.email && ` (${formData.email})`}
              </small>
            </div>
          )}
          
          {/* Final Submit Button */}
          {formData.name.trim() && (
            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <Button
                type="button"
                variant="success"
                onClick={handleFinalSubmit}
                disabled={isLoading}
              >
                <i className="bi bi-check-lg me-1"></i>
                Crear Contacto Completo
              </Button>
            </div>
          )}
        </div>

        {/* Direcciones Tab */}
        {activeTab === 'addresses' && (
          <div className="tab-pane fade show active">
            <ContactAddresses
              contactId={contact?.id}
              addresses={addresses}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              isLoading={isLoading}
            />
            
            {/* Navigation buttons for non-basic tabs */}
            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setActiveTab('basic')}
                  disabled={isLoading}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Datos Básicos
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setActiveTab('documents')}
                  disabled={isLoading}
                >
                  Documentos
                  <i className="bi bi-arrow-right ms-1"></i>
                </Button>
                {formData.name.trim() && (
                  <Button
                    type="button"
                    variant="success"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Crear Contacto
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documentos Tab */}
        {activeTab === 'documents' && (
          <div className="tab-pane fade show active">
            <ContactDocuments
              contactId={contact?.id}
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onDownloadDocument={handleDownloadDocument}
              onVerifyDocument={handleVerifyDocument}
              isLoading={isLoading}
            />
            
            {/* Navigation buttons */}
            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setActiveTab('addresses')}
                  disabled={isLoading}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Direcciones
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setActiveTab('people')}
                  disabled={isLoading}
                >
                  Personas
                  <i className="bi bi-arrow-right ms-1"></i>
                </Button>
                {formData.name.trim() && (
                  <Button
                    type="button"
                    variant="success"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Crear Contacto
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Personas Tab */}
        {activeTab === 'people' && (
          <div className="tab-pane fade show active">
            <ContactPeople
              contactId={contact?.id}
              people={people}
              onAddPerson={handleAddPerson}
              onUpdatePerson={handleUpdatePerson}
              onDeletePerson={handleDeletePerson}
              isLoading={isLoading}
            />
            
            {/* Navigation buttons */}
            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setActiveTab('documents')}
                  disabled={isLoading}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Documentos
                </Button>
                {formData.name.trim() && (
                  <Button
                    type="button"
                    variant="success"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Crear Contacto
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Progress Indicator */}
      {(formData.name.trim() || addresses.length > 0 || documents.length > 0 || people.length > 0) && (
        <div className="position-fixed bottom-0 end-0 m-4">
          <div className="toast show" role="alert">
            <div className="toast-header">
              <i className={`bi ${formData.name.trim() ? 'bi-check-circle-fill text-success' : 'bi-info-circle-fill text-primary'} me-2`}></i>
              <strong className="me-auto">Progreso del Contacto</strong>
            </div>
            <div className="toast-body small">
              <div className={formData.name.trim() ? 'text-success' : 'text-muted'}>
                {formData.name.trim() ? '✅' : '⏳'} Datos básicos {formData.name.trim() ? `(${formData.name})` : '(pendientes)'}
              </div>
              {addresses.length > 0 && <div className="text-success">✅ {addresses.length} direccion(es)</div>}
              {documents.length > 0 && <div className="text-success">✅ {documents.length} documento(s)</div>}
              {people.length > 0 && <div className="text-success">✅ {people.length} persona(s)</div>}
              {formData.name.trim() && (addresses.length > 0 || documents.length > 0 || people.length > 0) && (
                <hr className="my-2" />
              )}
              {formData.name.trim() && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="success"
                    size="small"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Crear Contacto
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}