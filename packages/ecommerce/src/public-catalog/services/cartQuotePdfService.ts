import { axiosClient } from '@lwm/auth'
import type { LocalCartItem } from '../hooks/useLocalCart'

/**
 * Cotizacion INFORMATIVA del carrito publico (pedido cliente 2026-09-01: el
 * boton Cotizar descarga el PDF directo). El endpoint es anonimo y calcula
 * precios en backend desde la DB; aqui solo viajan ids y cantidades. La
 * cotizacion formal (con folio, en my-quotes) sigue el flujo autenticado.
 */
export const cartQuotePdfService = {
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
