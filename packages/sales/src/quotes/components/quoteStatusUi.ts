import type { LwTone } from '@lwm/ui'
import type { Quote, QuoteStatus } from '../types'
import { QUOTE_STATUS_CONFIG, canEditQuote } from '../types'

/** Tono de la pastilla de estado en el rediseno (Figma, 12-11). */
export const QUOTE_STATUS_TONE: Record<QuoteStatus, LwTone> = {
  draft: 'neutral',
  sent: 'success',
  accepted: 'info',
  rejected: 'danger',
  expired: 'danger',
  converted: 'navy',
  cancelled: 'neutral',
}

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Expirada',
  converted: 'Convertida',
  cancelled: 'Cancelada',
}

/** Que se puede hacer con una cotizacion en su estado (las mismas reglas del backend). */
export function quoteAbilities(quote: Quote, isAdmin: boolean) {
  const cfg = QUOTE_STATUS_CONFIG[quote.status]
  return {
    edit: canEditQuote(quote, isAdmin),
    send: !!cfg?.canSend,
    accept: !!cfg?.canAccept,
    reject: !!cfg?.canReject,
    convert: !!cfg?.canConvert && !quote.salesOrderId,
    cancel: !!cfg?.canCancel,
    // Borrar solo un borrador: lo enviado se cancela (documentos con efecto)
    delete: quote.status === 'draft',
  }
}
