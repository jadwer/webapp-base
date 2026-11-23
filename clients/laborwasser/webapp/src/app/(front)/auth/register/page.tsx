'use client'

/**
 * /auth/register (rediseno 2026-08): AuthSplitLayout + RegisterForm de
 * @lwm/auth (logica intacta). Textos y enlaces del Figma "Crear cuenta".
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { RegisterForm, safeRedirect, withRedirect } from '@/modules/auth'
import { AuthSplitLayout } from '@/modules/auth-ui'
import { trackEvent } from '@/lib/analytics'

function RegisterContent() {
  // La pagina a la que iba el visitante viaja con el (BUG-03).
  const redirect = safeRedirect(useSearchParams().get('redirect'))
  return (
    <AuthSplitLayout
      title="Regístrate ahora"
      subtitle="Completa tus datos y comienza a disfrutar de todos nuestros servicios."
      footer={<p>¿Ya tienes una cuenta? <Link href={withRedirect('/auth/login', redirect)}>¡Inicia sesión aquí!</Link></p>}
    >
      <RegisterForm redirect={redirect} onRegistered={() => trackEvent('sign_up', { method: 'email' })} />
    </AuthSplitLayout>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  )
}
