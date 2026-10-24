'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@lwm/auth'
import { useNavigation, type NavigationConfig } from '../hooks/useNavigation'

/**
 * Inicio del personal con rol propio (vendedor, tech, roles por puesto):
 * accesos a los modulos que sus permisos permiten, tomados del mismo menu.
 * El panel de administracion pide finanzas y reportes que estos roles no
 * ven; el portal de cliente no les sirve.
 */
export const StaffDashboard: React.FC<{ navigationConfig: NavigationConfig }> = ({ navigationConfig }) => {
  const { user } = useAuth()
  const { groups, topLinks } = useNavigation(navigationConfig)
  const links = topLinks.filter((l) => l.href !== '/dashboard')

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-1">Bienvenido, {user?.name}</h1>
        <p className="text-muted mb-0">Estos son los módulos a los que tienes acceso.</p>
      </div>

      {links.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="btn btn-outline-primary">
              <i className={`bi ${l.icon} me-2`} aria-hidden="true" />
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="alert alert-info">
          Tu usuario aún no tiene módulos asignados. Pide acceso a un administrador.
        </div>
      ) : (
        <div className="row g-3">
          {groups.map((group) => (
            <div key={group.key} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100">
                <div className="card-header d-flex align-items-center gap-2">
                  <i className={`bi ${group.icon}`} aria-hidden="true" />
                  <h2 className="h6 mb-0">{group.label}</h2>
                </div>
                <div className="list-group list-group-flush">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className="list-group-item list-group-item-action d-flex align-items-center gap-2">
                      <i className={`bi ${item.icon} text-muted`} aria-hidden="true" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StaffDashboard
