/**
 * PRODUCT DETAIL PAGE
 * Public product detail view with image, description, and add to cart functionality
 * Uses localStorage cart for guest users (no backend required)
 */

'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePublicProduct, useProductSuggestions } from '../hooks/usePublicProducts'
import { useLocalCart } from '../hooks/useLocalCart'
import { useTrackProductView } from '@/modules/ecommerce/hooks/useProductViews'
import type { EnhancedPublicProduct } from '../types/publicProduct'

interface ProductDetailPageProps {
  productId: string
  onAddToCart?: (product: EnhancedPublicProduct) => void
  onRequestQuote?: (product: EnhancedPublicProduct) => void
  backUrl?: string
  backLabel?: string
}

export default function ProductDetailPage({
  productId,
  onAddToCart,
  onRequestQuote,
  backUrl = '/productos',
  backLabel = 'Volver al catalogo'
}: ProductDetailPageProps) {
  const router = useRouter()
  const { product, isLoading, error } = usePublicProduct(productId)
  const { suggestions, isLoading: suggestionsLoading } = useProductSuggestions(productId, 4)
  const { addToCart, isInCart, getQuantity } = useLocalCart()
  useTrackProductView(productId)
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleAddToCart = useCallback(() => {
    if (!product) return

    addToCart(product, quantity)

    if (onAddToCart) {
      onAddToCart(product)
    }
  }, [product, quantity, addToCart, onAddToCart])

  const handleRequestQuote = useCallback(() => {
    if (!product) return

    addToCart(product, quantity)

    if (onRequestQuote) {
      onRequestQuote(product)
    }

    // Use setTimeout to let React flush the state update + localStorage save
    setTimeout(() => router.push('/cart?action=quote'), 50)
  }, [product, quantity, addToCart, onRequestQuote, router])

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger">
              <h4 className="alert-heading">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Error al cargar el producto
              </h4>
              <p className="mb-0">{error.message || 'No se pudo cargar el producto. Por favor intenta de nuevo.'}</p>
            </div>
            <Link href={backUrl} className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!product) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center">
            <div className="py-5">
              <i className="bi bi-box-seam display-1 text-muted"></i>
              <h2 className="mt-4">Producto no encontrado</h2>
              <p className="text-muted">El producto que buscas no existe o ya no esta disponible.</p>
              <Link href={backUrl} className="btn btn-primary mt-3">
                <i className="bi bi-arrow-left me-2"></i>
                {backLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inCart = isInCart(product.id)
  const cartQuantity = getQuantity(product.id)

  const gallery = product.galleryImages
  const mainImageUrl = gallery && gallery.length > 0
    ? (gallery[selectedImageIndex]?.attributes.imageUrl || product.attributes.imageUrl)
    : product.attributes.imageUrl
  const mainImageAlt = gallery?.[selectedImageIndex]?.attributes.altText || product.displayName

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={backUrl}>Productos</Link>
          </li>
          {product.category && (
            <li className="breadcrumb-item">
              <Link href={`${backUrl}?categoryId=${product.category.id}`}>
                {product.displayCategory}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.displayName}
          </li>
        </ol>
      </nav>

      {/* Product Detail */}
      <div className="row g-4 mb-5">
        {/* Product Image Gallery */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              {/* Main image */}
              <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                {mainImageUrl && !imageError ? (
                  <Image
                    src={mainImageUrl}
                    alt={mainImageAlt}
                    width={500}
                    height={500}
                    className="img-fluid rounded"
                    style={{ objectFit: 'contain', maxHeight: '400px' }}
                    onError={() => setImageError(true)}
                    priority
                  />
                ) : (
                  <div className="text-center text-muted">
                    <i className="bi bi-image display-1"></i>
                    <p className="mt-2">Sin imagen disponible</p>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap">
                  {product.galleryImages.map((img, index) => (
                    <button
                      key={img.id}
                      type="button"
                      className="btn p-0"
                      style={{
                        width: 64,
                        height: 64,
                        border: selectedImageIndex === index
                          ? '2px solid var(--bs-primary)'
                          : '2px solid var(--bs-border-color)',
                        borderRadius: 6,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: selectedImageIndex === index ? 1 : 0.7,
                        transition: 'border-color 0.15s, opacity 0.15s',
                      }}
                      onClick={() => {
                        setSelectedImageIndex(index)
                        setImageError(false)
                      }}
                    >
                      <Image
                        src={img.attributes.imageUrl || `/storage/${img.attributes.filePath}`}
                        alt={img.attributes.altText || `Imagen ${index + 1}`}
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              {/* Brand */}
              {product.brand && (
                <Link
                  href={`${backUrl}?brandId=${product.brand.id}`}
                  className="badge bg-secondary text-decoration-none mb-2"
                >
                  {product.displayBrand}
                </Link>
              )}

              {/* Name */}
              <h1 className="h2 mb-3">{product.displayName}</h1>

              {/* Price */}
              <div className="mb-4">
                <span className="display-5 fw-bold text-primary">
                  {product.displayPrice}
                </span>
                <span className="text-muted ms-2">
                  {product.displayCurrency}{product.unit ? ` / ${product.displayUnit}` : ''}
                </span>
              </div>

              {/* SKU & Barcode */}
              <div className="row mb-4">
                {product.attributes.sku && (
                  <div className="col-auto">
                    <small className="text-muted">
                      <strong>SKU:</strong> {product.attributes.sku}
                    </small>
                  </div>
                )}
              </div>

              {/* Category */}
              {product.category && (
                <div className="mb-4">
                  <span className="text-muted me-2">Categoria:</span>
                  <Link
                    href={`${backUrl}?categoryId=${product.category.id}`}
                    className="text-decoration-none"
                  >
                    {product.displayCategory}
                  </Link>
                </div>
              )}

              {/* Description */}
              {product.attributes.description && (
                <div className="mb-4">
                  <h5>Descripcion</h5>
                  <p className="text-muted">{product.attributes.description}</p>
                </div>
              )}

              {/* Full Description / Technical Details */}
              {product.attributes.fullDescription && (
                <div className="mb-4">
                  <h5>Detalles Técnicos</h5>
                  <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                    {product.attributes.fullDescription}
                  </div>
                </div>
              )}

              {/* Datasheet Download - Uses tracked endpoint */}
              {product.attributes.datasheetUrl && (
                <div className="mb-4">
                  <a
                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${product.id}/datasheet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-info w-100"
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    Descargar Ficha Técnica (PDF)
                  </a>
                </div>
              )}

              {/* Cart Section */}
              <div className="border-top pt-4">
                {inCart && (
                  <div className="alert alert-success py-2 mb-3">
                    <i className="bi bi-check-circle me-2"></i>
                    Ya tienes {cartQuantity} en tu carrito
                  </div>
                )}

                <div className="d-flex align-items-center gap-3 mb-3">
                  {/* Quantity Selector */}
                  <div className="input-group" style={{ width: '140px' }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    className="btn btn-primary btn-lg flex-grow-1"
                    onClick={handleAddToCart}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Agregar al Carrito
                  </button>
                </div>

                {/* Request Quote Button */}
                <button
                  className="btn btn-success w-100 mb-3"
                  onClick={handleRequestQuote}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Solicitar Cotizacion
                </button>

                {/* View Cart Link */}
                {inCart && (
                  <Link href="/cart" className="btn btn-outline-success w-100">
                    <i className="bi bi-cart me-2"></i>
                    Ver Carrito
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {suggestions.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4">
            <i className="bi bi-grid me-2"></i>
            Productos Relacionados
          </h3>

          {suggestionsLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {suggestions.map((suggestedProduct) => (
                <div key={suggestedProduct.id} className="col-6 col-md-3">
                  <Link
                    href={`/productos/${suggestedProduct.id}`}
                    className="card h-100 border-0 shadow-sm text-decoration-none"
                  >
                    <div className="card-body text-center">
                      {suggestedProduct.attributes.imageUrl ? (
                        <Image
                          src={suggestedProduct.attributes.imageUrl}
                          alt={suggestedProduct.displayName}
                          width={150}
                          height={150}
                          className="img-fluid mb-3"
                          style={{ objectFit: 'contain', maxHeight: '120px' }}
                        />
                      ) : (
                        <div className="text-muted mb-3" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image display-4"></i>
                        </div>
                      )}
                      <h6 className="text-dark mb-2">{suggestedProduct.displayName}</h6>
                      <p className="text-primary fw-bold mb-0">
                        {suggestedProduct.displayPrice} {suggestedProduct.displayCurrency}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-5 pt-4 border-top">
        <Link href={backUrl} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          {backLabel}
        </Link>
      </div>
    </div>
  )
}
