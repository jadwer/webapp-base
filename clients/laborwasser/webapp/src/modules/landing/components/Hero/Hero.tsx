'use client'

/**
 * HERO (rediseno 2026-08)
 *
 * Foto a todo el ancho con gradiente azul -> transparente (izq -> der),
 * titulo Poppins Bold, parrafo, dos botones pill y tres "quick-cards" que
 * flotan sobre el borde inferior (nosotros / productos / certificados).
 *
 * Titulo y parrafo siguen siendo configurables desde app-config
 * (landing.hero_title / landing.hero_subtitle); el fallback es el texto del
 * rediseno. "Cotiza con nosotros!" abre el offcanvas de contacto, igual que
 * el hero anterior.
 */

import React from 'react'
import Link from 'next/link'
import { usePublicSettings } from '@lwm/app-config'
import styles from './Hero.module.scss'

const QUICK_LINKS = [
  { href: '/nosotros', icon: 'bi-people', label: 'Conoce mas de nosotros' },
  { href: '/productos', icon: 'bi-book', label: 'Conoce nuestros productos' },
  { href: '/certificados', icon: 'bi-shield-check', label: 'Conoce nuestros Certificados' },
] as const

export const Hero: React.FC = () => {
  const { get } = usePublicSettings()
  const title = (get('landing.hero_title') as string) || 'Innovacion y confianza para tu laboratorio'
  const subtitle = (get('landing.hero_subtitle') as string) ||
    'Encuentra productos de excelencia, marcas reconocidas y una atencion especializada que hacen de Labor Wasser el aliado ideal para tu laboratorio. Te invitamos a descubrir nuestros servicios y transformar tu experiencia.'

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        <picture>
          <source media="(max-width: 767.98px)" srcSet="/images/laborwasser/labor-wasser-redesign-hero-mobile.webp" />
          <img
            src="/images/laborwasser/labor-wasser-redesign-hero.webp"
            alt=""
            className={styles.photo}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn lw-btn lw-btn-brand"
              data-bs-toggle="offcanvas"
              data-bs-target="#navMenu"
            >
              Cotiza con nosotros!
            </button>
            <Link href="/productos" className="btn lw-btn lw-btn-brand-outline lw-on-photo">
              Ver nuestros productos
            </Link>
          </div>
        </div>
      </div>

      {/* Quick-cards: flotan sobre el borde inferior del hero */}
      <div className={`container ${styles.quickWrap}`}>
        <nav className={`lw-card ${styles.quick}`} aria-label="Accesos rapidos">
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href} className={styles.quickItem}>
              <i className={`bi ${q.icon} ${styles.quickIcon}`} aria-hidden="true" />
              <span className={styles.quickLabel}>{q.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
