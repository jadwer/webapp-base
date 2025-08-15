'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useStockItem, useStockMutations } from '../hooks'

interface StockDetailProps {
  stockId: string
}

export const StockDetail = ({ stockId }: StockDetailProps) => {
  const router = useRouter()
  const { stockItem: stock, isLoading, error } = useStockItem(stockId, ['product', 'warehouse', 'location'])
  const { deleteStock } = useStockMutations()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const getStatusLabel = (status: string) => {
    const statuses = {
      available: 'Disponible',
      reserved: 'Reservado',
      allocated: 'Asignado',
      damaged: 'Dañado',
      expired: 'Expirado',
      on_hold: 'En Espera'
    }
    return statuses[status as keyof typeof statuses] || status
  }
  
  const getStatusBadgeClass = (status: string) => {
    const classes = {
      available: 'bg-success',
      reserved: 'bg-warning',
      allocated: 'bg-info',
      damaged: 'bg-danger',
      expired: 'bg-dark',
      on_hold: 'bg-secondary'
    }
    return classes[status as keyof typeof classes] || 'bg-secondary'
  }
  
  const handleEdit = () => {
    router.push(`/dashboard/inventory/stock/${stockId}/edit`)
  }
  
  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true)
      return
    }
    
    try {
      setIsDeleting(true)
      await deleteStock(stockId)
      
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
            Registro de stock eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        router.push('/dashboard/inventory/stock')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error deleting stock:', error)
      
      // Show error toast
      const message = (error as any)?.response?.data?.message || 'Error al eliminar el registro de stock'
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
    router.push('/dashboard/inventory/stock')
  }
  
  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando detalles del stock...</p>
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
          <div className="col-lg-8">
            <div className="card border-danger">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 text-danger">Error al cargar el stock</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del stock'}</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Stock
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!stock) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-boxes" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Stock no encontrado</h4>
                <p className="text-muted">El registro de stock solicitado no existe o no está disponible</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Stock
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const isLowStock = stock.minimumStock && stock.quantity <= stock.minimumStock
  const isOutOfStock = stock.quantity <= 0

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">Stock ID: {stock.id}</h1>
                <span className={`badge ${getStatusBadgeClass(stock.status)} text-white`}>
                  {getStatusLabel(stock.status)}
                </span>
                {isOutOfStock && (
                  <span className="badge bg-danger">Sin Stock</span>
                )}
                {isLowStock && !isOutOfStock && (
                  <span className="badge bg-warning">Stock Bajo</span>
                )}
              </div>
              <p className="text-muted mb-0">
                <strong>Producto:</strong> {stock.product?.name || 'N/A'} •{' '}
                <strong>Almacén:</strong> {stock.warehouse?.name || 'N/A'}
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
            {/* Stock Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-box-seam me-2"></i>
                    Información de Stock
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-6">Cantidad Total:</dt>
                    <dd className="col-sm-6">
                      <span className={`fw-bold ${isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-success'}`}>
                        {stock.quantity?.toLocaleString() || 0}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-6">Cantidad Reservada:</dt>
                    <dd className="col-sm-6">{stock.reservedQuantity?.toLocaleString() || 0}</dd>
                    
                    <dt className="col-sm-6">Cantidad Disponible:</dt>
                    <dd className="col-sm-6">
                      <span className="fw-bold text-success">
                        {stock.availableQuantity?.toLocaleString() || 0}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-6">Estado:</dt>
                    <dd className="col-sm-6">
                      <span className={`badge ${getStatusBadgeClass(stock.status)} text-white`}>
                        {getStatusLabel(stock.status)}
                      </span>
                    </dd>
                    
                    {stock.minimumStock && (
                      <>
                        <dt className="col-sm-6">Stock Mínimo:</dt>
                        <dd className="col-sm-6">{stock.minimumStock.toLocaleString()}</dd>
                      </>
                    )}
                    
                    {stock.maximumStock && (
                      <>
                        <dt className="col-sm-6">Stock Máximo:</dt>
                        <dd className="col-sm-6">{stock.maximumStock.toLocaleString()}</dd>
                      </>
                    )}
                    
                    {stock.reorderPoint && (
                      <>
                        <dt className="col-sm-6">Punto de Reorden:</dt>
                        <dd className="col-sm-6">{stock.reorderPoint.toLocaleString()}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Financial Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Información Financiera
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {stock.unitCost && (
                      <>
                        <dt className="col-sm-6">Costo Unitario:</dt>
                        <dd className="col-sm-6">
                          ${stock.unitCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </>
                    )}
                    
                    {stock.totalValue && (
                      <>
                        <dt className="col-sm-6">Valor Total:</dt>
                        <dd className="col-sm-6">
                          <span className="fw-bold text-success">
                            ${stock.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </dd>
                      </>
                    )}
                    
                    {stock.lastMovementDate && (
                      <>
                        <dt className="col-sm-6">Último Movimiento:</dt>
                        <dd className="col-sm-6">{new Date(stock.lastMovementDate).toLocaleDateString('es-ES')}</dd>
                      </>
                    )}
                    
                    {stock.lastMovementType && (
                      <>
                        <dt className="col-sm-6">Tipo de Movimiento:</dt>
                        <dd className="col-sm-6">
                          <span className="badge bg-info">
                            {stock.lastMovementType}
                          </span>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Product and Location */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-box me-2"></i>
                    Producto y Ubicación
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Producto:</dt>
                    <dd className="col-sm-7">
                      {stock.product?.name || 'No especificado'}
                      {stock.product?.sku && (
                        <>
                          <br />
                          <small className="text-muted">SKU: {stock.product.sku}</small>
                        </>
                      )}
                    </dd>
                    
                    <dt className="col-sm-5">Almacén:</dt>
                    <dd className="col-sm-7">{stock.warehouse?.name || 'No especificado'}</dd>
                    
                    <dt className="col-sm-5">Ubicación:</dt>
                    <dd className="col-sm-7">
                      {stock.location?.name || 'No especificada'}
                      {stock.location?.code && (
                        <>
                          <br />
                          <small className="text-muted">Código: {stock.location.code}</small>
                        </>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Timestamps and Additional Info */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-secondary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Información Adicional
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Creado:</dt>
                    <dd className="col-sm-7">{new Date(stock.createdAt).toLocaleString('es-ES')}</dd>
                    
                    <dt className="col-sm-5">Actualizado:</dt>
                    <dd className="col-sm-7">{new Date(stock.updatedAt).toLocaleString('es-ES')}</dd>
                    
                    {stock.batchInfo && (
                      <>
                        <dt className="col-sm-5">Info de Lote:</dt>
                        <dd className="col-sm-7">
                          <pre className="text-muted small">{JSON.stringify(stock.batchInfo, null, 2)}</pre>
                        </dd>
                      </>
                    )}
                    
                    {stock.metadata && (
                      <>
                        <dt className="col-sm-5">Metadatos:</dt>
                        <dd className="col-sm-7">
                          <pre className="text-muted small">{JSON.stringify(stock.metadata, null, 2)}</pre>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}