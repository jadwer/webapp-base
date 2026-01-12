'use client'

import React from 'react'
import styles from './PorQueComprar.module.scss'

// Estadisticas del sitio real de Labor Wasser de Mexico
const stats = [
  { number: '180k', label: 'Productos' },
  { number: '2k', label: 'Clientes' },
  { number: '27', label: 'Marcas' }
]

export const PorQueComprar: React.FC = () => {
  return (
    <section className={styles.porQueComprar}>
      <div className="container">
        {/* Stats section - basado en el sitio real */}
        <div className="row justify-content-center mb-5">
          {stats.map((stat, index) => (
            <div key={index} className="col-md-4 col-sm-4 mb-4 mb-md-0">
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Por que comprar section */}
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Por que comprar con nosotros?</h2>
              <p className={styles.sectionDescription}>
                Somos lideres en el sector por nuestra dedicacion a la excelencia y el servicio personalizado.
                Nuestro compromiso es proporcionarte las mejores soluciones para que empresas comerciales
                con tecnologias de vanguardia, trabajemos de la mano en tu crecimiento constante, brindandote
                los recursos de calidad y la asesoria especializada que necesitas para destacar en tu area
                de trabajo con productos de marcas reconocidas mundialmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
