'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import { useAuth } from '@/modules/auth/lib/auth'
import { getDefaultRoute } from '@/lib/permissions'
import Link from 'next/link'

interface Props {
  redirect: string
}

export default function LoginTemplate({ redirect }: Props) {
  const router = useRouter()
  const { user } = useAuth()

  const handleLoginSuccess = () => {
    // Si hay un redirect específico, usarlo
    if (redirect && redirect !== '/dashboard') {
      router.replace(redirect)
      return
    }

    // Si no hay redirect específico, usar la ruta por defecto según el rol
    const defaultRoute = getDefaultRoute(user)
    router.replace(defaultRoute)
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="mb-4 text-center">Iniciar sesión</h1>
      <LoginForm
        redirect={redirect}
        onLoginSuccess={handleLoginSuccess}
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
