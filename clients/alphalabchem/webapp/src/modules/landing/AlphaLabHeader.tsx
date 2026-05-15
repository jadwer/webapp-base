'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthStatus } from '@lwm/auth'

/**
 * AlphaLab Chemicals — public-site header.
 *
 * Replaces @lwm/ui's generic PublicHeader. Uses the client's logo from
 * /public/images/brand/logo.png and primary brand colors via inline
 * style + branding.scss tokens.
 *
 * Includes a public product search that navigates to /productos?search=...
 * — the catalog page already reads `search` from the query string as its
 * initial filter (see (front)/productos/page.tsx initialSearch).
 */
export default function AlphaLabHeader() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/productos?search=${encodeURIComponent(q)}`)
    } else {
      router.push('/productos')
    }
  }

  return (
    <header
      className="border-bottom py-3"
      style={{ background: 'var(--brand-bg, #fff)' }}
    >
      <div className="container d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <Link
          href="/"
          className="text-decoration-none d-flex align-items-center"
          aria-label="AlphaLab Chemicals — inicio"
        >
          <Image
            src="/images/brand/logo.png"
            alt="AlphaLab Chemicals"
            width={220}
            height={64}
            priority
            style={{ height: 'auto', maxHeight: 56, width: 'auto' }}
          />
        </Link>

        {/* Public search — same UX target as legacy LWM "Buscar" form. */}
        <form
          onSubmit={onSubmit}
          role="search"
          className="d-flex flex-grow-1 mx-lg-4"
          style={{ maxWidth: 480 }}
        >
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn"
              style={{
                background: 'var(--brand-primary, #1B3766)',
                color: 'white',
                borderColor: 'var(--brand-primary, #1B3766)',
              }}
              aria-label="Buscar"
            >
              <i className="bi bi-search" aria-hidden="true" />
            </button>
          </div>
        </form>

        <nav>
          <ul className="nav align-items-center">
            <li className="nav-item">
              <Link className="nav-link" href="/productos">
                Catálogo
              </Link>
            </li>
            {/* /p/<slug> son rutas dinámicas servidas por el PageBuilder.
                Devuelven 404 hasta que el admin cree la pagina via
                /dashboard/pages con el slug correspondiente. */}
            <li className="nav-item">
              <Link className="nav-link" href="/p/nosotros">
                Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/p/contacto">
                Contacto
              </Link>
            </li>
            <li className="nav-item ms-2">
              <AuthStatus />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
