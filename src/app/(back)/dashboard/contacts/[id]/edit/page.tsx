/**
 * CONTACTS EDIT PAGE
 * Página para editar contactos existentes
 */

'use client'

import React from 'react'
import { ContactFormTabs } from '@/modules/contacts/components/ContactFormTabs'
import { useContact, useContactMutations } from '@/modules/contacts'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { ContactFormData } from '@/modules/contacts/types'

interface EditContactPageProps {
  params: Promise<{ id: string }>
}

export default function EditContactPage({ params }: EditContactPageProps) {
  const resolvedParams = React.use(params)
  const navigation = useNavigationProgress()
  const { contact, isLoading: contactLoading, error } = useContact(resolvedParams.id)
  const { updateContact } = useContactMutations()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (data: ContactFormData) => {
    if (!contact) return
    
    setIsLoading(true)
    
    try {
      console.log('🚀 [EditContactPage] Updating contact:', { id: contact.id, data })
      
      const result = await updateContact(contact.id, data)
      
      console.log('✅ [EditContactPage] Contact updated:', result.data.id)
      
      // Navigate back to the contact's detail page
      navigation.push(`/dashboard/contacts/${contact.id}`)
      
    } catch (error) {
      console.error('❌ [EditContactPage] Error updating contact:', error)
      // TODO: Show error toast in Phase 4
      alert('Error al actualizar el contacto. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.back()
  }

  // Loading state
  if (contactLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center py-5">
          <div className="text-center">
            <div className="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p className="text-muted">Cargando contacto...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !contact) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Error:</strong> {error?.message || 'No se pudo cargar el contacto'}
        </Alert>
        <button
          className="btn btn-secondary"
          onClick={() => navigation.back()}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-link text-muted p-0 me-3"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <div>
              <h1 className="h3 mb-0">Editar Contacto</h1>
              <p className="text-muted mb-0">
                Modificar información de {contact.displayName}
              </p>
            </div>
          </div>

          {/* Form with Tabs */}
          <div className="card">
            <div className="card-body">
              <ContactFormTabs
                contact={contact}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}