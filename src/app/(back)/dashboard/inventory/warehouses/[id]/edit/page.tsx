/**
 * 📦 EDIT WAREHOUSE PAGE - INVENTORY MODULE
 * Página para editar un almacén existente
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useWarehouse } from '@/modules/inventory'
import { WarehouseForm } from '@/modules/inventory'

export default function EditWarehousePage() {
  const params = useParams()
  const warehouseId = params.id as string
  
  const {
    warehouse,
    isLoading,
    isError,
    error,
    refresh,
  } = useWarehouse(warehouseId, {
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
            <div className="mt-2">
              <button 
                className="btn btn-link p-0 me-3"
                onClick={refresh}
              >
                Reintentar
              </button>
              <Link href="/dashboard/inventory/warehouses" className="btn btn-link p-0">
                Volver a la lista
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href="/dashboard/inventory/warehouses" className="text-decoration-none">
                      Almacenes
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href={`/dashboard/inventory/warehouses/${warehouse.id}`} className="text-decoration-none">
                      {warehouse.name}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Editar
                  </li>
                </ol>
              </nav>
              
              <h1 className="h3 mb-1">Editar Almacén</h1>
              <p className="text-muted mb-0">
                Modifica la información del almacén "{warehouse.name}"
              </p>
            </div>
          </div>
          
          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <WarehouseForm 
                warehouse={warehouse}
                showCancelButton={true}
                autoRedirect={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}