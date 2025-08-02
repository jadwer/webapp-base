'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/dashboard', label: 'Panel Principal', icon: 'bi-house' },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: 'bi-person-circle' },
  { href: '/dashboard/design-system', label: 'Design System', icon: 'bi-palette' },
  { href: '/dashboard/page-builder', label: 'Page Builder', icon: 'bi-layout-text-window-reverse' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'bi-people' }
]

const permissionManagerLinks = [
  { href: '/dashboard/permission-manager', label: 'Permission Manager', icon: 'bi-grid' },
  { href: '/dashboard/roles', label: 'Roles', icon: 'bi-person-badge' },
  { href: '/dashboard/permissions', label: 'Permisos', icon: 'bi-shield-lock' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [permissionManagerOpen, setPermissionManagerOpen] = useState(
    pathname?.startsWith('/dashboard/permission-manager') || 
    pathname?.startsWith('/dashboard/roles') || 
    pathname?.startsWith('/dashboard/permissions')
  )

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
          {/* Enlaces simples */}
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
          
          {/* Grupo Permission Manager */}
          <li className="nav-item">
            <button
              className={`nav-link d-flex align-items-center justify-content-between w-100 border-0 bg-transparent ${
                permissionManagerOpen ? 'fw-semibold text-primary' : 'text-dark'
              }`}
              onClick={() => setPermissionManagerOpen(!permissionManagerOpen)}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-fill-check" aria-hidden="true"></i>
                Permission Manager
              </div>
              <i className={`bi ${permissionManagerOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`collapse ${permissionManagerOpen ? 'show' : ''}`}>
              <ul className="nav flex-column ms-3 mt-2">
                {permissionManagerLinks.map(({ href, label, icon }) => (
                  <li className="nav-item" key={href}>
                    <Link
                      href={href}
                      className={`nav-link d-flex align-items-center gap-2 py-2 ${
                        pathname === href ? 'active fw-semibold text-primary' : 'text-dark'
                      }`}
                      style={{ fontSize: '0.9rem' }}
                    >
                      <i className={`bi ${icon}`} aria-hidden="true"></i>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </aside>
    </>
  )
}
