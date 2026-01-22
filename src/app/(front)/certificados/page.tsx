/**
 * CERTIFICADOS Y ACREDITACIONES
 * Página que muestra las certificaciones, acreditaciones y reconocimientos de la empresa
 */

import { Metadata } from 'next'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Certificaciones y Acreditaciones - Labor Wasser de México',
  description: 'Conoce las certificaciones, acreditaciones y reconocimientos que avalan la calidad de Labor Wasser de México como distribuidor autorizado de productos para laboratorio.',
  keywords: 'certificaciones laboratorio, ISO 9001, distribuidor autorizado, acreditaciones, calidad, México',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Certificaciones - Labor Wasser de México',
    description: 'Certificaciones y acreditaciones que avalan nuestra calidad.',
    type: 'website',
    locale: 'es_MX',
  },
}

interface Certificate {
  id: string
  name: string
  issuer: string
  description: string
  validUntil?: string
  icon: string
  category: 'quality' | 'authorization' | 'compliance' | 'recognition'
}

const certificates: Certificate[] = [
  {
    id: 'iso-9001',
    name: 'ISO 9001:2015',
    issuer: 'Bureau Veritas',
    description: 'Sistema de Gestión de Calidad certificado bajo estándares internacionales. Garantiza procesos consistentes y mejora continua en todas nuestras operaciones.',
    validUntil: 'Diciembre 2027',
    icon: 'bi-patch-check-fill',
    category: 'quality',
  },
  {
    id: 'cofepris',
    name: 'Licencia Sanitaria COFEPRIS',
    issuer: 'COFEPRIS',
    description: 'Autorización federal para la comercialización de reactivos, equipos y material de laboratorio para uso en salud e investigación.',
    validUntil: 'Vigente',
    icon: 'bi-hospital-fill',
    category: 'compliance',
  },
  {
    id: 'merck',
    name: 'Distribuidor Autorizado Merck',
    issuer: 'Merck KGaA',
    description: 'Distribuidor oficial de productos Merck (MilliporeSigma) para reactivos químicos, estándares de referencia y materiales para cromatografía.',
    icon: 'bi-award-fill',
    category: 'authorization',
  },
  {
    id: 'fisher',
    name: 'Distribuidor Autorizado Fisher Scientific',
    issuer: 'Thermo Fisher Scientific',
    description: 'Partner certificado para distribución de equipos, consumibles y reactivos Fisher Scientific en México.',
    icon: 'bi-award-fill',
    category: 'authorization',
  },
  {
    id: 'vwr',
    name: 'Distribuidor Autorizado VWR',
    issuer: 'VWR International',
    description: 'Distribuidor autorizado de la línea completa de productos VWR para laboratorios científicos e industriales.',
    icon: 'bi-award-fill',
    category: 'authorization',
  },
  {
    id: 'hach',
    name: 'Distribuidor Certificado Hach',
    issuer: 'Hach Company',
    description: 'Centro de servicio y distribución autorizado para equipos y reactivos de análisis de agua y calidad ambiental.',
    icon: 'bi-droplet-fill',
    category: 'authorization',
  },
  {
    id: 'imss',
    name: 'Padrón de Proveedores IMSS',
    issuer: 'Instituto Mexicano del Seguro Social',
    description: 'Proveedor registrado y autorizado para suministro de insumos a unidades médicas del sector salud público.',
    icon: 'bi-building-fill',
    category: 'compliance',
  },
  {
    id: 'repse',
    name: 'Registro REPSE',
    issuer: 'Secretaría del Trabajo y Previsión Social',
    description: 'Registro de Prestadoras de Servicios Especializados conforme a la reforma laboral de 2021.',
    validUntil: 'Vigente',
    icon: 'bi-file-earmark-check-fill',
    category: 'compliance',
  },
  {
    id: 'canacintra',
    name: 'Membresía CANACINTRA',
    issuer: 'Cámara Nacional de la Industria de Transformación',
    description: 'Miembro activo de CANACINTRA, participando en el desarrollo industrial del país.',
    icon: 'bi-people-fill',
    category: 'recognition',
  },
  {
    id: 'nom-059',
    name: 'Cumplimiento NOM-059-SSA1',
    issuer: 'Secretaría de Salud',
    description: 'Buenas prácticas de fabricación y manejo de insumos para la salud, garantizando la integridad de los productos.',
    icon: 'bi-shield-check',
    category: 'compliance',
  },
]

const categoryLabels: Record<Certificate['category'], string> = {
  quality: 'Certificaciones de Calidad',
  authorization: 'Distribuidores Autorizados',
  compliance: 'Cumplimiento Normativo',
  recognition: 'Reconocimientos',
}

const categoryDescriptions: Record<Certificate['category'], string> = {
  quality: 'Certificaciones internacionales que avalan nuestros procesos y sistemas de gestión.',
  authorization: 'Marcas líderes que nos han otorgado su confianza como distribuidores oficiales.',
  compliance: 'Cumplimiento con normativas y regulaciones mexicanas aplicables a nuestra industria.',
  recognition: 'Membresías y reconocimientos del sector industrial y empresarial.',
}

export default function CertificadosPage() {
  const groupedCertificates = certificates.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = []
    }
    acc[cert.category].push(cert)
    return acc
  }, {} as Record<Certificate['category'], Certificate[]>)

  const categoryOrder: Certificate['category'][] = ['quality', 'authorization', 'compliance', 'recognition']

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Certificaciones y Acreditaciones</h1>
          <p className={styles.subtitle}>
            Nuestro compromiso con la calidad está respaldado por certificaciones internacionales,
            autorizaciones de marcas líderes y cumplimiento normativo verificado.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {categoryOrder.map((category) => {
          const certs = groupedCertificates[category]
          if (!certs || certs.length === 0) return null

          return (
            <section key={category} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>{categoryLabels[category]}</h2>
                <p>{categoryDescriptions[category]}</p>
              </div>

              <div className={styles.grid}>
                {certs.map((cert) => (
                  <article key={cert.id} className={styles.card}>
                    <div className={styles.cardIcon}>
                      <i className={`bi ${cert.icon}`}></i>
                    </div>
                    <div className={styles.cardContent}>
                      <h3>{cert.name}</h3>
                      <p className={styles.issuer}>
                        <i className="bi bi-building"></i>
                        {cert.issuer}
                      </p>
                      <p className={styles.description}>{cert.description}</p>
                      {cert.validUntil && (
                        <p className={styles.validity}>
                          <i className="bi bi-calendar-check"></i>
                          Vigencia: {cert.validUntil}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2>¿Necesita verificar nuestras certificaciones?</h2>
            <p>
              Estamos comprometidos con la transparencia. Si requiere copias de nuestros certificados
              o constancias de autorización para sus procesos de auditoría o licitación, contáctenos.
            </p>
            <div className={styles.ctaButtons}>
              <a href="mailto:certificaciones@laborwasser.mx" className={styles.primaryButton}>
                <i className="bi bi-envelope-fill"></i>
                Solicitar Certificados
              </a>
              <a href="/contacto" className={styles.secondaryButton}>
                <i className="bi bi-telephone-fill"></i>
                Contactar
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
