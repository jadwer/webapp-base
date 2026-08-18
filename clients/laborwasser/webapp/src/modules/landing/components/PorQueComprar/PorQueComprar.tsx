'use client'

/**
 * POR QUE COMPRAR CON NOSOTROS (rediseno 2026-08)
 *
 * Izquierda: foto con doble marco decorativo escalonado (azul atras, verde
 * delante). Derecha: titulo con "comprar" resaltado, dos parrafos y botones
 * "Conocer mas de nosotros" (outline) + "Cotizar ahora" (solido, abre el
 * offcanvas de contacto como el resto de los CTA de cotizacion del home).
 * Absorbe el CTA de la seccion "Necesitas una cotizacion?", que el rediseno
 * elimina.
 */

import React from 'react'
import Link from 'next/link'
import styles from './PorQueComprar.module.scss'

export const PorQueComprar: React.FC = () => {
  return (
    <section className={styles.section} aria-labelledby="porque-title">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.visual} aria-hidden="true">
            <span className={`${styles.frame} ${styles.frameBlue}`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/laborwasser/labor-wasser-redesign-porque.webp"
              alt=""
              className={styles.photo}
              loading="lazy"
              decoding="async"
            />
            <span className={`${styles.frame} ${styles.frameGreen}`} />
          </div>

          <div className={styles.copy}>
            <h2 id="porque-title" className={`lw-heading ${styles.title}`}>
              ¿Por que <span className="lw-highlight">comprar</span> con nosotros?
            </h2>
            <p className={styles.text}>
              Combinamos experiencia tecnica, tecnologia de vanguardia y un servicio
              personalizado para ofrecer soluciones confiables en laboratorio, industria
              y tratamiento de agua. Ademas, trabajamos con marcas lideres a nivel
              nacional e internacional, brindando productos de alta calidad que
              garantizan precision, confiabilidad y desempeno.
            </p>
            <p className={styles.text}>
              Nuestro equipo esta listo para brindarte asesoria especializada y ayudarte
              a encontrar la mejor opcion para tu laboratorio o industria. Contactanos
              para conocer mas sobre nosotros o solicitar una cotizacion personalizada.
            </p>
            <div className={styles.actions}>
              <Link href="/nosotros" className="btn lw-btn lw-btn-brand-outline">
                Conocer mas de nosotros
              </Link>
              <button
                type="button"
                className="btn lw-btn lw-btn-brand"
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
              >
                Cotizar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
