/**
 * Estatus de la orden de compra en el rediseno (2026-11-17). Son los cuatro del
 * backend; "Borrador" se quito por decision de Gabino. El estatus cambia solo con
 * las acciones (aprobar, recibir, cancelar), nunca en el formulario.
 */
import type { LwTone } from '@lwm/ui'

export type PurchaseStatusKey = 'pending' | 'approved' | 'received' | 'cancelled'

export const PURCHASE_STATUS: Record<PurchaseStatusKey, { label: string; tone: LwTone }> = {
  pending: { label: 'Pendiente', tone: 'navy' },
  approved: { label: 'Aprobada', tone: 'success' },
  received: { label: 'Recibida', tone: 'info' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
}

export const PURCHASE_STATUS_OPTIONS = (Object.keys(PURCHASE_STATUS) as PurchaseStatusKey[]).map((value) => ({
  value,
  label: PURCHASE_STATUS[value].label,
}))

export const purchaseStatusLabel = (status: string): string =>
  PURCHASE_STATUS[status as PurchaseStatusKey]?.label ?? status

export const purchaseStatusTone = (status: string): LwTone =>
  PURCHASE_STATUS[status as PurchaseStatusKey]?.tone ?? 'neutral'

/** La orden ya no admite cambios en datos ni partidas (PurchaseOrder::LOCKED_ITEM_STATUSES). */
export const isPurchaseOrderClosed = (status: string): boolean => status === 'received' || status === 'cancelled'

interface ApiErrorShape {
  message?: string
  response?: {
    data?: {
      message?: string
      error?: string
      errors?: Array<{ detail?: string; title?: string }> | Record<string, string[]>
    }
  }
}

/**
 * Mensajes legibles de un error de la API: errors[] de JSON:API, el objeto por campo
 * de la validacion de Laravel (alta con partidas) o message. Nunca vacio.
 */
export const purchaseApiErrors = (error: unknown, fallback: string): string[] => {
  const e = error as ApiErrorShape | undefined
  const data = e?.response?.data
  const errors = data?.errors
  if (Array.isArray(errors)) {
    const list = errors.map((x) => x.detail || x.title || '').filter(Boolean)
    if (list.length) return list
  } else if (errors && typeof errors === 'object') {
    const list = Object.values(errors).flat().filter((x): x is string => typeof x === 'string' && x !== '')
    if (list.length) return list
  }
  const single = data?.message || (typeof data?.error === 'string' ? data.error : undefined) || e?.message
  return [single || fallback]
}
