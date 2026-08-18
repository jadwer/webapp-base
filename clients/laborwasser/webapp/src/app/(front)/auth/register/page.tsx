'use client'

/**
 * /auth/register (rediseno 2026-08): AuthSplitLayout + RegisterForm de
 * @lwm/auth (logica intacta). Textos y enlaces del Figma "Crear cuenta".
 */

import Link from 'next/link'
import { RegisterForm } from '@/modules/auth'
import { AuthSplitLayout } from '@/modules/auth-ui'

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      title="Regístrate ahora"
      subtitle="Completa tus datos y comienza a disfrutar de todos nuestros servicios."
      footer={<p>¿Ya tienes una cuenta? <Link href="/auth/login">¡Inicia sesión aquí!</Link></p>}
    >
      <RegisterForm />
    </AuthSplitLayout>
  )
}
