'use client'

/**
 * LISTADO DE CATALOGOS (categorias, marcas y unidades) con la piel del rediseno (Figma
 * "Diseno final - Productos", 2026-11-17). Una sola pieza para los tres: tabla o tarjetas
 * (las dos vistas del diseno; decision de Gabino), buscador, "N productos" que abre el
 * listado de productos ya filtrado, estatus y acciones. Cada pagina pone sus datos, sus
 * acciones extra (activar o desactivar, actualizar precios) y sus columnas propias.
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LwSurface, LwPageTitle, LwPagination, LwTableWrap, LwStatusPill, LwIconButton } from '@lwm/ui'
import { useProductsUIStore } from '../store/productsUIStore'
import type { ProductFilters } from '../types'

export interface CatalogItem {
  id: string
  name: string
  /** Segunda linea del nombre: slug o codigo */
  sub?: string
  /** Columna de detalle: descripcion o tipo */
  detail?: string
  createdAt?: string
  productsCount?: number
  /** undefined = el catalogo no maneja estatus (unidades) */
  isActive?: boolean
}

export interface CatalogAdminPageProps {
  title: string
  subtitle: string
  /** Singular en minusculas: "categoría", "marca", "unidad" */
  noun: string
  /** Plural para el total: "categorías", "marcas", "unidades" */
  nounPlural: string
  /** Encabezado de la columna de nombre y de detalle */
  nameHeader: string
  detailHeader: string
  icon: string
  basePath: string
  /** Filtro de productos que abre "N productos" */
  productsFilter: (id: string) => ProductFilters
  items: CatalogItem[]
  total?: number
  page: number
  lastPage: number
  perPage: number
  onPage: (page: number) => void
  onPerPage: (n: number) => void
  isLoading: boolean
  error?: unknown
  search: string
  onSearch: (term: string) => void
  viewMode: 'table' | 'grid'
  onViewMode: (mode: 'table' | 'grid') => void
  onRefresh: () => void
  onDelete: (item: CatalogItem) => void
  onToggleActive?: (item: CatalogItem) => void
  /** Botones extra junto a "Nueva ..." (p. ej. Actualizar precios) */
  extraActions?: React.ReactNode
}

const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export const CatalogAdminPage: React.FC<CatalogAdminPageProps> = (props) => {
  const router = useRouter()
  const { setFilters } = useProductsUIStore()
  const [term, setTerm] = useState(props.search)
  const [updatedAt, setUpdatedAt] = useState(() => new Date())
  const { items, noun, basePath, viewMode } = props
  const withStatus = items.some((i) => i.isActive !== undefined)
  const offset = (props.page - 1) * props.perPage

  const openProducts = (item: CatalogItem) => {
    setFilters(props.productsFilter(item.id))
    router.push('/dashboard/products')
  }

  const status = (i: CatalogItem) => (i.isActive === undefined ? null : (
    <LwStatusPill tone={i.isActive ? 'success' : 'neutral'}>{i.isActive ? 'Activa' : 'Inactiva'}</LwStatusPill>
  ))
  const products = (i: CatalogItem) => (
    <button type="button" className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => openProducts(i)} disabled={!i.productsCount}>
      {(i.productsCount ?? 0).toLocaleString('es-MX')} {i.productsCount === 1 ? 'producto' : 'productos'}
    </button>
  )
  const actions = (i: CatalogItem) => (
    <>
      <LwIconButton icon="bi-eye" label={`Consultar ${noun} ${i.name}`} onClick={() => router.push(`${basePath}/${i.id}`)} />
      <LwIconButton icon="bi-pencil" label={`Editar ${noun} ${i.name}`} onClick={() => router.push(`${basePath}/${i.id}/edit`)} />
      {props.onToggleActive && i.isActive !== undefined ? (
        <LwIconButton icon={i.isActive ? 'bi-toggle-on' : 'bi-toggle-off'} label={`${i.isActive ? 'Desactivar' : 'Activar'} ${noun} ${i.name}`} onClick={() => props.onToggleActive?.(i)} />
      ) : null}
      <LwIconButton icon="bi-trash" label={`Eliminar ${noun} ${i.name}`} onClick={() => props.onDelete(i)} />
    </>
  )
  const empty = props.search ? `No se encontró ninguna ${noun} con esa búsqueda` : `Todavía no hay ${props.nounPlural}`

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title={props.title}
          subtitle={<>{props.subtitle} {props.total != null ? <span className="small text-muted ms-1">{props.total.toLocaleString('es-MX')} {props.nounPlural} en total</span> : null}</>}
        />

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-5">
            <form onSubmit={(e) => { e.preventDefault(); props.onSearch(term.trim()) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder={`Buscar ${noun}...`}
                  aria-label={`Buscar ${noun}`}
                  value={term}
                  onChange={(e) => { setTerm(e.target.value); if (e.target.value === '' && props.search) props.onSearch('') }}
                />
              </div>
            </form>
          </div>
          <div className="col d-flex flex-wrap justify-content-end align-items-center gap-2">
            <div className="btn-group" role="group" aria-label="Vista">
              <button type="button" className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`} aria-pressed={viewMode === 'grid'} title="Vista de tarjetas" onClick={() => props.onViewMode('grid')}><i className="bi bi-grid" aria-hidden="true" /><span className="visually-hidden">Tarjetas</span></button>
              <button type="button" className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`} aria-pressed={viewMode === 'table'} title="Vista de tabla" onClick={() => props.onViewMode('table')}><i className="bi bi-list-ul" aria-hidden="true" /><span className="visually-hidden">Tabla</span></button>
            </div>
            <Link href={`${basePath}/create`} className="btn btn-primary"><i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nueva {noun}</Link>
            {props.extraActions}
            <div className="text-end">
              <button type="button" className="btn btn-primary" onClick={() => { props.onRefresh(); setUpdatedAt(new Date()) }} disabled={props.isLoading}>
                <i className="bi bi-arrow-repeat me-1" aria-hidden="true" /> Actualizar
              </button>
              <div className="small text-muted">Últ. act.: {updatedAt.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {props.error ? <div className="alert alert-danger" role="alert">No se pudieron cargar las {props.nounPlural}. Intenta de nuevo con Actualizar.</div> : null}

        {viewMode === 'table' ? (
          <LwTableWrap>
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th className="text-center">No.</th>
                  <th>{props.nameHeader}</th>
                  <th>{props.detailHeader}</th>
                  <th>Creación</th>
                  <th className="text-center">Productos</th>
                  {withStatus ? <th>Estatus</th> : null}
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {props.isLoading && items.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">Cargando…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">{empty}</td></tr>
                ) : items.map((i, n) => (
                  <tr key={i.id}>
                    <td className="text-center text-muted">{String(offset + n + 1).padStart(2, '0')}</td>
                    <td>
                      <Link href={`${basePath}/${i.id}`} className="text-reset">{i.name}</Link>
                      {i.sub ? <div className="small text-muted">{i.sub}</div> : null}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 320 }}>{i.detail || <span className="text-muted">—</span>}</td>
                    <td className="text-nowrap small">{fmtDate(i.createdAt)}</td>
                    <td className="text-center">{products(i)}</td>
                    {withStatus ? <td>{status(i)}</td> : null}
                    <td className="text-center text-nowrap">{actions(i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </LwTableWrap>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {items.length === 0 && !props.isLoading ? <div className="col-12 text-center text-muted py-4">{empty}</div> : items.map((i) => (
              <div className="col" key={i.id}>
                <div className="border rounded h-100 p-3 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <i className={`bi ${props.icon} fs-3 text-primary`} aria-hidden="true" />
                    {status(i)}
                  </div>
                  <Link href={`${basePath}/${i.id}`} className="text-reset fw-semibold">{i.name}</Link>
                  {i.sub ? <div className="small text-primary">{i.sub}</div> : null}
                  <div className="small text-muted mb-2">{i.detail}</div>
                  <div className="d-flex justify-content-between align-items-center mt-auto small">
                    <span className="text-muted">{fmtDate(i.createdAt)}</span>
                    {products(i)}
                  </div>
                  <div className="d-flex justify-content-center gap-1 border-top pt-2 mt-2">{actions(i)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <LwPagination page={props.page} lastPage={props.lastPage} perPage={props.perPage} total={props.total} onPage={props.onPage} onPerPage={props.onPerPage} />
      </LwSurface>
    </div>
  )
}

export default CatalogAdminPage
