/**
 * CONTACT PEOPLE COMPONENT
 * Gestión de personas de contacto dentro de una empresa
 * Administra ejecutivos, representantes, contactos técnicos, etc.
 */

'use client'

import React, { useState } from 'react'
import { Input } from '@/ui/components/base/Input'
import { Button } from '@/ui/components/base/Button'
import type { ContactPerson } from '../types'

interface ContactPeopleProps {
  contactId?: string
  people: ContactPerson[]
  onAddPerson: (person: Omit<ContactPerson, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => void
  onUpdatePerson: (id: string, person: Partial<ContactPerson>) => void
  onDeletePerson: (id: string) => void
  isLoading?: boolean
  className?: string
}

interface PersonFormData {
  name: string
  position: string
  department: string
  email: string
  phone: string
  mobile: string
  isPrimary: boolean
}

const initialPersonForm: PersonFormData = {
  name: '',
  position: '',
  department: '',
  email: '',
  phone: '',
  mobile: '',
  isPrimary: false
}

export const ContactPeople: React.FC<ContactPeopleProps> = ({
  people,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
  isLoading = false,
  className = ''
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<string | null>(null)
  const [formData, setFormData] = useState<PersonFormData>(initialPersonForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Clean up form data
    const cleanedData = {
      name: formData.name.trim(),
      position: formData.position.trim() || undefined,
      department: formData.department.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      mobile: formData.mobile.trim() || undefined,
      isPrimary: formData.isPrimary
    }
    
    if (editingPerson) {
      // Update existing person
      onUpdatePerson(editingPerson, cleanedData)
      setEditingPerson(null)
    } else {
      // Add new person
      onAddPerson(cleanedData)
      setShowAddForm(false)
    }
    
    setFormData(initialPersonForm)
    setErrors({})
  }

  const handleEdit = (person: ContactPerson) => {
    setFormData({
      name: person.name,
      position: person.position || '',
      department: person.department || '',
      email: person.email || '',
      phone: person.phone || '',
      mobile: person.mobile || '',
      isPrimary: person.isPrimary
    })
    setEditingPerson(person.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingPerson(null)
    setFormData(initialPersonForm)
    setErrors({})
  }

  const updateField = <K extends keyof PersonFormData>(field: K, value: PersonFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className={`contact-people ${className}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <i className="bi bi-people-fill me-2"></i>
            Personas de Contacto
          </h5>
          <p className="text-muted small mb-0">
            Administra ejecutivos, representantes y contactos clave de la empresa
          </p>
        </div>
        {!showAddForm && (
          <Button 
            variant="primary" 
            size="small"
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
          >
            <i className="bi bi-person-plus me-1"></i>
            Agregar Persona
          </Button>
        )}
      </div>

      {/* People List */}
      {people.length > 0 && (
        <div className="mb-4">
          <div className="row g-3">
            {people.map((person) => (
              <div key={person.id} className="col-md-6">
                <div className={`card h-100 ${person.isPrimary ? 'border-primary' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                               style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-person-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1">{person.name}</h6>
                          {person.isPrimary && (
                            <span className="badge bg-primary">
                              <i className="bi bi-star-fill me-1"></i>
                              Contacto Principal
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(person)}
                          disabled={isLoading}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onDeletePerson(person.id)}
                          disabled={isLoading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="contact-details">
                      {person.position && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="bi bi-briefcase me-1"></i>
                            Puesto:
                          </small>
                          <div className="fw-medium">{person.position}</div>
                        </div>
                      )}
                      
                      {person.department && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="bi bi-building me-1"></i>
                            Departamento:
                          </small>
                          <div>{person.department}</div>
                        </div>
                      )}
                      
                      {person.email && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="bi bi-envelope me-1"></i>
                            Email:
                          </small>
                          <div>
                            <a href={`mailto:${person.email}`} className="text-decoration-none">
                              {person.email}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="row">
                        {person.phone && (
                          <div className="col-6">
                            <small className="text-muted">
                              <i className="bi bi-telephone me-1"></i>
                              Teléfono:
                            </small>
                            <div>
                              <a href={`tel:${person.phone}`} className="text-decoration-none">
                                {person.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {person.mobile && (
                          <div className="col-6">
                            <small className="text-muted">
                              <i className="bi bi-phone me-1"></i>
                              Móvil:
                            </small>
                            <div>
                              <a href={`tel:${person.mobile}`} className="text-decoration-none">
                                {person.mobile}
                              </a>
                            </div>
                          </div>
                        )}
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
              <i className="bi bi-person-plus me-2"></i>
              {editingPerson ? 'Editar Persona de Contacto' : 'Nueva Persona de Contacto'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Name */}
                <div className="col-md-8">
                  <label htmlFor="name" className="form-label">
                    Nombre completo <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    errorText={errors.name}
                    disabled={isLoading}
                    placeholder="Ej. María García Rodríguez"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onChange={(e) => updateField('isPrimary', e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="isPrimary">
                      Contacto principal
                    </label>
                  </div>
                </div>

                {/* Position & Department */}
                <div className="col-md-6">
                  <label htmlFor="position" className="form-label">
                    Puesto o cargo
                  </label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Gerente de Ventas, Director Comercial"
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="department" className="form-label">
                    Departamento
                  </label>
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Ventas, Administración, Operaciones"
                  />
                </div>

                {/* Email */}
                <div className="col-md-12">
                  <label htmlFor="email" className="form-label">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    errorText={errors.email}
                    disabled={isLoading}
                    placeholder="ejemplo@empresa.com"
                    leftIcon="bi-envelope"
                  />
                </div>

                {/* Phone & Mobile */}
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label">
                    Teléfono oficina
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    disabled={isLoading}
                    placeholder="33-1234-5678"
                    leftIcon="bi-telephone"
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="mobile" className="form-label">
                    Teléfono móvil
                  </label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    disabled={isLoading}
                    placeholder="33-1234-5678"
                    leftIcon="bi-phone"
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
                      {editingPerson ? 'Actualizar' : 'Agregar'} Persona
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {people.length === 0 && !showAddForm && (
        <div className="text-center py-5">
          <i className="bi bi-people text-muted mb-3" style={{ fontSize: '3rem' }}></i>
          <h6 className="text-muted">No hay personas de contacto registradas</h6>
          <p className="text-muted small">
            Agrega ejecutivos, representantes y contactos clave para facilitar la comunicación
          </p>
        </div>
      )}
    </div>
  )
}