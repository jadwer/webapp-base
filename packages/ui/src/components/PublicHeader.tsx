'use client'

import React from 'react'
import Link from 'next/link'

/**
 * Minimal public-site header for the template (used by `app/(front)/layout.tsx`).
 *
 * Tenants replace this with their own header under
 * `clients/<name>/webapp/src/modules/landing/Header.tsx` and import that one
 * from their own `(front)/layout.tsx`.
 *
 * The optional `search` slot lets consumers inject a product typeahead (e.g.
 * ProductSearchBox from @lwm/ecommerce) without @lwm/ui depending on ecommerce.
 * ecommerce already depends on ui, so importing it here would create a cycle;
 * the slot keeps the dependency edge one-directional.
 */
export interface PublicHeaderProps {
  search?: React.ReactNode
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ search }) => {
  return (
    <header className="bg-white border-bottom py-3">
      <div className="container d-flex align-items-center gap-3">
        <Link href="/" className="text-decoration-none">
          <span className="fw-bold fs-5">WebApp Base</span>
        </Link>
        {search && (
          <div className="flex-grow-1 d-flex justify-content-center">{search}</div>
        )}
        <nav className={search ? '' : 'ms-auto'}>
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
