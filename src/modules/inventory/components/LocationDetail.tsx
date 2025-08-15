'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useLocation, useLocationsMutations } from '../hooks'

interface LocationDetailProps {
  locationId: string
}

export const LocationDetail = ({ locationId }: LocationDetailProps) => {
  const router = useRouter()
  const { location, isLoading, error } = useLocation(locationId, ['warehouse'])
  const { deleteLocation } = useLocationsMutations()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleEdit = () => {
    router.push(`/dashboard/inventory/locations/${locationId}/edit`)
  }
  
  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true)
      return
    }
    
    try {
      setIsDeleting(true)
      await deleteLocation(locationId)
      
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
            Ubicación eliminada correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        router.push('/dashboard/inventory/locations')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error deleting location:', error)
      
      // Show error toast
      const message = error.response?.data?.message || 'Error al eliminar la ubicación'
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
    router.push('/dashboard/inventory/locations')
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
                <p className="mt-3 text-muted">Cargando detalles de la ubicación...</p>
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
                <h4 className="mt-3 text-danger">Error al cargar la ubicación</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información de la ubicación'}</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Ubicaciones
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!location) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-geo-alt" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Ubicación no encontrada</h4>
                <p className="text-muted">La ubicación solicitada no existe o no está disponible</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Ubicaciones
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const attrs = location.attributes
  
  const getTypeLabel = (type: string) => {
    const types = {
      storage: 'Almacenamiento',
      picking: 'Picking',
      receiving: 'Recepción',
      shipping: 'Envío',
      staging: 'Preparación',
      reserve: 'Reserva'
    }
    return types[type as keyof typeof types] || type
  }
  
  const getTypeBadgeClass = (type: string) => {
    const classes = {
      storage: 'bg-primary',
      picking: 'bg-success',
      receiving: 'bg-info',
      shipping: 'bg-warning',
      staging: 'bg-secondary',
      reserve: 'bg-dark'
    }
    return classes[type as keyof typeof classes] || 'bg-secondary'
  }
  
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">{attrs.name}</h1>
                <span className={`badge ${getTypeBadgeClass(attrs.locationType)} text-white`}>
                  {getTypeLabel(attrs.locationType)}
                </span>
                <span className={`badge ${attrs.isActive ? 'bg-success' : 'bg-danger'}`}>
                  {attrs.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-muted mb-0">
                <strong>Código:</strong> {attrs.code}
                {attrs.barcode && (
                  <>
                    {' • '}
                    <strong>Código de Barras:</strong> {attrs.barcode}
                  </>
                )}
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
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Información Básica
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Nombre:</dt>
                    <dd className="col-sm-8">{attrs.name}</dd>
                    
                    <dt className="col-sm-4">Código:</dt>
                    <dd className="col-sm-8">{attrs.code}</dd>
                    
                    <dt className="col-sm-4">Tipo:</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${getTypeBadgeClass(attrs.locationType)} text-white`}>
                        {getTypeLabel(attrs.locationType)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-4">Estado:</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${attrs.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {attrs.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-4">Prioridad:</dt>
                    <dd className="col-sm-8">{attrs.priority || 'No definida'}</dd>
                    
                    {attrs.description && (
                      <>
                        <dt className="col-sm-4">Descripción:</dt>
                        <dd className="col-sm-8">{attrs.description}</dd>
                      </>
                    )}
                    
                    {attrs.barcode && (
                      <>
                        <dt className="col-sm-4">Código de Barras:</dt>
                        <dd className="col-sm-8">
                          <code>{attrs.barcode}</code>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Location Details */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    Detalles de Ubicación
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {attrs.aisle && (
                      <>
                        <dt className="col-sm-4">Pasillo:</dt>
                        <dd className="col-sm-8">{attrs.aisle}</dd>
                      </>
                    )}
                    
                    {attrs.rack && (
                      <>
                        <dt className="col-sm-4">Estante:</dt>
                        <dd className="col-sm-8">{attrs.rack}</dd>
                      </>
                    )}
                    
                    {attrs.shelf && (
                      <>
                        <dt className="col-sm-4">Anaquel:</dt>
                        <dd className="col-sm-8">{attrs.shelf}</dd>
                      </>
                    )}
                    
                    {attrs.level && (
                      <>
                        <dt className="col-sm-4">Nivel:</dt>
                        <dd className="col-sm-8">{attrs.level}</dd>
                      </>
                    )}
                    
                    {attrs.position && (
                      <>
                        <dt className="col-sm-4">Posición:</dt>
                        <dd className="col-sm-8">{attrs.position}</dd>
                      </>
                    )}
                    
                    {attrs.dimensions && (
                      <>
                        <dt className="col-sm-4">Dimensiones:</dt>
                        <dd className="col-sm-8">{attrs.dimensions}</dd>
                      </>
                    )}
                    
                    {!attrs.aisle && !attrs.rack && !attrs.shelf && !attrs.level && !attrs.position && !attrs.dimensions && (
                      <dd className="col-12 text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        No se han proporcionado detalles específicos de ubicación
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Capacity and Capabilities */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-warning text-dark">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-archive me-2"></i>
                    Capacidad y Características
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {attrs.maxWeight && (
                      <>
                        <dt className="col-sm-5">Peso Máximo:</dt>
                        <dd className="col-sm-7">{attrs.maxWeight} kg</dd>
                      </>
                    )}
                    
                    {attrs.maxVolume && (
                      <>
                        <dt className="col-sm-5">Volumen Máximo:</dt>
                        <dd className="col-sm-7">{attrs.maxVolume} m³</dd>
                      </>
                    )}
                    
                    <dt className="col-sm-5">Se puede recoger:</dt>
                    <dd className="col-sm-7">
                      <span className={`badge ${attrs.isPickable ? 'bg-success' : 'bg-secondary'}`}>
                        {attrs.isPickable ? 'Sí' : 'No'}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-5">Se puede recibir:</dt>
                    <dd className="col-sm-7">
                      <span className={`badge ${attrs.isReceivable ? 'bg-success' : 'bg-secondary'}`}>
                        {attrs.isReceivable ? 'Sí' : 'No'}
                      </span>
                    </dd>
                    
                    {attrs.metadata && (
                      <>
                        <dt className="col-sm-5">Metadatos:</dt>
                        <dd className="col-sm-7">
                          <pre className="text-muted small">{JSON.stringify(attrs.metadata, null, 2)}</pre>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Warehouse Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-building me-2"></i>
                    Almacén
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">Almacén:</dt>
                    <dd className="col-sm-8">
                      {location.warehouse?.name || 'No especificado'}
                      {location.warehouse?.code && (
                        <>
                          <br />
                          <small className="text-muted">Código: {location.warehouse.code}</small>
                        </>
                      )}
                    </dd>
                    
                    {location.warehouse?.warehouseType && (
                      <>
                        <dt className="col-sm-4">Tipo:</dt>
                        <dd className="col-sm-8">
                          <span className="badge bg-info">
                            {location.warehouse.warehouseType}
                          </span>
                        </dd>
                      </>
                    )}
                    
                    {location.warehouse?.address && (
                      <>
                        <dt className="col-sm-4">Dirección:</dt>
                        <dd className="col-sm-8">{location.warehouse.address}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Timestamps */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-secondary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Información de Sistema
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-5">Creada:</dt>
                    <dd className="col-sm-7">{new Date(attrs.createdAt).toLocaleString('es-ES')}</dd>
                    
                    <dt className="col-sm-5">Última Actualización:</dt>
                    <dd className="col-sm-7">{new Date(attrs.updatedAt).toLocaleString('es-ES')}</dd>
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