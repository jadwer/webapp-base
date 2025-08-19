'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useFeaturedProducts } from '../../hooks'
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
import styles from './OfertasDelMes.module.scss'

export const OfertasDelMes: React.FC = () => {
  const { products, isLoading, error } = useFeaturedProducts({ limit: 3 })

  if (error) {
    return (
      <section className={styles.ofertas}>
        <div className="container">
          <div className="alert alert-warning">
            No se pudieron cargar las ofertas del mes. Intenta nuevamente más tarde.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.ofertas}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>OFERTAS DEL MES</h2>
              <p className={styles.sectionSubtitle}>
                Aprovecha nuestras mejores promociones en reactivos y equipos de laboratorio
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className={styles.productCard}>
                  <div className={styles.productImageSkeleton}></div>
                  <div className={styles.productContent}>
                    <div className={styles.textSkeleton}></div>
                    <div className={styles.textSkeleton}></div>
                    <div className={styles.priceSkeleton}></div>
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            // Actual products
            products.map((product: TransformedProduct) => (
              <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                <div className={styles.productCard}>
                  <div className={styles.productBadge}>
                    <span className={styles.badge}>EXCLUSIVA</span>
                  </div>
                  
                  <div className={styles.productImage}>
                    <div className={styles.productImagePlaceholder}>
                      <i className="bi bi-box" />
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    <h3 className={styles.productName}>
                      {product.name}
                    </h3>
                    <p className={styles.productDescription}>
                      {product.description || 'Producto de alta calidad para laboratorio'}
                    </p>

                    <div className={styles.productPricing}>
                      {product.cost && product.price && product.price > product.cost && (
                        <span className={styles.originalPrice}>
                          ${product.price.toLocaleString('es-MX')}
                        </span>
                      )}
                      <span className={styles.salePrice}>
                        ${(product.price || product.cost || 0).toLocaleString('es-MX')}
                      </span>
                      {product.cost && product.price && product.price > product.cost && (
                        <span className={styles.savings}>
                          ¡Ahorra ${(product.price - product.cost).toLocaleString('es-MX')}!
                        </span>
                      )}
                    </div>

                    <Button 
                      variant="success" 
                      className={styles.productButton}
                      size="small"
                    >
                      Ver Producto
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // No products fallback
            <div className="col-12">
              <div className={styles.noProducts}>
                <i className="bi bi-info-circle" />
                <h3>Próximamente nuevas ofertas</h3>
                <p>Estamos preparando increíbles ofertas para ti. ¡Vuelve pronto!</p>
              </div>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="row">
            <div className="col-12 text-center">
              <Button 
                variant="primary" 
                buttonStyle="outline"
                size="large"
                className={styles.viewAllButton}
              >
                Ver Todas las Ofertas
                <i className="bi bi-arrow-right ms-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}