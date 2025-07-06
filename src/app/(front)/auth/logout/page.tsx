'use client'

import { useEffect } from 'react'
import { useAuth } from '@/modules/auth/lib/auth'

export default function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 text-muted">
      <div className="text-center">
        <div className="spinner-border mb-3" role="status" />
        <p>Cerrando sesión...</p>
      </div>
    </div>
  )
}
