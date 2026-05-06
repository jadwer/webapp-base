/**
 * Folio Sequence Service
 *
 * Custom API service for managing folio sequences (COT, OV, OC, REM).
 * Backend: Modules/Sales/app/Http/Controllers/Api/V1/FolioSequenceController.php
 * API: /api/v1/folio-sequences (NOT JSON:API - custom endpoints)
 */

import axiosClient from '@/lib/axiosClient'

export interface FolioSequence {
  id: number
  documentType: string
  prefix: string
  includeYear: boolean
  yearFormat: string
  separator: string
  padding: number
  currentSequence: number
  resetYearly: boolean
  lastResetYear: number | null
  isActive: boolean
  nextFolio: string
  createdAt: string | null
  updatedAt: string | null
}

export interface UpdateFolioSequenceRequest {
  prefix?: string
  include_year?: boolean
  year_format?: string
  separator?: string
  padding?: number
  reset_yearly?: boolean
}

const BASE_URL = '/api/v1/folio-sequences'

export const folioSequenceService = {
  /**
   * Get all folio sequences
   */
  async getAll(): Promise<FolioSequence[]> {
    const response = await axiosClient.get<{ data: FolioSequence[] }>(BASE_URL)
    return response.data.data
  },

  /**
   * Get single folio sequence by document type
   */
  async getByType(documentType: string): Promise<FolioSequence> {
    const response = await axiosClient.get<{ data: FolioSequence }>(`${BASE_URL}/${documentType}`)
    return response.data.data
  },

  /**
   * Update folio sequence configuration
   */
  async update(documentType: string, data: UpdateFolioSequenceRequest): Promise<FolioSequence> {
    const response = await axiosClient.patch<{ data: FolioSequence; message: string }>(`${BASE_URL}/${documentType}`, data)
    return response.data.data
  },

  /**
   * Set initial sequence number
   */
  async setInitial(documentType: string, startFrom: number): Promise<{ message: string }> {
    const response = await axiosClient.post<{ message: string; data: FolioSequence }>(`${BASE_URL}/${documentType}/set-initial`, {
      start_from: startFrom,
    })
    return { message: response.data.message }
  },

  /**
   * Preview next folio without incrementing
   */
  async previewNext(documentType: string): Promise<{ documentType: string; nextFolio: string; currentSequence: number }> {
    const response = await axiosClient.get<{ data: { document_type: string; next_folio: string; current_sequence: number } }>(`${BASE_URL}/${documentType}/preview-next`)
    return {
      documentType: response.data.data.document_type,
      nextFolio: response.data.data.next_folio,
      currentSequence: response.data.data.current_sequence,
    }
  },
}

/** Human-readable labels for document types */
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  quote: 'Cotizacion',
  sales_order: 'Orden de Venta',
  purchase_order: 'Orden de Compra',
  remission: 'Remision',
  invoice: 'Factura',
  invoice_online: 'Factura Web',
  invoice_refac: 'Refacturacion',
}
