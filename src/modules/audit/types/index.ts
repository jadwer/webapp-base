// Audit Module Types - Aligned with Backend API

export type AuditEvent = 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'login_failed'

export interface Audit {
  id: string
  event: AuditEvent
  userId: number | null
  auditableType: string
  auditableId: number
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
  // Computed field for display
  changes: FieldChange[]
}

export interface FieldChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface AuditFilters {
  causer?: number | string
  event?: AuditEvent | ''
  auditableType?: string
  auditableId?: number | string
}

export interface AuditQueryParams {
  'filter[causer]'?: string
  'filter[event]'?: string
  'filter[auditableType]'?: string
  'filter[auditableId]'?: string
  'sort'?: string
  'page[number]'?: number
  'page[size]'?: number
}

// JSON:API response structure
export interface AuditJsonApiResource {
  type: 'audits'
  id: string
  attributes: {
    event: AuditEvent
    userId: number | null
    auditableType: string
    auditableId: number
    oldValues: string | null  // JSON string from backend
    newValues: string | null  // JSON string from backend
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface AuditJsonApiResponse {
  data: AuditJsonApiResource[]
  meta?: {
    page?: {
      currentPage: number
      lastPage: number
      perPage: number
      total: number
    }
  }
}

export interface AuditSingleJsonApiResponse {
  data: AuditJsonApiResource
}

// Entity type mapping for display
// Complete list from backend: 37 of 74 models (50%) are audited
export const AUDITABLE_TYPE_LABELS: Record<string, string> = {
  // Product Module
  'Modules\\Product\\Models\\Product': 'Producto',
  'Modules\\Product\\Models\\Category': 'Categoria',
  'Modules\\Product\\Models\\Brand': 'Marca',
  'Modules\\Product\\Models\\Unit': 'Unidad',
  // User Module
  'Modules\\User\\Models\\User': 'Usuario',
  // Contacts Module
  'Modules\\Contacts\\Models\\Contact': 'Contacto',
  // Sales Module
  'Modules\\Sales\\Models\\SalesOrder': 'Orden de Venta',
  'Modules\\Sales\\Models\\SalesOrderItem': 'Item de Venta',
  'Modules\\Sales\\Models\\SalesQuote': 'Cotizacion',
  // Purchase Module
  'Modules\\Purchase\\Models\\PurchaseOrder': 'Orden de Compra',
  'Modules\\Purchase\\Models\\PurchaseOrderItem': 'Item de Compra',
  // Inventory Module
  'Modules\\Inventory\\Models\\Warehouse': 'Almacen',
  'Modules\\Inventory\\Models\\Stock': 'Stock',
  'Modules\\Inventory\\Models\\InventoryMovement': 'Movimiento de Inventario',
  // Billing Module
  'Modules\\Billing\\Models\\CFDIInvoice': 'Factura CFDI',
  'Modules\\Billing\\Models\\PaymentTransaction': 'Transaccion de Pago',
  // HR Module
  'Modules\\HR\\Models\\Employee': 'Empleado',
  'Modules\\HR\\Models\\Department': 'Departamento',
  'Modules\\HR\\Models\\Position': 'Puesto',
  'Modules\\HR\\Models\\Attendance': 'Asistencia',
  // CRM Module
  'Modules\\CRM\\Models\\Lead': 'Lead',
  'Modules\\CRM\\Models\\Opportunity': 'Oportunidad',
  'Modules\\CRM\\Models\\Campaign': 'Campana',
  'Modules\\CRM\\Models\\Activity': 'Actividad',
  // Finance Module
  'Modules\\Finance\\Models\\APInvoice': 'Factura por Pagar',
  'Modules\\Finance\\Models\\ARInvoice': 'Factura por Cobrar',
  'Modules\\Finance\\Models\\Payment': 'Pago',
  'Modules\\Finance\\Models\\PaymentApplication': 'Aplicacion de Pago',
  'Modules\\Finance\\Models\\BankAccount': 'Cuenta Bancaria',
  // Accounting Module
  'Modules\\Accounting\\Models\\Account': 'Cuenta Contable',
  'Modules\\Accounting\\Models\\JournalEntry': 'Poliza Contable',
  // Roles & Permissions
  'Modules\\Role\\Models\\Role': 'Rol',
  'Modules\\Permission\\Models\\Permission': 'Permiso',
  // Ecommerce Module
  'Modules\\Ecommerce\\Models\\CartItem': 'Item de Carrito',
  'Modules\\Ecommerce\\Models\\CheckoutSession': 'Sesion de Checkout',
  'Modules\\Ecommerce\\Models\\ShoppingCart': 'Carrito de Compras',
  'Modules\\Ecommerce\\Models\\Wishlist': 'Lista de Deseos',
  'Modules\\Ecommerce\\Models\\ProductReview': 'Resena de Producto',
  // PageBuilder Module
  'Modules\\PageBuilder\\Models\\Page': 'Pagina',
}

// Event labels for display
export const EVENT_LABELS: Record<AuditEvent, string> = {
  created: 'Creado',
  updated: 'Actualizado',
  deleted: 'Eliminado',
  login: 'Inicio de Sesion',
  logout: 'Cierre de Sesion',
  login_failed: 'Login Fallido',
}

// Event colors for badges
export const EVENT_COLORS: Record<AuditEvent, string> = {
  created: 'success',
  updated: 'warning',
  deleted: 'danger',
  login: 'info',
  logout: 'secondary',
  login_failed: 'danger',
}

// Event icons
export const EVENT_ICONS: Record<AuditEvent, string> = {
  created: 'bi-plus-circle',
  updated: 'bi-pencil',
  deleted: 'bi-trash',
  login: 'bi-box-arrow-in-right',
  logout: 'bi-box-arrow-right',
  login_failed: 'bi-exclamation-triangle',
}

/**
 * Format entity type for display
 * "Modules\\User\\Models\\User" -> "Usuario" or "User" if not mapped
 */
export function formatAuditableType(type: string): string {
  return AUDITABLE_TYPE_LABELS[type] || type.split('\\').pop() || type
}
