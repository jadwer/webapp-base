'use client'

/**
 * CONSULTAR PRODUCTO con la piel del rediseno (Figma "Consultar producto", 2026-11-17):
 * los mismos campos del formulario en solo lectura y en el mismo orden, mas lo que el
 * diseno no dibuja (tipo de precio, oferta, visible en catalogo, galeria completa).
 */

import React from 'react'
import Link from 'next/link'
import { LwSurface, LwPageTitle, LwStatusPill } from '@lwm/ui'
import { useProduct } from '../hooks'
import { formatPrice } from '../utils/formatting'
import { requiresQuote, PRICING_TYPE_LABELS } from '../utils/pricingType'

const BASE = '/dashboard/products'
const PRODUCT_TYPE_LABEL: Record<string, string> = { finished: 'Terminado', raw_material: 'Materia prima', both: 'Ambos' }

function Field({ label, children, tall }: { label: string; children: React.ReactNode; tall?: boolean }) {
  return (
    <div>
      <div className="small text-muted mb-1">{label}</div>
      <div className="form-control bg-light" style={{ minHeight: tall ? 76 : 38, whiteSpace: 'pre-wrap' }}>{children}</div>
    </div>
  )
}

const Muted = ({ children }: { children: React.ReactNode }) => <span className="text-muted">{children}</span>
const yesNo = (v?: boolean) => (v ? 'Sí' : 'No')

export const ProductDetailView: React.FC<{ productId: string }> = ({ productId }) => {
  const { product: p, isLoading, error } = useProduct(productId, ['unit', 'category', 'brand', 'currency', 'images', 'stock'])

  if (isLoading) {
    return <div className="container-fluid py-5 text-center"><span className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando producto…</span></span></div>
  }
  if (error || !p) {
    return <div className="container-fluid py-4"><div className="alert alert-warning">{error ? 'No se pudo cargar el producto.' : 'No se encontró el producto.'}</div></div>
  }

  const code = p.currency?.code || 'MXN'
  const images = (p.images ?? []).filter((i) => i.imageUrl)
  const tax = p.taxRate === null || p.taxRate === undefined ? 'Exento' : `${p.taxRate}%`

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Consultar producto:"
          highlight={p.name}
          subtitle={
            <span className="d-inline-flex flex-wrap gap-2 align-items-center">
              <LwStatusPill tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Activo' : 'Inactivo'}</LwStatusPill>
              {p.isPublic === false ? <LwStatusPill tone="info">Interno (no sale en la tienda)</LwStatusPill> : null}
              {p.isOnSale ? <LwStatusPill tone="warning">En oferta{p.saleBadge ? `: ${p.saleBadge}` : ''}</LwStatusPill> : null}
            </span>
          }
          actions={<Link href={BASE} className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver</Link>}
        />

        <div className="row g-3">
          <div className="col-md-6"><Field label="Nombre del producto">{p.name}</Field></div>
          <div className="col-md-6"><Field label="SKU">{p.sku || <Muted>Sin SKU</Muted>}</Field></div>

          <div className="col-md-6">
            <div className="small text-muted mb-1">Imagen del producto</div>
            <div className="d-flex flex-wrap gap-2">
              {images.length ? images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.imageUrl ?? undefined} alt={img.altText || p.name} width={96} height={96} className={`rounded border ${img.isPrimary ? 'border-primary' : ''}`} style={{ objectFit: 'contain' }} />
              )) : p.imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imgUrl} alt={p.name} width={96} height={96} className="rounded border" style={{ objectFit: 'contain' }} />
              ) : <Muted>Sin imagen</Muted>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted mb-1">Hoja de datos</div>
            {p.datasheetUrl ? (
              <a href={p.datasheetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-file-earmark-pdf me-1" aria-hidden="true" /> {p.datasheetPath?.split('/').pop() || 'Ver hoja de datos'}
              </a>
            ) : <Muted>Sin hoja de datos</Muted>}
          </div>

          <div className="col-md-6"><Field label="Descripción corta" tall>{p.description || <Muted>Sin descripción</Muted>}</Field></div>
          <div className="col-md-6"><Field label="Descripción completa" tall>{p.fullDescription || <Muted>Sin descripción</Muted>}</Field></div>

          <div className="col-md-3"><Field label="Tipo de precio">{PRICING_TYPE_LABELS[p.pricingType ?? 'fixed']}</Field></div>
          <div className="col-md-3"><Field label="Precio de venta">{requiresQuote(p) ? <Muted>Sujeto a cotización</Muted> : `${formatPrice(p.price ?? 0, code)} ${code}`}</Field></div>
          <div className="col-md-3"><Field label="Costo">{p.cost != null ? `${formatPrice(p.cost, code)} ${code}` : <Muted>Sin costo</Muted>}</Field></div>
          <div className="col-md-3"><Field label="Moneda">{p.currency?.name || code}</Field></div>

          <div className="col-md-4"><Field label="Unidad de medida">{p.unit?.name || <Muted>Sin unidad</Muted>}</Field></div>
          <div className="col-md-4"><Field label="Categoría">{p.category?.name || <Muted>Sin categoría</Muted>}</Field></div>
          <div className="col-md-4"><Field label="Marca">{p.brand?.name || <Muted>Sin marca</Muted>}</Field></div>

          <div className="col-md-3"><Field label="IVA incluido">{yesNo(p.iva)}</Field></div>
          <div className="col-md-3"><Field label="Visible en catálogo público">{yesNo(p.isPublic !== false)}</Field></div>
          <div className="col-md-3"><Field label="En oferta">{yesNo(p.isOnSale)}</Field></div>
          <div className="col-md-3"><Field label="Existencia">{p.stockTotal !== undefined ? `${p.stockTotal.toLocaleString('es-MX')} ${p.unit?.name ?? ''}` : <Muted>Sin registro</Muted>}</Field></div>
        </div>

        <h2 className="h5 mt-4 mb-3">Datos fiscales (SAT)</h2>
        <div className="row g-3">
          <div className="col-md-6"><Field label="Clave Prod/Serv (SAT)">{p.satClaveProdServ || <Muted>Sin clave</Muted>}</Field></div>
          <div className="col-md-6"><Field label="Clave Unidad (SAT)">{p.satClaveUnidad || <Muted>Sin clave</Muted>}</Field></div>
          <div className="col-md-6"><Field label="Tipo de producto">{p.productType ? PRODUCT_TYPE_LABEL[p.productType] ?? p.productType : <Muted>Sin definir</Muted>}</Field></div>
          <div className="col-md-6"><Field label="IVA">{tax}</Field></div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link href={BASE} className="btn btn-outline-primary px-4">Volver</Link>
          <Link href={`${BASE}/${p.id}/edit`} className="btn btn-primary px-4">Ir a editar producto</Link>
        </div>
      </LwSurface>
    </div>
  )
}

export default ProductDetailView
