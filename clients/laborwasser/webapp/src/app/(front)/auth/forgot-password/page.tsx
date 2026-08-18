'use client'

/**
 * /auth/forgot-password (rediseno 2026-08): AuthSplitLayout +
 * ForgotPasswordForm de @lwm/auth (logica intacta). Textos del Figma
 * "Recuperar contrasena".
 */

import Link from 'next/link'
import { ForgotPasswordForm } from '@/modules/auth'
import { AuthSplitLayout } from '@/modules/auth-ui'

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
      footer={<p>¿Recordaste tu contraseña? <Link href="/auth/login">¡Inicia sesión aquí!</Link></p>}
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  )
}
