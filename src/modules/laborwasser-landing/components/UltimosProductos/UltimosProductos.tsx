'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/ui/components/base'
import { useLatestProducts } from '../../hooks'
// Define transformed product type that matches the hook return
interface TransformedProduct {
  id: string
  name: string
  description: string | null
  price: number | null
  sku: string | null
  barcode: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  unit: {
    id: string
    name: string
    abbreviation: string | null
    description: string | null
  } | null
  category: {
    id: string
    name: string
    description: string | null
    slug: string | null
    imageUrl: string | null
  } | null
  brand: {
    id: string
    name: string
    description: string | null
    slug: string | null
    logoUrl: string | null
    websiteUrl: string | null
  } | null
  iva: boolean
  cost: number | null
}
import styles from './UltimosProductos.module.scss'

export const UltimosProductos: React.FC = () => {
  const { products, total, isLoading, error } = useLatestProducts({ limit: 6 })

  if (error) {
    return (
      <section className={styles.ultimosProductos}>
        <div className="container">
          <div className="alert alert-warning">
            No se pudieron cargar los productos. Intenta nuevamente más tarde.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.ultimosProductos}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>ÚLTIMOS PRODUCTOS</h2>
              <p className={styles.sectionSubtitle}>
                Descubre nuestras últimas incorporaciones al catálogo de productos
              </p>
              {total > 0 && (
                <p className={styles.totalProducts}>
                  <i className="bi bi-box-seam" />
                  {total.toLocaleString('es-MX')} productos disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className={styles.productCard}>
                  <div className={styles.productImageSkeleton}></div>
                  <div className={styles.productContent}>
                    <div className={styles.textSkeleton}></div>
                    <div className={styles.textSkeleton}></div>
                    <div className={styles.priceSkeleton}></div>
                    <div className={styles.buttonSkeleton}></div>
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            // Actual products
            products.map((product: TransformedProduct) => (
              <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                <div className={styles.productCard}>
                  {/* New badge for recently added products */}
                  <div className={styles.newBadge}>
                    <span className={styles.badge}>NUEVO</span>
                  </div>
                  
                  <div className={styles.productImage}>
                    <div className={styles.productImagePlaceholder}>
                      <i className="bi bi-box-seam" />
                      <span>{product.category?.name || 'Producto'}</span>
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    <div className={styles.productMeta}>
                      <span className={styles.productBrand}>
                        {product.brand?.name || 'Labor Wasser'}
                      </span>
                      <span className={styles.productCategory}>
                        {product.category?.name || 'General'}
                      </span>
                    </div>

                    <h3 className={styles.productName}>
                      {product.name}
                    </h3>

                    <p className={styles.productDescription}>
                      {product.description || 'Producto de alta calidad para laboratorio profesional.'}
                    </p>

                    <div className={styles.productDetails}>
                      {product.sku && (
                        <div className={styles.productSku}>
                          <i className="bi bi-upc" />
                          <span>SKU: {product.sku}</span>
                        </div>
                      )}
                      {product.unit?.name && (
                        <div className={styles.productUnit}>
                          <i className="bi bi-rulers" />
                          <span>Unidad: {product.unit.name}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.productPricing}>
                      {product.price && (
                        <span className={styles.productPrice}>
                          ${product.price.toLocaleString('es-MX')}
                          {product.iva && <span className={styles.ivaText}>+ IVA</span>}
                        </span>
                      )}
                      {product.cost && product.cost !== product.price && (
                        <span className={styles.productCost}>
                          Costo: ${product.cost.toLocaleString('es-MX')}
                        </span>
                      )}
                    </div>

                    <div className={styles.productActions}>
                      <Link href={`/productos/${product.id}`}>
                        <Button 
                          variant="primary" 
                          buttonStyle="outline"
                          size="small"
                          className={styles.viewButton}
                        >
                          <i className="bi bi-eye" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Button 
                        variant="success" 
                        size="small"
                        className={styles.quoteButton}
                      >
                        <i className="bi bi-calculator" />
                        Cotizar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // No products fallback
            <div className="col-12">
              <div className={styles.noProducts}>
                <i className="bi bi-box" />
                <h3>Próximamente nuevos productos</h3>
                <p>Estamos trabajando en agregar más productos a nuestro catálogo. ¡Vuelve pronto!</p>
              </div>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="row">
            <div className="col-12 text-center">
              <Link href="/productos">
                <Button 
                  variant="primary" 
                  size="large"
                  className={styles.viewAllButton}
                >
                  Ver Todos los Productos
                  <i className="bi bi-arrow-right ms-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}