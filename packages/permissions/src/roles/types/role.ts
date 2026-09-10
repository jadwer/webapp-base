export interface Permission {
  id: number
  name: string
  guard_name: string
  /** Nombre legible del catalogo backend (ej. "Agregar producto"). */
  label: string | null
  /** Descripcion legible del catalogo backend. */
  description: string | null
  /** Slug del modulo de negocio (ej. "facturacion"). */
  module: string | null
  /** Label legible del modulo (ej. "Facturación CFDI"). */
  moduleLabel: string | null
  /** Prefijo del recurso sin verbo (ej. "billing.cfdi-invoices"). */
  resource: string | null
  /** Label legible del recurso en plural (ej. "Facturas CFDI"). */
  resourceLabel: string | null
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  description?: string
  guard_name: string
  permissions?: Permission[]
  created_at: string
  updated_at: string
}

export interface RoleFormData {
  name: string
  description?: string
  guard_name: string
  permissions?: number[] // IDs de permisos - cambiar a number[]
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}
