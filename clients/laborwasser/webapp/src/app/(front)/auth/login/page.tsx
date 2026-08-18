'use client'

/**
 * /auth/login (rediseno 2026-08): AuthSplitLayout del tenant + LoginForm de
 * @lwm/auth (logica de sesion intacta). El texto de titulo/bajada y los
 * enlaces siguen el Figma "Iniciar sesion".
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { LoginForm } from '@/modules/auth'
import { AuthSplitLayout } from '@/modules/auth-ui'

function AuthLoading({ label }: { label: string }) {
  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{label}</span>
        </div>
        <p className="mt-3 text-muted">{label}</p>
      </div>
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { shouldShowLogin } = useAuthRedirect()

  // Mostrar loading hasta saber si mostrar login o redirigir (misma logica
  // de siempre: servidor y cliente renderizan lo mismo al inicio)
  if (!shouldShowLogin) return <AuthLoading label="Verificando sesion..." />

  return (
    <AuthSplitLayout
      title="Bienvenido de nuevo"
      subtitle="Comencemos ingresando tus datos"
      aside={<Link href="/auth/forgot-password">¿Olvidaste tu contraseña?</Link>}
      footer={<p>¿No tienes una cuenta? <Link href="/auth/register">¡Regístrate aquí!</Link></p>}
    >
      <LoginForm redirect={redirect} onLoginSuccess={() => router.replace(redirect)} />
    </AuthSplitLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading label="Cargando..." />}>
      <LoginContent />
    </Suspense>
  )
}
