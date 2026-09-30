/**
 * Users sub-module types (v2, patron contacts).
 * El backend es fuente de verdad: JSON:API type 'users' con relationship
 * multi-rol 'roles' escribible.
 */

export type UserStatus = 'active' | 'inactive' | 'banned'

export interface UserRole {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  status: UserStatus
  roles: UserRole[]
  /** Sucursal principal (null solo en datos previos al backfill). */
  branchId: string | null
  /** Sucursales con acceso ademas de la principal. */
  branchIds: string[]
  /** Plantilla (rol) de la que salieron sus permisos; informativo. */
  permissionTemplate?: string | null
  emailVerifiedAt: string | null
  createdAt: string
  updatedAt?: string
  deletedAt: string | null
}

export interface UserFilters {
  /** Busca por nombre O email (LIKE en backend). */
  search?: string
  /** Nombre de rol Spatie (filter[role]). */
  role?: string
  /** Estado exacto. */
  status?: UserStatus | ''
  /** Soft deletes: 'with' incluye eliminados, 'only' solo eliminados. */
  trashed?: 'with' | 'only'
  /** Multi-sucursal: filter[branch] (sucursal principal). */
  branchId?: string
}

export interface UserFormData {
  name: string
  email: string
  status: UserStatus
  /** Requerido al crear (min 8); vacio al editar = no cambia. */
  password?: string
  passwordConfirmation?: string
  /** IDs de roles (legacy). El acceso nuevo va por PUT /users/{id}/access. */
  roleIds?: string[]
  /** Sucursal principal; vacio = el backend asigna la Matriz. */
  branchId?: string | null
  /** Sucursales con acceso. */
  branchIds?: string[]
}

export interface UsersPageMeta {
  currentPage?: number
  lastPage?: number
  total?: number
  perPage?: number
}

export interface UsersMeta {
  page?: UsersPageMeta
  [key: string]: unknown
}

export interface UsersListResult {
  users: User[]
  meta: UsersMeta
}
