'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/lib/auth'
import { useEffect } from 'react'

export default function AuthStatus() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
  }, [user, isLoading])

  if (isLoading) {
    return <span className="text-muted small">Cargando sesión...</span>
  }
  
  const handleLogout = async () => {
    await logout()
    router.replace('/auth/login')
  }

  return (
    
    <div className="d-flex align-items-center gap-3">
      {user ? (
        <>
          <i className="bi bi-person-circle fs-5 text-primary" aria-hidden="true"></i>
          <span className="fw-semibold small text-muted">{user.name}</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
            Cerrar sesión
          </button>
        </>
      ) : (
        <Link
          href="/auth/login"
          className="text-decoration-none text-muted small d-flex align-items-center gap-2"
        >
          <i className="bi bi-box-arrow-in-right fs-5 text-secondary" aria-hidden="true"></i>
          Iniciar sesión
        </Link>
      )}
    </div>
  )
}
