import type { GuideTrailEntry } from './types'

/** Departamentos que usa el backend de LWM (los proveedores de la guia). */
export const DEPARTMENT_LABEL: Record<string, string> = {
  ventas: 'Ventas',
  almacen: 'Almacén',
  facturacion: 'Facturación',
  cobranza: 'Cobranza',
  compras: 'Compras',
  system: 'Automático',
}

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  quotes: 'Cotización',
  'sales-orders': 'Pedido',
  remissions: 'Remisión',
  shipments: 'Envío',
  backorders: 'Backorder',
  'ar-invoices': 'Cuenta por cobrar',
  'cfdi-invoices': 'CFDI',
  payments: 'Cobro',
  'purchase-orders': 'Orden de compra',
}

/** Estados de los documentos del expediente, en espanol (regla 9). */
export const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Vencida',
  converted: 'Convertida',
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En surtido',
  shipped: 'Enviado',
  delivered: 'Entregado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
  refunded: 'Reembolsado',
  printed: 'Impresa',
  partial: 'Pago parcial',
  partially_fulfilled: 'Surtido parcial',
  fulfilled: 'Surtido',
  paid: 'Pagada',
  overdue: 'Vencida',
  posted: 'Contabilizada',
  void: 'Anulada',
  active: 'Activo',
  applied: 'Aplicado',
  valid: 'Vigente',
  error: 'Con error',
  cancel_pending: 'Cancelación en proceso',
  approved: 'Aprobada',
  received: 'Recibida',
}

export function departmentLabel(id: string): string {
  return DEPARTMENT_LABEL[id] ?? id
}

export function typeLabel(type: string): string {
  return DOCUMENT_TYPE_LABEL[type] ?? type
}

export function statusLabel(status: string | null): string {
  return status ? (STATUS_LABEL[status] ?? status) : '-'
}

/** Donde abre cada documento del expediente en el panel de LWM; null si no tiene pantalla propia. */
export function defaultHrefFor(entry: Pick<GuideTrailEntry, 'type' | 'id'>): string | null {
  switch (entry.type) {
    case 'quotes':
      return `/dashboard/quotes/${entry.id}`
    case 'sales-orders':
      return `/dashboard/sales/${entry.id}`
    case 'remissions':
      return '/dashboard/remissions'
    case 'ar-invoices':
      return `/dashboard/finance/ar-invoices/${entry.id}`
    case 'cfdi-invoices':
      return `/dashboard/billing/invoices/${entry.id}`
    case 'payments':
      return '/dashboard/finance/ar-receipts'
    case 'purchase-orders':
      return `/dashboard/purchase/${entry.id}`
    default:
      return null
  }
}
