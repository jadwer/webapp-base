'use client'

import React from 'react'
import Link from 'next/link'
import { productPath, type EnhancedPublicProduct } from '@lwm/ecommerce'
import { QUOTE_ONLY_LABEL, requiresQuote } from '@lwm/products/pricing'
import s from '../PortalLanding.module.scss'

export type PortalCardBadge = 'offer' | 'new' | null

interface PortalProductCardProps {
  product: EnhancedPublicProduct
  badge?: PortalCardBadge
  onAddToCart: (product: EnhancedPublicProduct) => void
  onRequestQuote: (product: EnhancedPublicProduct) => void
}

const money = (value: number) =>
  `$${value.toLocaleString('es-MX', {
    minimumFractionDigits: Math.round(value * 100) % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`

/**
 * Tarjeta de producto de la landing. Misma regla de acciones que la tienda:
 * con precio se compra (y se puede cotizar); sujeto a cotizacion solo se
 * cotiza, nunca muestra precio.
 */
export const PortalProductCard: React.FC<PortalProductCardProps> = ({
  product,
  badge = null,
  onAddToCart,
  onRequestQuote,
}) => {
  const { attributes } = product
  const href = productPath(product)
  const quoteOnly = Boolean(product.isQuoteOnly) || requiresQuote(attributes)
  const price = attributes.price
  const purchasable = !quoteOnly && price !== null && price !== undefined
  const compareAt = attributes.isOnSale && attributes.compareAtPrice && price && attributes.compareAtPrice > price
    ? attributes.compareAtPrice
    : null
  const meta = [product.displayBrand, product.displayCategory].filter(Boolean).join(' · ')

  return (
    <article className={s.card}>
      <Link href={href} className={s.cardMedia} aria-label={product.displayName}>
        {attributes.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={attributes.imageUrl} alt={product.displayName} loading="lazy" decoding="async" />
        ) : (
          <span className={s.cardPh} aria-hidden="true">
            <i className="bi bi-box-seam" />
          </span>
        )}
        {quoteOnly ? (
          <span className={`${s.badge} ${s.badgeQuote}`}>Granel</span>
        ) : badge === 'offer' ? (
          <span className={s.badge}>Oferta</span>
        ) : badge === 'new' ? (
          <span className={`${s.badge} ${s.badgeNew}`}>Nuevo</span>
        ) : null}
      </Link>

      <div className={s.cardBody}>
        {meta && <div className={s.cardMeta}>{meta}</div>}
        <h3 className={s.cardName}>
          <Link href={href}>{product.displayName}</Link>
        </h3>

        {purchasable ? (
          <div className={s.cardPrice}>
            <strong>{money(price)}</strong>
            {compareAt && <del>{money(compareAt)}</del>}
            {attributes.iva && <span>+ IVA</span>}
          </div>
        ) : (
          <div className={s.cardQuote}>{QUOTE_ONLY_LABEL}</div>
        )}

        <div className={s.cardActions}>
          {purchasable ? (
            <>
              <button type="button" className={`${s.btnOutline} ${s.btnSm}`} onClick={() => onRequestQuote(product)}>
                Cotizar
              </button>
              <button type="button" className={`${s.btnAccent} ${s.btnSm}`} onClick={() => onAddToCart(product)}>
                <i className="bi bi-cart3" aria-hidden="true" />
                Agregar
              </button>
            </>
          ) : (
            <button type="button" className={`${s.btnAccent} ${s.btnSm}`} onClick={() => onRequestQuote(product)}>
              Pedir cotización
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export const PortalProductCardSkeleton: React.FC = () => <div className={s.skeleton} aria-hidden="true" />
