'use client'

import Link from 'next/link'
import AuthStatus from '@/modules/auth/components/AuthStatus'
import styles from '@/ui/styles/modules/HeaderNavbar.module.scss'

export default function HeaderNavbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
            alt="Labor Wasser de México"
            className={styles.brandLogo}
          />
        </Link>

        <div className={styles.actions}>
          <AuthStatus />
        </div>
      </div>
    </header>
  )
}
