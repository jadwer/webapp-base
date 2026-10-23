'use client'

import React from 'react'
import Link from 'next/link'
import { usePublicSettings } from '@lwm/app-config'

/**
 * Minimal public-site footer for the template (used by `app/(front)/layout.tsx`).
 *
 * Tenants replace this with their own footer under
 * `clients/<name>/webapp/src/modules/landing/Footer.tsx`.
 */
export const PublicFooter: React.FC = () => {
  const { get } = usePublicSettings()
  const name = get('company.name') || 'Tienda en línea'
  const phone = get('company.phone')
  const email = get('company.email')

  return (
    <footer className="bg-light border-top py-4 mt-5">
      <div className="container text-center text-muted small">
        {(phone || email) && (
          <p className="mb-1">
            {phone && <span className="me-3"><i className="bi bi-telephone me-1" aria-hidden="true" />{phone}</span>}
            {email && <a href={`mailto:${email}`} className="text-muted"><i className="bi bi-envelope me-1" aria-hidden="true" />{email}</a>}
          </p>
        )}
        <p className="mb-1">
          &copy; {new Date().getFullYear()} {name}. Todos los derechos reservados.
        </p>
        <p className="mb-0">
          <Link href="/aviso-privacidad" className="text-muted me-3">Aviso de privacidad</Link>
          <Link href="/derechos-reservados" className="text-muted">Términos y condiciones</Link>
        </p>
      </div>
    </footer>
  )
}

export default PublicFooter
