'use client'

import React from 'react'
import styles from './PorQueComprar.module.scss'

interface Benefit {
  icon: string
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    icon: 'bi-shield-check',
    title: 'Calidad Garantizada',
    description: 'Productos certificados con los más altos estándares de calidad internacional para garantizar resultados precisos.'
  },
  {
    icon: 'bi-truck',
    title: 'Envío Rápido',
    description: 'Entrega en toda la República Mexicana con tiempos de respuesta que se adaptan a tus necesidades urgentes.'
  },
  {
    icon: 'bi-people',
    title: 'Asesoría Especializada',
    description: 'Equipo técnico especializado que te brinda soporte y recomendaciones para optimizar tus procesos de laboratorio.'
  },
  {
    icon: 'bi-award',
    title: '+20 Años de Experiencia',
    description: 'Respaldo de más de dos décadas sirviendo a instituciones educativas, empresas privadas y sector gubernamental.'
  }
]

export const PorQueComprar: React.FC = () => {
  return (
    <section className={styles.porQueComprar}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>¿Por qué comprar con nosotros?</h2>
              <p className={styles.sectionDescription}>
                Somos líderes en el sector por nuestra dedicación a la excelencia y el servicio personalizado. 
                Nuestro compromiso es proporcionarte las mejores soluciones para que empresas comerciales con tecnologías de vanguardia, trabajemos de la mano en tu crecimiento constante, brindándote los recursos de calidad y la asesoría especializada que necesitas para destacar en tu área de trabajo con productos de marcas reconocidas mundialmente.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {benefits.map((benefit, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-4">
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <i className={benefit.icon} />
                </div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p className={styles.benefitDescription}>{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="row">
          <div className="col-12">
            <div className={styles.statsSection}>
              <div className="row">
                <div className="col-lg-3 col-md-6 col-sm-6 mb-4">
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>5000+</div>
                    <div className={styles.statLabel}>Productos</div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 mb-4">
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>1200+</div>
                    <div className={styles.statLabel}>Clientes Satisfechos</div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 mb-4">
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>50+</div>
                    <div className={styles.statLabel}>Marcas Reconocidas</div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 mb-4">
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>24/7</div>
                    <div className={styles.statLabel}>Soporte Técnico</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}