export interface Permission {
  id?: string
  name: string
  guard_name: string
  created_at?: string
  updated_at?: string
}

export interface PermissionFormData {
  name: string
  guard_name: string
}
