'use client'

/**
 * LANDING PRODUCT CARD (rediseno 2026-08)
 *
 * Tarjeta de producto del home, compartida por "Ofertas del mes" y "Nuevos
 * productos". Una sola pieza, dos variantes:
 *   - offer: badge "Oferta", Modelo + precio, boton "Comprar ahora"
 *   - new:   badge "Nuevo", marca + categoria, subtitulo, Modelo + precio,
 *            botones "Ver detalles" + "Cotizar"
 *
 * Consume EnhancedPublicProduct (@lwm/ecommerce) directo, sin adaptadores
 * legados. Las acciones (carrito, cotizar) las inyecta el padre para que la
 * tarjeta no conozca el flujo; asi se reutiliza en cualquier listado.
 */

import React from 'react'
import Link from 'next/link'
import type { EnhancedPublicProduct } from '@lwm/ecommerce'
import styles from './LandingProductCard.module.scss'

export type LandingProductCardVariant = 'offer' | 'new' | 'catalog'

export interface LandingProductCardProps {
  product: EnhancedPublicProduct
  variant: LandingProductCardVariant
  /** "Comprar ahora" (offer) / "Agregar" (catalog) */
  onAddToCart?: (product: EnhancedPublicProduct) => void
  /** "Cotizar" (new/catalog) */
  onRequestQuote?: (product: EnhancedPublicProduct) => void
  /** horizontal = vista lista del catalogo (imagen izquierda) */
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

/**
 * Precio como lo pinta el Figma: "$15 USD + IVA" / "$1,943 + IVA".
 * Sin decimales cuando son .00, con 2 cuando no. La moneda solo se muestra
 * si NO es MXN (para el mercado local es ruido).
 */
export function formatLandingPrice(product: EnhancedPublicProduct): string | null {
  const price = product.attributes.price
  if (price === null || price === undefined) return null
  const hasCents = Math.round(price * 100) % 100 !== 0
  const amount = price.toLocaleString('es-MX', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })
  const currency = product.displayCurrency && product.displayCurrency !== 'MXN'
    ? ` ${product.displayCurrency}`
    : ''
  const iva = product.attributes.iva ? ' + IVA' : ''
  return `$${amount}${currency}${iva}`
}

export const LandingProductCard: React.FC<LandingProductCardProps> = ({
  product,
  variant,
  onAddToCart,
  onRequestQuote,
  orientation = 'vertical',
  className,
}) => {
  const detailHref = `/productos/${product.id}`
  const price = formatLandingPrice(product)
  const sku = product.attributes.sku
  const imageUrl = product.attributes.imageUrl
  const isOffer = variant === 'offer'
  const isCatalog = variant === 'catalog'
  // Catalogo: badge solo cuando el producto ESTA en oferta; home siempre
  const showBadge = !isCatalog || product.attributes.isOnSale
  // Regla de acciones del catalogo: comprable (tiene precio) = Cotizar
  // outline + Agregar solido; sin precio = Ver detalles + Cotizar
  const purchasable = product.attributes.price !== null && product.attributes.price !== undefined

  return (
    <article
      className={`lw-card lw-card-hover ${styles.card} ${orientation === 'horizontal' ? styles.horizontal : ''} ${isCatalog ? styles.catalog : ''} ${className || ''}`}
    >
      {/* Imagen + badge */}
      <Link href={detailHref} className={styles.media} aria-label={product.displayName}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.displayName}
            className={styles.image}
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget
              el.style.display = 'none'
              const ph = el.nextElementSibling as HTMLElement | null
              if (ph) ph.style.display = ''
            }}
          />
        ) : null}
        <div className={styles.placeholder} style={imageUrl ? { display: 'none' } : undefined}>
          <i className="bi bi-box-seam" aria-hidden="true" />
        </div>
        {showBadge && (
          <span className={`lw-badge ${styles.badge}`}>
            {(isOffer || isCatalog) && <i className="bi bi-tag" aria-hidden="true" />}
            {isOffer || isCatalog ? 'Oferta' : 'Nuevo'}
          </span>
        )}
      </Link>

      <div className={styles.body}>
        {(variant === 'new' || isCatalog) && (
          <div className={styles.meta}>
            <span className={styles.brand}>{product.displayBrand || product.brand?.attributes.name || 'Labor Wasser'}</span>
            <span className={styles.category}>{product.displayCategory || product.category?.attributes.name || 'General'}</span>
          </div>
        )}

        <h3 className={styles.name}>
          <Link href={detailHref}>{product.displayName}</Link>
        </h3>

        {(variant === 'new' || isCatalog) && product.attributes.description && (
          <p className={styles.subtitle}>{product.attributes.description}</p>
        )}

        <div className={styles.facts}>
          <span className={styles.model}>
            {sku ? <>Modelo: {sku}</> : <>&nbsp;</>}
          </span>
          {price && <span className={styles.price}>{price}</span>}
        </div>

        <div className={`${styles.actions} ${isOffer ? styles.actionsCenter : ''}`}>
          {isCatalog ? (
            purchasable ? (
              <>
                <button
                  type="button"
                  className="btn lw-btn lw-btn-sm lw-btn-accent-outline"
                  onClick={() => onRequestQuote?.(product)}
                  disabled={!onRequestQuote}
                >
                  Cotizar
                </button>
                <button
                  type="button"
                  className="btn lw-btn lw-btn-sm lw-btn-accent"
                  onClick={() => onAddToCart?.(product)}
                  disabled={!onAddToCart}
                >
                  <i className="bi bi-cart3 me-2" aria-hidden="true" />
                  Agregar
                </button>
              </>
            ) : (
              <>
                <Link href={detailHref} className="btn lw-btn lw-btn-sm lw-btn-accent-outline">
                  Ver detalles
                </Link>
                <button
                  type="button"
                  className="btn lw-btn lw-btn-sm lw-btn-accent"
                  onClick={() => onRequestQuote?.(product)}
                  disabled={!onRequestQuote}
                >
                  Cotizar
                </button>
              </>
            )
          ) : isOffer ? (
            <button
              type="button"
              className="btn lw-btn lw-btn-accent"
              onClick={() => onAddToCart?.(product)}
              disabled={!onAddToCart}
            >
              Comprar ahora
            </button>
          ) : (
            <>
              <Link href={detailHref} className="btn lw-btn lw-btn-sm lw-btn-accent-outline">
                Ver detalles
              </Link>
              <button
                type="button"
                className="btn lw-btn lw-btn-sm lw-btn-accent"
                onClick={() => onRequestQuote?.(product)}
                disabled={!onRequestQuote}
              >
                Cotizar
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

/** Esqueleto de carga con la misma geometria (evita saltos de layout). */
export const LandingProductCardSkeleton: React.FC<{ variant: LandingProductCardVariant }> = ({ variant }) => (
  <div className={`lw-card ${styles.card}`} aria-hidden="true">
    <div className={`${styles.media} ${styles.skeletonMedia}`} />
    <div className={styles.body}>
      {variant === 'new' && <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />}
      <div className={styles.skeletonLine} />
      <div className={`${styles.skeletonLine} ${styles.skeletonMedium}`} />
      <div className={styles.facts}>
        <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
      </div>
      <div className={`${styles.actions} ${variant === 'offer' ? styles.actionsCenter : ''}`}>
        <div className={styles.skeletonButton} />
        {variant === 'new' && <div className={styles.skeletonButton} />}
      </div>
    </div>
  </div>
)

export default LandingProductCard
