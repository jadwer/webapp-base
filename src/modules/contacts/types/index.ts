/**
 * CONTACTS MODULE - TYPES
 * Tipos TypeScript para el módulo de contactos siguiendo JSON:API specification
 * Basado en documentación API generada el 2025-08-19
 */

// ===== MAIN CONTACT ENTITY =====
export interface Contact {
  id: string
  contactType: 'individual' | 'company'
  name: string
  legalName?: string
  taxId?: string
  email?: string
  phone?: string
  website?: string
  status: 'active' | 'inactive' | 'suspended'
  isCustomer: boolean
  isSupplier: boolean
  creditLimit?: number
  currentCredit?: number
  classification?: string
  paymentTerms?: number
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ===== RELATED ENTITIES (for future phases) =====
export interface ContactAddress {
  id: string
  contactId: number
  addressType: 'billing' | 'shipping' | 'main' | 'other'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault: boolean
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ContactDocument {
  id: string
  contactId: number
  documentType: 'tax_certificate' | 'business_license' | 'rfc' | 'other'
  filePath: string
  originalFilename: string
  mimeType: string
  fileSize: number
  uploadedBy: number
  verifiedAt?: string
  verifiedBy?: number
  expiresAt?: string
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ContactPerson {
  id: string
  contactId: number
  name: string
  position?: string
  department?: string
  email?: string
  phone?: string
  mobile?: string
  isPrimary: boolean
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ===== JSON:API RESPONSE TYPES =====
export interface ContactResponse {
  data: Contact
  included?: (ContactAddress | ContactDocument | ContactPerson)[]
}

export interface ContactsResponse {
  data: Contact[]
  meta?: {
    page?: {
      currentPage: number
      lastPage: number
      perPage: number
      total: number
    }
    [key: string]: unknown
  }
  included?: (ContactAddress | ContactDocument | ContactPerson)[]
}

// ===== API PARAMETERS =====
export interface ContactFilters {
  search?: string
  contactType?: string
  status?: string
  isCustomer?: boolean
  isSupplier?: boolean
  classification?: string
}

export interface UseContactsParams {
  filters?: ContactFilters
  pagination?: {
    page: number
    size: number
  }
  include?: string[]
  sort?: string
}

// ===== FORM DATA TYPES =====
export interface CreateContactData {
  contactType: 'individual' | 'company'
  name: string
  legalName?: string
  taxId?: string
  email?: string
  phone?: string
  website?: string
  status: 'active' | 'inactive' | 'suspended'
  isCustomer: boolean
  isSupplier: boolean
  creditLimit?: number
  classification?: string
  paymentTerms?: number
  notes?: string
  metadata?: Record<string, unknown>
}

export type UpdateContactData = Partial<CreateContactData>

export type ContactFormData = CreateContactData

// ===== PARSED TYPES (for UI) =====
export interface ContactParsed extends Contact {
  // Computed fields for UI
  displayName: string
  contactTypeLabel: string
  statusLabel: string
  isActiveCustomer: boolean
  isActiveSupplier: boolean
  hasDocuments: boolean
  hasAddresses: boolean
  hasPeople: boolean
}