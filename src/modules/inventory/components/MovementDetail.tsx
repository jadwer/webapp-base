'use client'

import { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useInventoryMovement, useInventoryMovementsMutations } from '../hooks'

interface MovementDetailProps {
  movementId: string
}

export const MovementDetail = ({ movementId }: MovementDetailProps) => {
  const navigation = useNavigationProgress()
  const { movement, isLoading, error } = useInventoryMovement(movementId, ['product', 'warehouse', 'location', 'user'])
  const { deleteMovement } = useInventoryMovementsMutations()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Helper functions
  const getTypeLabel = (type: string) => {
    const types = {
      entry: 'Entrada',
      exit: 'Salida',
      transfer: 'Transferencia',
      adjustment: 'Ajuste'
    }
    return types[type as keyof typeof types] || type
  }
  
  const getTypeBadgeClass = (type: string) => {
    const classes = {
      entry: 'bg-success',
      exit: 'bg-primary',
      transfer: 'bg-info',
      adjustment: 'bg-warning'
    }
    return classes[type as keyof typeof classes] || 'bg-secondary'
  }
  
  const getStatusLabel = (status: string) => {
    const statuses = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      cancelled: 'Cancelado',
      failed: 'Fallido'
    }
    return statuses[status as keyof typeof statuses] || status
  }
  
  const getStatusBadgeClass = (status: string) => {
    const classes = {
      pending: 'bg-warning',
      processing: 'bg-info',
      completed: 'bg-success',
      cancelled: 'bg-secondary',
      failed: 'bg-danger'
    }
    return classes[status as keyof typeof classes] || 'bg-secondary'
  }
  
  const handleEdit = () => {
    navigation.push(`/dashboard/inventory/movements/${movementId}/edit`)
  }
  
  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true)
      return
    }
    
    try {
      setIsDeleting(true)
      await deleteMovement(movementId)
      
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
            Movimiento eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        navigation.push('/dashboard/inventory/movements')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error deleting movement:', error)
      
      // Show error toast
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al eliminar el movimiento'
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
    navigation.push('/dashboard/inventory/movements')
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
                <p className="mt-3 text-muted">Cargando detalles del movimiento...</p>
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
                <h4 className="mt-3 text-danger">Error al cargar el movimiento</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del movimiento'}</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Movimientos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!movement) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-arrow-left-right" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Movimiento no encontrado</h4>
                <p className="text-muted">El movimiento solicitado no existe o no está disponible</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Movimientos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">Movimiento #{movement.id}</h1>
                <span className={`badge ${getTypeBadgeClass(movement.movementType)} text-white`}>
                  {getTypeLabel(movement.movementType)}
                </span>
                <span className={`badge ${getStatusBadgeClass(movement.status)} text-white`}>
                  {getStatusLabel(movement.status)}
                </span>
              </div>
              <p className="text-muted mb-0">
                <strong>Referencia:</strong> {movement.referenceType || 'N/A'} •{' '}
                <strong>Fecha:</strong> {new Date(movement.movementDate).toLocaleDateString('es-ES')}
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
            {/* Movement Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Información del Movimiento
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Tipo:</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${getTypeBadgeClass(movement.movementType)} text-white`}>
                        {getTypeLabel(movement.movementType)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-4">Estado:</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${getStatusBadgeClass(movement.status)} text-white`}>
                        {getStatusLabel(movement.status)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-4">Cantidad:</dt>
                    <dd className="col-sm-8">
                      <span className="fw-bold text-primary">
                        {formatQuantity(movement.quantity)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-4">Referencia:</dt>
                    <dd className="col-sm-8">{movement.referenceType || 'No especificada'}</dd>
                    
                    <dt className="col-sm-4">Fecha:</dt>
                    <dd className="col-sm-8">{new Date(movement.movementDate).toLocaleDateString('es-ES')}</dd>
                    
                    {movement.metadata?.reason && (
                      <>
                        <dt className="col-sm-4">Motivo:</dt>
                        <dd className="col-sm-8">{movement.metadata.reason}</dd>
                      </>
                    )}
                    
                    {movement.metadata?.notes && (
                      <>
                        <dt className="col-sm-4">Notas:</dt>
                        <dd className="col-sm-8">{movement.metadata.notes}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Product and Location */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-box me-2"></i>
                    Producto y Ubicación
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Producto:</dt>
                    <dd className="col-sm-7">
                      {movement.product?.name || 'No especificado'}
                      {movement.product?.sku && (
                        <>
                          <br />
                          <small className="text-muted">SKU: {movement.product.sku}</small>
                        </>
                      )}
                    </dd>
                    
                    <dt className="col-sm-5">Almacén:</dt>
                    <dd className="col-sm-7">{movement.warehouse?.name || 'No especificado'}</dd>
                    
                    <dt className="col-sm-5">Ubicación:</dt>
                    <dd className="col-sm-7">
                      {movement.location?.name || 'No especificada'}
                    </dd>
                    
                    {movement.destinationWarehouse && (
                      <>
                        <dt className="col-sm-5">Almacén Destino:</dt>
                        <dd className="col-sm-7">{movement.destinationWarehouse.name}</dd>
                      </>
                    )}
                    
                    {movement.destinationLocation && (
                      <>
                        <dt className="col-sm-5">Ubicación Destino:</dt>
                        <dd className="col-sm-7">{movement.destinationLocation.name}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Financial Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-warning text-dark">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Información Financiera
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {movement.unitCost && (
                      <>
                        <dt className="col-sm-6">Costo Unitario:</dt>
                        <dd className="col-sm-6">
                          {formatCurrency(movement.unitCost)}
                        </dd>
                      </>
                    )}
                    
                    {movement.totalValue && (
                      <>
                        <dt className="col-sm-6">Valor Total:</dt>
                        <dd className="col-sm-6">
                          <span className="fw-bold text-success">
                            {formatCurrency(movement.totalValue)}
                          </span>
                        </dd>
                      </>
                    )}
                    
                    {!movement.unitCost && !movement.totalValue && (
                      <dd className="col-12 text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        No se ha proporcionado información financiera
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* System Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-secondary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Información del Sistema
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Creado:</dt>
                    <dd className="col-sm-7">{new Date(movement.createdAt).toLocaleString('es-ES')}</dd>
                    
                    <dt className="col-sm-5">Actualizado:</dt>
                    <dd className="col-sm-7">{new Date(movement.updatedAt).toLocaleString('es-ES')}</dd>
                    
                    
                    {movement.user && (
                      <>
                        <dt className="col-sm-5">Usuario:</dt>
                        <dd className="col-sm-7">{movement.user.name || movement.user.email}</dd>
                      </>
                    )}
                    
                    {movement.metadata && (
                      <>
                        <dt className="col-sm-5">Metadatos:</dt>
                        <dd className="col-sm-7">
                          <pre className="text-muted small">{JSON.stringify(movement.metadata, null, 2)}</pre>
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