/**
 * Eventos de negocio para GA4 (brief SEO REQ-11, 2026-09-18).
 *
 * gtag lo inyecta el layout raiz solo en prod (NEXT_PUBLIC_GA_ID); aqui se
 * guarda con optional chaining para que dev, demo y tests no fallen. Los
 * nombres siguen la convencion de GA4 (snake_case) para poder marcarlos como
 * conversiones desde la consola sin tocar codigo.
 */

import type { EnhancedPublicProduct } from '@lwm/ecommerce'

export type BusinessEvent =
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'contact_submit'
  | 'datasheet_download'
  | 'catalog_download'
  | 'certificate_click'
  | 'quote_request'
  | 'add_to_cart'
  // Conversiones de prospecto a cliente (junta 2026-10-30): cuenta creada,
  // cotizacion generada y pedido confirmado. Nombres recomendados de GA4.
  | 'sign_up'
  | 'generate_lead'
  | 'purchase'

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void

export function trackEvent(name: BusinessEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', name, params)
  } catch {
    // La analitica nunca rompe la UI
  }
}

/** Clasifica un enlace por su href para el rastreo por delegacion. */
export function classifyLink(href: string, pathname = ''): BusinessEvent | null {
  const h = href.toLowerCase()
  if (h.startsWith('tel:')) return 'phone_click'
  if (h.startsWith('mailto:')) return 'email_click'
  if (h.includes('wa.me/') || h.includes('api.whatsapp.com') || h.includes('whatsapp.com/send')) return 'whatsapp_click'
  if (h.includes('/datasheet')) return 'datasheet_download'
  if (h.endsWith('.pdf') && pathname.startsWith('/catalogos')) return 'catalog_download'
  if (h.endsWith('.pdf')) return 'datasheet_download'
  if (pathname.startsWith('/certificados') && /^https?:\/\//.test(h)) return 'certificate_click'
  return null
}

/** Producto agregado al carrito (o al carrito previo a cotizar). */
export function trackAddToCart(product: EnhancedPublicProduct, quantity = 1): void {
  const price = product.attributes?.price ?? 0
  trackEvent('add_to_cart', {
    currency: 'MXN',
    value: price * quantity,
    items: [{ item_id: product.attributes?.sku || product.id, item_name: product.displayName, price, quantity }],
  })
}
