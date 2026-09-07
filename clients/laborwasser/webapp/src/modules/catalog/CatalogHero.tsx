'use client'

/**
 * CATALOG HERO (rediseno 2026-08)
 * Banda superior del catalogo: gradiente celeste a blanco, badge verde,
 * titulo y subtitulo en navy de marca. Textos fijos del Figma.
 */

import React from 'react'
import styles from './CatalogHero.module.scss'

export const CatalogHero: React.FC = () => (
  <section className={styles.hero}>
    <div className="container text-center">
      <span className={`lw-badge ${styles.badge}`}>Calidad, Innovación y confianza</span>
      <h1 className={styles.title}>Productos y equipos de laboratorio</h1>
      <p className={styles.subtitle}>Más de 20 años brindando soluciones confiables para su éxito</p>
    </div>
  </section>
)

export default CatalogHero
