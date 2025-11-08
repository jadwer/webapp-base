/**
 * Billing Module - API Services
 *
 * CFDI Workflow:
 * 1. Create draft invoice with items
 * 2. Generate XML (generateXML)
 * 3. Generate PDF (generatePDF)
 * 4. Stamp with PAC (stamp)
 * 5. Download XML/PDF or Cancel
 */

import axiosClient from '@/lib/axiosClient'
import type {
  CFDIInvoiceFormData,
  CFDIInvoicesFilters,
  CFDIItemFormData,
  CFDIItemsFilters,
  CompanySetting,
  CompanySettingFormData,
  CFDIStampResponse,
  CFDICancelRequest,
  CFDICancelResponse,
  CFDIGenerateResponse,
  CreateCFDIInvoiceData,
} from '../types'
import {
  transformJsonApiCFDIInvoice,
  transformCFDIInvoiceFormToJsonApi,
  transformCFDIInvoicesResponse,
  transformJsonApiCFDIItem,
  transformCFDIItemFormToJsonApi,
  transformCFDIItemsResponse,
  transformJsonApiCompanySetting,
  transformCompanySettingFormToJsonApi,
  transformCompanySettingsResponse,
} from '../utils/transformers'

// ============================================================================
// CFDI INVOICES SERVICE
// ============================================================================

export const cfdiInvoicesService = {
  /**
   * Get all CFDI invoices with filters
   */
  getAll: async (filters?: CFDIInvoicesFilters) => {
    const queryParams = new URLSearchParams()

    if (filters?.search) {
      queryParams.append('filter[search]', filters.search)
    }
    if (filters?.status) {
      queryParams.append('filter[status]', filters.status)
    }
    if (filters?.tipoComprobante) {
      queryParams.append('filter[tipoComprobante]', filters.tipoComprobante)
    }
    if (filters?.receptorRfc) {
      queryParams.append('filter[receptorRfc]', filters.receptorRfc)
    }
    if (filters?.dateFrom) {
      queryParams.append('filter[dateFrom]', filters.dateFrom)
    }
    if (filters?.dateTo) {
      queryParams.append('filter[dateTo]', filters.dateTo)
    }

    // Include relationships
    queryParams.append('include', 'companySetting,contact,items')

    const query = queryParams.toString()
    const url = query ? `/cfdi-invoices?${query}` : '/cfdi-invoices'

    const response = await axiosClient.get(url)
    return transformCFDIInvoicesResponse(response.data)
  },

  /**
   * Get single CFDI invoice by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(
      `/cfdi-invoices/${id}?include=companySetting,contact,items`
    )
    return transformJsonApiCFDIInvoice(response.data.data, response.data.included)
  },

  /**
   * Create new CFDI invoice (draft)
   */
  create: async (data: CFDIInvoiceFormData) => {
    const payload = {
      data: transformCFDIInvoiceFormToJsonApi(data),
    }
    const response = await axiosClient.post('/cfdi-invoices', payload)
    return transformJsonApiCFDIInvoice(response.data.data, response.data.included)
  },

  /**
   * Create CFDI invoice with items in one request
   */
  createWithItems: async (data: CreateCFDIInvoiceData) => {
    const payload = {
      data: {
        type: 'cfdi_invoices',
        attributes: transformCFDIInvoiceFormToJsonApi(data.invoice).attributes,
        relationships: {
          items: {
            data: data.items.map((item) => transformCFDIItemFormToJsonApi(item)),
          },
        },
      },
    }
    const response = await axiosClient.post('/cfdi-invoices', payload)
    return transformJsonApiCFDIInvoice(response.data.data, response.data.included)
  },

  /**
   * Update CFDI invoice
   */
  update: async (id: string, data: CFDIInvoiceFormData) => {
    const payload = {
      data: {
        id,
        ...transformCFDIInvoiceFormToJsonApi(data),
      },
    }
    const response = await axiosClient.patch(`/cfdi-invoices/${id}`, payload)
    return transformJsonApiCFDIInvoice(response.data.data, response.data.included)
  },

  /**
   * Delete CFDI invoice
   */
  delete: async (id: string) => {
    await axiosClient.delete(`/cfdi-invoices/${id}`)
  },

  // ============================================================================
  // CFDI WORKFLOW METHODS
  // ============================================================================

  /**
   * Generate XML for CFDI invoice
   * Workflow: draft → generated
   */
  generateXML: async (id: string): Promise<CFDIGenerateResponse> => {
    const response = await axiosClient.post(`/cfdi-invoices/${id}/generate-xml`)
    return {
      cfdiId: response.data.data.id,
      xmlPath: response.data.data.attributes.xml_path,
      status: response.data.data.attributes.status,
    }
  },

  /**
   * Generate PDF for CFDI invoice
   * Workflow: generated → generated (with PDF)
   */
  generatePDF: async (id: string): Promise<CFDIGenerateResponse> => {
    const response = await axiosClient.post(`/cfdi-invoices/${id}/generate-pdf`)
    return {
      cfdiId: response.data.data.id,
      pdfPath: response.data.data.attributes.pdf_path,
      status: response.data.data.attributes.status,
    }
  },

  /**
   * Stamp CFDI with PAC (SW)
   * Workflow: generated → stamped → valid
   * This sends the XML to SW (Smarter Web) for certification
   */
  stamp: async (id: string): Promise<CFDIStampResponse> => {
    const response = await axiosClient.post(`/cfdi-invoices/${id}/stamp`)
    return {
      cfdiId: response.data.data.id,
      uuid: response.data.data.attributes.uuid,
      fechaTimbrado: response.data.data.attributes.fecha_timbrado,
      status: response.data.data.attributes.status,
    }
  },

  /**
   * Cancel CFDI invoice with SAT
   * Workflow: valid → cancelled
   */
  cancel: async (
    id: string,
    cancelRequest: CFDICancelRequest
  ): Promise<CFDICancelResponse> => {
    const response = await axiosClient.post(`/cfdi-invoices/${id}/cancel`, {
      motivo: cancelRequest.motivo,
      uuid_reemplazo: cancelRequest.uuidReemplazo || null,
    })
    return {
      cfdiId: response.data.data.id,
      status: response.data.data.attributes.status,
      fechaCancelacion: response.data.data.attributes.fecha_cancelacion,
    }
  },

  /**
   * Download XML file
   */
  downloadXML: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/cfdi-invoices/${id}/download-xml`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Download PDF file
   */
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/cfdi-invoices/${id}/download-pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Send CFDI by email
   */
  sendEmail: async (id: string, email: string) => {
    await axiosClient.post(`/cfdi-invoices/${id}/send-email`, {
      email,
    })
  },
}

// ============================================================================
// CFDI ITEMS SERVICE
// ============================================================================

export const cfdiItemsService = {
  /**
   * Get all CFDI items (usually filtered by cfdiInvoiceId)
   */
  getAll: async (filters?: CFDIItemsFilters) => {
    const queryParams = new URLSearchParams()

    if (filters?.cfdiInvoiceId) {
      queryParams.append('filter[cfdiInvoiceId]', filters.cfdiInvoiceId.toString())
    }

    const query = queryParams.toString()
    const url = query ? `/cfdi-items?${query}` : '/cfdi-items'

    const response = await axiosClient.get(url)
    return transformCFDIItemsResponse(response.data)
  },

  /**
   * Get single CFDI item by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/cfdi-items/${id}`)
    return transformJsonApiCFDIItem(response.data.data, response.data.included)
  },

  /**
   * Create new CFDI item
   */
  create: async (data: CFDIItemFormData) => {
    const payload = {
      data: transformCFDIItemFormToJsonApi(data),
    }
    const response = await axiosClient.post('/cfdi-items', payload)
    return transformJsonApiCFDIItem(response.data.data, response.data.included)
  },

  /**
   * Update CFDI item
   */
  update: async (id: string, data: CFDIItemFormData) => {
    const payload = {
      data: {
        id,
        ...transformCFDIItemFormToJsonApi(data),
      },
    }
    const response = await axiosClient.patch(`/cfdi-items/${id}`, payload)
    return transformJsonApiCFDIItem(response.data.data, response.data.included)
  },

  /**
   * Delete CFDI item
   */
  delete: async (id: string) => {
    await axiosClient.delete(`/cfdi-items/${id}`)
  },
}

// ============================================================================
// COMPANY SETTINGS SERVICE
// ============================================================================

export const companySettingsService = {
  /**
   * Get all company settings
   */
  getAll: async () => {
    const response = await axiosClient.get('/company-settings')
    return transformCompanySettingsResponse(response.data)
  },

  /**
   * Get single company setting by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/company-settings/${id}`)
    return transformJsonApiCompanySetting(response.data.data)
  },

  /**
   * Get active company setting
   */
  getActive: async (): Promise<CompanySetting | null> => {
    const response = await axiosClient.get('/company-settings?filter[isActive]=true')
    const transformed = transformCompanySettingsResponse(response.data)
    return transformed.data[0] || null
  },

  /**
   * Create new company setting
   */
  create: async (data: CompanySettingFormData) => {
    const payload = {
      data: transformCompanySettingFormToJsonApi(data),
    }
    const response = await axiosClient.post('/company-settings', payload)
    return transformJsonApiCompanySetting(response.data.data)
  },

  /**
   * Update company setting
   */
  update: async (id: string, data: CompanySettingFormData) => {
    const payload = {
      data: {
        id,
        ...transformCompanySettingFormToJsonApi(data),
      },
    }
    const response = await axiosClient.patch(`/company-settings/${id}`, payload)
    return transformJsonApiCompanySetting(response.data.data)
  },

  /**
   * Delete company setting
   */
  delete: async (id: string) => {
    await axiosClient.delete(`/company-settings/${id}`)
  },

  /**
   * Test PAC connection
   */
  testPACConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post(`/company-settings/${id}/test-pac`)
    return response.data
  },

  /**
   * Upload certificate file (.cer)
   */
  uploadCertificate: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('certificate', file)
    const response = await axiosClient.post(
      `/company-settings/${id}/upload-certificate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Upload key file (.key)
   */
  uploadKey: async (id: string, file: File, password: string) => {
    const formData = new FormData()
    formData.append('key', file)
    formData.append('password', password)
    const response = await axiosClient.post(
      `/company-settings/${id}/upload-key`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}
