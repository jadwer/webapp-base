export interface Permission {
  id?: string
  name: string
  guard_name: string
  createdAt?: string
  updatedAt?: string
}

export interface PermissionFormData {
  name: string
  guard_name: string
}
