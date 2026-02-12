/**
 * PRODUCT QUICK VIEW MODAL
 * Shared modal component for product quick view with image gallery support
 * Used by landing page and catalog components
 */

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePublicProduct } from '../hooks/usePublicProducts'
import type { EnhancedPublicProduct } from '../types/publicProduct'

interface ProductQuickViewModalProps {
  /** The product selected from the list (basic data without images) */
  product: EnhancedPublicProduct
  /** Called when modal should close */
  onClose: () => void
  /** Called when user clicks "Add to Cart" */
  onAddToCart: (product: EnhancedPublicProduct) => void
  /** Whether to show "Ver Detalles Completos" link button */
  showDetailsLink?: boolean
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  showDetailsLink = false
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  // Fetch full product data with images included
  const { product: fullProduct } = usePublicProduct(
    product.id,
    'unit,category,brand,images'
  )

  // Use full product data if available, fallback to list product
  const displayProduct = fullProduct ?? product

  // Reset image index when product changes
  useEffect(() => {
    setSelectedImageIndex(0)
    setImageError(false)
  }, [product.id])

  // Resolve gallery images
  const gallery = displayProduct.galleryImages
  const hasGallery = gallery && gallery.length > 0

  const mainImageUrl = hasGallery
    ? (gallery[selectedImageIndex]?.attributes.imageUrl || displayProduct.attributes.imageUrl)
    : displayProduct.attributes.imageUrl

  const mainImageAlt = hasGallery
    ? (gallery[selectedImageIndex]?.attributes.altText || displayProduct.displayName)
    : displayProduct.displayName

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{displayProduct.displayName}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Image Column with Gallery */}
              <div className="col-md-6">
                {/* Main Image */}
                <div className="ratio ratio-1x1 mb-2">
                  {mainImageUrl && !imageError ? (
                    <Image
                      src={mainImageUrl}
                      alt={mainImageAlt || displayProduct.displayName}
                      fill
                      className="object-fit-contain rounded"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-light rounded">
                      <i className="bi bi-image display-4 text-muted"></i>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {hasGallery && gallery.length > 1 && (
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    {gallery.map((img, index) => (
                      <button
                        key={img.id}
                        type="button"
                        className="btn p-0"
                        style={{
                          width: 52,
                          height: 52,
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
                          width={52}
                          height={52}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Column */}
              <div className="col-md-6">
                <h6>Detalles del Producto</h6>
                <ul className="list-unstyled">
                  <li><strong>Categoria:</strong> {displayProduct.displayCategory}</li>
                  <li><strong>Marca:</strong> {displayProduct.displayBrand}</li>
                  <li><strong>Unidad:</strong> {displayProduct.displayUnit}</li>
                  {displayProduct.attributes.sku && (
                    <li><strong>SKU:</strong> {displayProduct.attributes.sku}</li>
                  )}
                  <li><strong>Precio:</strong> {displayProduct.displayPrice}</li>
                </ul>
                {displayProduct.attributes.description && (
                  <>
                    <h6>Descripcion</h6>
                    <p className="text-muted">{displayProduct.attributes.description}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => onAddToCart(displayProduct)}
            >
              <i className="bi bi-cart-plus me-1"></i>
              Agregar al Carrito
            </button>
            {showDetailsLink && (
              <Link
                href={`/productos/${displayProduct.id}`}
                className="btn btn-primary"
              >
                <i className="bi bi-eye me-1"></i>
                Ver Detalles Completos
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductQuickViewModal
