import React from 'react'
import clsx from 'clsx'
import styles from './redesign.module.scss'

export interface LwPaginationProps {
  page: number
  lastPage: number
  perPage: number
  total?: number
  onPage: (page: number) => void
  onPerPage?: (perPage: number) => void
  perPageOptions?: number[]
}

function pageList(page: number, last: number): Array<number | '...'> {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const out: Array<number | '...'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(last - 1, page + 1)
  if (start > 2) out.push('...')
  for (let p = start; p <= end; p++) out.push(p)
  if (end < last - 1) out.push('...')
  out.push(last)
  return out
}

/** Paginacion del rediseno: "Mostrando [10] resultados" y "Anterior 01 02 ... Siguiente". */
export function LwPagination({ page, lastPage, perPage, total, onPage, onPerPage, perPageOptions = [10, 20, 50, 100] }: LwPaginationProps) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className={clsx(styles.pager, 'mt-3')}>
      <div className="d-flex align-items-center gap-2">
        <span>Mostrando</span>
        {onPerPage ? (
          <select
            className={clsx('form-select form-select-sm', styles.pagerSize)}
            value={perPage}
            aria-label="Resultados por página"
            onChange={(e) => onPerPage(Number(e.target.value))}
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        ) : (
          <strong>{perPage}</strong>
        )}
        <span>resultados{typeof total === 'number' ? ` de ${total}` : ''}</span>
      </div>
      {lastPage > 1 ? (
        <nav className="d-flex align-items-center gap-1" aria-label="Paginación">
          <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <i className="bi bi-chevron-left" aria-hidden="true" /> Anterior
          </button>
          {pageList(page, lastPage).map((p, i) =>
            p === '...' ? (
              <span key={`gap-${i}`} className="px-1">...</span>
            ) : (
              <button
                key={p}
                type="button"
                className={clsx(styles.pageBtn, p === page && styles.pageBtnActive)}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onPage(p)}
              >
                {pad(p)}
              </button>
            )
          )}
          <button type="button" className={styles.pageBtn} disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
            Siguiente <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  )
}
