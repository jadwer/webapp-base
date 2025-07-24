'use client'

import Link from 'next/link'
import AuthStatus from '@/modules/auth/components/AuthStatus'

export default function HeaderNavbar() {
  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand fw-bold text-primary">
          AtomoSoluciones WebApp
        </Link>

        <div className="ms-auto">
          <AuthStatus />
        </div>
      </div>
    </header>
  )
}
