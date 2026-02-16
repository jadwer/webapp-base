'use client'

import { ForgotPasswordForm } from '@/modules/auth/components/ForgotPasswordForm'
import Link from 'next/link'
import styles from '@/modules/auth/styles/AuthTemplate.module.scss'

export default function ForgotPasswordTemplate() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.brandIcon}>
            <i className="bi bi-key" aria-hidden="true"></i>
          </div>
          <h1 className={styles.authTitle}>Recuperar contrasena</h1>
          <p className={styles.authSubtitle}>Te enviaremos un enlace para restablecer tu contrasena</p>
        </div>

        <div className={styles.authForm}>
          <ForgotPasswordForm />
        </div>

        <div className={styles.authFooter}>
          <p>
            ¿Recordaste tu contrasena?{' '}
            <Link href="/auth/login">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
