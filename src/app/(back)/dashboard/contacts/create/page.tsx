/**
 * CONTACTS CREATE PAGE
 * Página para crear nuevos contactos
 */

'use client'

import React from 'react'
import { ContactFormTabs } from '@/modules/contacts/components/ContactFormTabs'
import { useContactMutations } from '@/modules/contacts'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useSearchParams } from 'next/navigation'
import type { ContactFormData } from '@/modules/contacts/types'
import { parseContact } from '@/modules/contacts/hooks'
import { toast } from '@/lib/toast'

export default function CreateContactPage() {
  const navigation = useNavigationProgress()
  const searchParams = useSearchParams()
  const { createContact } = useContactMutations()
  const [isLoading, setIsLoading] = React.useState(false)

  // Get suggested type from query params
  const suggestedType = searchParams.get('type')
  
  const handleSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    
    try {
      // Apply suggestions from query params
      const finalData = { ...data }
      
      if (suggestedType === 'customer') {
        finalData.isCustomer = true
      } else if (suggestedType === 'supplier') {
        finalData.isSupplier = true
      }
      
      const result = await createContact(finalData)

      // Navigate to the new contact's detail page
      navigation.push(`/dashboard/contacts/${result.data.id}`)
      
      // Return the parsed contact data for ContactFormTabs to use
      return parseContact(result.data)
      
    } catch {
      toast.error('Error al crear el contacto. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.back()
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
              <h1 className="h3 mb-0">Nuevo Contacto</h1>
              <p className="text-muted mb-0">
                Crear un nuevo {suggestedType === 'customer' ? 'cliente' : suggestedType === 'supplier' ? 'proveedor' : 'contacto'}
              </p>
            </div>
          </div>

          {/* Form with Tabs */}
          <div className="card">
            <div className="card-body">
              <ContactFormTabs
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