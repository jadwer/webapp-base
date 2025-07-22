'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/dashboard/page-builder', label: 'Page Builder', icon: 'bi-layout-text-window-reverse' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'bi-people' },
  { href: '/dashboard/permissions', label: 'Permisos', icon: 'bi-shield-lock' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botón toggle en pantallas pequeñas */}
      <button
        className="btn btn-outline-secondary d-lg-none m-2"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-list"></i> Menú
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-light border-end p-3 d-lg-block ${open ? '' : 'd-none'}`}
        style={{ width: 240, minHeight: '100vh' }}
      >
        <h6 className="text-uppercase fw-bold mb-4">Menú</h6>
        <ul className="nav flex-column gap-2">
          {links.map(({ href, label, icon }) => (
            <li className="nav-item" key={href}>
              <Link
                href={href}
                className={`nav-link d-flex align-items-center gap-2 ${
                  pathname?.startsWith(href) ? 'active fw-semibold text-primary' : 'text-dark'
                }`}
              >
                <i className={`bi ${icon}`} aria-hidden="true"></i>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
