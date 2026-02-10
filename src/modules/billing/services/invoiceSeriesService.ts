/**
 * Invoice Series Service
 *
 * JSON:API service for managing invoice series (FAC, FAC-W, REFAC, N).
 * Backend: Modules/Billing/app/Http/Controllers/Api/V1/InvoiceSeriesController.php
 * API: /api/v1/invoice-series (JSON:API standard + custom endpoints)
 */

import axiosClient from '@/lib/axiosClient'

export interface InvoiceSeries {
  id: string
  code: string
  name: string
  description: string | null
  cfdiType: string
  cfdiTypeLabel: string
  currentFolio: number
  initialFolio: number
  folioPadding: number
  includeYear: boolean
  yearFormat: string
  separator: string
  isActive: boolean
  isDefault: boolean
  resetYearly: boolean
  lastResetYear: number | null
  allowedRoles: string | null
  sourceType: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceSeriesRequest {
  code: string
  name: string
  description?: string
  cfdiType: string
  initialFolio?: number
  folioPadding?: number
  includeYear?: boolean
  yearFormat?: string
  separator?: string
  isActive?: boolean
  isDefault?: boolean
  resetYearly?: boolean
  sourceType?: string | null
  companySettingId: string
}

export interface UpdateInvoiceSeriesRequest {
  name?: string
  description?: string
  initialFolio?: number
  folioPadding?: number
  includeYear?: boolean
  yearFormat?: string
  separator?: string
  isActive?: boolean
  isDefault?: boolean
  resetYearly?: boolean
  sourceType?: string | null
}

interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
}

const BASE_URL = '/api/v1/invoice-series'

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function parseInvoiceSeries(resource: JsonApiResource): InvoiceSeries {
  const attrs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(resource.attributes)) {
    attrs[toCamelCase(key)] = value
  }
  return { id: resource.id, ...attrs } as InvoiceSeries
}

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export const invoiceSeriesService = {
  /**
   * Get all invoice series
   */
  async getAll(): Promise<InvoiceSeries[]> {
    const response = await axiosClient.get(BASE_URL)
    const data = response.data.data as JsonApiResource[]
    return data.map(parseInvoiceSeries)
  },

  /**
   * Get single invoice series by ID
   */
  async getById(id: string): Promise<InvoiceSeries> {
    const response = await axiosClient.get(`${BASE_URL}/${id}`)
    return parseInvoiceSeries(response.data.data)
  },

  /**
   * Create new invoice series
   */
  async create(data: CreateInvoiceSeriesRequest): Promise<InvoiceSeries> {
    const { companySettingId, ...rest } = data
    const attributes: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        attributes[toSnakeCase(key)] = value
      }
    }

    const payload = {
      data: {
        type: 'invoice-series',
        attributes,
        relationships: {
          companySetting: {
            data: { type: 'company-settings', id: companySettingId },
          },
        },
      },
    }

    const response = await axiosClient.post(BASE_URL, payload)
    return parseInvoiceSeries(response.data.data)
  },

  /**
   * Update invoice series
   */
  async update(id: string, data: UpdateInvoiceSeriesRequest): Promise<InvoiceSeries> {
    const attributes: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        attributes[toSnakeCase(key)] = value
      }
    }

    const payload = {
      data: {
        type: 'invoice-series',
        id,
        attributes,
      },
    }

    const response = await axiosClient.patch(`${BASE_URL}/${id}`, payload)
    return parseInvoiceSeries(response.data.data)
  },

  /**
   * Delete invoice series
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${id}`)
  },

  /**
   * Set as default for its CFDI type
   */
  async setAsDefault(id: string): Promise<{ message: string }> {
    const response = await axiosClient.post(`${BASE_URL}/${id}/set-as-default`)
    return { message: response.data.message }
  },

  /**
   * Preview next folio
   */
  async previewNextFolio(id: string): Promise<{ nextFolioPreview: string; currentFolio: number }> {
    const response = await axiosClient.get(`${BASE_URL}/${id}/preview-next-folio`)
    return {
      nextFolioPreview: response.data.data.next_folio_preview,
      currentFolio: response.data.data.current_folio,
    }
  },

  /**
   * Set initial folio number
   */
  async setInitialFolio(id: string, folio: number): Promise<{ message: string }> {
    const response = await axiosClient.post(`${BASE_URL}/${id}/set-initial-folio`, { folio })
    return { message: response.data.message }
  },

  /**
   * Initialize default series for a company setting
   */
  async initializeDefaults(companySettingId?: string): Promise<{ message: string; series: InvoiceSeries[] }> {
    const response = await axiosClient.post(`${BASE_URL}/initialize-defaults`, {
      company_setting_id: companySettingId,
    })
    return {
      message: response.data.message,
      series: (response.data.data || []).map((r: JsonApiResource) => parseInvoiceSeries(r)),
    }
  },

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<Record<string, unknown>> {
    const response = await axiosClient.get(`${BASE_URL}/summary`)
    return response.data.data
  },

  /**
   * Get available series for a CFDI type
   */
  async getAvailable(cfdiType: string, source?: string): Promise<Array<{ id: string; code: string; name: string; isDefault: boolean; nextFolioPreview: string }>> {
    const params: Record<string, string> = { cfdi_type: cfdiType }
    if (source) params.source = source
    const response = await axiosClient.get(`${BASE_URL}/available`, { params })
    return response.data.data.map((item: Record<string, unknown>) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      isDefault: item.is_default,
      nextFolioPreview: item.next_folio_preview,
    }))
  },
}

/** CFDI Type labels */
export const CFDI_TYPE_LABELS: Record<string, string> = {
  I: 'Ingreso',
  E: 'Egreso',
  P: 'Pago',
  N: 'Nomina',
  T: 'Traslado',
}

/** Source type labels */
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  web: 'Web',
  pos: 'Punto de Venta',
  manual: 'Manual',
}
