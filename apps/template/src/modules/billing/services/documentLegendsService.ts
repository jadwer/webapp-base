/**
 * Document Legends Service
 *
 * JSON:API service para las leyendas configurables por tipo de documento.
 * Backend: Modules/Billing/app/Http/Controllers/Api/V1/DocumentLegendController.php
 * API: /api/v1/document-legends (+ /api/v1/document-legends-placeholders)
 */

import axiosClient from '@/lib/axiosClient'

export type LegendDocumentType = 'quote' | 'sales_order' | 'cfdi_invoice' | 'remission'

export interface DocumentLegend {
  id: string
  documentType: LegendDocumentType
  body: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DocumentLegendPlaceholder {
  placeholder: string
  description: string
}

export const LEGEND_DOCUMENT_TYPE_LABELS: Record<LegendDocumentType, string> = {
  quote: 'Cotizacion',
  sales_order: 'Orden de venta',
  cfdi_invoice: 'Factura (CFDI)',
  remission: 'Remision',
}

interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
}

const BASE_URL = '/api/v1/document-legends'

function parseLegend(resource: JsonApiResource): DocumentLegend {
  return {
    id: resource.id,
    documentType: resource.attributes.documentType as LegendDocumentType,
    body: (resource.attributes.body as string) ?? '',
    isActive: Boolean(resource.attributes.isActive),
    createdAt: resource.attributes.createdAt as string,
    updatedAt: resource.attributes.updatedAt as string,
  }
}

export const documentLegendsService = {
  async getAll(): Promise<DocumentLegend[]> {
    const response = await axiosClient.get(BASE_URL)
    const data = response.data.data as JsonApiResource[]
    return data.map(parseLegend)
  },

  async create(data: { documentType: LegendDocumentType; body: string; isActive: boolean }): Promise<DocumentLegend> {
    const response = await axiosClient.post(
      BASE_URL,
      {
        data: {
          type: 'document-legends',
          attributes: {
            documentType: data.documentType,
            body: data.body,
            isActive: data.isActive,
          },
        },
      }
    )
    return parseLegend(response.data.data)
  },

  async update(id: string, data: { body?: string; isActive?: boolean }): Promise<DocumentLegend> {
    const attributes: Record<string, unknown> = {}
    if (data.body !== undefined) attributes.body = data.body
    if (data.isActive !== undefined) attributes.isActive = data.isActive

    const response = await axiosClient.patch(
      `${BASE_URL}/${id}`,
      {
        data: {
          type: 'document-legends',
          id,
          attributes,
        },
      }
    )
    return parseLegend(response.data.data)
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${id}`)
  },

  async getPlaceholders(): Promise<DocumentLegendPlaceholder[]> {
    const response = await axiosClient.get('/api/v1/document-legends-placeholders')
    return response.data.data as DocumentLegendPlaceholder[]
  },
}

export default documentLegendsService
