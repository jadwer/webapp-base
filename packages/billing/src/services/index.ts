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

import axiosClient from '../lib/axiosClient'
import type {
  PaymentComplementResponse,
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
    if (filters?.branchId) {
      queryParams.append('filter[branch]', filters.branchId)
    }

    if (filters?.arInvoiceId) {
      queryParams.append('filter[arInvoiceId]', filters.arInvoiceId.toString())
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

    // Default: lo mas reciente primero (pedido de Gabino 2026-07-19). Sin sort
    // el backend devuelve id ascendente y el listado abria en lo mas viejo.
    queryParams.append('sort', '-createdAt')

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
   * Create CFDI invoice and then its items.
   * La API no acepta conceptos anidados (items es readOnly en el Schema):
   * se crea la factura y despues cada cfdi-item con cfdiInvoiceId y numeroLinea.
   */
  createWithItems: async (data: CreateCFDIInvoiceData) => {
    const invoice = await cfdiInvoicesService.create(data.invoice)
    const cfdiInvoiceId = Number(invoice.id)
    for (const [index, item] of data.items.entries()) {
      await axiosClient.post('/api/v1/cfdi-items', {
        data: transformCFDIItemFormToJsonApi({
          ...item,
          cfdiInvoiceId,
          numeroLinea: item.numeroLinea ?? index + 1,
        }),
      })
    }
    return invoice
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
    // Endpoint propio: { message, xml, invoice_id }
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/generate-xml`)
    const body = (response.data || {}) as Record<string, unknown>
    return {
      cfdiId: String(body.invoice_id ?? id),
      message: body.message as string | undefined,
    }
  },

  /**
   * Generate PDF for CFDI invoice
   */
  generatePDF: async (id: string): Promise<CFDIGenerateResponse> => {
    // Endpoint propio: { message, pdf_path, pdf_url, invoice_id }
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/generate-pdf`)
    const body = (response.data || {}) as Record<string, unknown>
    return {
      cfdiId: String(body.invoice_id ?? id),
      message: body.message as string | undefined,
      pdfPath: (body.pdf_path as string | null | undefined) || undefined,
      pdfUrl: (body.pdf_url as string | null | undefined) || undefined,
    }
  },

  /**
   * Stamp CFDI with PAC (SW)
   * Workflow: draft -> valid
   */
  stamp: async (id: string): Promise<CFDIStampResponse> => {
    // Endpoint propio: { message, data: { id, uuid, fecha_timbrado, status, folio_completo } }
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/stamp`)
    const data = response.data.data as Record<string, unknown>
    return {
      cfdiId: String(data.id),
      uuid: data.uuid as string,
      fechaTimbrado: data.fecha_timbrado as string,
      status: data.status as CFDIStampResponse['status'],
    }
  },

  /**
   * Cancel CFDI invoice with SAT
   * Workflow: valid -> cancelled
   */
  cancel: async (
    id: string,
    cancelRequest: CFDICancelRequest
  ): Promise<CFDICancelResponse> => {
    // El backend valida motivo_cancelacion (01-04) y uuid_sustitucion
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/cancel`, {
      motivo_cancelacion: cancelRequest.motivo,
      uuid_sustitucion: cancelRequest.uuidReemplazo || null,
    })
    // Respuesta: { message, data: { id, uuid, fecha_cancelacion, status, motivo } }
    const data = response.data.data as Record<string, unknown>
    return {
      cfdiId: String(data.id),
      status: data.status as CFDICancelResponse['status'],
      fechaCancelacion: data.fecha_cancelacion as string,
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
   */
  sendEmail: async (id: string, email: string, options?: { subject?: string; message?: string; includeXml?: boolean }) => {
    const response = await axiosClient.post(`/api/v1/cfdi-invoices/${id}/send-email`, {
      email,
      subject: options?.subject,
      message: options?.message,
      include_xml: options?.includeXml ?? true,
    })
    return response.data
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
    // Endpoint propio: { message, data: { status, es_cancelable, estado, validacion_efos } }
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/validate-sat`)
    const data = ((response.data?.data ?? response.data) || {}) as Record<string, unknown>
    const estado = String(data.estado ?? data.status ?? '')
    return {
      valid: data.valid !== undefined ? Boolean(data.valid) : estado === 'Vigente',
      uuid: String(data.uuid ?? ''),
      status: estado as 'Vigente' | 'Cancelado',
      fechaEmision: String(data.fechaEmision ?? data.fecha_emision ?? ''),
      rfcEmisor: String(data.rfcEmisor ?? data.rfc_emisor ?? ''),
      rfcReceptor: String(data.rfcReceptor ?? data.rfc_receptor ?? ''),
    }
  },

  /**
   * Get cancellation status
   */
  getCancellationStatus: async (id: string): Promise<{
    status: 'cancellation_pending' | 'cancelled'
    fechaCancelacion?: string
    acuse?: string
  }> => {
    // Endpoint propio: { message, data: <respuesta del PAC> }
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/cancellation-status`)
    const data = ((response.data?.data ?? response.data) || {}) as Record<string, unknown>
    return {
      status: data.status as 'cancellation_pending' | 'cancelled',
      fechaCancelacion: (data.fechaCancelacion ?? data.fecha_cancelacion) as string | undefined,
      acuse: data.acuse as string | undefined,
    }
  },

  // ============================================================================
  // PREFACTURA (Draft Invoice Preview)
  // ============================================================================

  /**
   * Generate prefactura for a CFDI invoice
   */
  prefactura: async (id: string) => {
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/prefactura`)
    return response.data
  },

  /**
   * Download prefactura PDF
   */
  prefacturaDownload: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/api/v1/cfdi-invoices/${id}/prefactura/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Preview prefactura PDF inline (returns URL)
   */
  prefacturaPreview: (id: string): string => {
    return `/api/v1/cfdi-invoices/${id}/prefactura/preview`
  },

  /**
   * Generate prefactura PDF from a SalesOrder
   */
  prefacturaFromOrder: async (orderId: string, options?: {
    receptorRfc?: string
    receptorUsoCfdi?: string
    receptorRegimenFiscal?: string
    receptorDomicilioFiscal?: string
    metodoPago?: string
    formaPago?: string
    series?: string
  }): Promise<Blob> => {
    // Endpoint propio: valida llaves snake_case (receptor_rfc, metodo_pago, ...)
    const body: Record<string, string> = {}
    if (options?.receptorRfc) body.receptor_rfc = options.receptorRfc
    if (options?.receptorUsoCfdi) body.receptor_uso_cfdi = options.receptorUsoCfdi
    if (options?.receptorRegimenFiscal) body.receptor_regimen_fiscal = options.receptorRegimenFiscal
    if (options?.receptorDomicilioFiscal) body.receptor_domicilio_fiscal = options.receptorDomicilioFiscal
    if (options?.metodoPago) body.metodo_pago = options.metodoPago
    if (options?.formaPago) body.forma_pago = options.formaPago
    if (options?.series) body.series = options.series
    const response = await axiosClient.post(`/api/v1/sales-orders/${orderId}/prefactura`, body, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Create CFDI invoice from a SalesOrder (GAP 5: automated invoicing)
   */
  createFromOrder: async (orderId: string) => {
    const response = await axiosClient.post(`/api/v1/sales-orders/${orderId}/facturar`)
    return response.data
  },

  // ============================================================================
  // COMPLEMENTO DE PAGOS 2.0 (REP)
  // ============================================================================

  /**
   * List the Complementos de Pago (REP, tipo P) emitted for a PPD invoice.
   *
   * A REP shares the same ar_invoice_id as the PPD invoice it settles, so the
   * REPs of a given invoice are fetched by filtering cfdi-invoices on
   * tipoComprobante=P AND arInvoiceId={parent invoice ar_invoice_id}.
   *
   * @param arInvoiceId The parent PPD invoice's arInvoiceId (Finance AR invoice id)
   */
  getPaymentComplements: async (arInvoiceId: number) => {
    return await cfdiInvoicesService.getAll({
      tipoComprobante: 'P',
      arInvoiceId,
    })
  },

  /**
   * Manually (re)emit a Complemento de Pagos (REP) for the latest abono of a PPD
   * invoice. Custom endpoint (not JSON:API).
   *
   * POST /api/v1/ar-invoices/{arInvoiceId}/payment-complement
   *
   * Backend guards: 201 fresh REP, 200 idempotent (already existed), 422 when the
   * invoice is PUE or has no applied payments, 403 without permission.
   *
   * @param arInvoiceId The Finance AR invoice id (route binding)
   * @param paymentId   Optional specific abono; defaults to the latest applied payment
   */
  emitPaymentComplement: async (
    arInvoiceId: number,
    paymentId?: number
  ): Promise<PaymentComplementResponse> => {
    const body = paymentId ? { payment_id: paymentId } : {}
    const response = await axiosClient.post(
      `/api/v1/ar-invoices/${arInvoiceId}/payment-complement`,
      body
    )
    const raw = response.data as {
      message: string
      data: {
        id: string | number
        series: string
        folio: number
        uuid?: string
        status: PaymentComplementResponse['data']['status']
        tipo_comprobante: PaymentComplementResponse['data']['tipoComprobante']
        monto_pago: number
      }
    }
    return {
      message: raw.message,
      data: {
        id: String(raw.data.id),
        series: raw.data.series,
        folio: raw.data.folio,
        uuid: raw.data.uuid,
        status: raw.data.status,
        tipoComprobante: raw.data.tipo_comprobante,
        montoPago: raw.data.monto_pago,
      },
    }
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
   */
  testPACConnection: async (id: string): Promise<{ success: boolean; message: string; data?: { provider: string; mode: string; balance: number; stamps_used: number; stamps_available: number } }> => {
    const response = await axiosClient.post(`/api/v1/company-settings/${id}/test-pac`)
    return response.data
  },

  /**
   * Upload certificate file (.cer)
   */
  uploadCertificate: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('certificate', file)
    const response = await axiosClient.post(`/api/v1/company-settings/${id}/upload-certificate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Upload key file (.key)
   */
  uploadKey: async (id: string, file: File, password: string) => {
    const formData = new FormData()
    formData.append('key', file)
    formData.append('password', password)
    const response = await axiosClient.post(`/api/v1/company-settings/${id}/upload-key`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// Catalogos SAT (uso CFDI, regimen fiscal, forma de pago): ver satCfdiCatalogsService.ts,
// que los lee del backend. La copia estatica que vivia aqui no tenia consumidores.
