'use client'

import React from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Card, Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useProduct } from '@/modules/products'
import { StatusBadge } from '@/modules/products/components'
import { formatDate, formatPrice } from '@/modules/products/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const navigation = useNavigationProgress()
  const { product, isLoading, error } = useProduct(id, ['unit', 'category', 'brand'])


  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando producto...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el producto: {error?.message || 'Producto no encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Button
              size="small"
              variant="secondary"
              buttonStyle="ghost"
              onClick={() => navigation.back()}
            >
              <i className="bi bi-arrow-left me-1" />
              Volver
            </Button>
          </div>
          <h1 className="h3 mb-1">{product.name}</h1>
          <p className="text-muted mb-0">Detalles del producto</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="primary"
            buttonStyle="outline"
            onClick={() => navigation.push(`/dashboard/products/${product.id}/edit`)}
          >
            <i className="bi bi-pencil me-2" />
            Editar
          </Button>
          <Button
            variant="secondary"
            buttonStyle="outline"
            onClick={() => navigation.push('/dashboard/products')}
          >
            <i className="bi bi-list me-2" />
            Ver todos
          </Button>
        </div>
      </div>

      <div className="row">
        {/* Main Information */}
        <div className="col-lg-8">
          <Card className="mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2" />
                Información General
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre:</label>
                    <div>{product.name}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">SKU:</label>
                    <div>
                      {product.sku ? (
                        <code>{product.sku}</code>
                      ) : (
                        <span className="text-muted">Sin SKU</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Estado:</label>
                    <div>
                      <StatusBadge status="active" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Precio de venta:</label>
                    <div className="fs-4 text-primary fw-bold">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Costo:</label>
                    <div>{formatPrice(product.cost)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">IVA:</label>
                    <div>
                      {product.iva ? (
                        <span className="badge bg-success">Incluido</span>
                      ) : (
                        <span className="badge bg-secondary">No incluido</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Descriptions */}
          <Card className="mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-file-text me-2" />
                Descripciones
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-bold">Descripción corta:</label>
                <div className="text-muted">
                  {product.description || 'Sin descripción corta'}
                </div>
              </div>
              <div>
                <label className="form-label fw-bold">Descripción completa:</label>
                <div className="text-muted">
                  {product.fullDescription ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {product.fullDescription}
                    </div>
                  ) : (
                    'Sin descripción completa'
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Categories and Classifications */}
          <Card>
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-tags me-2" />
                Clasificación
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Categoría:</label>
                    <div>
                      <span className="badge bg-secondary fs-6">
                        {product.category?.name || 'Sin categoría'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Marca:</label>
                    <div>
                      <span className="badge bg-primary fs-6">
                        {product.brand?.name || 'Sin marca'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Unidad:</label>
                    <div>
                      <span className="badge bg-info text-dark fs-6">
                        {product.unit?.name || 'Sin unidad'}
                        {product.unit?.code && ` (${product.unit.code})`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Image */}
          {product.imgUrl && (
            <Card className="mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-image me-2" />
                  Imagen
                </h6>
              </div>
              <div className="card-body text-center">
                <Image
                  src={product.imgUrl}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="img-fluid rounded"
                  style={{ maxHeight: 300 }}
                />
              </div>
            </Card>
          )}

          {/* Files */}
          {product.datasheetUrl && (
            <Card className="mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-file-earmark-pdf me-2" />
                  Archivos
                </h6>
              </div>
              <div className="card-body">
                <a
                  href={product.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-info w-100"
                >
                  <i className="bi bi-download me-2" />
                  Descargar hoja de datos
                </a>
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-clock me-2" />
                Información del sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold small">ID del producto:</label>
                <div className="small text-muted">
                  <code>{product.id}</code>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold small">Creado:</label>
                <div className="small text-muted">
                  {formatDate(product.createdAt, 'dd \'de\' MMMM \'de\' yyyy, HH:mm')}
                </div>
              </div>
              <div>
                <label className="form-label fw-bold small">Actualizado:</label>
                <div className="small text-muted">
                  {formatDate(product.updatedAt, 'dd \'de\' MMMM \'de\' yyyy, HH:mm')}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}