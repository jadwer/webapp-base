// Administrative User shape used by ProfileInfo / ProfileLayout (forms that
// edit user records, including password fields and deleted_at).
//
// Distinct from the runtime User in `./permissions` which is the type carried
// in the auth state and only exposes read-only fields. Both shapes will be
// reconciled when @lwm/permissions extracts the user-admin module in
// subfase 3.5 of the WP-style refactor.
export interface AdminUser {
  id?: string
  name: string
  email: string
  status?: 'active' | 'inactive'
  password?: string
  password_confirmation?: string
  role?: string
  roles?: AdminRole[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface AdminRole {
  id: string
  name: string
  description?: string
}
