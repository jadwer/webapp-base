'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Hero.module.scss'

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                MEJORAMOS EL <span className={styles.heroTitleHighlight}>MUNDO</span>
                <br />
                DE TU <span className={styles.heroTitleHighlight}>LABORATORIO</span>
              </h1>
              <div className={styles.heroActions}>
                <Link href="/productos" className={styles.heroCta}>
                  Ver Productos
                  <i className="bi bi-arrow-right ms-2" />
                </Link>
                <Link href="#cotizacion" className={styles.heroSecondary}>
                  Cotizar Ahora
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-5 d-none d-lg-block">
            <div className={styles.heroImage}>
              <Image
                src="/images/laborwasser/labor-wasser-contacto.svg"
                alt="Labor Wasser de Mexico - Equipos de Laboratorio"
                width={400}
                height={300}
                className={styles.heroImageMain}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className={styles.heroBackground}>
        <div className={styles.heroShape1}></div>
        <div className={styles.heroShape2}></div>
      </div>
    </section>
  )
}