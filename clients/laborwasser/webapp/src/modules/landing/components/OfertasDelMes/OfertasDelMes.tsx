'use client'

/**
 * OFERTAS DEL MES (rediseno 2026-08)
 *
 * Encabezado "Conoce nuestras <ofertas> del mes" + link "Ver mas", y una fila
 * de LandingProductCard variante offer. La logica de datos se conserva:
 * ofertas reales (is_on_sale) con cantidad configurable en app-config
 * (landing.offers_count) y fallback estatico curado si no hay ofertas.
 */

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSaleProducts, useLocalCart, type EnhancedPublicProduct } from '@lwm/ecommerce'
import { useToast } from '@lwm/ui'
import { usePublicSettings } from '@lwm/app-config'
import { curatedOffers as fallbackOfertas } from '../../data/curatedOffers'
import { LandingProductCard, LandingProductCardSkeleton } from '../LandingProductCard'
import styles from './OfertasDelMes.module.scss'

export const OfertasDelMes: React.FC = () => {
  const { get } = usePublicSettings()
  const offersCount = Number(get('landing.offers_count')) || 3

  const { products, isLoading, error } = useSaleProducts(offersCount, 'unit,category,brand,currency')
  const { addToCart } = useLocalCart()
  const toast = useToast()

  const handleAddToCart = (product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }

  const useFallback = !isLoading && (error || products.length === 0)

  return (
    <section className={styles.section} aria-labelledby="ofertas-title">
      <div className="container">
        <div className="lw-section-header">
          <h2 id="ofertas-title" className="lw-section-title">
            Conoce nuestras <span className="lw-highlight">ofertas</span> del mes
          </h2>
          <Link href="/ofertas" className="lw-link-more">Ver mas</Link>
        </div>

        <div className={`row g-4 ${styles.grid}`}>
          {isLoading &&
            Array.from({ length: offersCount }).map((_, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <LandingProductCardSkeleton variant="offer" />
              </div>
            ))}

          {!isLoading && !useFallback &&
            products.map((product) => (
              <div key={product.id} className="col-12 col-md-6 col-lg-4">
                <LandingProductCard
                  product={product}
                  variant="offer"
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}

          {useFallback &&
            fallbackOfertas.slice(0, offersCount).map((oferta) => (
              <div key={oferta.id} className="col-12 col-md-6 col-lg-4">
                {/* Fallback curado: misma geometria que LandingProductCard, datos estaticos */}
                <article className={`lw-card lw-card-hover ${styles.fallbackCard}`}>
                  <div className={styles.fallbackMedia}>
                    <Image
                      src={oferta.image}
                      alt={oferta.description}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={styles.fallbackImage}
                    />
                    <span className={`lw-badge ${styles.fallbackBadge}`}>
                      <i className="bi bi-tag" aria-hidden="true" /> Oferta
                    </span>
                  </div>
                  <div className={styles.fallbackBody}>
                    <h3 className={styles.fallbackName}>{oferta.description}</h3>
                    <div className={styles.fallbackFacts}>
                      <span>Modelo: {oferta.modelo}</span>
                      <span className={styles.fallbackPrice}>{oferta.precio.replace('+IVA', ' + IVA').replace('USD', ' USD')}</span>
                    </div>
                    <div className={styles.fallbackActions}>
                      <a
                        className="btn lw-btn lw-btn-accent"
                        href={oferta.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Comprar ahora
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
