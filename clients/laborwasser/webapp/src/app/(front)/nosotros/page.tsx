'use client'

/**
 * /nosotros (rediseno 2026-08). La pagina NO existia (el nav la linkeaba a
 * un 404). Estructura del Figma: hero con foto + overlay azul y "Somos
 * Labor Wasser", tarjetas Mision/Vision montadas sobre el hero, Valores LWM
 * (5 tarjetas con icono verde + foto con doble marco) y el cierre "Por que
 * comprar" compartido con el home.
 */

import React from 'react'
import { PorQueComprar } from '@/modules/landing'
import styles from './nosotros.module.scss'

const VALORES = [
  { icon: 'bi-hand-thumbs-up', title: 'Honestidad', text: 'Transparencia y veracidad en nuestras relaciones.' },
  { icon: 'bi-heart', title: 'Pasión', text: 'Entusiasmo y compromiso en cada acción.' },
  { icon: 'bi-shield-check', title: 'Responsabilidad', text: 'Cumplimos con lealtad y gratitud nuestros compromisos.' },
  { icon: 'bi-star', title: 'Calidad', text: 'Excelencia constante para superar expectativas.' },
  { icon: 'bi-graph-up-arrow', title: 'Competitividad', text: 'Innovamos y mejoramos para mantener el liderazgo.' },
] as const

export default function NosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero} aria-labelledby="nosotros-title">
        <div className={styles.heroMedia} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/laborwasser/labor-wasser-mexico-about.webp" alt="" className={styles.heroPhoto} />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1 id="nosotros-title" className={styles.heroTitle}>Somos Labor Wasser</h1>
          <p className={styles.heroText}>
            un equipo comprometido con el progreso científico y el bienestar de nuestros
            clientes. Durante más de 20 años hemos acompañado a profesionales y estudiantes
            en su búsqueda de precisión y excelencia. Creemos en la colaboración, la calidad
            y la innovación como pilares para construir un futuro más confiable y sostenible
            en el ámbito de laboratorio.
          </p>
        </div>

        {/* Mision / Vision montadas sobre el borde inferior */}
        <div className={`container ${styles.mvWrap}`}>
          <div className={`lw-card ${styles.mvCard}`}>
            <h2 className={styles.mvTitle}>Misión</h2>
            <p className={styles.mvText}>
              LWM es un factor clave para el desarrollo de la industria y el laboratorio, ya
              que ofrecemos soluciones e ingenierías innovadoras para todos nuestros usuarios
              tanto en la parte operativa como en la parte científica. Ponemos nuestra
              experiencia en tus manos y no solo es un producto, damos una solución a la
              problemática del día a día.
            </p>
          </div>
          <div className={`lw-card ${styles.mvCard}`}>
            <h2 className={styles.mvTitle}>Visión</h2>
            <p className={styles.mvText}>
              Consolidarnos como una de las mejores empresas en el suministro de materiales,
              equipos y servicios de la industria nacional, asegurando la satisfacción de
              cada uno de nuestros clientes y socios comerciales, logrando esto solo con
              nuestra respuesta inmediata y la amplia experiencia.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className={`container ${styles.valores}`} aria-labelledby="valores-title">
        <div className={styles.valoresCol}>
          <h2 id="valores-title" className={`lw-heading ${styles.valoresTitle}`}>Valores LWM</h2>
          <div className={styles.valoresGrid}>
            {VALORES.map((v) => (
              <div key={v.title} className={`lw-card ${styles.valorCard}`}>
                <i className={`bi ${v.icon} ${styles.valorIcon}`} aria-hidden="true" />
                <h3 className={styles.valorTitle}>{v.title}</h3>
                <p className={styles.valorText}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.valoresVisual} aria-hidden="true">
          <span className={`${styles.frame} ${styles.frameBlue}`} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/laborwasser/labor-wasser-redesign-hero.webp" alt="" className={styles.valoresPhoto} loading="lazy" />
          <span className={`${styles.frame} ${styles.frameGreen}`} />
        </div>
      </section>

      <PorQueComprar />
    </>
  )
}
