/**
 * CATÁLOGOS PDF
 * Página para descargar catálogos PDF de productos por marca/categoría
 */

import { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Catálogos PDF - Labor Wasser de México',
  description: 'Descarga nuestros catálogos PDF de productos para laboratorio. Reactivos, equipos, consumibles y más de las marcas líderes del sector.',
  keywords: 'catálogos laboratorio, PDF productos, reactivos químicos, equipos laboratorio, descarga catálogo',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Catálogos PDF - Labor Wasser de México',
    description: 'Descarga catálogos de productos para laboratorio de las marcas líderes.',
    type: 'website',
    locale: 'es_MX',
  },
}

interface Catalog {
  id: string
  name: string
  brand: string
  description: string
  fileSize: string
  pages: number
  year: number
  category: 'reactivos' | 'equipos' | 'consumibles' | 'general'
  downloadUrl: string
  thumbnailIcon: string
}

const catalogs: Catalog[] = [
  {
    id: 'merck-2026',
    name: 'Catálogo General Merck 2026',
    brand: 'Merck / MilliporeSigma',
    description: 'Catálogo completo de reactivos químicos, estándares de referencia, solventes y materiales para cromatografía.',
    fileSize: '45 MB',
    pages: 1200,
    year: 2026,
    category: 'reactivos',
    downloadUrl: '/catalogos/merck-catalogo-2026.pdf',
    thumbnailIcon: 'bi-flask',
  },
  {
    id: 'fisher-2026',
    name: 'Fisher Scientific Chemicals',
    brand: 'Fisher Scientific',
    description: 'Reactivos analíticos, solventes grado HPLC, ácidos y bases de alta pureza.',
    fileSize: '32 MB',
    pages: 850,
    year: 2026,
    category: 'reactivos',
    downloadUrl: '/catalogos/fisher-chemicals-2026.pdf',
    thumbnailIcon: 'bi-droplet',
  },
  {
    id: 'vwr-lab-essentials',
    name: 'VWR Lab Essentials',
    brand: 'VWR International',
    description: 'Consumibles esenciales para laboratorio: puntas, tubos, placas, guantes y material desechable.',
    fileSize: '18 MB',
    pages: 420,
    year: 2026,
    category: 'consumibles',
    downloadUrl: '/catalogos/vwr-lab-essentials-2026.pdf',
    thumbnailIcon: 'bi-box-seam',
  },
  {
    id: 'hach-water-analysis',
    name: 'Hach Water Analysis',
    brand: 'Hach Company',
    description: 'Equipos y reactivos para análisis de agua: colorímetros, turbidímetros, medidores multiparamétricos.',
    fileSize: '25 MB',
    pages: 320,
    year: 2026,
    category: 'equipos',
    downloadUrl: '/catalogos/hach-water-analysis-2026.pdf',
    thumbnailIcon: 'bi-moisture',
  },
  {
    id: 'thermo-lab-equipment',
    name: 'Thermo Scientific Lab Equipment',
    brand: 'Thermo Fisher Scientific',
    description: 'Centrífugas, incubadoras, baños, agitadores, espectrofotómetros y equipos de laboratorio.',
    fileSize: '38 MB',
    pages: 680,
    year: 2026,
    category: 'equipos',
    downloadUrl: '/catalogos/thermo-lab-equipment-2026.pdf',
    thumbnailIcon: 'bi-cpu',
  },
  {
    id: 'corning-labware',
    name: 'Corning Labware & Life Sciences',
    brand: 'Corning',
    description: 'Cristalería de laboratorio, plásticos, cultivo celular y productos para ciencias de la vida.',
    fileSize: '22 MB',
    pages: 480,
    year: 2026,
    category: 'consumibles',
    downloadUrl: '/catalogos/corning-labware-2026.pdf',
    thumbnailIcon: 'bi-clipboard2-pulse',
  },
  {
    id: 'laborwasser-general',
    name: 'Catálogo General Labor Wasser',
    brand: 'Labor Wasser de México',
    description: 'Catálogo completo con todas las líneas de productos que distribuimos. Incluye referencias cruzadas.',
    fileSize: '85 MB',
    pages: 2400,
    year: 2026,
    category: 'general',
    downloadUrl: '/catalogos/laborwasser-catalogo-general-2026.pdf',
    thumbnailIcon: 'bi-journal-richtext',
  },
  {
    id: 'laborwasser-precios',
    name: 'Lista de Precios Actualizada',
    brand: 'Labor Wasser de México',
    description: 'Lista de precios vigente para clientes. Precios sujetos a cambios sin previo aviso.',
    fileSize: '5 MB',
    pages: 180,
    year: 2026,
    category: 'general',
    downloadUrl: '/catalogos/laborwasser-lista-precios-2026.pdf',
    thumbnailIcon: 'bi-currency-dollar',
  },
]

const categoryLabels: Record<Catalog['category'], string> = {
  general: 'Catálogos Generales',
  reactivos: 'Reactivos y Químicos',
  equipos: 'Equipos de Laboratorio',
  consumibles: 'Consumibles y Material',
}

const categoryIcons: Record<Catalog['category'], string> = {
  general: 'bi-book',
  reactivos: 'bi-flask',
  equipos: 'bi-gear',
  consumibles: 'bi-box',
}

export default function CatalogosPage() {
  const groupedCatalogs = catalogs.reduce((acc, catalog) => {
    if (!acc[catalog.category]) {
      acc[catalog.category] = []
    }
    acc[catalog.category].push(catalog)
    return acc
  }, {} as Record<Catalog['category'], Catalog[]>)

  const categoryOrder: Catalog['category'][] = ['general', 'reactivos', 'equipos', 'consumibles']

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Catálogos PDF</h1>
          <p className={styles.subtitle}>
            Descarga nuestros catálogos completos con especificaciones técnicas, fichas de seguridad
            y toda la información que necesitas para seleccionar los productos adecuados.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.notice}>
          <i className="bi bi-info-circle"></i>
          <p>
            <strong>Nota:</strong> Para precios actualizados y disponibilidad en tiempo real,
            te recomendamos consultar nuestro{' '}
            <Link href="/productos">catálogo en línea</Link> o{' '}
            <Link href="/cart">solicitar una cotización</Link>.
          </p>
        </div>

        {categoryOrder.map((category) => {
          const items = groupedCatalogs[category]
          if (!items || items.length === 0) return null

          return (
            <section key={category} className={styles.section}>
              <div className={styles.sectionHeader}>
                <i className={`bi ${categoryIcons[category]}`}></i>
                <h2>{categoryLabels[category]}</h2>
              </div>

              <div className={styles.grid}>
                {items.map((catalog) => (
                  <article key={catalog.id} className={styles.card}>
                    <div className={styles.cardIcon}>
                      <i className={`bi ${catalog.thumbnailIcon}`}></i>
                    </div>
                    <div className={styles.cardContent}>
                      <h3>{catalog.name}</h3>
                      <p className={styles.brand}>{catalog.brand}</p>
                      <p className={styles.description}>{catalog.description}</p>
                      <div className={styles.meta}>
                        <span><i className="bi bi-file-earmark-pdf"></i> {catalog.fileSize}</span>
                        <span><i className="bi bi-journal-text"></i> {catalog.pages} págs.</span>
                        <span><i className="bi bi-calendar3"></i> {catalog.year}</span>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <a
                        href={catalog.downloadUrl}
                        className={styles.downloadButton}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <i className="bi bi-download"></i>
                        Descargar PDF
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        <section className={styles.requestSection}>
          <div className={styles.requestContent}>
            <i className="bi bi-envelope-paper"></i>
            <div>
              <h2>¿Necesitas un catálogo específico?</h2>
              <p>
                Si buscas un catálogo de alguna marca o línea de productos que no está listada,
                contáctanos y te lo enviaremos por correo electrónico.
              </p>
            </div>
            <a href="mailto:ventas@laborwasser.mx?subject=Solicitud de catálogo" className={styles.requestButton}>
              <i className="bi bi-envelope"></i>
              Solicitar Catálogo
            </a>
          </div>
        </section>

        <section className={styles.helpSection}>
          <h2>¿Cómo usar nuestros catálogos?</h2>
          <div className={styles.helpGrid}>
            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                <i className="bi bi-search"></i>
              </div>
              <h3>Buscar por código</h3>
              <p>Usa Ctrl+F (Cmd+F en Mac) para buscar por número de catálogo, nombre o CAS number.</p>
            </div>
            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                <i className="bi bi-cart-plus"></i>
              </div>
              <h3>Agregar a cotización</h3>
              <p>Anota los códigos de producto y agrégalos a tu carrito en nuestro catálogo en línea.</p>
            </div>
            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                <i className="bi bi-headset"></i>
              </div>
              <h3>Asesoría técnica</h3>
              <p>¿Dudas sobre especificaciones? Nuestro equipo técnico puede orientarte.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
