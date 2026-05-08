export interface Permission {
  id: number
  name: string
  guard_name: string
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
