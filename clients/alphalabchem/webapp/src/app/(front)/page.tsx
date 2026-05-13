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

      {/* Quienes somos: Mision + Vision + Valores */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
              Quiénes somos
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 720 }}>
              Conoce los principios que guían nuestro trabajo y nuestra relación con la industria.
            </p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h3 className="h4 fw-bold mb-3" style={{ color: 'var(--brand-primary)' }}>
                    <i className="bi bi-bullseye me-2" aria-hidden="true" />
                    Misión
                  </h3>
                  <p className="text-muted mb-0">
                    En AlphaLab Chemicals nos dedicamos a la fabricación y comercialización de
                    productos químicos industriales con los más altos estándares de calidad,
                    ofreciendo soluciones confiables, eficientes y competitivas para nuestros
                    clientes. Trabajamos con honestidad, innovación y compromiso profesional,
                    garantizando excelencia en cada producto y un servicio orientado a satisfacer
                    las necesidades de la industria moderna.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h3 className="h4 fw-bold mb-3" style={{ color: 'var(--brand-secondary)' }}>
                    <i className="bi bi-eye me-2" aria-hidden="true" />
                    Visión
                  </h3>
                  <p className="text-muted mb-0">
                    Ser una empresa líder y reconocida en el sector químico industrial a nivel
                    nacional e internacional, destacándonos por nuestra calidad, innovación,
                    responsabilidad y profesionalismo. Buscamos construir relaciones sólidas y
                    duraderas con nuestros clientes, ofreciendo productos de alto desempeño,
                    precios competitivos y un servicio basado en la confianza y la excelencia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="h4 fw-bold" style={{ color: 'var(--brand-primary)' }}>
              Valores corporativos
            </h3>
          </div>

          <div className="row g-4">
            {[
              {
                icon: 'bi-award',
                title: 'Calidad',
                copy: 'Garantizamos productos desarrollados bajo estrictos controles y procesos que aseguran seguridad, eficiencia y alto desempeño.',
              },
              {
                icon: 'bi-shield-check',
                title: 'Honestidad',
                copy: 'Actuamos con transparencia, ética y responsabilidad en cada relación comercial y profesional.',
              },
              {
                icon: 'bi-briefcase',
                title: 'Profesionalismo',
                copy: 'Trabajamos con disciplina, conocimiento técnico y compromiso para ofrecer soluciones confiables y de excelencia.',
              },
              {
                icon: 'bi-headset',
                title: 'Servicio',
                copy: 'Brindamos atención personalizada y acompañamiento continuo, priorizando las necesidades de nuestros clientes.',
              },
              {
                icon: 'bi-lightbulb',
                title: 'Innovación',
                copy: 'Impulsamos la mejora continua y el desarrollo de nuevas soluciones químicas para responder a las exigencias del mercado.',
              },
              {
                icon: 'bi-people',
                title: 'Compromiso',
                copy: 'Cumplimos con nuestros objetivos y responsabilidades, generando confianza y satisfacción en cada proyecto.',
              },
              {
                icon: 'bi-graph-up-arrow',
                title: 'Competitividad',
                copy: 'Ofrecemos productos y servicios con la mejor relación calidad-precio del mercado.',
              },
              {
                icon: 'bi-tree',
                title: 'Responsabilidad',
                copy: 'Promovemos prácticas responsables con nuestros clientes, colaboradores y el entorno industrial.',
              },
            ].map((value) => (
              <div className="col-sm-6 col-lg-3" key={value.title}>
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body p-4">
                    <div
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: 'var(--brand-secondary)',
                        color: 'white',
                      }}
                    >
                      <i className={`bi ${value.icon} fs-4`} aria-hidden="true" />
                    </div>
                    <h5 className="fw-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
                      {value.title}
                    </h5>
                    <p className="text-muted small mb-0">{value.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que elegirnos (ex-Pillars) */}
      <section className="py-5" style={{ background: 'var(--brand-bg-muted, #f8f9fa)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: 'var(--brand-primary)' }}>
              Por qué elegirnos
            </h2>
          </div>
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

      {/* Productos destacados */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6 text-center">
              <Image
                src="/images/brand/productos.png"
                alt="Catálogo de productos AlphaLab Chemicals"
                width={720}
                height={540}
                style={{ height: 'auto', maxWidth: '100%', width: 'auto' }}
                className="rounded shadow-sm"
              />
            </div>
            <div className="col-md-6">
              <h2 className="fw-bold mb-3" style={{ color: 'var(--brand-primary)' }}>
                Catálogo de productos químicos
              </h2>
              <p className="text-muted mb-4">
                Reactivos analíticos, solventes industriales, ácidos, bases y
                materias primas químicas. Presentaciones desde 1&nbsp;L hasta
                tambores de 200&nbsp;L y tote IBC de 1,000&nbsp;L para clientes
                industriales.
              </p>
              <Link
                href="/productos"
                className="btn btn-lg px-4"
                style={{
                  background: 'var(--brand-primary)',
                  color: 'white',
                  borderColor: 'var(--brand-primary)',
                }}
              >
                Ver catálogo completo
                <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
              </Link>
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
