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

const ProductGrid: React.FC<GridProps> = ({ products, isLoading, badge = null, skeletons = 4 }) => {
  const actions = useCardActions()
  return (
    <div className="row g-4">
      {isLoading && products.length === 0
        ? Array.from({ length: skeletons }).map((_, i) => (
            <div key={i} className="col-6 col-lg-3"><PortalProductCardSkeleton /></div>
          ))
        : products.map((product) => (
            <div key={product.id} className="col-6 col-lg-3">
              <PortalProductCard product={product} badge={badge} {...actions} />
            </div>
          ))}
    </div>
  )
}

const LiveChip = () => <span className={s.liveChip}>En vivo</span>

export const OffersSection: React.FC = () => {
  const { products, isLoading, error } = useSaleProducts(4, INCLUDE)
  if (!isLoading && (error || products.length === 0)) return null

  return (
    <section className={s.section} aria-labelledby="pl-ofertas">
      <div className="container">
        <div className={s.sectionHeader}>
          <div>
            <span className={s.eyebrow}>La tienda funcionando</span>
            <h2 id="pl-ofertas">Ofertas del mes <LiveChip /></h2>
            <p>Precio anterior tachado y vigencia por producto; se configuran desde el sistema.</p>
          </div>
          <Link href="/ofertas" className={s.linkMore}>Ver todas las ofertas <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </div>
        <ProductGrid products={products} isLoading={isLoading} badge="offer" />
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
    <section className={s.section} aria-labelledby="pl-granel">
      <div className="container">
        <div className={s.bulkBand}>
          <div className={s.sectionHeader}>
            <div>
              <span className={s.eyebrow}>Granel</span>
              <h2 id="pl-granel">Productos a granel, por cotización</h2>
              <p>
                Sin precio fijo: el cliente pide cotización según el volumen y el granel se
                fracciona en presentaciones que sí se venden en la tienda.
              </p>
            </div>
          </div>
          <ProductGrid products={bulk} isLoading={false} />
        </div>
      </div>
    </section>
  )
}
