'use client'

/**
 * NUESTROS NUEVOS PRODUCTOS (rediseno 2026-08; antes "Ultimos productos")
 *
 * Encabezado "Nuestros <nuevos> productos" + "Ver todos", y una fila de
 * LandingProductCard variante new. Datos: los ultimos AGREGADOS (createdAt
 * desc) con cantidad configurable en app-config (landing.latest_products_count;
 * el rediseno muestra 3). El boton "Cotizar" usa el mismo flujo que el
 * catalogo: agrega al carrito local y abre /cart?action=quote (antes no
 * hacia nada). Se elimino la lectura de `cost` (patron de la fuga de costo).
 */

import React, { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocalCart, type EnhancedPublicProduct } from '@lwm/ecommerce'
import { useToast } from '@lwm/ui'
import { usePublicSettings } from '@lwm/app-config'
import { useLatestProductsEnhanced } from '../../hooks'
import { LandingProductCard, LandingProductCardSkeleton } from '../LandingProductCard'
import styles from './UltimosProductos.module.scss'

export const UltimosProductos: React.FC = () => {
  const { get } = usePublicSettings()
  const latestCount = Number(get('landing.latest_products_count')) || 3
  const { products, isLoading, error } = useLatestProductsEnhanced({ limit: latestCount })
  const { addToCart } = useLocalCart()
  const toast = useToast()
  const router = useRouter()

  const handleRequestQuote = useCallback((product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.info(`${product.displayName} agregado. Redirigiendo a cotizacion...`)
    // Dejar que React/localStorage persistan el carrito antes de navegar
    setTimeout(() => router.push('/cart?action=quote'), 50)
  }, [addToCart, toast, router])

  return (
    <section className={styles.section} aria-labelledby="nuevos-title">
      <div className="container">
        <div className="lw-section-header">
          <h2 id="nuevos-title" className="lw-section-title">
            Nuestros <span className="lw-highlight">nuevos</span> productos
          </h2>
          <Link href="/productos" className="lw-link-more">Ver todos</Link>
        </div>

        {error && !isLoading && (
          <div className="alert alert-warning" role="alert">
            No se pudieron cargar los productos. Intenta nuevamente mas tarde.
          </div>
        )}

        <div className={`row g-4 ${styles.grid}`}>
          {isLoading &&
            Array.from({ length: latestCount }).map((_, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <LandingProductCardSkeleton variant="new" />
              </div>
            ))}

          {!isLoading && !error &&
            products.map((product) => (
              <div key={product.id} className="col-12 col-md-6 col-lg-4">
                <LandingProductCard
                  product={product}
                  variant="new"
                  onRequestQuote={handleRequestQuote}
                />
              </div>
            ))}

          {!isLoading && !error && products.length === 0 && (
            <div className="col-12">
              <div className={styles.empty}>
                <i className="bi bi-box" aria-hidden="true" />
                <h3>Proximamente nuevos productos</h3>
                <p>Estamos agregando mas productos a nuestro catalogo. Vuelve pronto.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
