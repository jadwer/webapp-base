'use client'

/**
 * POR QUE COMPRAR CON NOSOTROS (rediseno 2026-08)
 *
 * Izquierda: foto con doble marco decorativo escalonado (azul atras, verde
 * delante). Derecha: titulo con "comprar" resaltado, dos parrafos y dos
 * llamados (junta 2026-10-30): "Compra ahora" lleva al catalogo y "Quiero que
 * me contacten" abre el offcanvas de contacto. Absorbe el CTA de la seccion
 * "Necesitas una cotizacion?", que el rediseno elimina.
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
              ¿Por qué <span className="lw-highlight">comprar</span> con nosotros?
            </h2>
            <p className={styles.text}>
              Combinamos experiencia técnica, tecnología de vanguardia y un servicio
              personalizado para ofrecer soluciones confiables en laboratorio, industria
              y tratamiento de agua. Además, trabajamos con marcas líderes a nivel
              nacional e internacional, brindando productos de alta calidad que
              garantizan precisión, confiabilidad y desempeño.
            </p>
            <p className={styles.text}>
              Nuestro equipo está listo para brindarte asesoría especializada y ayudarte
              a encontrar la mejor opción para tu laboratorio o industria. Compra en línea
              cuando quieras o déjanos tus datos y un asesor se pondrá en contacto contigo.
            </p>
            <div className={styles.actions}>
              <Link href="/productos" className="btn lw-btn lw-btn-brand">
                ¡Compra ahora!
              </Link>
              <button
                type="button"
                className="btn lw-btn lw-btn-brand-outline"
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
              >
                Quiero que me contacten
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
