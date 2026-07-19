'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSaleProducts, useLocalCart, type EnhancedPublicProduct } from '@lwm/ecommerce'
import { useToast } from '@lwm/ui'
import { usePublicSettings } from '@lwm/app-config'
import { curatedOffers as fallbackOfertas } from '../../data/curatedOffers'

export const OfertasDelMes: React.FC = () => {
  // Fase 3 (landing.*): cuantas ofertas muestra el home se configura en
  // app-config (landing.offers_count); fallback al 3 historico.
  const { get } = usePublicSettings()
  const offersCount = Number(get('landing.offers_count')) || 3

  // Ofertas reales (is_on_sale), NO los primeros del catalogo. Si no hay ofertas
  // cargadas, el render cae al fallback estatico (mejor que mostrar productos a $0.00).
  const { products, isLoading, error } = useSaleProducts(offersCount, 'unit,category,brand')
  const { addToCart } = useLocalCart()
  const toast = useToast()

  const handleAddToCart = (product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container-fluid offers">
        <div className="row">
          <div className="col text-center">
            <h1>OFERTAS DEL MES</h1>
            <hr className="separator" />
          </div>
        </div>
        <div className="row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="col-12 col-md-4 text-center card-offer blue-1 d-block mx-auto">
              <div className="placeholder-glow">
                <div className="placeholder bg-secondary" style={{ width: '200px', height: '200px' }}></div>
                <p className="placeholder col-10 mt-3"></p>
                <p className="placeholder col-6"></p>
                <h4 className="placeholder col-4"></h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // If error or no products, show static fallback
  if (error || products.length === 0) {
    return (
      <div className="container-fluid offers">
        <div className="row">
          <div className="col text-center">
            <h1>OFERTAS DEL MES</h1>
            <hr className="separator" />
          </div>
        </div>
        <div className="row">
          {fallbackOfertas.map((oferta) => (
            <div
              key={oferta.id}
              className={`col-12 col-md-4 text-center card-offer ${oferta.bgClass} d-block mx-auto`}
            >
              <Image
                src={oferta.image}
                className="img-fluid"
                alt="Labor Wasser Mexico"
                width={200}
                height={200}
              />
              <p>{oferta.description}</p>
              <p>Modelo: {oferta.modelo}</p>
              <h4>{oferta.precio}</h4>
              <a
                className="btn btn-primary mt-3"
                href={oferta.whatsappLink}
                role="button"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pidelo ahora
              </a>
            </div>
          ))}
        </div>
        <div className="row mt-4">
          <div className="col text-center">
            <Link href="/ofertas" className="btn btn-outline-primary">
              Ver todas las ofertas
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show products from API
  return (
    <div className="container-fluid offers">
      <div className="row">
        <div className="col text-center">
          <h1>OFERTAS DEL MES</h1>
          <hr className="separator" />
        </div>
      </div>
      <div className="row">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`col-12 col-md-4 text-center card-offer ${index % 2 === 0 ? 'blue-1' : 'blue-2'} d-block mx-auto`}
          >
            <Link href={`/productos/${product.id}`}>
              <div className="position-relative" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                {product.attributes.imageUrl ? (
                  <Image
                    src={product.attributes.imageUrl}
                    alt={product.displayName}
                    fill
                    className="img-fluid object-fit-contain"
                    sizes="200px"
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded">
                    <i className="bi bi-image display-4 text-muted"></i>
                  </div>
                )}
              </div>
            </Link>
            <p className="mt-3">{product.displayName}</p>
            {product.attributes.sku && <p>SKU: {product.attributes.sku}</p>}
            <h4>{formatPrice(product.attributes.price || 0)}</h4>
            <div className="d-flex gap-2 justify-content-center mt-3">
              <button
                className="btn btn-primary"
                onClick={() => handleAddToCart(product)}
              >
                <i className="bi bi-cart-plus me-2"></i>
                Agregar
              </button>
              <Link href={`/productos/${product.id}`} className="btn btn-outline-secondary">
                Ver mas
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="row mt-4">
        <div className="col text-center">
          <Link href="/ofertas" className="btn btn-outline-primary btn-lg">
            <i className="bi bi-tag me-2"></i>
            Ver todas las ofertas
          </Link>
        </div>
      </div>
    </div>
  )
}
