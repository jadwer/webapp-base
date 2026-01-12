'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './OfertasDelMes.module.scss'

interface OfertaProducto {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  precioUSD: number
  colorClass: 'blue1' | 'blue2' | 'blue3'
  link: string
}

// Ofertas estaticas basadas en el sitio real de Labor Wasser de Mexico
// Los enlaces usan busqueda por nombre para encontrar productos reales en el catalogo
const ofertasDelMes: OfertaProducto[] = [
  {
    id: '1',
    nombre: 'Guantes de Nitrilo Libre de Polvo',
    descripcion: 'Caja de 100 piezas, tallas disponibles: XS, S, M, L, XL. Ideales para laboratorio y uso industrial.',
    imagen: '/images/laborwasser/labor-wasser-guantes-nitrilo.webp',
    precioUSD: 9.80,
    colorClass: 'blue1',
    link: '/productos?search=guantes+nitrilo'
  },
  {
    id: '2',
    nombre: 'Viales de Digestion DQO',
    descripcion: 'Viales para determinacion de Demanda Quimica de Oxigeno. Rango de medicion configurable.',
    imagen: '/images/laborwasser/labor-wasser-mexico-viales-digestion-dqo.webp',
    precioUSD: 85.00,
    colorClass: 'blue2',
    link: '/productos?search=viales+dqo'
  },
  {
    id: '3',
    nombre: 'Kit de Frascos Tampon pH',
    descripcion: 'Kit completo de soluciones buffer para calibracion de medidores de pH. pH 4, 7 y 10.',
    imagen: '/images/laborwasser/labor-wasser-kit-frascos-tampon.webp',
    precioUSD: 45.00,
    colorClass: 'blue1',
    link: '/productos?search=tampon+ph'
  }
]

export const OfertasDelMes: React.FC = () => {
  return (
    <section className={styles.ofertas}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>OFERTAS DEL MES</h2>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          {ofertasDelMes.map((oferta) => (
            <div key={oferta.id} className="col-lg-4 col-md-6 mb-4">
              <Link href={oferta.link} className={styles.productCardLink}>
                <div className={`${styles.productCard} ${styles[oferta.colorClass]}`}>
                  <div className={styles.productImage}>
                    <Image
                      src={oferta.imagen}
                      alt={oferta.nombre}
                      width={280}
                      height={200}
                      className={styles.productImg}
                    />
                  </div>

                  <div className={styles.productContent}>
                    <h3 className={styles.productName}>
                      {oferta.nombre}
                    </h3>
                    <p className={styles.productDescription}>
                      {oferta.descripcion}
                    </p>

                    <div className={styles.productPricing}>
                      <span className={styles.precioLabel}>Desde</span>
                      <span className={styles.precio}>
                        ${oferta.precioUSD.toFixed(2)} USD
                      </span>
                      <span className={styles.iva}>+ IVA</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
