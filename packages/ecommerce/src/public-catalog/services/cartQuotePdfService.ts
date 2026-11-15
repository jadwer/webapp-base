import { axiosClient } from '@lwm/auth'
import type { LocalCartItem } from '../hooks/useLocalCart'

/**
 * Cotizacion INFORMATIVA del carrito publico (pedido cliente 2026-09-01: el
 * boton Cotizar descarga el PDF directo). El endpoint es anonimo y calcula
 * precios en backend desde la DB; aqui solo viajan ids y cantidades. La
 * cotizacion formal (con folio, en my-quotes) sigue el flujo autenticado.
 */
export interface GuestQuoteRequest {
  name: string
  email: string
  company: string
  attentionTo: string
  phone?: string
  /** Campo trampa contra bots: una persona lo deja vacio. */
  website?: string
}

/** Mensaje del backend (en espanol); con responseType blob el error tambien llega como Blob. */
export async function quoteRequestErrorMessage(err: unknown, fallback: string): Promise<string> {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  let body: unknown = data
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      body = JSON.parse(await data.text())
    } catch {
      body = null
    }
  }
  const parsed = body as { message?: unknown; errors?: Record<string, unknown> } | null
  const first = parsed?.errors ? Object.values(parsed.errors).flat().find((m) => typeof m === 'string') : undefined
  const message = typeof first === 'string' ? first : parsed?.message
  return typeof message === 'string' && message.trim() !== '' ? message : fallback
}

function saveBlob(data: BlobPart, filename: string) {
  const blob = new Blob([data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const cartQuotePdfService = {
  /**
   * Cotizacion formal desde la tienda sin registrarse (junta 2026-11-12, J2):
   * nace en el sistema con folio y avisa a ventas; descarga su PDF y devuelve el folio.
   */
  async requestFormalQuote(contact: GuestQuoteRequest, items: Array<Pick<LocalCartItem, 'productId' | 'quantity'>>): Promise<string | null> {
    const response = await axiosClient.post(
      '/api/v1/public/quote-requests',
      {
        name: contact.name,
        email: contact.email,
        company: contact.company,
        attention_to: contact.attentionTo,
        phone: contact.phone || null,
        website: contact.website || '',
        items: items.map((item) => ({ product_id: Number(item.productId), quantity: item.quantity })),
      },
      { responseType: 'blob' }
    )
    const folio = (response.headers?.['x-quote-number'] as string | undefined) ?? null
    saveBlob(response.data, folio ? `cotizacion-${folio}.pdf` : 'cotizacion.pdf')
    return folio
  },

  async downloadInformativePdf(items: Array<Pick<LocalCartItem, 'productId' | 'quantity'>>): Promise<void> {
    const response = await axiosClient.post(
      '/api/v1/public/cart-quote-pdf',
      {
        items: items.map((item) => ({
          product_id: Number(item.productId),
          quantity: item.quantity,
        })),
      },
      { responseType: 'blob' }
    )

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cotizacion-informativa.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
