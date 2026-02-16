'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import { useAuth } from '@/modules/auth/lib/auth'
import { getDefaultRoute } from '@/lib/permissions'
import Link from 'next/link'
import styles from '@/modules/auth/styles/AuthTemplate.module.scss'

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
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.brandIcon}>
            <i className="bi bi-diagram-3" aria-hidden="true"></i>
          </div>
          <h1 className={styles.authTitle}>Iniciar sesión</h1>
          <p className={styles.authSubtitle}>Bienvenido de nuevo</p>
        </div>
        
        <div className={styles.authForm}>
          <LoginForm
            redirect={redirect}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
        
        <div className={styles.authFooter}>
          <p>
            <Link href="/auth/forgot-password">
              ¿Olvidaste tu contrasena?
            </Link>
          </p>
          <p>
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/register">
              ¡Registrate aqui!
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
