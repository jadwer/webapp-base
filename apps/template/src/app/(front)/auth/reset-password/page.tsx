'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ResetPasswordTemplate from '@/modules/auth/templates/ResetPasswordTemplate'
import styles from '@/modules/auth/styles/AuthTemplate.module.scss'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.brandIcon}>
              <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            </div>
            <h1 className={styles.authTitle}>Enlace invalido</h1>
            <p className={styles.authSubtitle}>
              El enlace para restablecer tu contrasena es invalido o ha expirado.
            </p>
          </div>
          <div className={styles.authFooter}>
            <p>
              <Link href="/auth/forgot-password">
                Solicitar un nuevo enlace
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <ResetPasswordTemplate token={token} email={email} />
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}
