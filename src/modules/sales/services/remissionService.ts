/**
 * Remission Service
 *
 * Service for managing remissions (remisiones de mercancia).
 * Backend: Modules/Sales/app/Http/Controllers/Api/V1/RemissionController.php
 * API: /api/v1/remissions (JSON:API standard + custom endpoints)
 */

import axiosClient from '@/lib/axiosClient'

export interface Remission {
  id: string
  salesOrderId: number
  warehouseId: number | null
  remissionNumber: string
  status: 'draft' | 'printed' | 'delivered' | 'cancelled'
  remissionDate: string
  deliveryDate: string | null
  deliveredBy: string | null
  receivedBy: string | null
  deliveryNotes: string | null
  shippingAddress: Record<string, string> | null
  pdfPath: string | null
  internalNotes: string | null
  totalItems: number
  totalQuantity: number
  createdAt: string
  updatedAt: string
}

export interface RemissionItem {
  id: string
  remissionId: number
  salesOrderItemId: number
  productId: number
  quantity: number
  productName: string | null
  productSku: string | null
  unit: string | null
  batchNumber: string | null
  notes: string | null
}

interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
}

const BASE_URL = '/api/v1/remissions'

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function parseRemission(resource: JsonApiResource): Remission {
  const attrs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(resource.attributes)) {
    attrs[toCamelCase(key)] = value
  }
  return { id: resource.id, ...attrs } as Remission
}

export const remissionService = {
  /**
   * Get all remissions
   */
  async getAll(filters?: { salesOrderId?: string; status?: string }): Promise<Remission[]> {
    const params: Record<string, string> = { include: 'salesOrder,items' }
    if (filters?.salesOrderId) params['filter[salesOrder]'] = filters.salesOrderId
    if (filters?.status) params['filter[status]'] = filters.status

    const response = await axiosClient.get(BASE_URL, { params })
    return (response.data.data as JsonApiResource[]).map(parseRemission)
  },

  /**
   * Get single remission by ID
   */
  async getById(id: string): Promise<Remission> {
    const response = await axiosClient.get(`${BASE_URL}/${id}`, {
      params: { include: 'salesOrder,items,items.product' },
    })
    return parseRemission(response.data.data)
  },

  /**
   * Get remissions for a specific sales order
   */
  async getForOrder(orderId: string): Promise<{ remissions: Remission[]; count: number }> {
    const response = await axiosClient.get(`/api/v1/sales-orders/${orderId}/remissions`)
    const remissions = (response.data.data || []).map((r: Record<string, unknown>) => {
      // This endpoint returns transformed (non-JSON:API) response
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(r)) {
        result[toCamelCase(key)] = value
      }
      return result as unknown as Remission
    })
    return {
      remissions,
      count: response.data.meta?.count || remissions.length,
    }
  },

  /**
   * Create remission from order with all items
   */
  async createFromOrderFull(salesOrderId: string): Promise<Remission> {
    const response = await axiosClient.post(`${BASE_URL}/from-order-full`, {
      sales_order_id: parseInt(salesOrderId),
    })
    return parseRemission(response.data.data)
  },

  /**
   * Create remission from order with selected items
   */
  async createFromOrder(salesOrderId: string, items: Array<{ sales_order_item_id: number; quantity: number }>): Promise<Remission> {
    const response = await axiosClient.post(`${BASE_URL}/from-order`, {
      sales_order_id: parseInt(salesOrderId),
      items,
    })
    return parseRemission(response.data.data)
  },

  /**
   * Print remission (generates PDF and marks as printed)
   */
  async print(id: string): Promise<{ pdfUrl: string }> {
    const response = await axiosClient.post(`${BASE_URL}/${id}/print`)
    return { pdfUrl: response.data.data?.pdf_url || response.data.data?.pdfUrl || '' }
  },

  /**
   * Mark remission as delivered
   */
  async deliver(id: string, data?: { received_by?: string; delivery_notes?: string }): Promise<Remission> {
    const response = await axiosClient.post(`${BASE_URL}/${id}/deliver`, data || {})
    return parseRemission(response.data.data)
  },

  /**
   * Cancel remission
   */
  async cancel(id: string): Promise<Remission> {
    const response = await axiosClient.post(`${BASE_URL}/${id}/cancel`)
    return parseRemission(response.data.data)
  },

  /**
   * Download remission PDF
   */
  async downloadPdf(id: string): Promise<void> {
    const response = await axiosClient.get(`${BASE_URL}/${id}/pdf/download`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `remision-${id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  /**
   * Preview remission PDF
   */
  async previewPdf(id: string): Promise<void> {
    const response = await axiosClient.get(`${BASE_URL}/${id}/pdf/stream`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  },

  /**
   * Get remissions summary
   */
  async getSummary(): Promise<Record<string, unknown>> {
    const response = await axiosClient.get(`${BASE_URL}/summary`)
    return response.data.data
  },
}

/** Remission status labels */
export const REMISSION_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  draft: { label: 'Borrador', badgeClass: 'bg-secondary' },
  printed: { label: 'Impresa', badgeClass: 'bg-primary' },
  delivered: { label: 'Entregada', badgeClass: 'bg-success' },
  cancelled: { label: 'Cancelada', badgeClass: 'bg-danger' },
}
