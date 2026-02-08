/**
 * CONTACTS DETAIL PAGE
 * Página para ver detalles de un contacto
 */

'use client'

import React from 'react'
import { useContact, useContactMutations } from '@/modules/contacts'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { ContactViewTabs } from '@/modules/contacts/components/ContactViewTabs'
import { Alert } from '@/ui/components/base/Alert'
import { toast } from '@/lib/toast'

interface ContactDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const resolvedParams = React.use(params)
  const navigation = useNavigationProgress()
  const { deleteContact } = useContactMutations()
  // Use includes to get all related data in one request
  const { contact, addresses, documents, people, isLoading, error } = useContact(
    resolvedParams.id,
    ['contactAddresses', 'contactDocuments', 'contactPeople']
  )

  if (isLoading) {
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

  const handleEdit = () => {
    navigation.push(`/dashboard/contacts/${contact.id}/edit`)
  }

  const handleDelete = async () => {
    if (!contact) return
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar el contacto "${contact.displayName}"?\n\nEsta acción también eliminará:\n- ${addresses.length} dirección(es)\n- ${documents.length} documento(s)\n- ${people.length} persona(s)\n\nEsta acción no se puede deshacer.`
    
    if (!confirm(confirmMessage)) {
      return
    }
    
    try {
      // Note: The backend should handle cascade deletion automatically
      // If not, we would need to delete related entities first
      await deleteContact(contact.id)

      // Navigate back to contacts list
      navigation.push('/dashboard/contacts')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const axiosError = error && typeof error === 'object' && 'response' in error ?
        error as { response?: { status?: number; data?: { message?: string } } } : null

      // Show user-friendly error message
      if (axiosError?.response?.status === 409 || axiosError?.response?.status === 400) {
        toast.error('No se puede eliminar el contacto porque tiene elementos relacionados. Por favor contacta al administrador.')
      } else {
        toast.error(`Error al eliminar el contacto: ${axiosError?.response?.data?.message || errorMessage}`)
      }
    }
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link text-muted p-0 me-3"
            onClick={() => navigation.back()}
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <div>
            <div className="d-flex align-items-center mb-1">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '48px', height: '48px', minWidth: '48px' }}
              >
                <i className={`bi ${contact.contactType === 'company' ? 'bi-building' : 'bi-person'}`}></i>
              </div>
              <div>
                <h1 className="h3 mb-0">{contact.displayName}</h1>
                <p className="text-muted mb-0">
                  {contact.contactTypeLabel}
                  {contact.taxId && (
                    <>
                      {' • '}
                      <span className="font-monospace">{contact.taxId}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <ContactViewTabs
        contact={contact}
        addresses={addresses}
        documents={documents}
        people={people}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}