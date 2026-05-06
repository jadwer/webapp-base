'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import Link from 'next/link'
import styles from '@/modules/auth/styles/AuthTemplate.module.scss'

interface Props {
  redirect: string
}

export default function LoginTemplate({ redirect }: Props) {
  const router = useRouter()

  const handleLoginSuccess = () => {
    // redirect siempre tiene valor (/dashboard por defecto, o el ?redirect= param)
    router.replace(redirect)
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
