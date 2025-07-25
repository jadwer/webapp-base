export interface User {
  id?: string
  name: string
  email: string
  status?: 'active' | 'inactive'
  password?: string
  password_confirmation?: string
  role?: string // Solo lectura - primer rol del usuario
  roles?: Role[] // Relación completa con roles
  createdAt?: string
  updatedAt?: string
}

export interface Role {
  id: string
  name: string
  description?: string
}
