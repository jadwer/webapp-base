'use client'

/**
 * GESTION DE PRODUCTOS con la piel del rediseno (Figma "Diseno final - Productos",
 * 2026-11-17). Decisiones de Gabino: dos vistas (tabla y tarjetas, se retiran lista,
 * compacto y showcase) y "Desactivar" cuando el backend no deja borrar un producto con
 * historia. Conserva lo que el diseno no dibuja: tipo de precio (granel, "Sujeto a
 * cotizacion") y su filtro. Stock y estatus son los reales (antes la tabla pintaba "N/A"
 * y "Activo" fijos): existencia sumada de include=stock e isActive.
 */

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmModal, LwSurface, LwPageTitle, LwPagination, LwTableWrap, LwStatusPill, LwIconButton, toast, type ConfirmModalHandle } from '@lwm/ui'
import { useProducts, useProductMutations, useBrands, useCategories, useUnits } from '../hooks'
import { useProductsUIStore, useProductsFilters, useProductsPage, useProductsViewMode } from '../store/productsUIStore'
import { BulkAssignCategoryDialog } from './BulkAssignCategoryDialog'
import { PricingTypeBadge } from './PricingTypeBadge'
import { requiresQuote, PRICING_TYPES, PRICING_TYPE_LABELS, type PricingType } from '../utils/pricingType'
import { formatPrice } from '../utils/formatting'
import type { Product, ProductFilters } from '../types'

const BASE = '/dashboard/products'
const PLACEHOLDER = '/images/product-placeholder.svg'

interface ApiErrorShape { response?: { status?: number; data?: { message?: string; errors?: Array<{ detail?: string; title?: string }> } }; message?: string }
const apiError = (err: unknown, fallback: string) => {
  const e = err as ApiErrorShape
  const first = e?.response?.data?.errors?.[0]
  return first?.detail || first?.title || e?.response?.data?.message || fallback
}

const qty = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 2 })

function Price({ product }: { product: Product }) {
  if (requiresQuote(product)) return <PricingTypeBadge short />
  const code = product.currency?.code || 'MXN'
  return (
    <span className="text-nowrap">
      {formatPrice(product.price ?? 0, code)} {code}
      {product.iva ? <span className="small text-muted ms-1">+IVA</span> : null}
    </span>
  )
}

function Stock({ product }: { product: Product }) {
  if (product.stockTotal === undefined) return <span className="text-muted">—</span>
  return (
    <span className={product.stockTotal <= 0 ? 'text-danger' : undefined}>
      {qty(product.stockTotal)}
      {product.unit?.name ? <span className="small text-muted d-block">{product.unit.name}</span> : null}
    </span>
  )
}

const Status = ({ product }: { product: Product }) => (
  <LwStatusPill tone={product.isActive ? 'success' : 'neutral'}>{product.isActive ? 'Activo' : 'Inactivo'}</LwStatusPill>
)

export const ProductsAdminPagePro = React.memo(() => {
  const router = useRouter()
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const filters = useProductsFilters()
  const page = useProductsPage()
  const viewMode = useProductsViewMode() === 'grid' ? 'grid' : 'table'
  const { setFilters, setPage, setViewMode, clearFilters } = useProductsUIStore()
  const [searchTerm, setSearchTerm] = useState(filters.name ?? '')
  const [updatedAt, setUpdatedAt] = useState(() => new Date())

  const { brands } = useBrands({ page: { number: 1, size: 200 } })
  const { categories } = useCategories({ page: { number: 1, size: 200 } })
  const { units } = useUnits({ page: { number: 1, size: 200 } })
  const { products, meta, isLoading, error, refresh } = useProducts({
    page: { number: page, size: perPage },
    filters,
    sort: { field: 'name', direction: 'asc' },
    include: ['unit', 'category', 'brand', 'currency', 'stock'],
  })
  const { deleteProduct, updateProduct } = useProductMutations()
  const pageMeta = (meta as { page?: { total?: number; lastPage?: number; currentPage?: number } } | undefined)?.page
  const total = pageMeta?.total

  const setFilter = (patch: Partial<ProductFilters>) => {
    const next = { ...filters, ...patch } as Record<string, unknown>
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] === undefined) delete next[k] })
    setFilters(next as ProductFilters)
  }
  const hasFilters = Object.keys(filters).length > 0
  const reload = async () => { await refresh(); setUpdatedAt(new Date()) }

  const handleDelete = async (product: Product) => {
    const ok = await confirmRef.current?.confirm(
      `Estás a punto de eliminar ${product.name}. No se podrá recuperar. ¿Deseas continuar?`,
      { title: 'Eliminar producto', confirmText: 'Eliminar', cancelText: 'Cancelar', confirmVariant: 'danger' },
    )
    if (!ok) return
    try {
      await deleteProduct(product.id)
      toast.success('Producto eliminado')
      await refresh()
    } catch (err) {
      // Con historia (movimientos, compras, cotizaciones) el backend no deja borrar:
      // se ofrece desactivar para sacarlo de la venta sin romper los historicos.
      if (!product.isActive) {
        toast.error(apiError(err, 'No se pudo eliminar el producto.'))
        return
      }
      const deactivate = await confirmRef.current?.confirm(
        `${product.name} tiene historia (movimientos, compras o cotizaciones) y no se puede eliminar. ¿Lo desactivas? Dejará de ofrecerse, pero su historia se conserva.`,
        { title: 'No se puede eliminar', confirmText: 'Desactivar', cancelText: 'Volver', confirmVariant: 'warning' },
      )
      if (!deactivate) return
      try {
        await updateProduct(product.id, { isActive: false })
        toast.success(`${product.name} quedó inactivo`)
        await refresh()
      } catch (err2) {
        toast.error(apiError(err2, 'No se pudo desactivar el producto.'))
      }
    }
  }

  const actions = (p: Product) => (
    <>
      <LwIconButton icon="bi-eye" label={`Consultar ${p.name}`} onClick={() => router.push(`${BASE}/${p.id}`)} />
      <LwIconButton icon="bi-pencil" label={`Editar ${p.name}`} onClick={() => router.push(`${BASE}/${p.id}/edit`)} />
      <LwIconButton icon="bi-trash" label={`Eliminar ${p.name}`} onClick={() => handleDelete(p)} />
    </>
  )
  const offset = (page - 1) * perPage

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Gestión de productos"
          subtitle={<>Administra los productos del sistema y web {total != null ? <span className="small text-muted ms-1">{total.toLocaleString('es-MX')} productos {hasFilters ? 'con estos filtros' : 'en total'}</span> : null}</>}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => setAssignOpen(true)}>
                <i className="bi bi-diagram-3 me-1" aria-hidden="true" /> Reasignar categoría por marca
              </button>
              <Link href={`${BASE}/create`} className="btn btn-primary">
                <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo producto
              </Link>
            </>
          }
        />

        <div className="row g-2 align-items-center mb-2">
          <div className="col-md-5">
            <form onSubmit={(e) => { e.preventDefault(); setFilter({ name: searchTerm.trim() || undefined }) }}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar producto por nombre o SKU..."
                  aria-label="Buscar producto"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value === '' && filters.name) setFilter({ name: undefined }) }}
                />
              </div>
            </form>
          </div>
        </div>
        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-auto">
            <select className="form-select" aria-label="Categoría" value={String(filters.categoryId ?? '')} onChange={(e) => setFilter({ categoryId: e.target.value || undefined })}>
              <option value="">Todas las categorías</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Marca" value={String(filters.brandId ?? '')} onChange={(e) => setFilter({ brandId: e.target.value || undefined })}>
              <option value="">Todas las marcas</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Unidad" value={String(filters.unitId ?? '')} onChange={(e) => setFilter({ unitId: e.target.value || undefined })}>
              <option value="">Todas las unidades</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" aria-label="Tipo de precio" value={String(filters.pricingType ?? '')} onChange={(e) => setFilter({ pricingType: (e.target.value || undefined) as PricingType | undefined })}>
              <option value="">Todos los precios</option>
              {PRICING_TYPES.map((t) => <option key={t} value={t}>{PRICING_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="col d-flex justify-content-end align-items-center gap-2">
            {hasFilters ? <button type="button" className="btn btn-link btn-sm" onClick={() => { clearFilters(); setSearchTerm('') }}>Limpiar filtros</button> : null}
            <div className="btn-group" role="group" aria-label="Vista">
              <button type="button" className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`} aria-pressed={viewMode === 'grid'} title="Vista de tarjetas" onClick={() => setViewMode('grid')}><i className="bi bi-grid" aria-hidden="true" /><span className="visually-hidden">Tarjetas</span></button>
              <button type="button" className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`} aria-pressed={viewMode === 'table'} title="Vista de tabla" onClick={() => setViewMode('table')}><i className="bi bi-list-ul" aria-hidden="true" /><span className="visually-hidden">Tabla</span></button>
            </div>
            <div className="text-end">
              <button type="button" className="btn btn-primary" onClick={reload} disabled={isLoading}>
                <i className="bi bi-arrow-repeat me-1" aria-hidden="true" /> Actualizar
              </button>
              <div className="small text-muted">Últ. act.: {updatedAt.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">No se pudieron cargar los productos. Intenta de nuevo con Actualizar.</div> : null}

        {viewMode === 'table' ? (
          <LwTableWrap>
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th className="text-center">No.</th>
                  <th className="text-center">Imagen</th>
                  <th>Producto</th>
                  <th className="text-end">Precio</th>
                  <th className="text-center">Stock</th>
                  <th>Estatus</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">Cargando productos…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">{hasFilters ? 'Producto no encontrado con esos filtros' : 'Todavía no hay productos'}</td></tr>
                ) : (
                  products.map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-center text-muted">{String(offset + i + 1).padStart(2, '0')}</td>
                      <td className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imgUrl || PLACEHOLDER} alt="" width={48} height={48} className="rounded border" style={{ objectFit: 'cover' }} />
                      </td>
                      <td style={{ maxWidth: 360 }}>
                        <Link href={`${BASE}/${p.id}`} className="text-reset d-block text-truncate">{p.name}</Link>
                        {p.sku ? <div className="small text-muted">SKU: {p.sku}</div> : null}
                        <div className="small text-muted text-truncate">{[p.category?.name, p.brand?.name].filter(Boolean).join(' - ')}</div>
                      </td>
                      <td className="text-end"><Price product={p} /></td>
                      <td className="text-center"><Stock product={p} /></td>
                      <td><Status product={p} /></td>
                      <td className="text-center text-nowrap">{actions(p)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </LwTableWrap>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {products.length === 0 && !isLoading ? (
              <div className="col-12 text-center text-muted py-4">{hasFilters ? 'Producto no encontrado con esos filtros' : 'Todavía no hay productos'}</div>
            ) : (
              products.map((p) => (
                <div className="col" key={p.id}>
                  <div className="border rounded h-100 p-3 d-flex flex-column">
                    <div className="d-flex justify-content-end"><Status product={p} /></div>
                    <div className="text-center my-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imgUrl || PLACEHOLDER} alt="" width={96} height={96} style={{ objectFit: 'contain' }} />
                    </div>
                    <Link href={`${BASE}/${p.id}`} className="text-reset fw-semibold" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</Link>
                    {p.sku ? <div className="small text-primary">SKU: {p.sku}</div> : null}
                    <div className="small text-muted mb-2">{[p.category?.name, p.brand?.name].filter(Boolean).join(' - ')}</div>
                    <div className="d-flex justify-content-between align-items-end mt-auto small">
                      <div><div className="text-muted">Precio</div><Price product={p} /></div>
                      <div className="text-end"><div className="text-muted">Stock</div><Stock product={p} /></div>
                    </div>
                    <div className="d-flex justify-content-center gap-1 border-top pt-2 mt-2">{actions(p)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <LwPagination
          page={pageMeta?.currentPage ?? page}
          lastPage={pageMeta?.lastPage ?? 1}
          perPage={perPage}
          total={total}
          onPage={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          onPerPage={(n) => { setPerPage(n); setPage(1) }}
        />
      </LwSurface>

      <BulkAssignCategoryDialog
        show={assignOpen}
        onHide={() => setAssignOpen(false)}
        brands={brands}
        categories={categories}
        onSuccess={(affected) => { refresh(); toast.success(`${affected} producto(s) reasignados`) }}
      />
      <ConfirmModal ref={confirmRef} />
    </div>
  )
})

ProductsAdminPagePro.displayName = 'ProductsAdminPagePro'

export default ProductsAdminPagePro
