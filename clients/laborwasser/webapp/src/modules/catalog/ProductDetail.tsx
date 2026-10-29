'use client'

/**
 * PRODUCT DETAIL (rediseno 2026-08, piel del tenant)
 *
 * Ficha de producto del Figma: banda celeste con breadcrumb, tarjeta blanca
 * grande (imagen con badge Oferta + galeria | titulo, precio verde con
 * unidad/IVA, cantidad, detalles tecnicos, descripcion larga, botones
 * Cotizar/Agregar) y "Productos relacionados" en fila horizontal con la
 * tarjeta del home (variant offer).
 *
 * Motor: hooks de @lwm/ecommerce (usePublicProduct, useProductSuggestions,
 * useTrackProductView, useLocalCart). El ProductDetailPage clasico del
 * package queda intacto para los demas tenants.
 */

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  usePublicProduct,
  useProductSuggestions,
  useLocalCart,
  type EnhancedPublicProduct,
} from '@lwm/ecommerce'
import { useTrackProductView } from '@lwm/ecommerce'
import { toast } from '@lwm/ui'
import { trackAddToCart, trackEvent } from '@/lib/analytics'
import { QUOTE_ONLY_LABEL, requiresQuote } from '@lwm/products/pricing'
import { LandingProductCard } from '../landing/components/LandingProductCard'
import { optimizedImage } from '@/lib/images'
import { categoryPath } from '@/lib/seo/categoryPath'
import styles from './ProductDetail.module.scss'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function formatDetailPrice(product: EnhancedPublicProduct): string | null {
  // P2 granel: sujeto a cotizacion no muestra precio aunque llegara alguno.
  if (product.isQuoteOnly || requiresQuote(product.attributes)) return null
  const price = product.attributes.price
  if (price === null || price === undefined) return null
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export interface ProductDetailProps {
  productId: string
  /** Ficha prerenderizada en servidor (SEO Bloque 1): el HTML ya trae el producto. */
  initialProduct?: EnhancedPublicProduct | null
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, initialProduct }) => {
  const { product, isLoading, error } = usePublicProduct(productId, 'unit,category,brand,images,currency', {
    fallbackData: initialProduct ?? undefined,
  })
  const { suggestions } = useProductSuggestions(productId, 8)
  const { addToCart } = useLocalCart()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  // Imagenes cuyo archivo no carga (dato legado): salen de la galeria y la
  // ficha cae al placeholder en lugar del icono roto del navegador.
  const [brokenImages, setBrokenImages] = useState<ReadonlySet<string>>(() => new Set())
  const markBroken = useCallback((key: string) => {
    setBrokenImages((prev) => (prev.has(key) ? prev : new Set(prev).add(key)))
    setSelectedImage(0)
  }, [])

  // Contador de vistas (mismo endpoint de siempre)
  useTrackProductView(productId)

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addToCart(product, quantity)
    trackAddToCart(product, quantity)
    toast.success(`${product.displayName} agregado al carrito`)
  }, [product, quantity, addToCart])

  const handleQuote = useCallback(() => {
    if (!product) return
    addToCart(product, quantity)
    trackEvent('quote_request', { item_id: product.attributes?.sku || product.id })
    toast.info(`${product.displayName} agregado. Redirigiendo a cotización...`)
    setTimeout(() => router.push('/cart?action=quote'), 50)
  }, [product, quantity, addToCart, router])

  const handleRelatedAdd = useCallback((p: EnhancedPublicProduct) => {
    addToCart(p, 1)
    trackAddToCart(p, 1)
    toast.success(`${p.displayName} agregado al carrito`)
  }, [addToCart])

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando producto...</span>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          No se pudo cargar el producto.
          <Link href="/productos" className="alert-link ms-2">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  const price = formatDetailPrice(product)
  const gallery = (product.galleryImages || []).filter(
    (img) => img.attributes.imageUrl && !brokenImages.has(img.attributes.imageUrl),
  )
  const fallbackImage = product.attributes.imageUrl && !brokenImages.has(product.attributes.imageUrl)
    ? product.attributes.imageUrl
    : null
  const mainImage = gallery.length > 0
    ? gallery[selectedImage]?.attributes.imageUrl || fallbackImage
    : fallbackImage
  // Texto alternativo capturado en la galeria; si no hay, el nombre del producto
  const mainImageAlt = gallery[selectedImage]?.attributes.altText || product.displayName
  const category = product.category
  const purchasable = price !== null
  const quoteOnly = Boolean(product.isQuoteOnly) || requiresQuote(product.attributes)

  return (
    <>
      <div className={styles.band}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <Link href="/productos">Productos</Link>
            {category && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={categoryPath({ id: category.id, slug: category.attributes.slug })}>{category.attributes.name}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent}>{product.displayName}</span>
          </nav>
        </div>
      </div>

      <div className={`container ${styles.wrap}`}>
        <article className={`lw-card ${styles.card}`}>
          {/* Imagen */}
          <div className={styles.mediaCol}>
            <div className={styles.media}>
              {product.attributes.isOnSale && (
                <span className={`lw-badge ${styles.badge}`}>
                  <i className="bi bi-tag" aria-hidden="true" /> Oferta
                </span>
              )}
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={mainImage} src={optimizedImage(mainImage, 1080) ?? mainImage} alt={mainImageAlt} className={styles.image} fetchPriority="high" decoding="async" onError={() => markBroken(mainImage)} />
              ) : (
                <div className={styles.placeholder}><i className="bi bi-box-seam" aria-hidden="true" /></div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className={styles.thumbs} role="group" aria-label="Imágenes del producto">
                {gallery.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImage(i)}
                    aria-pressed={i === selectedImage}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.attributes.imageUrl || ''} alt={img.attributes.altText || `${product.displayName}, imagen ${i + 1}`} onError={() => markBroken(img.attributes.imageUrl || '')} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className={styles.content}>
            <h1 className={styles.title}>{product.displayName}</h1>

            {price && (
              <p className={styles.priceRow}>
                <span className={styles.price}>{price}</span>
                <span className={styles.priceMeta}>
                  {product.displayCurrency}/{product.displayUnit} {product.attributes.iva ? '+ IVA' : 'IVA 0%'}
                </span>
              </p>
            )}

            {quoteOnly && (
              <p className={styles.priceRow}>
                <span className="badge bg-info text-dark" data-testid="quote-only-badge">
                  <i className="bi bi-chat-square-quote me-1" aria-hidden="true" />
                  {QUOTE_ONLY_LABEL}
                </span>
                <span className={styles.priceMeta}>Solicita una cotización y te enviamos el precio vigente.</span>
              </p>
            )}

            {(purchasable || quoteOnly) && (
              <div className={styles.qty}>
                <span className={styles.qtyLabel}>Cantidad:</span>
                <label className={styles.qtySelectWrap}>
                  <span className="visually-hidden">Cantidad</span>
                  {/* Cantidad libre (pedido cliente 2026-09): el stock se
                      valida al comprar, no al capturar. */}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    className={styles.qtySelect}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
                  />
                </label>
              </div>
            )}

            <h2 className={styles.detailsTitle}>Detalles Técnicos</h2>
            <dl className={styles.details}>
              {product.attributes.sku && (
                <div><dt>SKU:</dt><dd>{product.attributes.sku}</dd></div>
              )}
              {category && (
                <div>
                  <dt>Categoría:</dt>
                  <dd><Link href={categoryPath({ id: category.id, slug: category.attributes.slug })}>{category.attributes.name}</Link></dd>
                </div>
              )}
              {product.attributes.description && (
                <div><dt>Descripción:</dt><dd>{product.attributes.description}</dd></div>
              )}
              {product.brand && (
                <div><dt>Marca:</dt><dd>{product.brand.attributes.name}</dd></div>
              )}
              {product.attributes.datasheetUrl && (
                <div>
                  <dt>Ficha técnica:</dt>
                  <dd>
                    <a href={`${BACKEND}/api/v1/products/${product.id}/datasheet`} target="_blank" rel="noopener noreferrer">
                      Descargar ficha técnica
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {product.attributes.fullDescription && (
              <p className={styles.longDescription}>{product.attributes.fullDescription}</p>
            )}

            <div className={styles.actions}>
              {purchasable ? (
                <>
                  <button type="button" className="btn lw-btn lw-btn-accent-outline" onClick={handleQuote}>
                    Cotizar
                  </button>
                  <button type="button" className="btn lw-btn lw-btn-accent" onClick={handleAddToCart}>
                    <i className="bi bi-cart3 me-2" aria-hidden="true" />
                    Agregar
                  </button>
                </>
              ) : (
                <button type="button" className="btn lw-btn lw-btn-accent" onClick={handleQuote}>
                  {quoteOnly ? 'Solicitar cotización' : 'Cotizar'}
                </button>
              )}
            </div>
          </div>
        </article>

        {suggestions.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className={`lw-heading ${styles.relatedTitle}`}>
              Productos <span className="lw-highlight">relacionados</span>
            </h2>
            <div className={styles.relatedRow}>
              {suggestions.map((p) => (
                <div key={p.id} className={styles.relatedItem}>
                  <LandingProductCard product={p} variant="offer" onAddToCart={handleRelatedAdd} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default ProductDetail
