'use client'

import Link from 'next/link'
import AuthStatus from '@/modules/auth/components/AuthStatus'
import { usePublicSettings } from '@/modules/app-config'
import styles from '@/ui/styles/modules/HeaderNavbar.module.scss'

export default function HeaderNavbar() {
  const { get } = usePublicSettings()

  const logoSrc = get('company.logo_path_alt') || '/images/laborwasser/labor-wasser-mexico-logo2.webp'
  const companyName = get('company.name') || 'Logo'

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={companyName}
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
