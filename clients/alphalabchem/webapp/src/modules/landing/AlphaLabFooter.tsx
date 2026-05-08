'use client'

import Link from 'next/link'

/**
 * AlphaLab Chemicals — public-site footer.
 *
 * Built around the client's 4 value pillars (Quality You Trust /
 * Science That Delivers / Solutions That Transform / Chemistry For A
 * Better Future). Background uses --brand-banner-bg from branding.scss.
 */
export default function AlphaLabFooter() {
  return (
    <footer
      className="mt-5 text-white"
      style={{ background: 'var(--brand-banner-bg, #0F2752)' }}
    >
      <div className="container py-5">
        <div className="row g-4 text-center">
          <div className="col-6 col-md-3">
            <i className="bi bi-shield-check display-6 d-block mb-2" aria-hidden="true" />
            <h6 className="text-uppercase fw-bold mb-1">Quality</h6>
            <small className="text-white-50">You Trust</small>
          </div>
          <div className="col-6 col-md-3">
            <i className="bi bi-eyedropper display-6 d-block mb-2" aria-hidden="true" />
            <h6 className="text-uppercase fw-bold mb-1">Science</h6>
            <small className="text-white-50">That Delivers</small>
          </div>
          <div className="col-6 col-md-3">
            <i className="bi bi-bezier2 display-6 d-block mb-2" aria-hidden="true" />
            <h6 className="text-uppercase fw-bold mb-1">Solutions</h6>
            <small className="text-white-50">That Transform</small>
          </div>
          <div className="col-6 col-md-3">
            <i className="bi bi-globe2 display-6 d-block mb-2" aria-hidden="true" />
            <h6 className="text-uppercase fw-bold mb-1">Chemistry</h6>
            <small className="text-white-50">For A Better Future</small>
          </div>
        </div>
      </div>

      <div className="border-top border-white-50 py-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center small">
          <div>
            &copy; {new Date().getFullYear()} AlphaLab Chemicals. Todos los derechos reservados.
          </div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <Link href="/p/aviso-privacidad" className="text-white-50 text-decoration-none">
              Aviso de privacidad
            </Link>
            <Link href="/p/derechos-reservados" className="text-white-50 text-decoration-none">
              Términos
            </Link>
            <a
              href="mailto:ventas@alphalabchem.com.mx"
              className="text-white-50 text-decoration-none"
            >
              ventas@alphalabchem.com.mx
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
