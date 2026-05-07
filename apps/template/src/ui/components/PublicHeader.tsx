'use client'

import React from 'react'
import Link from 'next/link'

/**
 * Minimal public-site header for the template (used by `app/(front)/layout.tsx`).
 *
 * Tenants replace this with their own header under
 * `clients/<name>/webapp/src/modules/landing/Header.tsx` and import that one
 * from their own `(front)/layout.tsx`.
 */
export const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white border-bottom py-3">
      <div className="container d-flex align-items-center justify-content-between">
        <Link href="/" className="text-decoration-none">
          <span className="fw-bold fs-5">WebApp Base</span>
        </Link>
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" href="/productos">Catalog</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/auth/login">Sign in</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default PublicHeader
