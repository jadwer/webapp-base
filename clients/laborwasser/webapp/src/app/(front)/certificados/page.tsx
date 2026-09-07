'use client'

/**
 * /certificados (rediseno 2026-08; links restaurados 2026-09-07).
 *
 * La pagina correcta vivia en el sitio ANTERIOR al cutover (rescatada de
 * archive.org, captura 2025-08-06): un directorio donde "Consultar" abre el
 * PORTAL DE CERTIFICADOS/SDS DEL FABRICANTE (Fisher, Hach COA, Merck, BRAND,
 * VWR, USP...). El rediseno de agosto la reemplazo por links a WhatsApp y el
 * cliente lo reporto como regresion (junta 2026-09-01 + review 09-07).
 *
 * Se corrigen ademas dos defectos que el sitio viejo arrastraba: un
 * corrimiento de links a partir de Merck (Microbiologics apuntaba al portal
 * de Merck, etc.; aqui cada URL va con su marca duena por dominio) y el link
 * de Thermo que iba a UN certificado PDF suelto en vez del buscador.
 *
 * Marcas sin portal conocido conservan el fallback de WhatsApp con mensaje
 * prellenado (el numero sale de app-config).
 */

import React from 'react'
import { usePublicSettings } from '@lwm/app-config'
import { CatalogHero } from '@/modules/catalog'
import { PorQueComprar } from '@/modules/landing'
import styles from './certificados.module.scss'

// Marcas con logo disponible en public/images/laborwasser/logos/.
// certUrl = portal oficial de certificados/SDS del fabricante (restaurado
// del sitio pre-cutover via archive.org); sin certUrl = fallback WhatsApp.
const BRANDS: ReadonlyArray<{ slug: string; name: string; certUrl?: string }> = [
  { slug: 'apera-labor-wasser', name: 'Apera Instruments' },
  { slug: 'avantor-labor-wasser', name: 'Avantor', certUrl: 'https://cheminfo.avantorsciences.com/store/search/searchPartnersCertSds.jsp' },
  { slug: 'band-labor-wasser', name: 'Brand', certUrl: 'https://www.brand.de/es/servicio-de-ayuda/mi-producto' },
  { slug: 'bd-labor-wasser', name: 'BD', certUrl: 'https://regdocs.bd.com/regdocs/qcinfo' },
  { slug: 'biomerieux-labor-wasser', name: 'Biomerieux', certUrl: 'https://www.3eonline.com/EeeOnlinePortal/DesktopDefault.aspx' },
  { slug: 'condalab-labor-wasser', name: 'Condalab', certUrl: 'https://www.condalab.com/int/es/documentos' },
  { slug: 'dibico-labor-wasser', name: 'Dibico' },
  { slug: 'dwk-labor-wasser', name: 'DWK Life Sciences', certUrl: 'https://cert.dwk.com/login' },
  { slug: 'eisco-labor-wasser', name: 'Eisco', certUrl: 'https://www.eiscoindustrial.com/pages/glassware-certificates' },
  { slug: 'hach-labor-wasser', name: 'Hach', certUrl: 'https://app.hach.com/coaweb/customer_coa_request.asp' },
  { slug: 'hanna-labor-wasser', name: 'Hanna Instruments', certUrl: 'https://certificates.hannainst.com/vi' },
  { slug: 'high-purity-labor-wasser', name: 'High Purity' },
  { slug: 'honeywell-labor-wasser', name: 'Honeywell', certUrl: 'https://lab.honeywell.com/en/sds' },
  { slug: 'imparlab-labor-wasser', name: 'Imparlab' },
  { slug: 'jt-baker-labor-wasser', name: 'J.T. Baker' },
  { slug: 'cobetter-labor-wasser', name: 'Cobetter' },
  { slug: 'fisher', name: 'Fisher Scientific', certUrl: 'https://www.fishersci.com/us/en/catalog/search/certificates.html' },
  // URL heredada del sitio viejo (aterriza en el buscador de documentos de
  // Merck aunque el deep-link original ya caduco).
  { slug: 'merck-labor-wasser', name: 'Merck', certUrl: 'https://www.merckmillipore.com/MX/es/systempage.search.result.document.product.not.available.pagelet2-systempage.search.result.document.product.not.available' },
  { slug: 'meyer-labor-wasser', name: 'Meyer' },
  { slug: 'microbiologics-labor-wasser', name: 'Microbiologics', certUrl: 'https://www.microbiologics.com/certificate-of-analysis' },
  { slug: 'microflex-labor-wasser', name: 'Microflex' },
  { slug: 'micron-labor-wasser', name: 'Micron', certUrl: 'https://www.myronl.com/downloads/' },
  { slug: 'productos-quimicos-monterrey-labor-wasser', name: 'Productos Químicos Monterrey', certUrl: 'http://148.244.138.146:88/eCertPqm/' },
  { slug: 'thermo-labor-wasser', name: 'Thermo Scientific', certUrl: 'https://www.thermofisher.com/document-connect/document-connect.html' },
  { slug: 'toronto-labor-wasser', name: 'Toronto Research Chemicals', certUrl: 'https://www.lgcstandards.com/GB/en/search?q=trc&searchIn=documents%3Acoa' },
  { slug: 'usp-labor-wasser', name: 'USP', certUrl: 'https://store.usp.org/home' },
  { slug: 'vwr-labor-wasser', name: 'VWR', certUrl: 'https://us.vwr.com/store/search/searchCerts.jsp?tabId=certSearch' },
  { slug: 'whatman-labor-wasser', name: 'Whatman' },
  { slug: 'whirl-labor-wasser', name: 'Whirl-Pak', certUrl: 'https://www.whirl-pak.com/sterility-document/' },
] as const

export default function CertificadosPage() {
  const { get } = usePublicSettings()
  const whatsapp = get('company.whatsapp_number')

  // Fallback para marcas sin portal del fabricante
  const fallbackUrl = (brand: string) =>
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
                href={b.certUrl || fallbackUrl(b.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn lw-btn lw-btn-sm lw-btn-brand ${styles.btn}`}
                aria-label={b.certUrl ? `Consultar certificados de ${b.name} en el sitio del fabricante` : `Solicitar certificado de ${b.name} por WhatsApp`}
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
