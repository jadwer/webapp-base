'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePublicSettings } from '@lwm/app-config'

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
  /** Acceso al carrito (mismo motivo que `search`: ui no depende de ecommerce). */
  cart?: React.ReactNode
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ search, cart }) => {
  // Marca desde la configuracion (company.name, company.logo_path): cada
  // instalacion se ve con su nombre sin tocar codigo (23-10).
  const { get } = usePublicSettings()
  const name = get('company.name') || 'Tienda en línea'
  const logo = get('company.logo_path')
  // Si el logo no carga se oculta y queda el nombre.
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className="bg-white border-bottom py-3">
      {/* En celular el buscador baja a su propia fila para que nada desborde. */}
      <div className="container d-flex flex-wrap align-items-center gap-2 gap-md-3">
        <Link href="/" className="text-decoration-none d-flex align-items-center gap-2" aria-label={`${name}, inicio`}>
          {logo && !logoFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" height={36} style={{ width: 'auto' }} onError={() => setLogoFailed(true)} />
          )}
          <span className="fw-bold fs-5">{name}</span>
        </Link>
        {search && (
          <div className="col-12 col-md order-last order-md-0 d-flex justify-content-center">{search}</div>
        )}
        <nav className="ms-auto">
          <ul className="nav flex-nowrap">
            <li className="nav-item">
              <Link className="nav-link px-2" href="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-2" href="/ofertas">Ofertas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-2" href="/auth/login">Iniciar sesión</Link>
            </li>
            {cart && <li className="nav-item d-flex align-items-center">{cart}</li>}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default PublicHeader
