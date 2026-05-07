'use client'

import React from 'react'
import Link from 'next/link'

/**
 * Minimal public-site footer for the template (used by `app/(front)/layout.tsx`).
 *
 * Tenants replace this with their own footer under
 * `clients/<name>/webapp/src/modules/landing/Footer.tsx`.
 */
export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-light border-top py-4 mt-5">
      <div className="container text-center text-muted small">
        <p className="mb-1">
          &copy; {new Date().getFullYear()} WebApp Base Template. All rights reserved.
        </p>
        <p className="mb-0">
          <Link href="/aviso-privacidad" className="text-muted me-3">Privacy</Link>
          <Link href="/derechos-reservados" className="text-muted">Terms</Link>
        </p>
      </div>
    </footer>
  )
}

export default PublicFooter
