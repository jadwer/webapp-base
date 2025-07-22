'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import Link from 'next/link'

interface Props {
  redirect: string
}

export default function LoginTemplate({ redirect }: Props) {
  const router = useRouter()

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="mb-4 text-center">Iniciar sesión</h1>
      <LoginForm
        redirect={redirect}
        onLoginSuccess={() => router.replace(redirect)}
      />
<div className="text-center mt-4">
        ¿No tienes una cuenta?{' '}
        <Link href="/auth/register" className="text-primary fw-semibold">
          ¡Regístrate!
        </Link>
      </div>
    </div>
  )
}
