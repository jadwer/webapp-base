/**
 * PRODUCT BATCH DETAIL
 * Vista detalle para lotes de productos
 * Siguiendo patrón exitoso de MovementDetail
 */

'use client'

import { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useProductBatch, useProductBatchMutations } from '../hooks'

interface ProductBatchDetailProps {
  productBatchId: string
}

export const ProductBatchDetail = ({ productBatchId }: ProductBatchDetailProps) => {
  const navigation = useNavigationProgress()
  const { productBatch, isLoading, error } = useProductBatch({ id: productBatchId })
  const { deleteProductBatch } = useProductBatchMutations()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Helper functions
  const getStatusLabel = (status: string) => {
    const statuses = {
      active: 'Activo',
      quarantine: 'Cuarentena',
      expired: 'Vencido',
      recalled: 'Retirado',
      consumed: 'Consumido'
    }
    return statuses[status as keyof typeof statuses] || status
  }
  
  const getStatusBadgeClass = (status: string) => {
    const classes = {
      active: 'bg-success',
      quarantine: 'bg-warning',
      expired: 'bg-danger',
      recalled: 'bg-danger',
      consumed: 'bg-secondary'
    }
    return classes[status as keyof typeof classes] || 'bg-secondary'
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null
    try {
      const now = new Date()
      const expiry = new Date(expirationDate)
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const getExpirationWarning = (expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days === null) return null

    if (days < 0) {
      return { color: 'danger', text: `Vencido hace ${Math.abs(days)} días`, icon: 'bi-exclamation-triangle' }
    } else if (days <= 7) {
      return { color: 'danger', text: `Vence en ${days} días`, icon: 'bi-exclamation-triangle' }
    } else if (days <= 30) {
      return { color: 'warning', text: `Vence en ${days} días`, icon: 'bi-clock' }
    }
    return { color: 'success', text: `${days} días restantes`, icon: 'bi-check-circle' }
  }

  const getQuantityPercentage = (current: number, initial: number) => {
    if (!current || !initial) return 0
    return Math.round((current / initial) * 100)
  }
  
  const handleEdit = () => {
    navigation.push(`/dashboard/inventory/product-batch/${productBatchId}/edit`)
  }
  
  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true)
      return
    }
    
    try {
      setIsDeleting(true)
      await deleteProductBatch(productBatchId)
      
      // Show success toast
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-success text-white">
            <strong class="me-auto">Éxito</strong>
          </div>
          <div class="toast-body">
            Lote eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        navigation.push('/dashboard/inventory/product-batch')
      }, 2000)
      
    } catch (error: unknown) {
      // Show error toast
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al eliminar el lote'
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
    } finally {
      setIsDeleting(false)
      setIsConfirmingDelete(false)
    }
  }
  
  const handleBack = () => {
    navigation.push('/dashboard/inventory/product-batch')
  }
  
  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando detalles del lote...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-danger">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 text-danger">Error al cargar el lote</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del lote'}</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Lotes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!productBatch) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-box" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Lote no encontrado</h4>
                <p className="text-muted">El lote solicitado no existe o no está disponible</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Lotes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const expirationWarning = getExpirationWarning(productBatch.expirationDate || '')
  const quantityPercentage = getQuantityPercentage(productBatch.currentQuantity || 0, productBatch.initialQuantity || 0)
  
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">Lote: {productBatch.batchNumber}</h1>
                <span className={`badge ${getStatusBadgeClass(productBatch.status || 'active')} text-white`}>
                  {getStatusLabel(productBatch.status || 'active')}
                </span>
                {expirationWarning && (
                  <span className={`badge bg-${expirationWarning.color} text-white`}>
                    <i className={`bi ${expirationWarning.icon} me-1`}></i>
                    {expirationWarning.text}
                  </span>
                )}
              </div>
              <p className="text-muted mb-0">
                <strong>Producto:</strong> {productBatch.product?.name || 'No especificado'} •{' '}
                <strong>Cantidad:</strong> {formatQuantity(productBatch.currentQuantity || 0)} / {formatQuantity(productBatch.initialQuantity || 0)} ({quantityPercentage}%)
              </p>
            </div>
            
            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                size="medium"
                onClick={handleBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </Button>
              
              <Button
                variant="primary"
                size="medium"
                onClick={handleEdit}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar
              </Button>
              
              <Button
                variant={isConfirmingDelete ? "danger" : "secondary"}
                size="medium"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Eliminando...
                  </>
                ) : isConfirmingDelete ? (
                  <>
                    <i className="bi bi-check me-2"></i>
                    Confirmar Eliminar
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="row g-4">
            {/* Basic Information */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Información Básica
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Número de Lote:</dt>
                    <dd className="col-sm-7">
                      <span className="fw-bold">{productBatch.batchNumber}</span>
                    </dd>
                    
                    {productBatch.lotNumber && (
                      <>
                        <dt className="col-sm-5">Número LOT:</dt>
                        <dd className="col-sm-7">{productBatch.lotNumber}</dd>
                      </>
                    )}
                    
                    <dt className="col-sm-5">Estado:</dt>
                    <dd className="col-sm-7">
                      <span className={`badge ${getStatusBadgeClass(productBatch.status || 'active')} text-white`}>
                        {getStatusLabel(productBatch.status || 'active')}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-5">Fabricación:</dt>
                    <dd className="col-sm-7">{formatDate(productBatch.manufacturingDate)}</dd>
                    
                    <dt className="col-sm-5">Vencimiento:</dt>
                    <dd className="col-sm-7">
                      <span className={expirationWarning ? `text-${expirationWarning.color}` : ''}>
                        {formatDate(productBatch.expirationDate)}
                        {expirationWarning && (
                          <small className="d-block">
                            <i className={`bi ${expirationWarning.icon} me-1`}></i>
                            {expirationWarning.text}
                          </small>
                        )}
                      </span>
                    </dd>
                    
                    {productBatch.bestBeforeDate && (
                      <>
                        <dt className="col-sm-5">Mejor Antes De:</dt>
                        <dd className="col-sm-7">{formatDate(productBatch.bestBeforeDate)}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Quantities and Cost */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-calculator me-2"></i>
                    Cantidades y Costo
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Cantidad Inicial:</dt>
                    <dd className="col-sm-7">
                      <span className="fw-bold text-info">
                        {formatQuantity(productBatch.initialQuantity || 0)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-5">Cantidad Actual:</dt>
                    <dd className="col-sm-7">
                      <span className={`fw-bold ${quantityPercentage <= 25 ? 'text-danger' : quantityPercentage <= 50 ? 'text-warning' : 'text-success'}`}>
                        {formatQuantity(productBatch.currentQuantity || 0)}
                      </span>
                      <small className="text-muted ms-2">({quantityPercentage}%)</small>
                      <div className="progress mt-1" style={{ height: '4px' }}>
                        <div 
                          className={`progress-bar ${quantityPercentage <= 25 ? 'bg-danger' : quantityPercentage <= 50 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar" 
                          style={{ width: `${quantityPercentage}%` }}
                        ></div>
                      </div>
                    </dd>
                    
                    <dt className="col-sm-5">Costo Unitario:</dt>
                    <dd className="col-sm-7">
                      <span className="fw-bold">
                        {formatCurrency(productBatch.unitCost || 0)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-5">Valor Total:</dt>
                    <dd className="col-sm-7">
                      <span className="fw-bold text-success">
                        {formatCurrency((productBatch.currentQuantity || 0) * (productBatch.unitCost || 0))}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Product and Location */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-warning text-dark">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-box me-2"></i>
                    Producto y Ubicación
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Producto:</dt>
                    <dd className="col-sm-7">
                      <div className="fw-bold">{productBatch.product?.name || 'No especificado'}</div>
                      {productBatch.product?.sku && (
                        <small className="text-muted">SKU: {productBatch.product.sku}</small>
                      )}
                    </dd>
                    
                    <dt className="col-sm-5">Almacén:</dt>
                    <dd className="col-sm-7">
                      <div className="fw-bold">{productBatch.warehouse?.name || 'No especificado'}</div>
                      {productBatch.warehouse?.code && (
                        <small className="text-muted">Código: {productBatch.warehouse.code}</small>
                      )}
                    </dd>
                    
                    <dt className="col-sm-5">Ubicación:</dt>
                    <dd className="col-sm-7">
                      {productBatch.warehouseLocation?.name ? (
                        <div>
                          <div className="fw-bold">{productBatch.warehouseLocation.name}</div>
                          {productBatch.warehouseLocation.code && (
                            <small className="text-muted">Código: {productBatch.warehouseLocation.code}</small>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">No especificada</span>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Supplier Information */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-truck me-2"></i>
                    Información del Proveedor
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Proveedor:</dt>
                    <dd className="col-sm-7">
                      {productBatch.supplierName || <span className="text-muted">No especificado</span>}
                    </dd>
                    
                    <dt className="col-sm-5">Lote del Proveedor:</dt>
                    <dd className="col-sm-7">
                      {productBatch.supplierBatch || <span className="text-muted">No especificado</span>}
                    </dd>
                    
                    {productBatch.qualityNotes && (
                      <>
                        <dt className="col-sm-5">Notas de Calidad:</dt>
                        <dd className="col-sm-7">
                          <div className="bg-light p-2 rounded">
                            {productBatch.qualityNotes}
                          </div>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Additional Data */}
            {(productBatch.testResults || productBatch.certifications || productBatch.metadata) && (
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-clipboard-data me-2"></i>
                      Información Adicional
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {productBatch.testResults && (
                        <div className="col-md-4 mb-3">
                          <h6 className="text-primary">Resultados de Pruebas</h6>
                          <pre className="bg-light p-3 rounded small">
                            {JSON.stringify(productBatch.testResults, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {productBatch.certifications && (
                        <div className="col-md-4 mb-3">
                          <h6 className="text-success">Certificaciones</h6>
                          <pre className="bg-light p-3 rounded small">
                            {JSON.stringify(productBatch.certifications, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {productBatch.metadata && (
                        <div className="col-md-4 mb-3">
                          <h6 className="text-info">Metadatos</h6>
                          <pre className="bg-light p-3 rounded small">
                            {JSON.stringify(productBatch.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Information */}
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-dark text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Información del Sistema
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <dl className="row">
                        <dt className="col-sm-4">ID:</dt>
                        <dd className="col-sm-8">
                          <code>{productBatch.id}</code>
                        </dd>
                        
                        <dt className="col-sm-4">Creado:</dt>
                        <dd className="col-sm-8">
                          {productBatch.createdAt ? new Date(productBatch.createdAt).toLocaleString('es-ES') : 'No disponible'}
                        </dd>
                        
                        <dt className="col-sm-4">Actualizado:</dt>
                        <dd className="col-sm-8">
                          {productBatch.updatedAt ? new Date(productBatch.updatedAt).toLocaleString('es-ES') : 'No disponible'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}