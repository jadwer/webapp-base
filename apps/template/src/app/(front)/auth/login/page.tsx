'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import LoginTemplate from '@/modules/auth/templates/LoginTemplate'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { shouldShowLogin } = useAuthRedirect()

  // Mostrar loading hasta que sepamos si mostrar login o redirigir
  // Esto asegura que servidor y cliente rendericen lo mismo inicialmente
  if (!shouldShowLogin) {
    return (
      <div className="container py-5" style={{ maxWidth: 480 }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Verificando sesión...</span>
          </div>
          <p className="mt-3 text-muted">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return <LoginTemplate redirect={redirect} />
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container py-5" style={{ maxWidth: 480 }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
