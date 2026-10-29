'use client'

/**
 * /catalogos (junta 2026-10-30): antes caia en la pagina generica del page
 * builder, sin el diseno del sitio y sin PDF reales. Mientras LWM entrega los
 * PDF, la pagina avisa y manda al catalogo en linea o al contacto. Cuando
 * lleguen, la lista va en CATALOGS (los enlaces .pdf bajo /catalogos ya se
 * miden como 'catalog_download' en GA4).
 */

import Link from 'next/link'
import { CatalogHero } from '@/modules/catalog'
import styles from './catalogos.module.scss'

const CATALOGS: ReadonlyArray<{ name: string; file: string }> = []

export default function CatalogosClient() {
  return (
    <>
      <CatalogHero title="Catálogos en PDF" subtitle="Descarga los catálogos de nuestras líneas de producto" />

      <section className={`container ${styles.section}`} aria-labelledby="catalogos-title">
        {CATALOGS.length > 0 ? (
          <>
            <h2 id="catalogos-title" className={`lw-heading ${styles.title}`}>
              Descarga nuestros <span className="lw-highlight">catálogos</span>
            </h2>
            <ul className={styles.list}>
              {CATALOGS.map((c) => (
                <li key={c.file} className={`lw-card lw-card-hover ${styles.card}`}>
                  <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                  <span>{c.name}</span>
                  <a href={c.file} className="btn lw-btn lw-btn-brand" download>Descargar</a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={`lw-card ${styles.empty}`}>
            <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
            <h2 id="catalogos-title" className={`lw-heading ${styles.title}`}>
              Estamos preparando nuestros <span className="lw-highlight">catálogos</span>
            </h2>
            <p>
              Muy pronto podrás descargarlos aquí. Mientras tanto, consulta el catálogo en
              línea con precios y existencias, o pide a un asesor el catálogo de la marca
              que necesitas.
            </p>
            <div className={styles.actions}>
              <Link href="/productos" className="btn lw-btn lw-btn-brand">Ver catálogo en línea</Link>
              <button
                type="button"
                className="btn lw-btn lw-btn-brand-outline"
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
              >
                Pedir un catálogo
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
