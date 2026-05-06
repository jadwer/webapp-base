'use client'

import { useAuth } from '@/modules/auth/lib/auth'

export default function UserRoleDisplay() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="text-muted">Cargando...</span>
      </div>
    )
  }

  if (!user) return null

  const getRoleBadgeClass = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'god':
        return 'bg-dark'
      case 'admin':
      case 'administrator':
        return 'bg-danger'
      case 'customer':
      case 'user':
        return 'bg-primary'
      default:
        return 'bg-secondary'
    }
  }

  const getRoleDisplayName = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'god':
        return 'Super Admin (God)'
      case 'admin':
      case 'administrator':
        return 'Administrador'
      case 'customer':
        return 'Cliente'
      case 'user':
        return 'Usuario'
      default:
        return role || 'Sin rol'
    }
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <i className="bi bi-person-circle fs-5 text-primary" aria-hidden="true"></i>
      <div className="d-flex flex-column">
        <span className="fw-semibold small">{user.name}</span>
        <span className={`badge ${getRoleBadgeClass(user.role)} small`}>
          {getRoleDisplayName(user.role)}
        </span>
      </div>
    </div>
  )
}
