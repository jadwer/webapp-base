'use client'

/**
 * /productos (rediseno 2026-08): catalogo con motor/piel.
 *
 * Motor: usePublicCatalogController de @lwm/ecommerce (estado de filtros,
 * orden, vista, paginacion, fetch y facetas; el mismo que usa el template
 * clasico de otros tenants). Piel: modulos del tenant (CatalogHero,
 * CatalogSidebar, CatalogToolbar, CatalogPagination) + LandingProductCard
 * variante catalog. Cierra con la seccion "Por que comprar" del home.
 *
 * Comportamiento conservado: ?search= y ?categoryId= de la URL, agregar al
 * carrito local con toast, y Cotizar = carrito + /cart?action=quote.
 */

import React, { Suspense, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  usePublicCatalogController,
  usePublicCategories,
  useLocalCart,
  type EnhancedPublicProduct,
} from '@/modules/public-catalog'
import { useToast } from '@/ui/hooks/useToast'
import { LandingProductCard, LandingProductCardSkeleton, PorQueComprar } from '@/modules/landing'
import { CatalogHero, CatalogSidebar, CatalogToolbar, CatalogPagination } from '@/modules/catalog'
import styles from './productos.module.scss'

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="container-fluid py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      }
    >
      <ProductosContent />
    </Suspense>
  )
}

function ProductosContent() {
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || undefined
  const initialCategoryId = searchParams.get('categoryId') || undefined

  // Categorias con counts reales del backend (productsCount)
  const { categories: publicCategories } = usePublicCategories({ limit: 100 })
  const categoryOptions = useMemo(
    () =>
      publicCategories.map((c: { id: string; name: string; productsCount?: number }) => ({
        value: String(c.id),
        label: c.name,
        count: c.productsCount,
      })),
    [publicCategories]
  )

  const controller = usePublicCatalogController({
    initialFilters: { search: initialSearch, categoryId: initialCategoryId },
    initialSortField: 'name',
    initialSortDirection: 'asc',
    initialViewMode: 'list',
    initialPageSize: 24,
    categories: categoryOptions,
  })

  const { addToCart } = useLocalCart()

  const handleAddToCart = useCallback(
    (product: EnhancedPublicProduct) => {
      addToCart(product, 1)
      toast.success(`${product.displayName} agregado al carrito`)
    },
    [addToCart, toast]
  )

  const handleRequestQuote = useCallback(
    (product: EnhancedPublicProduct) => {
      addToCart(product, 1)
      toast.info(`${product.displayName} agregado. Redirigiendo a cotizacion...`)
      // Dejar que React/localStorage persistan el carrito antes de navegar
      setTimeout(() => router.push('/cart?action=quote'), 50)
    },
    [addToCart, toast, router]
  )

  const { products, isLoading, error, viewMode, handleRefresh } = controller
  const isList = viewMode === 'list'

  return (
    <>
      <CatalogHero />

      <div className={`container ${styles.layout}`}>
        <CatalogSidebar controller={controller} />

        <div className={styles.main}>
          <CatalogToolbar controller={controller} />

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
              <div>
                Error al cargar productos.
                <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={handleRefresh}>
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!error && (
            <div className={isList ? styles.list : `row g-4 ${styles.grid}`}>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) =>
                  isList ? (
                    <LandingProductCardSkeleton key={i} variant="new" />
                  ) : (
                    <div key={i} className="col-12 col-md-6 col-xl-4">
                      <LandingProductCardSkeleton variant="new" />
                    </div>
                  )
                )}

              {!isLoading &&
                products.map((product) =>
                  isList ? (
                    <LandingProductCard
                      key={product.id}
                      product={product}
                      variant="catalog"
                      orientation="horizontal"
                      onAddToCart={handleAddToCart}
                      onRequestQuote={handleRequestQuote}
                    />
                  ) : (
                    <div key={product.id} className="col-12 col-md-6 col-xl-4">
                      <LandingProductCard
                        product={product}
                        variant="catalog"
                        onAddToCart={handleAddToCart}
                        onRequestQuote={handleRequestQuote}
                      />
                    </div>
                  )
                )}

              {!isLoading && products.length === 0 && (
                <div className={styles.empty}>
                  <i className="bi bi-search" aria-hidden="true" />
                  <h3>No se encontraron productos</h3>
                  <p>Ajusta los filtros o intenta con otra busqueda.</p>
                </div>
              )}
            </div>
          )}

          <CatalogPagination controller={controller} />
        </div>
      </div>

      <PorQueComprar />
    </>
  )
}
