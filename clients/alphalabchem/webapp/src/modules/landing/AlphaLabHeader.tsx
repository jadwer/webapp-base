'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AuthStatus } from '@lwm/auth'
import { ProductSearchBox } from '@lwm/ecommerce'

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

        {/* Nota cliente #4: buscador con autocompletado (typeahead) del catalogo publico.
            Reemplaza el form de busqueda plano por el mismo slot y ancho. */}
        <div className="flex-grow-1 mx-lg-4" style={{ maxWidth: 480 }}>
          <ProductSearchBox />
        </div>

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
