'use client'

import Link from 'next/link'
import AuthStatus from '@/modules/auth/components/AuthStatus'
import styles from '@/ui/styles/modules/HeaderNavbar.module.scss'

export default function HeaderNavbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <i className="bi bi-diagram-3" aria-hidden="true"></i>
          </div>
          <span className={styles.brandText}>
            Labor Wasser de México WebApp
          </span>
        </Link>

        <div className={styles.actions}>
          <AuthStatus />
        </div>
      </div>
    </header>
  )
}
