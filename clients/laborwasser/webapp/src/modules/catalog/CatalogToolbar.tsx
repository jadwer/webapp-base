'use client'

/**
 * CATALOG TOOLBAR (rediseno 2026-08)
 * Titulo "Todos nuestros productos" + fila de busqueda (debounced),
 * "Ordenar por:" y toggles de vista grid/lista, sobre el motor.
 */

import React, { useEffect, useState } from 'react'
import type { PublicCatalogController } from '@lwm/ecommerce'
import type { PublicProductSortField, SortDirection } from '@lwm/ecommerce'
import styles from './CatalogToolbar.module.scss'

const SORT_OPTIONS: { value: string; label: string; field: PublicProductSortField; direction: SortDirection }[] = [
  { value: 'name-asc', label: 'Nombre (A-Z)', field: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Nombre (Z-A)', field: 'name', direction: 'desc' },
  { value: 'price-asc', label: 'Precio: menor a mayor', field: 'price', direction: 'asc' },
  { value: 'price-desc', label: 'Precio: mayor a menor', field: 'price', direction: 'desc' },
  { value: 'createdAt-desc', label: 'Mas recientes', field: 'createdAt', direction: 'desc' },
]

export const CatalogToolbar: React.FC<{ controller: PublicCatalogController }> = ({ controller }) => {
  const { filters, sortField, sortDirection, viewMode, handleFiltersChange, handleSortChange, handleViewModeChange } = controller
  const [search, setSearch] = useState(filters.search || '')

  // Busqueda con debounce de 400ms para no disparar un fetch por tecla
  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters.search || '') !== search.trim()) {
        handleFiltersChange({ ...filters, search: search.trim() || undefined })
      }
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Sincronizar si el filtro cambia desde fuera (chips, limpiar)
  useEffect(() => { setSearch(filters.search || '') }, [filters.search])

  const sortValue = `${sortField}-${sortDirection}`

  return (
    <div className={styles.toolbar}>
      <h2 className={`lw-heading ${styles.title}`}>Todos nuestros productos</h2>
      <div className={styles.controls}>
        <div className={styles.search}>
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar producto en el catalogo"
          />
        </div>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>Ordenar por:</span>
          <select
            className={styles.sortSelect}
            value={sortValue}
            onChange={(e) => {
              const opt = SORT_OPTIONS.find((o) => o.value === e.target.value)
              if (opt) handleSortChange(opt.field, opt.direction)
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <div className={styles.views} role="group" aria-label="Modo de vista">
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
            onClick={() => handleViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Vista de cuadricula"
          >
            <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
            onClick={() => handleViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="Vista de lista"
          >
            <i className="bi bi-list-ul" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CatalogToolbar
