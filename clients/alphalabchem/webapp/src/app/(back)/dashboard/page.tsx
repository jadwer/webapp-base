'use client'

import { useAuth } from '@lwm/auth'

/**
 * AlphaLab Chemicals — Dashboard home (logged-in landing).
 *
 * Minimal placeholder. Replace with the full dashboard composition
 * (KPIs, sales charts, CRM widgets, etc.) once AlphaLab decides which
 * @lwm/* modules to surface to its admins.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-1" style={{ color: 'var(--brand-primary)' }}>
            Bienvenido{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted">AlphaLab Chemicals · Panel administrativo</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <i
                className="bi bi-box-seam fs-2 mb-2 d-block"
                style={{ color: 'var(--brand-secondary)' }}
              />
              <h5 className="card-title">Catálogo</h5>
              <p className="card-text text-muted">
                Productos químicos, presentaciones y precios.
              </p>
              <a href="/dashboard/products" className="card-link">
                Ir al catálogo →
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <i
                className="bi bi-people fs-2 mb-2 d-block"
                style={{ color: 'var(--brand-secondary)' }}
              />
              <h5 className="card-title">Contactos</h5>
              <p className="card-text text-muted">
                Clientes, proveedores y direcciones.
              </p>
              <a href="/dashboard/contacts" className="card-link">
                Ver contactos →
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <i
                className="bi bi-receipt fs-2 mb-2 d-block"
                style={{ color: 'var(--brand-secondary)' }}
              />
              <h5 className="card-title">Cotizaciones</h5>
              <p className="card-text text-muted">
                Quotes activas, expirando, ventas.
              </p>
              <a href="/dashboard/quotes" className="card-link">
                Ver cotizaciones →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
