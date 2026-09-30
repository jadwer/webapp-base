/**
 * Sucursales (backend Modules/Branch, JSON:API type 'branches').
 * Misma empresa y misma entidad fiscal: la sucursal es etiqueta de origen
 * de usuarios, almacenes y documentos. Siempre hay exactamente una
 * principal (isMain), la Matriz.
 */

export interface Branch {
  id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  isMain: boolean
}

export interface BranchFormData {
  name: string
  code: string
  address?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  phone?: string | null
  email?: string | null
  isActive: boolean
  isMain: boolean
}
