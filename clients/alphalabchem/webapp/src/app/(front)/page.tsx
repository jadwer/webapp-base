import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AlphaLab Chemicals — Pure Solutions. Powerful Results.',
  description:
    'Reactivos químicos, materias primas y soluciones de laboratorio para industria, investigación y educación. Atizapán de Zaragoza, Estado de México.',
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="py-5 text-center"
        style={{ background: 'var(--brand-bg-muted, #f8f9fa)' }}
      >
        <div className="container py-5">
          <Image
            src="/images/brand/logo.png"
            alt="AlphaLab Chemicals"
            width={420}
            height={140}
            priority
            style={{ height: 'auto', maxWidth: '90%', width: 'auto' }}
            className="mb-4"
          />
          <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--brand-primary)' }}>
            Pure Solutions.{' '}
            <span style={{ color: 'var(--brand-secondary)' }}>Powerful Results.</span>
          </h1>
          <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: 720 }}>
            Reactivos químicos, materias primas y soluciones de laboratorio para
            industria, investigación y educación.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link
              href="/productos"
              className="btn btn-lg px-4"
              style={{
                background: 'var(--brand-primary)',
                color: 'white',
                borderColor: 'var(--brand-primary)',
              }}
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="btn btn-lg btn-outline-secondary px-4"
              style={{ borderColor: 'var(--brand-secondary)', color: 'var(--brand-secondary)' }}
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--brand-primary)',
                  color: 'white',
                }}
              >
                <i className="bi bi-shield-check fs-2" aria-hidden="true" />
              </div>
              <h5 className="fw-bold">Quality</h5>
              <p className="text-muted small">You Trust</p>
            </div>
            <div className="col-md-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--brand-secondary)',
                  color: 'white',
                }}
              >
                <i className="bi bi-eyedropper fs-2" aria-hidden="true" />
              </div>
              <h5 className="fw-bold">Science</h5>
              <p className="text-muted small">That Delivers</p>
            </div>
            <div className="col-md-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--brand-accent)',
                  color: 'white',
                }}
              >
                <i className="bi bi-bezier2 fs-2" aria-hidden="true" />
              </div>
              <h5 className="fw-bold">Solutions</h5>
              <p className="text-muted small">That Transform</p>
            </div>
            <div className="col-md-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--brand-primary-dark)',
                  color: 'white',
                }}
              >
                <i className="bi bi-globe2 fs-2" aria-hidden="true" />
              </div>
              <h5 className="fw-bold">Chemistry</h5>
              <p className="text-muted small">For A Better Future</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section
        className="py-4"
        style={{ background: 'var(--brand-secondary)', color: 'white' }}
      >
        <div className="container text-center">
          <p className="mb-1">
            <i className="bi bi-geo-alt me-2" aria-hidden="true" />
            Laureles #62, Jardines de Atizapán, Atizapán de Zaragoza, Estado de México, CP 52978
          </p>
          <p className="mb-0">
            <i className="bi bi-telephone me-2" aria-hidden="true" />
            55-8939-3444 / 55-2121-2494 &nbsp;·&nbsp;
            <i className="bi bi-envelope me-2" aria-hidden="true" />
            <a href="mailto:ventas@alphalabchem.com.mx" className="text-white text-decoration-underline">
              ventas@alphalabchem.com.mx
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
