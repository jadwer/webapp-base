'use client'

/**
 * CATALOG PAGINATION (rediseno 2026-08)
 * Paginacion de pildoras: < 1 2 3 ... N > con la activa en azul solido.
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

export const CatalogPagination: React.FC<{ controller: PublicCatalogController }> = ({ controller }) => {
  const { meta, currentPage, handlePageChange } = controller
  if (!meta.lastPage || meta.lastPage <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="Paginacion del catalogo">
      <button
        type="button"
        className={styles.arrow}
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Pagina anterior"
      >
        <i className="bi bi-chevron-left" aria-hidden="true" />
      </button>
      {pageItems(currentPage, meta.lastPage).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">...</span>
        ) : (
          <button
            key={item}
            type="button"
            className={`${styles.page} ${item === currentPage ? styles.active : ''}`}
            onClick={() => handlePageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        className={styles.arrow}
        disabled={currentPage >= meta.lastPage}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Pagina siguiente"
      >
        <i className="bi bi-chevron-right" aria-hidden="true" />
      </button>
    </nav>
  )
}

export default CatalogPagination
