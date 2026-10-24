'use client'

import React from 'react'
import Link from 'next/link'
import { useLocalCartCount } from '@lwm/ecommerce'

/** Carrito del encabezado publico con el conteo real del carrito local. */
export const HeaderCartLink: React.FC = () => {
  const count = useLocalCartCount()
  return (
    <Link
      href="/cart"
      className="nav-link position-relative"
      aria-label={count > 0 ? `Carrito, ${count} productos` : 'Carrito'}
    >
      <i className="bi bi-cart3 fs-5" aria-hidden="true" />
      {count > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
          {count}
        </span>
      )}
    </Link>
  )
}
