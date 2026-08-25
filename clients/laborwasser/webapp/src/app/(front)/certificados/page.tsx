'use client'

/**
 * /certificados (rediseno 2026-08). La pagina NO existia (el nav la
 * linkeaba a un 404). Figma: hero del catalogo + "Conoce los certificados
 * de nuestras marcas" con grid de tarjetas de marca (logo + boton verde
 * Consultar) + cierre "Por que comprar".
 *
 * "Consultar" abre WhatsApp con mensaje prellenado pidiendo el certificado
 * de la marca (no existe todavia almacen de certificados por marca en el
 * backend; queda como deuda registrada). El numero sale de app-config.
 */

import React from 'react'
import { usePublicSettings } from '@lwm/app-config'
import { CatalogHero } from '@/modules/catalog'
import { PorQueComprar } from '@/modules/landing'
import styles from './certificados.module.scss'

// Marcas con logo disponible en public/images/laborwasser/logos/
const BRANDS = [
  { slug: 'apera-labor-wasser', name: 'Apera Instruments' },
  { slug: 'avantor-labor-wasser', name: 'Avantor' },
  { slug: 'band-labor-wasser', name: 'Brand' },
  { slug: 'bd-labor-wasser', name: 'BD' },
  { slug: 'biomerieux-labor-wasser', name: 'Biomerieux' },
  { slug: 'condalab-labor-wasser', name: 'Condalab' },
  { slug: 'dibico-labor-wasser', name: 'Dibico' },
  { slug: 'dwk-labor-wasser', name: 'DWK Life Sciences' },
  { slug: 'eisco-labor-wasser', name: 'Eisco' },
  { slug: 'hach-labor-wasser', name: 'Hach' },
  { slug: 'hanna-labor-wasser', name: 'Hanna Instruments' },
  { slug: 'high-purity-labor-wasser', name: 'High Purity' },
  { slug: 'honeywell-labor-wasser', name: 'Honeywell' },
  { slug: 'imparlab-labor-wasser', name: 'Imparlab' },
  { slug: 'jt-baker-labor-wasser', name: 'J.T. Baker' },
  { slug: 'cobetter-labor-wasser', name: 'Cobetter' },
  { slug: 'fisher', name: 'Fisher Scientific' },
  { slug: 'merck-labor-wasser', name: 'Merck' },
  { slug: 'meyer-labor-wasser', name: 'Meyer' },
  { slug: 'microbiologics-labor-wasser', name: 'Microbiologics' },
  { slug: 'microflex-labor-wasser', name: 'Microflex' },
  { slug: 'micron-labor-wasser', name: 'Micron' },
  { slug: 'productos-quimicos-monterrey-labor-wasser', name: 'Productos Quimicos Monterrey' },
  { slug: 'thermo-labor-wasser', name: 'Thermo Scientific' },
  { slug: 'toronto-labor-wasser', name: 'Toronto Research Chemicals' },
  { slug: 'usp-labor-wasser', name: 'USP' },
  { slug: 'vwr-labor-wasser', name: 'VWR' },
  { slug: 'whatman-labor-wasser', name: 'Whatman' },
  { slug: 'whirl-labor-wasser', name: 'Whirl-Pak' },
] as const

export default function CertificadosPage() {
  const { get } = usePublicSettings()
  const whatsapp = get('company.whatsapp_number')

  const consultUrl = (brand: string) =>
    whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, me interesa el certificado de la marca ${brand}.`)}`
      : `mailto:${get('company.email') || ''}?subject=${encodeURIComponent(`Certificado ${brand}`)}`

  return (
    <>
      <CatalogHero />

      <section className={`container ${styles.section}`} aria-labelledby="certs-title">
        <h2 id="certs-title" className={`lw-heading ${styles.title}`}>
          Conoce los certificados de nuestras <span className="lw-highlight">marcas</span>
        </h2>

        <div className={styles.grid}>
          {BRANDS.map((b) => (
            <div key={b.slug} className={`lw-card lw-card-hover ${styles.card}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/laborwasser/logos/${b.slug}.webp`}
                alt={b.name}
                className={styles.logo}
                loading="lazy"
              />
              <a
                href={consultUrl(b.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn lw-btn lw-btn-sm lw-btn-brand ${styles.btn}`}
              >
                Consultar
              </a>
            </div>
          ))}
        </div>
      </section>

      <PorQueComprar />
    </>
  )
}
