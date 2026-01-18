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
    
    const response = await axiosClient.get('/api/v1/contacts', { params: queryParams })
    return transformJsonApiResponse(response.data)
  },

  /**
   * Get single contact by ID
   */
  getById: async (id: string, include?: string[]): Promise<ContactResponse> => {
    const params: Record<string, unknown> = {}
    
    if (include && include.length > 0) {
      params.include = include.join(',')
    }
    
    const response = await axiosClient.get(`/api/v1/contacts/${id}`, { params })
    return transformSingleJsonApiResponse(response.data)
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
    
    const response = await axiosClient.post('/api/v1/contacts', payload)
    return transformSingleJsonApiResponse(response.data)
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
    
    const response = await axiosClient.patch(`/api/v1/contacts/${id}`, payload)
    return transformSingleJsonApiResponse(response.data)
  },

  /**
   * Delete contact
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/contacts/${id}`)
  },

  /**
   * Check for potential duplicates before creating
   */
  checkDuplicates: async (params: { name?: string; email?: string; taxId?: string }): Promise<{
    duplicates: Array<{
      id: number
      name: string
      email: string | null
      matchScore: number
      matchReasons: string[]
    }>
    hasDuplicates: boolean
  }> => {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append('name', params.name)
    if (params.email) queryParams.append('email', params.email)
    if (params.taxId) queryParams.append('tax_id', params.taxId)

    const response = await axiosClient.get(`/api/v1/contacts/check-duplicates?${queryParams.toString()}`)
    return response.data
  },

  /**
   * Get customer credit status
   */
  getCreditStatus: async (id: string): Promise<{
    creditLimit: number
    currentBalance: number
    availableCredit: number
    overdueAmount: number
    paymentScore: number
    isOnCreditHold: boolean
  }> => {
    const response = await axiosClient.get(`/api/v1/contacts/${id}/credit-status`)
    return response.data
  }
}

// ===== RELATED SERVICES =====

// Contact Addresses Service
export const contactAddressesService = {
  getAll: async (contactId?: string) => {
    const params = contactId ? { 'filter[contactId]': parseInt(contactId) } : {}
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
    const response = await axiosClient.patch(`/api/v1/contact-addresses/${id}`, payload)
    return transformSingleJsonApiResponse(response.data)
  },

  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/contact-addresses/${id}`)
  }
}

// Contact Documents Service
export const contactDocumentsService = {
  getAll: async (contactId?: string) => {
    const params = contactId ? { 'filter[contactId]': parseInt(contactId) } : {}
    const response = await axiosClient.get('/api/v1/contact-documents', { params })
    return transformJsonApiResponse(response.data)
  },

  upload: async (file: File, contactId: string, documentType: string, notes?: string) => {
    const formData = new FormData()
    formData.append('contact_id', contactId)
    formData.append('document_type', documentType)
    formData.append('file', file)

    if (notes) {
      formData.append('notes', notes)
    }

    const response = await axiosClient.post('/api/v1/contact-documents/upload', formData)
    return transformSingleJsonApiResponse(response.data)
  },

  download: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/contact-documents/${id}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  view: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/contact-documents/${id}/view`, {
      responseType: 'blob'
    })
    return response.data
  },

  verify: async (id: string) => {
    const response = await axiosClient.patch(`/api/v1/contact-documents/${id}/verify`)
    return response.data
  },

  unverify: async (id: string) => {
    const response = await axiosClient.patch(`/api/v1/contact-documents/${id}/unverify`)
    return response.data
  },

  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/contact-documents/${id}`)
  }
}

// Contact People Service
export const contactPeopleService = {
  getAll: async (contactId?: string) => {
    const params = contactId ? { 'filter[contactId]': parseInt(contactId) } : {}
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
    const response = await axiosClient.patch(`/api/v1/contact-people/${id}`, payload)
    return transformSingleJsonApiResponse(response.data)
  },

  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/contact-people/${id}`)
  }
}