/**
 * 📦 WAREHOUSE DETAILS PAGE - INVENTORY MODULE
 * Página para ver detalles de un almacén específico
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useWarehouse } from '@/modules/inventory'
import { getWarehouseTypeLabel, formatCapacity } from '@/modules/inventory'
import { Button } from '@/ui/components/base/Button'

export default function WarehouseDetailsPage() {
  const params = useParams()
  const warehouseId = params.id as string
  
  const {
    warehouse,
    isLoading,
    isError,
    error,
    refresh,
  } = useWarehouse(warehouseId, {
    include: ['locations', 'stock'],
    enabled: !!warehouseId,
  })
  
  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando almacén...</span>
          </div>
        </div>
      </div>
    )
  }
  
  if (isError || !warehouse) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Error al cargar almacén:</strong>{' '}
            {error?.message || 'Almacén no encontrado'}
            <button 
              className="btn btn-link p-0 ms-2"
              onClick={refresh}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const location = [warehouse.city, warehouse.state, warehouse.country].filter(Boolean).join(', ')
  const capacity = warehouse.maxCapacity 
    ? formatCapacity(warehouse.maxCapacity, warehouse.capacityUnit || '')
    : 'No especificada'
  
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href="/dashboard/inventory/warehouses" className="text-decoration-none">
                      Almacenes
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {warehouse.name}
                  </li>
                </ol>
              </nav>
              
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">{warehouse.name}</h1>
                <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'}`}>
                  <i className={`bi bi-${warehouse.isActive ? 'check-circle' : 'x-circle'} me-1`}></i>
                  {warehouse.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className={`badge bg-${getWarehouseTypeBadgeColor(warehouse.warehouseType)}`}>
                  {getWarehouseTypeLabel(warehouse.warehouseType)}
                </span>
              </div>
              
              {warehouse.description && (
                <p className="text-muted mb-0">{warehouse.description}</p>
              )}
            </div>
            
            <div className="d-flex gap-2">
              <Link href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}>
                <Button variant="outline-primary">
                  <i className="bi bi-pencil me-2"></i>
                  Editar
                </Button>
              </Link>
              
              <Button variant="outline-secondary" onClick={refresh}>
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="row g-4">
            
            {/* Basic Information */}
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Información Básica
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Código</label>
                      <div>
                        <code className="badge bg-light text-dark fs-6">{warehouse.code}</code>
                      </div>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small text-muted">Slug</label>
                      <div className="text-muted small font-monospace">{warehouse.slug}</div>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small text-muted">Tipo de Almacén</label>
                      <div>{getWarehouseTypeLabel(warehouse.warehouseType)}</div>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small text-muted">Capacidad Máxima</label>
                      <div>{capacity}</div>
                    </div>
                    
                    {warehouse.operatingHours && (
                      <div className="col-12">
                        <label className="form-label small text-muted">Horario de Operación</label>
                        <div>{warehouse.operatingHours}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Location Information */}
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    Ubicación
                  </h6>
                </div>
                <div className="card-body">
                  {warehouse.address || location ? (
                    <div className="row g-3">
                      {warehouse.address && (
                        <div className="col-12">
                          <label className="form-label small text-muted">Dirección</label>
                          <div>{warehouse.address}</div>
                        </div>
                      )}
                      
                      {location && (
                        <div className="col-12">
                          <label className="form-label small text-muted">Ubicación</label>
                          <div>{location}</div>
                        </div>
                      )}
                      
                      {warehouse.postalCode && (
                        <div className="col-6">
                          <label className="form-label small text-muted">Código Postal</label>
                          <div>{warehouse.postalCode}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted text-center py-3">
                      <i className="bi bi-geo-alt display-6 mb-2"></i>
                      <div>No se ha especificado ubicación</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            {(warehouse.managerName || warehouse.phone || warehouse.email) && (
              <div className="col-lg-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Contacto
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {warehouse.managerName && (
                        <div className="col-12">
                          <label className="form-label small text-muted">Gerente/Responsable</label>
                          <div>{warehouse.managerName}</div>
                        </div>
                      )}
                      
                      {warehouse.phone && (
                        <div className="col-6">
                          <label className="form-label small text-muted">Teléfono</label>
                          <div>
                            <a href={`tel:${warehouse.phone}`} className="text-decoration-none">
                              {warehouse.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {warehouse.email && (
                        <div className="col-6">
                          <label className="form-label small text-muted">Email</label>
                          <div>
                            <a href={`mailto:${warehouse.email}`} className="text-decoration-none">
                              {warehouse.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Statistics */}
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Estadísticas
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Ubicaciones</label>
                      <div className="h5 mb-0">
                        {warehouse.locations?.length || 0}
                        <small className="text-muted ms-1">registradas</small>
                      </div>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small text-muted">Stock Items</label>
                      <div className="h5 mb-0">
                        {warehouse.stock?.length || 0}
                        <small className="text-muted ms-1">productos</small>
                      </div>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small text-muted">Creado</label>
                      <div className="small">
                        {new Date(warehouse.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small text-muted">Actualizado</label>
                      <div className="small">
                        {new Date(warehouse.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Future Sections Placeholder */}
          <div className="row g-4 mt-2">
            <div className="col-12">
              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Próximamente
                </h6>
                <p className="mb-0">
                  En las próximas iteraciones se agregará la gestión de ubicaciones específicas 
                  y control detallado de inventario para este almacén.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

function getWarehouseTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    main: 'primary',
    secondary: 'info', 
    distribution: 'success',
    returns: 'warning',
  }
  return colors[type] || 'secondary'
}