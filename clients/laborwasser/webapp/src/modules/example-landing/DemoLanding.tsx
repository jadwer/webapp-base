'use client'

import React from 'react'

interface DemoLandingProps {
  showFullCatalog?: boolean
  enableProductModal?: boolean
}

/**
 * DemoLanding - placeholder landing for the webapp-base template.
 *
 * Tenants replace this with their own landing module under
 * `clients/<name>/webapp/src/modules/landing/` and import it from their own
 * `app/HomeClient.tsx`. This component intentionally has no images, no
 * external data fetches, and no tenant branding — it only verifies that
 * the template arranca and Bootstrap classes render correctly.
 */
export const DemoLanding: React.FC<DemoLandingProps> = () => {
  return (
    <div className="demo-landing">
      <section
        className="text-white py-5"
        style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}
      >
        <div className="container py-5 text-center">
          <h1 className="display-4 fw-bold mb-3">WebApp Base Template</h1>
          <p className="lead mb-4">
            A starting point for building tenant-specific web applications on the WebApp Base backbone.
          </p>
          <a className="btn btn-primary btn-lg" href="/dashboard">
            Open Dashboard
          </a>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Modular Architecture</h5>
                  <p className="card-text">
                    Decoupled modules under <code>src/modules/</code> for products, sales,
                    contacts, ecommerce, and more.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">JSON:API Backend</h5>
                  <p className="card-text">
                    Powered by <code>api-base</code> Laravel template with JSON:API,
                    Sanctum auth, and Spatie permissions.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Tenant-ready</h5>
                  <p className="card-text">
                    Branding, content, and seeders live in client repos. The template
                    stays generic and merge-friendly for upstream upgrades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="text-white py-5"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="container py-4 text-center">
          <h2 className="mb-3">Build your tenant on top of this template</h2>
          <p className="lead mb-4">
            Override branding, landing, and seeders in your own client repo. Pull
            upstream bugfixes via shared packages and <code>git merge upstream</code>.
          </p>
          <a className="btn btn-light btn-lg" href="/auth/login">
            Sign in
          </a>
        </div>
      </section>

      <footer className="py-4 text-center text-muted">
        <div className="container">
          <small>
            &copy; {new Date().getFullYear()} WebApp Base Template. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  )
}

export default DemoLanding
