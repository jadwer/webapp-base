'use client'

import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useLocalCart,
  usePublicCategories,
  usePublicProducts,
  usePublicProductsByCategory,
  useSaleProducts,
  type EnhancedPublicProduct,
} from '@lwm/ecommerce'
import { toast } from '@lwm/ui'
import { PortalProductCard, PortalProductCardSkeleton, type PortalCardBadge } from './PortalProductCard'
import s from '../PortalLanding.module.scss'

const INCLUDE = 'unit,category,brand,currency' as const

/** Carrito y cotizacion: mismo flujo que la tienda (cotizar = carrito + action=quote). */
export function useCardActions() {
  const { addToCart } = useLocalCart()
  const router = useRouter()

  const onAddToCart = useCallback((product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }, [addToCart])

  const onRequestQuote = useCallback((product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    router.push('/cart?action=quote')
  }, [addToCart, router])

  return { onAddToCart, onRequestQuote }
}

/** Ultimos productos publicados; de aqui salen tambien el heroe y el granel. */
export function useLatestPublicProducts(size = 24) {
  const sort = useMemo(() => [{ field: 'createdAt' as const, direction: 'desc' as const }], [])
  const pagination = useMemo(() => ({ size }), [size])
  return usePublicProducts(undefined, sort, pagination, INCLUDE, { revalidateOnFocus: false })
}

interface GridProps {
  products: EnhancedPublicProduct[]
  isLoading: boolean
  badge?: PortalCardBadge
  skeletons?: number
}

/**
 * Rejilla de tarjetas centrada: con menos de cuatro productos las tarjetas se
 * centran con ancho tope en vez de dejar columnas vacias a la derecha.
 */
const ProductGrid: React.FC<GridProps> = ({ products, isLoading, badge = null, skeletons = 4 }) => {
  const actions = useCardActions()
  return (
    <div className={s.productGrid}>
      {isLoading && products.length === 0
        ? Array.from({ length: skeletons }).map((_, i) => (
            <div key={i} className={s.productCell}><PortalProductCardSkeleton /></div>
          ))
        : products.map((product) => (
            <div key={product.id} className={s.productCell}>
              <PortalProductCard product={product} badge={badge} {...actions} />
            </div>
          ))}
    </div>
  )
}

interface ShowcaseProps extends GridProps {
  intro: React.ReactNode
  /** Variante de fondo del panel. */
  tone?: 'paper' | 'sand'
}

/**
 * Panel con texto y tarjetas. Con una o dos tarjetas (desktop) el texto va a
 * la izquierda y las tarjetas a la derecha con su ancho natural, asi el panel
 * queda lleno sin importar cuantas haya; con tres o mas el texto va arriba.
 */
const Showcase: React.FC<ShowcaseProps> = ({ intro, tone = 'paper', ...grid }) => {
  const count = grid.isLoading && grid.products.length === 0 ? (grid.skeletons ?? 4) : grid.products.length
  const split = count > 0 && count <= 2
  return (
    <div
      className={`${s.showcase} ${tone === 'sand' ? s.showcaseSand : ''} ${split ? s.showcaseSplit : ''}`}
      data-count={count}
    >
      <div className={s.showcaseIntro}>{intro}</div>
      <ProductGrid {...grid} />
    </div>
  )
}

const LiveChip = () => <span className={s.liveChip}>En vivo</span>

export const OffersSection: React.FC = () => {
  const { products, isLoading, error } = useSaleProducts(4, INCLUDE)
  if (!isLoading && (error || products.length === 0)) return null

  return (
    <section className={`${s.section} ${s.sectionTight}`} aria-labelledby="pl-ofertas">
      <div className="container">
        <Showcase
          products={products}
          isLoading={isLoading}
          badge="offer"
          skeletons={2}
          intro={
            <>
              <span className={s.eyebrow}>La tienda funcionando</span>
              <h2 id="pl-ofertas">Ofertas del mes <LiveChip /></h2>
              <p>Precio anterior tachado y vigencia por producto; se configuran desde el sistema.</p>
              <ul className={s.checkList}>
                <li><i className="bi bi-check2" aria-hidden="true" />Precio anterior tachado</li>
                <li><i className="bi bi-check2" aria-hidden="true" />Vigencia de inicio y fin</li>
                <li><i className="bi bi-check2" aria-hidden="true" />Precios + IVA claros</li>
              </ul>
              <Link href="/ofertas" className={s.linkMore}>Ver todas las ofertas <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
            </>
          }
        />
      </div>
    </section>
  )
}

export const FeaturedSection: React.FC = () => {
  const { categories } = usePublicCategories()
  const tabs = useMemo(
    () => categories.filter((c) => (c.productsCount ?? 0) > 0).slice(0, 5),
    [categories]
  )
  const [selected, setSelected] = useState<string | null>(null)
  const active = selected ?? tabs[0]?.id ?? null
  const pagination = useMemo(() => ({ size: 4 }), [])
  const { products, isLoading } = usePublicProductsByCategory(active, pagination, INCLUDE)

  if (tabs.length === 0) return null

  return (
    <section className={`${s.section} ${s.sectionAlt}`} aria-labelledby="pl-destacados">
      <div className="container">
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>Destacados</span>
            <h2 id="pl-destacados">Explora por categoría <LiveChip /></h2>
            <p>Tus clientes encuentran lo que buscan por categoría, marca o precio.</p>
          </div>
          <Link href="/productos" className={s.linkMore}>Ver catálogo completo <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </div>
        <div className={s.tabs} role="tablist" aria-label="Categorías">
          {tabs.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === active}
              className={s.tab}
              onClick={() => setSelected(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        {/* Sin categoria activa el hook trae todo el catalogo: esqueletos hasta tenerla. */}
        <ProductGrid products={active ? products : []} isLoading={isLoading || !active} />
      </div>
    </section>
  )
}

interface LatestProps {
  products: EnhancedPublicProduct[]
  isLoading: boolean
}

export const LatestSection: React.FC<LatestProps> = ({ products, isLoading }) => {
  const latest = useMemo(() => products.filter((p) => !p.isQuoteOnly).slice(0, 4), [products])
  if (!isLoading && latest.length === 0) return null

  return (
    <section className={s.section} aria-labelledby="pl-nuevos">
      <div className="container">
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>Recién agregados</span>
            <h2 id="pl-nuevos">Nuevos productos <LiveChip /></h2>
            <p>Lo último que se publicó en el catálogo, ordenado por fecha de alta.</p>
          </div>
          <Link href="/productos" className={s.linkMore}>Ver más <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </div>
        <ProductGrid products={latest} isLoading={isLoading} badge="new" />
      </div>
    </section>
  )
}

export const BulkSection: React.FC<LatestProps> = ({ products, isLoading }) => {
  const bulk = useMemo(() => products.filter((p) => p.isQuoteOnly).slice(0, 4), [products])
  if (isLoading || bulk.length === 0) return null

  return (
    <section className={`${s.section} ${s.sectionAlt}`} aria-labelledby="pl-granel">
      <div className="container">
        <Showcase
          products={bulk}
          isLoading={false}
          tone="sand"
          intro={
            <>
              <span className={s.eyebrow}>Granel</span>
              <h2 id="pl-granel">Productos a granel, por cotización</h2>
              <p>
                Sin precio fijo: el cliente pide cotización según el volumen y el granel se
                fracciona en presentaciones que sí se venden en la tienda.
              </p>
              <ul className={s.checkList}>
                <li><i className="bi bi-check2" aria-hidden="true" />Precio sujeto a cotización</li>
                <li><i className="bi bi-check2" aria-hidden="true" />Fraccionamiento a presentaciones</li>
              </ul>
            </>
          }
        />
      </div>
    </section>
  )
}
