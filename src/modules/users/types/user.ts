export interface User {
  id?: string
  name: string
  email: string
  status?: 'active' | 'inactive'
  password?: string
  password_confirmation?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}
