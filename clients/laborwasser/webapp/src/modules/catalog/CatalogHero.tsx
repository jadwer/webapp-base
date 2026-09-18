'use client'

/**
 * CATALOG HERO (rediseno 2026-08)
 * Banda superior del catalogo: gradiente celeste a blanco, badge verde,
 * titulo y subtitulo en navy de marca. Textos fijos del Figma por defecto;
 * la pagina de categoria (SEO 2026-09-18) manda su nombre como h1 y su
 * descripcion (editable desde el dashboard) como texto propio.
 */

import React from 'react'
import styles from './CatalogHero.module.scss'

export interface CatalogHeroProps {
  title?: string
  subtitle?: string
  /** Texto descriptivo de la categoria (viene de categories.description). */
  description?: string | null
}

export const CatalogHero: React.FC<CatalogHeroProps> = ({
  title = 'Productos y equipos de laboratorio',
  subtitle = 'Más de 20 años brindando soluciones confiables para su éxito',
  description,
}) => (
  <section className={styles.hero}>
    <div className="container text-center">
      <span className={`lw-badge ${styles.badge}`}>Calidad, Innovación y confianza</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{description && description.trim() !== '' ? description : subtitle}</p>
    </div>
  </section>
)

export default CatalogHero
