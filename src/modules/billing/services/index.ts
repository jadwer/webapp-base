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
    const url = query ? `/api/v1/cfdi-invoices?${query}` : '/api/v1/cfdi-invoices'

    const response = await axiosClient.get(url)
    return transformCFDIInvoicesResponse(response.data)
  },

  /**
   * Get single CFDI invoice by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(
      `/api/v1/cfdi-invoices/${id}?include=companySetting,contact,items`
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
    const response = await axiosClient.post('/api/v1/cfdi-invoices', payload)
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
    const response = await axiosClient.post('/api/v1/cfdi-invoices', payload)
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
    const response = await axiosClient.patch(`/api/v1/cfdi-invoices/${id}`, payload)
    return transformJsonApiCFDIInvoice(response.data.data, response.data.included)
  },

  /**
   * Delete CFDI invoice
   */
  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/cfdi-invoices/${id}`)
  },

  // ============================================================================
  // CFDI WORKFLOW METHODS
  // ============================================================================

  /**
   * Generate XML for CFDI invoice
   * Workflow: draft → generated
   */
  generateXML: async (id: string): Promise<CFDIGenerateResponse> => {
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/generate-xml`)
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
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/generate-pdf`)
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
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/stamp`)
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
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/cancel`, {
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
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/download-xml`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Download PDF file
   */
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/download-pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Send CFDI by email
   * NOTE: Backend endpoint not yet implemented - requires POST /api/v1/cfdi-invoices/{id}/send-email
   */
  sendEmail: async (id: string, email: string) => {
    // TODO: Backend needs to implement this endpoint
    // For now, throw a clear error so UI can handle it gracefully
    throw new Error('El envío de correo electrónico no está disponible. Endpoint pendiente de implementación en backend.')
  },

  /**
   * Preview PDF in browser
   */
  previewPDF: (id: string): string => {
    return `/api/v1/cfdi-invoices/${id}/preview-pdf`
  },

  /**
   * Validate CFDI status with SAT
   */
  validateSAT: async (id: string): Promise<{
    valid: boolean
    uuid: string
    status: 'Vigente' | 'Cancelado'
    fechaEmision: string
    rfcEmisor: string
    rfcReceptor: string
  }> => {
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/validate-sat`)
    return response.data
  },

  /**
   * Get cancellation status
   */
  getCancellationStatus: async (id: string): Promise<{
    status: 'cancellation_pending' | 'cancelled'
    fechaCancelacion?: string
    acuse?: string
  }> => {
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/cancellation-status`)
    return response.data
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
    const url = query ? `/api/v1/cfdi-items?${query}` : '/api/v1/cfdi-items'

    const response = await axiosClient.get(url)
    return transformCFDIItemsResponse(response.data)
  },

  /**
   * Get single CFDI item by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/cfdi-items/${id}`)
    return transformJsonApiCFDIItem(response.data.data, response.data.included)
  },

  /**
   * Create new CFDI item
   */
  create: async (data: CFDIItemFormData) => {
    const payload = {
      data: transformCFDIItemFormToJsonApi(data),
    }
    const response = await axiosClient.post('/api/v1/cfdi-items', payload)
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
    const response = await axiosClient.patch(`/api/v1/cfdi-items/${id}`, payload)
    return transformJsonApiCFDIItem(response.data.data, response.data.included)
  },

  /**
   * Delete CFDI item
   */
  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/cfdi-items/${id}`)
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
    const response = await axiosClient.get('/api/v1/company-settings')
    return transformCompanySettingsResponse(response.data)
  },

  /**
   * Get single company setting by ID
   */
  getById: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/company-settings/${id}`)
    return transformJsonApiCompanySetting(response.data.data)
  },

  /**
   * Get active company setting
   */
  getActive: async (): Promise<CompanySetting | null> => {
    const response = await axiosClient.get('/api/v1/company-settings?filter[isActive]=true')
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
    const response = await axiosClient.post('/api/v1/company-settings', payload)
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
    const response = await axiosClient.patch(`/api/v1/company-settings/${id}`, payload)
    return transformJsonApiCompanySetting(response.data.data)
  },

  /**
   * Delete company setting
   */
  delete: async (id: string) => {
    await axiosClient.delete(`/api/v1/company-settings/${id}`)
  },

  /**
   * Test PAC connection
   * NOTE: Backend endpoint not yet implemented - requires POST /api/v1/company-settings/{id}/test-pac
   */
  testPACConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    // TODO: Backend needs to implement this endpoint
    throw new Error('La prueba de conexión PAC no está disponible. Endpoint pendiente de implementación en backend.')
  },

  /**
   * Upload certificate file (.cer)
   * NOTE: Backend endpoint not yet implemented - requires POST /api/v1/company-settings/{id}/upload-certificate
   */
  uploadCertificate: async (id: string, file: File) => {
    // TODO: Backend needs to implement this endpoint
    // The CompanySetting model may need to store certificate data directly in fields:
    // - certificate_base64 or certificate_path
    // For now, update via regular PATCH with base64 encoded certificate
    throw new Error('La carga de certificado no está disponible. Endpoint pendiente de implementación en backend.')
  },

  /**
   * Upload key file (.key)
   * NOTE: Backend endpoint not yet implemented - requires POST /api/v1/company-settings/{id}/upload-key
   */
  uploadKey: async (id: string, file: File, password: string) => {
    // TODO: Backend needs to implement this endpoint
    throw new Error('La carga de llave privada no está disponible. Endpoint pendiente de implementación en backend.')
  },
}

// ============================================================================
// SAT CATALOGS SERVICE
// NOTE: These endpoints DO NOT EXIST in the backend.
// Backend needs to implement GET /api/v1/sat-catalogs/* endpoints
// For now, we provide static fallback data for essential catalogs.
// ============================================================================

export interface SATCatalogItem {
  code: string
  description: string
}

// Static fallback data for essential SAT catalogs
// These are the most commonly used values in Mexico
const FALLBACK_REGIMENES: SATCatalogItem[] = [
  { code: '601', description: 'General de Ley Personas Morales' },
  { code: '603', description: 'Personas Morales con Fines no Lucrativos' },
  { code: '605', description: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { code: '606', description: 'Arrendamiento' },
  { code: '607', description: 'Régimen de Enajenación o Adquisición de Bienes' },
  { code: '608', description: 'Demás ingresos' },
  { code: '610', description: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
  { code: '611', description: 'Ingresos por Dividendos (socios y accionistas)' },
  { code: '612', description: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { code: '614', description: 'Ingresos por intereses' },
  { code: '615', description: 'Régimen de los ingresos por obtención de premios' },
  { code: '616', description: 'Sin obligaciones fiscales' },
  { code: '620', description: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
  { code: '621', description: 'Incorporación Fiscal' },
  { code: '622', description: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { code: '623', description: 'Opcional para Grupos de Sociedades' },
  { code: '624', description: 'Coordinados' },
  { code: '625', description: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { code: '626', description: 'Régimen Simplificado de Confianza' },
]

const FALLBACK_FORMAS_PAGO: SATCatalogItem[] = [
  { code: '01', description: 'Efectivo' },
  { code: '02', description: 'Cheque nominativo' },
  { code: '03', description: 'Transferencia electrónica de fondos' },
  { code: '04', description: 'Tarjeta de crédito' },
  { code: '05', description: 'Monedero electrónico' },
  { code: '06', description: 'Dinero electrónico' },
  { code: '08', description: 'Vales de despensa' },
  { code: '12', description: 'Dación en pago' },
  { code: '13', description: 'Pago por subrogación' },
  { code: '14', description: 'Pago por consignación' },
  { code: '15', description: 'Condonación' },
  { code: '17', description: 'Compensación' },
  { code: '23', description: 'Novación' },
  { code: '24', description: 'Confusión' },
  { code: '25', description: 'Remisión de deuda' },
  { code: '26', description: 'Prescripción o caducidad' },
  { code: '27', description: 'A satisfacción del acreedor' },
  { code: '28', description: 'Tarjeta de débito' },
  { code: '29', description: 'Tarjeta de servicios' },
  { code: '30', description: 'Aplicación de anticipos' },
  { code: '31', description: 'Intermediario pagos' },
  { code: '99', description: 'Por definir' },
]

const FALLBACK_USO_CFDI: SATCatalogItem[] = [
  { code: 'G01', description: 'Adquisición de mercancías' },
  { code: 'G02', description: 'Devoluciones, descuentos o bonificaciones' },
  { code: 'G03', description: 'Gastos en general' },
  { code: 'I01', description: 'Construcciones' },
  { code: 'I02', description: 'Mobiliario y equipo de oficina por inversiones' },
  { code: 'I03', description: 'Equipo de transporte' },
  { code: 'I04', description: 'Equipo de computo y accesorios' },
  { code: 'I05', description: 'Dados, troqueles, moldes, matrices y herramental' },
  { code: 'I06', description: 'Comunicaciones telefónicas' },
  { code: 'I07', description: 'Comunicaciones satelitales' },
  { code: 'I08', description: 'Otra maquinaria y equipo' },
  { code: 'D01', description: 'Honorarios médicos, dentales y gastos hospitalarios' },
  { code: 'D02', description: 'Gastos médicos por incapacidad o discapacidad' },
  { code: 'D03', description: 'Gastos funerales' },
  { code: 'D04', description: 'Donativos' },
  { code: 'D05', description: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)' },
  { code: 'D06', description: 'Aportaciones voluntarias al SAR' },
  { code: 'D07', description: 'Primas por seguros de gastos médicos' },
  { code: 'D08', description: 'Gastos de transportación escolar obligatoria' },
  { code: 'D09', description: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
  { code: 'D10', description: 'Pagos por servicios educativos (colegiaturas)' },
  { code: 'S01', description: 'Sin efectos fiscales' },
  { code: 'CP01', description: 'Pagos' },
  { code: 'CN01', description: 'Nómina' },
]

export const satCatalogsService = {
  /**
   * Search product codes (ClaveProdServ)
   * NOTE: Backend endpoint not implemented. Returns empty array.
   * Backend needs: GET /api/v1/sat-catalogs/productos?search=
   */
  searchProducts: async (search: string): Promise<SATCatalogItem[]> => {
    // TODO: Backend needs to implement this endpoint with full SAT catalog
    // The SAT product catalog has 50,000+ entries
    return []
  },

  /**
   * Search unit codes (ClaveUnidad)
   * NOTE: Backend endpoint not implemented. Returns empty array.
   * Backend needs: GET /api/v1/sat-catalogs/unidades?search=
   */
  searchUnits: async (search: string): Promise<SATCatalogItem[]> => {
    // TODO: Backend needs to implement this endpoint with full SAT catalog
    return []
  },

  /**
   * Get tax regimes
   * Uses static fallback since backend endpoint not implemented.
   * Backend needs: GET /api/v1/sat-catalogs/regimenes
   */
  getRegimenes: async (): Promise<SATCatalogItem[]> => {
    // Using static fallback data
    return FALLBACK_REGIMENES
  },

  /**
   * Get payment forms
   * Uses static fallback since backend endpoint not implemented.
   * Backend needs: GET /api/v1/sat-catalogs/formas-pago
   */
  getFormasPago: async (): Promise<SATCatalogItem[]> => {
    // Using static fallback data
    return FALLBACK_FORMAS_PAGO
  },

  /**
   * Get CFDI usage types
   * Uses static fallback since backend endpoint not implemented.
   * Backend needs: GET /api/v1/sat-catalogs/uso-cfdi
   */
  getUsoCfdi: async (): Promise<SATCatalogItem[]> => {
    // Using static fallback data
    return FALLBACK_USO_CFDI
  },
}
