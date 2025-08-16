'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/components/base/Button'
import { useWarehouse, useWarehousesMutations } from '../hooks'

interface WarehouseDetailProps {
  warehouseId: string
}

export const WarehouseDetail = ({ warehouseId }: WarehouseDetailProps) => {
  const router = useRouter()
  const { warehouse, isLoading, error } = useWarehouse(warehouseId)
  const { deleteWarehouse, isDeleting } = useWarehousesMutations()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  
  const handleEdit = () => {
    router.push(`/dashboard/inventory/warehouses/${warehouseId}/edit`)
  }
  
  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true)
      return
    }
    
    try {
      await deleteWarehouse(warehouseId)
      
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
            Almacén eliminado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => {
        document.body.removeChild(toastElement)
        router.push('/dashboard/inventory/warehouses')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error deleting warehouse:', error)
      
      // Show error toast
      const message = error.response?.data?.message || 'Error al eliminar el almacén'
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
    }
    
    setIsConfirmingDelete(false)
  }
  
  const handleBack = () => {
    router.push('/dashboard/inventory/warehouses')
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
                <p className="mt-3 text-muted">Cargando detalles del almacén...</p>
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
                <h4 className="mt-3 text-danger">Error al cargar el almacén</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del almacén'}</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Almacenes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!warehouse) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-building" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Almacén no encontrado</h4>
                <p className="text-muted">El almacén solicitado no existe o no está disponible</p>
                <Button variant="primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Almacenes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const attrs = warehouse.attributes
  
  const getTypeLabel = (type: string) => {
    const types = {
      main: 'Principal',
      secondary: 'Secundario',
      distribution: 'Distribución',
      returns: 'Devoluciones'
    }
    return types[type as keyof typeof types] || type
  }
  
  const getTypeBadgeClass = (type: string) => {
    const classes = {
      main: 'bg-primary',
      secondary: 'bg-secondary',
      distribution: 'bg-info',
      returns: 'bg-warning'
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
                <span className={`badge ${getTypeBadgeClass(attrs.warehouseType)} text-white`}>
                  {getTypeLabel(attrs.warehouseType)}
                </span>
                <span className={`badge ${attrs.isActive ? 'bg-success' : 'bg-danger'}`}>
                  {attrs.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-muted mb-0">
                <strong>Código:</strong> {attrs.code} • <strong>Slug:</strong> {attrs.slug}
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
                    
                    <dt className="col-sm-4">Slug:</dt>
                    <dd className="col-sm-8">{attrs.slug}</dd>
                    
                    <dt className="col-sm-4">Tipo:</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${getTypeBadgeClass(attrs.warehouseType)} text-white`}>
                        {getTypeLabel(attrs.warehouseType)}
                      </span>
                    </dd>
                    
                    <dt className="col-sm-4">Estado:</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${attrs.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {attrs.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </dd>
                    
                    {attrs.description && (
                      <>
                        <dt className="col-sm-4">Descripción:</dt>
                        <dd className="col-sm-8">{attrs.description}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    Ubicación
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {attrs.address && (
                      <>
                        <dt className="col-sm-4">Dirección:</dt>
                        <dd className="col-sm-8">{attrs.address}</dd>
                      </>
                    )}
                    
                    {attrs.city && (
                      <>
                        <dt className="col-sm-4">Ciudad:</dt>
                        <dd className="col-sm-8">{attrs.city}</dd>
                      </>
                    )}
                    
                    {attrs.state && (
                      <>
                        <dt className="col-sm-4">Estado:</dt>
                        <dd className="col-sm-8">{attrs.state}</dd>
                      </>
                    )}
                    
                    {attrs.country && (
                      <>
                        <dt className="col-sm-4">País:</dt>
                        <dd className="col-sm-8">{attrs.country}</dd>
                      </>
                    )}
                    
                    {attrs.postalCode && (
                      <>
                        <dt className="col-sm-4">Código Postal:</dt>
                        <dd className="col-sm-8">{attrs.postalCode}</dd>
                      </>
                    )}
                    
                    {!attrs.address && !attrs.city && !attrs.state && !attrs.country && !attrs.postalCode && (
                      <dd className="col-12 text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        No se ha proporcionado información de ubicación
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Información de Contacto
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {attrs.managerName && (
                      <>
                        <dt className="col-sm-4">Encargado:</dt>
                        <dd className="col-sm-8">{attrs.managerName}</dd>
                      </>
                    )}
                    
                    {attrs.phone && (
                      <>
                        <dt className="col-sm-4">Teléfono:</dt>
                        <dd className="col-sm-8">
                          <a href={`tel:${attrs.phone}`} className="text-decoration-none">
                            <i className="bi bi-telephone me-2"></i>
                            {attrs.phone}
                          </a>
                        </dd>
                      </>
                    )}
                    
                    {attrs.email && (
                      <>
                        <dt className="col-sm-4">Email:</dt>
                        <dd className="col-sm-8">
                          <a href={`mailto:${attrs.email}`} className="text-decoration-none">
                            <i className="bi bi-envelope me-2"></i>
                            {attrs.email}
                          </a>
                        </dd>
                      </>
                    )}
                    
                    {!attrs.managerName && !attrs.phone && !attrs.email && (
                      <dd className="col-12 text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        No se ha proporcionado información de contacto
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Capacity and Operations */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-warning text-dark">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-archive me-2"></i>
                    Capacidad y Operación
                  </h5>
                </div>
                <div className="card-body">
                  <dl className="row">
                    {attrs.maxCapacity && (
                      <>
                        <dt className="col-sm-5">Capacidad Máxima:</dt>
                        <dd className="col-sm-7">
                          {attrs.maxCapacity.toLocaleString()} {attrs.capacityUnit || 'unidades'}
                        </dd>
                      </>
                    )}
                    
                    {attrs.operatingHours && (
                      <>
                        <dt className="col-sm-5">Horarios:</dt>
                        <dd className="col-sm-7">{attrs.operatingHours}</dd>
                      </>
                    )}
                    
                    {attrs.metadata && (
                      <>
                        <dt className="col-sm-5">Metadatos:</dt>
                        <dd className="col-sm-7">
                          <pre className="text-muted small">{attrs.metadata}</pre>
                        </dd>
                      </>
                    )}
                    
                    {!attrs.maxCapacity && !attrs.operatingHours && !attrs.metadata && (
                      <dd className="col-12 text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        No se ha proporcionado información de capacidad u operación
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Timestamps */}
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Información de Sistema
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <dt>Creado:</dt>
                      <dd>{new Date(attrs.createdAt).toLocaleString('es-ES')}</dd>
                    </div>
                    <div className="col-md-6">
                      <dt>Última Actualización:</dt>
                      <dd>{new Date(attrs.updatedAt).toLocaleString('es-ES')}</dd>
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