'use client'

/**
 * CATALOG PAGINATION (rediseno 2026-08)
 * Paginacion de pildoras: < 1 2 3 ... N > con la activa en azul solido.
 *
 * SEO 2026-09-18: cada pagina es un enlace real (?page=N, conservando
 * categoria y busqueda) para que el robot rastree todo el catalogo; el clic
 * humano sigue siendo instantaneo (estado del motor) y solo actualiza la URL
 * con replaceState. Un robot que aterriza en ?page=N recibe esa pagina
 * renderizada en servidor (ver app/(front)/productos/page.tsx).
 */

import React from 'react'
import type { PublicCatalogController } from '@lwm/ecommerce'
import styles from './CatalogPagination.module.scss'

/** 1, 2, 3, ..., N con elipsis alrededor de la pagina actual */
function pageItems(current: number, last: number): (number | 'gap')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages = new Set<number>([1, last, current - 1, current, current + 1])
  const list = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  let prev = 0
  for (const p of list) {
    if (p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

/**
 * URL de una pagina conservando categoria y busqueda. Se construye desde los
 * filtros del motor (no desde window.location) para que el HTML de servidor
 * ya traiga los enlaces correctos: el robot no ejecuta JavaScript.
 */
export function pageHref(page: number, filters: { categoryId?: string | string[]; search?: string }): string {
  const params = new URLSearchParams()
  const categoryId = Array.isArray(filters.categoryId) ? filters.categoryId[0] : filters.categoryId
  if (filters.search) params.set('search', filters.search)
  if (categoryId) params.set('categoryId', categoryId)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return `/productos${qs ? `?${qs}` : ''}`
}

export const CatalogPagination: React.FC<{ controller: PublicCatalogController }> = ({ controller }) => {
  const { meta, currentPage, handlePageChange, filters } = controller
  if (!meta.lastPage || meta.lastPage <= 1) return null

  const hrefOf = (page: number) => pageHref(page, { categoryId: filters.categoryId, search: filters.search })
  const go = (page: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    handlePageChange(page)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', hrefOf(page))
  }

  return (
    <nav className={styles.pagination} aria-label="Paginación del catálogo">
      {currentPage > 1 ? (
        <a href={hrefOf(currentPage - 1)} className={styles.arrow} onClick={go(currentPage - 1)} aria-label="Página anterior">
          <i className="bi bi-chevron-left" aria-hidden="true" />
        </a>
      ) : (
        <span className={styles.arrow} aria-disabled="true"><i className="bi bi-chevron-left" aria-hidden="true" /></span>
      )}
      {pageItems(currentPage, meta.lastPage).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">...</span>
        ) : (
          <a
            key={item}
            href={hrefOf(item)}
            className={`${styles.page} ${item === currentPage ? styles.active : ''}`}
            onClick={go(item)}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </a>
        )
      )}
      {currentPage < meta.lastPage ? (
        <a href={hrefOf(currentPage + 1)} className={styles.arrow} onClick={go(currentPage + 1)} aria-label="Página siguiente">
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </a>
      ) : (
        <span className={styles.arrow} aria-disabled="true"><i className="bi bi-chevron-right" aria-hidden="true" /></span>
      )}
    </nav>
  )
}

export default CatalogPagination
