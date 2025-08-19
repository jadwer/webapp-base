'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import styles from './Hero.module.scss'

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                MEJORAMOS EL
                <br />
                <span className={styles.heroTitleHighlight}>RENDIMIENTO</span>
              </h1>
              <p className={styles.heroDescription}>
                Somos distribuidores especializados en reactivos y material de laboratorio 
                con más de 20 años de experiencia brindando soluciones de calidad para 
                instituciones educativas, empresas y gobierno.
              </p>
              <div className={styles.heroActions}>
                <Button 
                  variant="success" 
                  size="large"
                  className={styles.heroCta}
                >
                  Ver Productos
                  <i className="bi bi-arrow-right ms-2" />
                </Button>
                <Button 
                  variant="secondary" 
                  buttonStyle="outline"
                  size="large"
                  className={styles.heroSecondary}
                >
                  Cotizar Ahora
                </Button>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className={styles.heroImage}>
              {/* Hero image placeholder - will be replaced with actual image */}
              <div className={styles.heroImagePlaceholder}>
                <div className={styles.heroImageContent}>
                  <i className="bi bi-flask" />
                  <span>Laboratorio Profesional</span>
                </div>
              </div>
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