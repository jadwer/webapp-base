// Reglas de estado de facturas AR/AP. "Vencida" no es un estado del backend:
// se deriva de dueDate sobre facturas abiertas.

import type { InvoiceStatus } from '../types'
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from '../types'

// Estados que ya no admiten cobro/pago.
const CLOSED_STATUSES: readonly InvoiceStatus[] = ['paid', 'void', 'voided', 'cancelled']

// Estados que cuentan como pendientes (emitidas y con saldo). draft queda fuera.
export const OPEN_INVOICE_STATUSES: readonly InvoiceStatus[] = ['pending', 'posted', 'partial']

interface InvoiceLike {
  status: string
  dueDate: string
  totalAmount: number
  paidAmount: number
}

const localToday = (asOf: Date = new Date()): string => {
  const y = asOf.getFullYear()
  const m = String(asOf.getMonth() + 1).padStart(2, '0')
  const d = String(asOf.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const isInvoiceClosed = (status: string): boolean =>
  (CLOSED_STATUSES as readonly string[]).includes(status)

export const isInvoiceOpen = (invoice: InvoiceLike): boolean =>
  (OPEN_INVOICE_STATUSES as readonly string[]).includes(invoice.status) &&
  (invoice.totalAmount - invoice.paidAmount) > 0

// Compara fechas Y-m-d como texto para no depender de la zona horaria.
export const isInvoiceOverdue = (invoice: InvoiceLike, asOf?: Date): boolean => {
  if (!isInvoiceOpen(invoice) || !invoice.dueDate) return false
  return invoice.dueDate.slice(0, 10) < localToday(asOf)
}

// Opciones de filtro por estado. 'void' es alias legado en Rule::in; el backend
// escribe 'voided', asi que solo se ofrece ese.
export const INVOICE_STATUS_FILTER_OPTIONS: { value: InvoiceStatus; label: string }[] =
  INVOICE_STATUSES.filter((status) => status !== 'void').map((status) => ({
    value: status,
    label: INVOICE_STATUS_LABELS[status],
  }))
