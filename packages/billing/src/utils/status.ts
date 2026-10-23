import type { CFDIStatus } from '../types'

/**
 * Etiqueta y color de cada estado de cfdi_invoices.status (fuente: api-base
 * Modules/Billing). Mapa unico para listado, tabla, detalle y complementos.
 */
export const CFDI_STATUS_BADGES: Record<CFDIStatus, { className: string; label: string }> = {
  draft: { className: 'bg-secondary', label: 'Borrador' },
  valid: { className: 'bg-success', label: 'Vigente' },
  cancel_pending: { className: 'bg-warning text-dark', label: 'Cancelación en proceso' },
  cancelled: { className: 'bg-danger', label: 'Cancelado' },
  error: { className: 'bg-warning text-dark', label: 'Error' },
}

export const cfdiStatusBadge = (status: string) =>
  CFDI_STATUS_BADGES[status as CFDIStatus] ?? { className: 'bg-secondary', label: status }

/** Motivos de cancelacion del SAT (los valida el endpoint cancel: in:01,02,03,04). */
export const CFDI_MOTIVOS_CANCELACION: Record<string, string> = {
  '01': '01 - Comprobante emitido con errores con relación',
  '02': '02 - Comprobante emitido con errores sin relación',
  '03': '03 - No se llevó a cabo la operación',
  '04': '04 - Operación nominativa relacionada en una factura global',
}
