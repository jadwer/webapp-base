'use client'

import React from 'react'
import Link from 'next/link'
import type { EnhancedPublicProduct } from '@lwm/ecommerce'
import { usePublicSettings } from '@lwm/app-config'
import { DEMO_ACCOUNTS } from '@/modules/demo/data/accounts'
import { ABOUT_POINTS, FAQS, FLOW_STEPS, HERO_CHECKS, MODULE_GROUPS, STORE_FEATURES } from '../content'
import s from '../PortalLanding.module.scss'

interface HeroProps {
  products: EnhancedPublicProduct[]
  isDemo: boolean
}

export const HeroSection: React.FC<HeroProps> = ({ products, isDemo }) => {
  const preview = products.filter((p) => !p.isQuoteOnly).slice(0, 3)

  return (
    <section className={s.hero}>
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6">
            <span className={s.eyebrow}>Tienda en línea + sistema de gestión</span>
            <h1>Tu portal para vender, administrar y crecer.</h1>
            <p className={s.heroLead}>
              Tienda en línea, cotizaciones, inventario, facturación CFDI 4.0 y contabilidad en un
              solo sistema, con el nombre y el logo de tu empresa.
            </p>
            <div className={s.heroCtas}>
              <Link href="/productos" className={s.btnAccent}>
                <i className="bi bi-grid" aria-hidden="true" />
                Ver catálogo
              </Link>
              <a href={isDemo ? '#acceso-demo' : '/auth/login'} className={s.btnGhost}>
                {isDemo ? 'Entrar al demo' : 'Iniciar sesión'}
              </a>
            </div>
            <ul className={s.heroChecks}>
              {HERO_CHECKS.map((item) => (
                <li key={item}><i className="bi bi-check2" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="col-lg-6">
            <div className={s.window} aria-label="Vista de la tienda en vivo">
              <div className={s.windowBar} aria-hidden="true">
                <span /><span /><span />
                <em>Tu tienda, en vivo</em>
              </div>
              <div className={s.windowBody}>
                {(preview.length ? preview : [null, null, null]).map((p, i) =>
                  p ? (
                    <Link key={p.id} href={`/productos`} className={s.miniCard}>
                      {p.attributes.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.attributes.imageUrl} alt="" />
                      ) : (
                        <span className={s.miniPh}><i className="bi bi-box-seam" aria-hidden="true" /></span>
                      )}
                      <strong>{p.displayName}</strong>
                      <small>
                        ${(p.attributes.price ?? 0).toLocaleString('es-MX')}
                        {p.attributes.iva ? ' + IVA' : ''}
                      </small>
                    </Link>
                  ) : (
                    <div key={i} className={s.miniCard}><span className={s.miniPh} /></div>
                  )
                )}
              </div>
              <div className={s.windowFoot}>
                <span><i className="bi bi-arrow-repeat me-1" aria-hidden="true" />Productos reales del catálogo</span>
                <Link href="/productos" className={s.linkMore}>Abrir tienda</Link>
              </div>
            </div>
          </div>
        </div>
        <QuickAccess isDemo={isDemo} />
      </div>
    </section>
  )
}

/** Accesos rapidos bajo el heroe: comprar, ofertas y, en demo, un perfil por clic. */
const QuickAccess: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const links = [
    { href: '/productos', icon: 'bi-cart3', label: 'Comprar en la tienda', hint: 'Catálogo con filtros' },
    { href: '/ofertas', icon: 'bi-tags', label: 'Ofertas del mes', hint: 'Precio anterior tachado' },
    ...(isDemo
      ? DEMO_ACCOUNTS.map((a) => ({
          href: `/auth/login?perfil=${a.key}`,
          icon: a.icon,
          label: `Demo ${a.role}`,
          hint: 'Entra con un clic',
        }))
      : [{ href: '/auth/login', icon: 'bi-person', label: 'Iniciar sesión', hint: 'Portal del cliente' }]),
  ]
  return (
    <nav className={s.quick} aria-label="Accesos rápidos">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={s.quickItem}>
          <i className={`bi ${l.icon}`} aria-hidden="true" />
          <span>
            <strong>{l.label}</strong>
            <small>{l.hint}</small>
          </span>
        </Link>
      ))}
    </nav>
  )
}

export const AboutSection: React.FC<{ isDemo: boolean }> = ({ isDemo }) => (
  <section className={s.section} aria-labelledby="pl-que-es">
    <div className="container">
      <div className={s.sectionHeader}>
        <div>
          <span className={s.eyebrow}>¿Qué es esta página?</span>
          <h2 id="pl-que-es">Es la demostración de tu próximo portal de ventas</h2>
          <p>
            Todo lo que ves abajo funciona: es la tienda que tendrían tus clientes y, detrás, el
            sistema con el que tu equipo administra la empresa.
          </p>
        </div>
      </div>
      <div className={s.aboutGrid}>
        {ABOUT_POINTS.map((item) => (
          <div key={item.title} className={s.aboutItem}>
            <span className={s.iconBox}><i className={`bi ${item.icon}`} aria-hidden="true" /></span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      {isDemo && (
        <p className={s.aboutNote}>
          <i className="bi bi-info-circle" aria-hidden="true" />
          Los datos de la demo se reinician cada semana: compra, cotiza y prueba con confianza.
        </p>
      )}
    </div>
  </section>
)

export const FeaturesSection: React.FC = () => (
  <section className={`${s.section} ${s.features}`} aria-labelledby="pl-caracteristicas">
    <div className="container">
      <div className={s.sectionHeader}>
        <div>
          <span className={s.eyebrow}>Características</span>
          <h2 id="pl-caracteristicas">Una tienda pensada para vender a empresas y al público</h2>
          <p>Lo que tus clientes usan cada vez que compran o cotizan.</p>
        </div>
      </div>
      <div className={s.featureGrid}>
        {STORE_FEATURES.map((f) => (
          <div key={f.title} className={s.feature}>
            <i className={`bi ${f.icon}`} aria-hidden="true" />
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/**
 * Modulos y flujo lado a lado (designboard r2): a la izquierda que se puede
 * sumar, a la derecha como corre una venta de punta a punta.
 */
export const OperationSection: React.FC = () => (
  <section className={s.section} aria-label="Módulos y flujo">
    <div className="container">
      <div className={s.operation}>
        <div className={s.opPanel} aria-labelledby="pl-modulos" role="region">
          <span className={s.eyebrow}>Detrás de la tienda</span>
          <h2 id="pl-modulos">Tu portal crece con tu empresa</h2>
          <p className={s.opLead}>Se contrata por bloques: empiezas con la tienda y sumas módulos cuando los necesitas.</p>
          <div className={s.moduleGrid}>
            {MODULE_GROUPS.map((m) => (
              <div key={m.title} className={s.module}>
                <h3><i className={`bi ${m.icon}`} aria-hidden="true" />{m.title}</h3>
                <ul>
                  {m.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={`${s.opPanel} ${s.opPanelFlow}`} aria-labelledby="pl-flujo" role="region">
          <span className={s.eyebrow}>De punta a punta</span>
          <h2 id="pl-flujo">Una venta, sin capturar nada dos veces</h2>
          <p className={s.opLead}>Desde que el cliente compra hasta que la póliza queda en contabilidad.</p>
          <ol className={s.flow}>
            {FLOW_STEPS.map((step) => (
              <li key={step.title} className={s.step}>
                <i className={`bi ${step.icon}`} aria-hidden="true" />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </section>
)

export const DemoAccessSection: React.FC = () => (
  <section id="acceso-demo" className={`${s.section} ${s.sectionAlt}`} aria-labelledby="pl-acceso">
    <div className="container">
      <div className={s.sectionHeader}>
        <div>
          <span className={s.eyebrow}>Pruébalo</span>
          <h2 id="pl-acceso">Entra al demo con un perfil</h2>
          <p>Cada perfil ve el sistema como lo vería esa persona en tu empresa.</p>
        </div>
      </div>
      <div className={s.profileGrid}>
        {DEMO_ACCOUNTS.map((account) => (
          <div key={account.key} className={s.profile}>
            <span className={s.iconBox}><i className={`bi ${account.icon}`} aria-hidden="true" /></span>
            <h3>{account.role}</h3>
            <p>{account.description}</p>
            <ul>
              {account.canTry.map((item) => (
                <li key={item}><i className="bi bi-check-circle-fill" aria-hidden="true" />{item}</li>
              ))}
            </ul>
            <Link href={`/auth/login?perfil=${account.key}`} className={s.btnAccent}>
              Entrar como {account.role}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const FaqSection: React.FC = () => (
  <section className={s.section} aria-labelledby="pl-faq">
    <div className="container">
      <div className={`${s.sectionHeader} justify-content-center text-center`}>
        <div>
          <span className={s.eyebrow}>Preguntas frecuentes</span>
          <h2 id="pl-faq">Lo que suelen preguntar</h2>
        </div>
      </div>
      <div className={s.faq}>
        {FAQS.map((f) => (
          <details key={f.q}>
            <summary>{f.q}<i className="bi bi-chevron-down" aria-hidden="true" /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
)

export const ClosingSection: React.FC = () => {
  const { get } = usePublicSettings()
  const email = get('company.email')
  const phone = get('company.phone')

  return (
    <section className={`${s.section} pt-0`}>
      <div className="container">
        <div className={s.closing}>
          <h2>¿Quieres tu propio portal?</h2>
          <p>Empieza con la tienda y crece por módulos. Platiquemos de lo que necesita tu empresa.</p>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
            <Link href="/productos" className={`${s.btnAccent} ${s.btnLight}`}>Ver catálogo</Link>
            {email && <a className={s.contact} href={`mailto:${email}`}>{email}</a>}
            {phone && <a className={s.contact} href={`tel:${String(phone).replace(/\s+/g, '')}`}>{phone}</a>}
          </div>
        </div>
      </div>
    </section>
  )
}
