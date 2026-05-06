'use client'

import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm'
import Link from 'next/link'
import styles from '@/modules/auth/styles/AuthTemplate.module.scss'

interface Props {
  token: string
  email: string
}

export default function ResetPasswordTemplate({ token, email }: Props) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.brandIcon}>
            <i className="bi bi-shield-lock" aria-hidden="true"></i>
          </div>
          <h1 className={styles.authTitle}>Nueva contrasena</h1>
          <p className={styles.authSubtitle}>Ingresa tu nueva contrasena</p>
        </div>

        <div className={styles.authForm}>
          <ResetPasswordForm token={token} email={email} />
        </div>

        <div className={styles.authFooter}>
          <p>
            <Link href="/auth/login">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
