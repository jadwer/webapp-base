/**
 * CONTACTS MODULE - HOOKS
 * Hook principal siguiendo patrón exitoso de Inventory
 * Un solo hook principal con parámetros opcionales
 */

'use client'

import useSWR from 'swr'
import { useCallback } from 'react'
import { contactsService, contactAddressesService, contactDocumentsService, contactPeopleService, processIncludedData } from '../services'
import type {
  Contact,
  ContactType,
  ContactStatus,
  ContactParsed,
  UseContactsParams,
  CreateContactData,
  UpdateContactData,
  ContactAddress,
  ContactDocument,
  ContactPerson
} from '../types'

// ===== TRANSFORM UTILITIES =====
export const parseContact = (rawContact: unknown): ContactParsed => {
  // Service layer already flattens JSON:API to { id, ...attributes }
  const c = rawContact as Record<string, unknown>

  const contact: Contact = {
    id: String(c.id || ''),
    contactType: (c.contactType as ContactType) || 'company',
    name: (c.name as string) || '',
    legalName: c.legalName as string | undefined,
    taxId: c.taxId as string | undefined,
    email: c.email as string | undefined,
    phone: c.phone as string | undefined,
    website: c.website as string | undefined,
    status: (c.status as ContactStatus) || 'active',
    isCustomer: Boolean(c.isCustomer),
    isSupplier: Boolean(c.isSupplier),
    creditLimit: c.creditLimit as number | undefined,
    currentCredit: c.currentCredit as number | undefined,
    classification: c.classification as string | undefined,
    paymentTerms: c.paymentTerms as number | undefined,
    notes: c.notes as string | undefined,
    metadata: c.metadata as Record<string, unknown> | undefined,
    createdAt: (c.createdAt as string) || '',
    updatedAt: (c.updatedAt as string) || '',
  }

  return {
    ...contact,
    displayName: contact.legalName || contact.name,
    contactTypeLabel: contact.contactType === 'person' ? 'Persona física' : 'Empresa',
    statusLabel: contact.status === 'active' ? 'Activo' : contact.status === 'inactive' ? 'Inactivo' : 'Suspendido',
    isActiveCustomer: contact.isCustomer && contact.status === 'active',
    isActiveSupplier: contact.isSupplier && contact.status === 'active',
    hasDocuments: false,
    hasAddresses: false,
    hasPeople: false
  }
}

// ===== MAIN HOOK =====
export const useContacts = (params?: UseContactsParams) => {
  const queryKey = ['contacts', params]
  
  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => contactsService.getAll(params),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  )

  // Parse contacts for UI
  const contacts: ContactParsed[] = data?.data?.map(parseContact) || []
  const meta = data?.meta || {}

  return {
    contacts,
    meta,
    isLoading,
    error,
    mutate
  }
}

// ===== SINGLE CONTACT HOOK =====
export const useContact = (id?: string, include?: string[]) => {
  const queryKey = id ? ['contact', id, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => id ? contactsService.getById(id, include) : null,
    {
      revalidateOnFocus: false
    }
  )

  const contact: ContactParsed | undefined = data?.data ? parseContact(data.data) : undefined

  // Process included data if available
  const includedData = data?.included ? processIncludedData(data.included) : null

  return {
    contact,
    addresses: includedData?.addresses || [],
    documents: includedData?.documents || [],
    people: includedData?.people || [],
    isLoading,
    error,
    mutate
  }
}

// ===== MUTATIONS HOOK =====
export const useContactMutations = () => {
  const createContact = useCallback(async (data: CreateContactData) => {
    const result = await contactsService.create(data)
    const { mutate } = await import('swr')
    mutate(key => Array.isArray(key) && key[0] === 'contacts')
    return result
  }, [])

  const updateContact = useCallback(async (id: string, data: UpdateContactData) => {
    const result = await contactsService.update(id, data)
    const { mutate } = await import('swr')
    mutate(key => Array.isArray(key) && (key[0] === 'contacts' || (key[0] === 'contact' && key[1] === id)))
    return result
  }, [])

  const deleteContact = useCallback(async (id: string) => {
    await contactsService.delete(id)
    const { mutate } = await import('swr')
    mutate(key => Array.isArray(key) && (key[0] === 'contacts' || (key[0] === 'contact' && key[1] === id)))
  }, [])

  return {
    createContact,
    updateContact,
    deleteContact
  }
}

// ===== SPECIALIZED HOOKS (for future use) =====
export const useContactsByType = (contactType: 'person' | 'company') => {
  return useContacts({
    filters: { contactType }
  })
}

export const useCustomers = () => {
  return useContacts({
    filters: { isCustomer: true }
  })
}

export const useSuppliers = () => {
  return useContacts({
    filters: { isSupplier: true }
  })
}

export const useActiveContacts = () => {
  return useContacts({
    filters: { status: 'active' }
  })
}

// ===== RELATED ENTITIES HOOKS =====

/**
 * Hook para obtener direcciones de un contacto
 */
export const useContactAddresses = (contactId?: string) => {
  const queryKey = contactId ? ['contact-addresses', contactId] : null

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => contactId ? contactAddressesService.getAll(contactId) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    addresses: (data?.data || []) as unknown as ContactAddress[],
    error,
    isLoading,
    mutate,
    endpointNotFound: error?.response?.status === 404 || error?.response?.status === 400
  }
}

/**
 * Hook para obtener documentos de un contacto
 */
export const useContactDocuments = (contactId?: string) => {
  const queryKey = contactId ? ['contact-documents', contactId] : null

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => contactId ? contactDocumentsService.getAll(contactId) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    documents: (data?.data || []) as unknown as ContactDocument[],
    error,
    isLoading,
    mutate,
    endpointNotFound: error?.response?.status === 404 || error?.response?.status === 400
  }
}

/**
 * Hook para obtener personas de contacto
 */
export const useContactPeople = (contactId?: string) => {
  const queryKey = contactId ? ['contact-people', contactId] : null

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => contactId ? contactPeopleService.getAll(contactId) : null,
    {
      revalidateOnFocus: false
    }
  )

  return {
    people: (data?.data || []) as unknown as ContactPerson[],
    error,
    isLoading,
    mutate,
    endpointNotFound: error?.response?.status === 404 || error?.response?.status === 400
  }
}