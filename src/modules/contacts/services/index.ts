/**
 * CONTACTS MODULE - SERVICE LAYER
 * API integration siguiendo JSON:API specification
 * Patrón simple y directo según blueprint simplificado
 */

import axiosClient from '@/lib/axiosClient'
import type {
  ContactsResponse,
  ContactResponse,
  UseContactsParams,
  CreateContactData,
  UpdateContactData,
  ContactAddress,
  ContactDocument,
  ContactPerson
} from '../types'

// ===== TRANSFORM UTILITIES =====
const transformJsonApiResponse = (response: unknown): ContactsResponse => {
  const res = response as { 
    data?: unknown[]
    meta?: { [key: string]: unknown }
    included?: unknown[] 
  }
  return {
    data: (res.data || []) as ContactsResponse['data'],
    meta: res.meta || {},
    included: (res.included || []) as ContactsResponse['included']
  }
}

const transformSingleJsonApiResponse = (response: unknown): ContactResponse => {
  const res = response as { data: unknown; included?: unknown[] }
  return {
    data: res.data as ContactResponse['data'],
    included: (res.included || []) as ContactResponse['included']
  }
}

// Transform included data into separate arrays by type
export const processIncludedData = (included: unknown[] = []) => {
  const addresses: ContactAddress[] = []
  const documents: ContactDocument[] = []
  const people: ContactPerson[] = []
  
  included.forEach((item: unknown) => {
    const jsonApiItem = item as { type: string; id: string; attributes: Record<string, unknown> }
    if (jsonApiItem.type === 'contact-addresses') {
      addresses.push({
        id: jsonApiItem.id,
        ...jsonApiItem.attributes
      } as ContactAddress)
    } else if (jsonApiItem.type === 'contact-documents') {
      documents.push({
        id: jsonApiItem.id,
        ...jsonApiItem.attributes
      } as ContactDocument)
    } else if (jsonApiItem.type === 'contact-people') {
      people.push({
        id: jsonApiItem.id,
        ...jsonApiItem.attributes
      } as ContactPerson)
    }
  })
  
  console.log('🔄 [processIncludedData] Processed:', {
    addresses: addresses.length,
    documents: documents.length,
    people: people.length
  })
  
  return { addresses, documents, people }
}

// ===== MAIN SERVICE =====
export const contactsService = {
  /**
   * Get all contacts with optional filtering and pagination
   */
  getAll: async (params?: UseContactsParams): Promise<ContactsResponse> => {
    const queryParams: Record<string, unknown> = {}
    
    // Add filters
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Convert boolean values to strings that the API expects
          if (typeof value === 'boolean') {
            queryParams[`filter[${key}]`] = value ? '1' : '0'
          } else {
            queryParams[`filter[${key}]`] = value
          }
        }
      })
    }
    
    // Add pagination
    if (params?.pagination) {
      queryParams['page[number]'] = params.pagination.page
      queryParams['page[size]'] = params.pagination.size
    }
    
    // Add includes
    if (params?.include && params.include.length > 0) {
      queryParams['include'] = params.include.join(',')
    }
    
    // Add sorting
    if (params?.sort) {
      queryParams['sort'] = params.sort
    }
    
    console.log('🌐 [contactsService.getAll] Request params:', queryParams)
    
    const response = await axiosClient.get('/api/v1/contacts', { params: queryParams })
    const transformedResponse = transformJsonApiResponse(response.data)
    
    console.log('✅ [contactsService.getAll] Response:', {
      count: transformedResponse.data?.length,
      meta: transformedResponse.meta,
      hasIncluded: !!transformedResponse.included?.length
    })
    
    return transformedResponse
  },

  /**
   * Get single contact by ID
   */
  getById: async (id: string, include?: string[]): Promise<ContactResponse> => {
    const params: Record<string, unknown> = {}
    
    if (include && include.length > 0) {
      params.include = include.join(',')
    }
    
    console.log('🌐 [contactsService.getById] Request:', { id, params })
    
    const response = await axiosClient.get(`/api/v1/contacts/${id}`, { params })
    const transformedResponse = transformSingleJsonApiResponse(response.data)
    
    console.log('✅ [contactsService.getById] Response:', {
      id: transformedResponse.data?.id,
      name: transformedResponse.data?.name,
      hasIncluded: !!transformedResponse.included?.length
    })
    
    return transformedResponse
  },

  /**
   * Create new contact
   */
  create: async (data: CreateContactData): Promise<ContactResponse> => {
    const payload = {
      data: {
        type: 'contacts',
        attributes: data
      }
    }
    
    console.log('🌐 [contactsService.create] Request:', payload)
    console.log('🔍 [contactsService.create] Raw data:', JSON.stringify(data, null, 2))
    
    try {
      const response = await axiosClient.post('/api/v1/contacts', payload)
      const transformedResponse = transformSingleJsonApiResponse(response.data)
      
      console.log('✅ [contactsService.create] Created contact:', {
        id: transformedResponse.data?.id,
        name: transformedResponse.data?.name
      })
      
      return transformedResponse
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { data: unknown } }
        console.error('❌ [contactsService.create] 422 Error details:', JSON.stringify(axiosError.response.data, null, 2))
        
        // Log individual errors for debugging
        const errorData = axiosError.response.data as { errors?: unknown[] }
        if (errorData.errors) {
          console.error('❌ Individual validation errors:')
          errorData.errors.forEach((err, index) => {
            console.error(`Error ${index + 1}:`, JSON.stringify(err, null, 2))
          })
        }
      }
      throw error
    }
  },

  /**
   * Update existing contact
   */
  update: async (id: string, data: UpdateContactData): Promise<ContactResponse> => {
    const payload = {
      data: {
        type: 'contacts',
        id,
        attributes: data
      }
    }
    
    console.log('🌐 [contactsService.update] Request:', { id, payload })
    
    const response = await axiosClient.patch(`/api/v1/contacts/${id}`, payload)
    const transformedResponse = transformSingleJsonApiResponse(response.data)
    
    console.log('✅ [contactsService.update] Updated contact:', {
      id: transformedResponse.data?.id,
      name: transformedResponse.data?.name
    })
    
    return transformedResponse
  },

  /**
   * Delete contact
   */
  delete: async (id: string): Promise<void> => {
    console.log('🌐 [contactsService.delete] Request:', { id })
    
    await axiosClient.delete(`/api/v1/contacts/${id}`)
    
    console.log('✅ [contactsService.delete] Deleted contact:', { id })
  }
}

// ===== RELATED SERVICES =====

// Contact Addresses Service
export const contactAddressesService = {
  getAll: async (contactId?: string) => {
    const params = contactId ? { 'filter[contactId]': parseInt(contactId) } : {}
    console.log('🔍 [contactAddressesService.getAll] Params:', params)
    const response = await axiosClient.get('/api/v1/contact-addresses', { params })
    return transformJsonApiResponse(response.data)
  },

  create: async (data: Omit<ContactAddress, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      data: {
        type: 'contact-addresses',
        attributes: data
      }
    }
    
    console.log('🌐 [contactAddressesService.create] Request:', payload)
    const response = await axiosClient.post('/api/v1/contact-addresses', payload)
    return transformSingleJsonApiResponse(response.data)
  },

  update: async (id: string, data: Partial<ContactAddress>) => {
    const payload = {
      data: {
        type: 'contact-addresses',
        id,
        attributes: data
      }
    }
    
    console.log('🌐 [contactAddressesService.update] Request:', { id, payload })
    const response = await axiosClient.patch(`/api/v1/contact-addresses/${id}`, payload)
    return transformSingleJsonApiResponse(response.data)
  },

  delete: async (id: string) => {
    console.log('🌐 [contactAddressesService.delete] Request:', { id })
    await axiosClient.delete(`/api/v1/contact-addresses/${id}`)
  }
}

// Contact Documents Service
export const contactDocumentsService = {
  getAll: async (contactId?: string) => {
    const params = contactId ? { 'filter[contactId]': parseInt(contactId) } : {}
    console.log('🔍 [contactDocumentsService.getAll] Params:', params)
    const response = await axiosClient.get('/api/v1/contact-documents', { params })
    return transformJsonApiResponse(response.data)
  },

  upload: async (file: File, contactId: string, documentType: string, notes?: string) => {
    console.log('🌐 [contactDocumentsService.upload] Starting upload with documented format...', { 
      fileName: file.name, 
      contactId, 
      documentType, 
      notes,
      fileSize: file.size,
      mimeType: file.type
    })
    
    // Use the documented upload endpoint with exact FormData format
    const formData = new FormData()
    formData.append('contact_id', contactId)           // Exactly as documented
    formData.append('document_type', documentType)     // snake_case as documented
    formData.append('file', file)                      // The actual file
    
    if (notes) {
      formData.append('notes', notes)                  // Optional notes
    }
    
    console.log('📎 [contactDocumentsService.upload] Using documented endpoint /upload with FormData:', {
      contact_id: contactId,
      document_type: documentType,
      file_name: file.name,
      has_notes: !!notes
    })
    
    // POST /api/v1/contact-documents/upload (as documented)
    const response = await axiosClient.post('/api/v1/contact-documents/upload', formData, {
      headers: {
        // NO Content-Type header - FormData handles it automatically as documented
        // axiosClient already includes Authorization header
      }
    })
    
    console.log('✅ [contactDocumentsService.upload] Upload successful!', {
      status: response.status,
      documentId: response.data?.data?.id
    })
    
    return transformSingleJsonApiResponse(response.data)
  },

  download: async (id: string) => {
    console.log('🌐 [contactDocumentsService.download] Request:', { id })
    const response = await axiosClient.get(`/api/v1/contact-documents/${id}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  verify: async (id: string) => {
    console.log('🌐 [contactDocumentsService.verify] Request:', { id })
    const response = await axiosClient.patch(`/api/v1/contact-documents/${id}/verify`)
    console.log('✅ [contactDocumentsService.verify] Response:', {
      status: response.data?.data?.attributes?.status,
      isVerified: response.data?.data?.attributes?.isVerified,
      verifiedBy: response.data?.data?.attributes?.verifiedBy,
      message: response.data?.message
    })
    return response.data // Return full response with message
  },

  unverify: async (id: string) => {
    console.log('🌐 [contactDocumentsService.unverify] Request:', { id })
    const response = await axiosClient.patch(`/api/v1/contact-documents/${id}/unverify`)
    console.log('✅ [contactDocumentsService.unverify] Response:', {
      status: response.data?.data?.attributes?.status,
      isVerified: response.data?.data?.attributes?.isVerified,
      message: response.data?.message
    })
    return response.data // Return full response with message
  },

  delete: async (id: string) => {
    console.log('🌐 [contactDocumentsService.delete] Request:', { id })
    await axiosClient.delete(`/api/v1/contact-documents/${id}`)
  }
}

// Contact People Service  
export const contactPeopleService = {
  getAll: async (contactId?: string) => {
    const params = contactId ? { 'filter[contactId]': parseInt(contactId) } : {}
    console.log('🔍 [contactPeopleService.getAll] Params:', params)
    const response = await axiosClient.get('/api/v1/contact-people', { params })
    return transformJsonApiResponse(response.data)
  },

  create: async (data: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      data: {
        type: 'contact-people',
        attributes: data
      }
    }
    
    console.log('🌐 [contactPeopleService.create] Request:', payload)
    const response = await axiosClient.post('/api/v1/contact-people', payload)
    return transformSingleJsonApiResponse(response.data)
  },

  update: async (id: string, data: Partial<ContactPerson>) => {
    const payload = {
      data: {
        type: 'contact-people',
        id,
        attributes: data
      }
    }
    
    console.log('🌐 [contactPeopleService.update] Request:', { id, payload })
    const response = await axiosClient.patch(`/api/v1/contact-people/${id}`, payload)
    return transformSingleJsonApiResponse(response.data)
  },

  delete: async (id: string) => {
    console.log('🌐 [contactPeopleService.delete] Request:', { id })
    await axiosClient.delete(`/api/v1/contact-people/${id}`)
  }
}