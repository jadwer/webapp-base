'use client'

/**
 * CATALOG SIDEBAR (rediseno 2026-08)
 *
 * Filtros del catalogo sobre el motor usePublicCatalogController:
 * chips de filtros activos (removibles), grupos colapsables de Categorias
 * (con "Mostrar mas"), Marcas, Unidades y Rango de precios (Todos /
 * Ofertas / buckets + min-max), y boton "Limpiar filtros".
 * Componente controlado: recibe estado y handlers del controller.
 */

import React, { useMemo, useState } from 'react'
import type { PublicCatalogController } from '@lwm/ecommerce'
import styles from './CatalogSidebar.module.scss'

const VISIBLE_OPTIONS = 6

// Buckets del Figma; el ultimo es abierto hasta el max del input
const PRICE_BUCKETS = [
  { label: '$0 - $200', min: 0, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: '$500 - $800', min: 500, max: 800 },
  { label: '$800 - $1000', min: 800, max: 1000 },
] as const

function toIds(value?: string | string[]): string[] {
  return Array.isArray(value) ? value : value ? [value] : []
}

interface GroupProps {
  title: string
  children: React.ReactNode
}

const Group: React.FC<GroupProps> = ({ title, children }) => {
  const [open, setOpen] = useState(true)
  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
      </button>
      {open && <div className={styles.groupBody}>{children}</div>}
    </div>
  )
}

interface OptionListProps {
  options: { value: string; label: string; count?: number }[]
  selected: string[]
  onToggle: (value: string) => void
}

const OptionList: React.FC<OptionListProps> = ({ options, selected, onToggle }) => {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? options : options.slice(0, VISIBLE_OPTIONS)
  return (
    <>
      {visible.map((o) => (
        <label key={o.value} className={styles.option}>
          <input
            type="checkbox"
            className="form-check-input"
            checked={selected.includes(o.value)}
            onChange={() => onToggle(o.value)}
          />
          <span className={styles.optionLabel}>{o.label}</span>
          {o.count !== undefined && <span className={styles.optionCount}>({o.count})</span>}
        </label>
      ))}
      {options.length > VISIBLE_OPTIONS && (
        <button type="button" className={styles.showMore} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Mostrar menos' : 'Mostrar mas'}
        </button>
      )}
    </>
  )
}

export const CatalogSidebar: React.FC<{ controller: PublicCatalogController }> = ({ controller }) => {
  const { filters, categories, brands, units, handleFiltersChange, handleClearFilters } = controller

  const selCats = toIds(filters.categoryId)
  const selBrands = toIds(filters.brandId)
  const selUnits = toIds(filters.unitId)

  const toggle = (key: 'categoryId' | 'brandId' | 'unitId', current: string[]) => (value: string) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    handleFiltersChange({ ...filters, [key]: next.length ? next : undefined })
  }

  const activeBucket = PRICE_BUCKETS.find((b) => filters.priceMin === b.min && filters.priceMax === b.max)
  const allPrices = filters.priceMin === undefined && filters.priceMax === undefined && !filters.isOnSale

  const setBucket = (b?: (typeof PRICE_BUCKETS)[number]) => {
    handleFiltersChange({
      ...filters,
      isOnSale: undefined,
      priceMin: b?.min,
      priceMax: b?.max,
    })
  }

  // Chips de filtros activos (Figma: pastillas con X arriba del sidebar)
  const chips = useMemo(() => {
    const list: { key: string; label: string; remove: () => void }[] = []
    const nameOf = (opts: { value: string; label: string }[], id: string) =>
      opts.find((o) => o.value === id)?.label || id
    selCats.forEach((id) => list.push({
      key: `c-${id}`, label: nameOf(categories, id),
      remove: () => toggle('categoryId', selCats)(id),
    }))
    selBrands.forEach((id) => list.push({
      key: `b-${id}`, label: nameOf(brands, id),
      remove: () => toggle('brandId', selBrands)(id),
    }))
    selUnits.forEach((id) => list.push({
      key: `u-${id}`, label: nameOf(units, id),
      remove: () => toggle('unitId', selUnits)(id),
    }))
    if (filters.isOnSale) list.push({
      key: 'sale', label: 'Ofertas',
      remove: () => handleFiltersChange({ ...filters, isOnSale: undefined }),
    })
    if (activeBucket) list.push({
      key: 'price', label: activeBucket.label,
      remove: () => setBucket(undefined),
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, categories, brands, units])

  return (
    <aside className={styles.sidebar} aria-label="Filtros del catalogo">
      <div className={styles.header}>
        <span className={styles.headerTitle}>Filtros</span>
        <button type="button" className={`btn lw-btn lw-btn-sm lw-btn-accent ${styles.clearBtn}`} onClick={handleClearFilters}>
          Limpiar filtros
        </button>
      </div>

      {chips.length > 0 && (
        <div className={styles.chips}>
          {chips.map((chip) => (
            <button key={chip.key} type="button" className={styles.chip} onClick={chip.remove}>
              {chip.label}
              <i className="bi bi-x" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <Group title="Categorias">
        <OptionList options={categories} selected={selCats} onToggle={toggle('categoryId', selCats)} />
      </Group>

      <Group title="Marcas">
        <OptionList options={brands} selected={selBrands} onToggle={toggle('brandId', selBrands)} />
      </Group>

      <Group title="Unidades">
        <OptionList options={units} selected={selUnits} onToggle={toggle('unitId', selUnits)} />
      </Group>

      <Group title="Rango de precios">
        <label className={styles.option}>
          <input type="checkbox" className="form-check-input" checked={allPrices} onChange={() => setBucket(undefined)} />
          <span className={styles.optionLabel}>Todos los precios</span>
        </label>
        <label className={styles.option}>
          <input
            type="checkbox"
            className="form-check-input"
            checked={!!filters.isOnSale}
            onChange={() => handleFiltersChange({ ...filters, isOnSale: filters.isOnSale ? undefined : true })}
          />
          <span className={styles.optionLabel}>Ofertas</span>
        </label>
        {PRICE_BUCKETS.map((b) => (
          <label key={b.label} className={styles.option}>
            <input
              type="checkbox"
              className="form-check-input"
              checked={activeBucket?.label === b.label}
              onChange={() => setBucket(activeBucket?.label === b.label ? undefined : b)}
            />
            <span className={styles.optionLabel}>{b.label}</span>
          </label>
        ))}
        <div className={styles.priceInputs}>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Min $0"
            min={0}
            value={filters.priceMin ?? ''}
            onChange={(e) => handleFiltersChange({ ...filters, priceMin: e.target.value === '' ? undefined : Number(e.target.value) })}
            aria-label="Precio minimo"
          />
          <span className={styles.priceDash} aria-hidden="true" />
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Max $50000"
            min={0}
            value={filters.priceMax ?? ''}
            onChange={(e) => handleFiltersChange({ ...filters, priceMax: e.target.value === '' ? undefined : Number(e.target.value) })}
            aria-label="Precio maximo"
          />
        </div>
      </Group>
    </aside>
  )
}

export default CatalogSidebar
