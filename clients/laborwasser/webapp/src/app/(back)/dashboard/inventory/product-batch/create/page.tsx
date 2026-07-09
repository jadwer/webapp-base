/**
 * CREATE PRODUCT BATCH PAGE
 * Página para crear nuevos lotes de productos
 * Siguiendo patrón establecido en inventory module
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CreateProductBatchWrapper } from '@/modules/inventory'
import Link from 'next/link'

// ✅ Next.js 15 metadata
export const metadata: Metadata = {
  title: 'Crear Lote de Producto - Inventory',
  description: 'Crear nuevo lote de producto con información de manufactura y vencimiento'
}

export default function CreateProductBatchPage() {
  return (
    <div className="container-fluid py-4">
      {/* Header with navigation */}
      <div className="row mb-4">
        <div className="col">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard" className="text-decoration-none">
                  Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/dashboard/inventory" className="text-decoration-none">
                  Inventory
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/dashboard/inventory/product-batch" className="text-decoration-none">
                  Lotes de Productos
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Crear Lote
              </li>
            </ol>
          </nav>
          
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 mb-1">
                <i className="bi bi-plus-circle text-success me-2" />
                Crear Lote de Producto
              </h1>
              <p className="text-muted mb-0">
                Registra un nuevo lote con información de manufactura, vencimiento y stock inicial
              </p>
            </div>
            
            <Link
              href="/dashboard/inventory/product-batch"
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-1" />
              Volver a Lotes
            </Link>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="row">
        <div className="col-12 col-lg-8 col-xl-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-box me-2" />
                Información del Lote
              </h5>
            </div>
            <div className="card-body">
              <Suspense fallback={
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando formulario...</span>
                  </div>
                </div>
              }>
                <CreateProductBatchWrapper />
              </Suspense>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-4 col-xl-6">
          <div className="card bg-light">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-info-circle me-2" />
                Información Importante
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="fw-semibold text-primary">
                  <i className="bi bi-calendar-check me-1" />
                  Fechas de Vencimiento
                </h6>
                <p className="small text-muted mb-0">
                  Asegúrate de ingresar la fecha de vencimiento correcta para un seguimiento preciso del stock.
                </p>
              </div>
              
              <div className="mb-3">
                <h6 className="fw-semibold text-warning">
                  <i className="bi bi-box-seam me-1" />
                  Stock Inicial
                </h6>
                <p className="small text-muted mb-0">
                  El stock inicial debe coincidir con la cantidad física recibida del proveedor.
                </p>
              </div>
              
              <div className="mb-3">
                <h6 className="fw-semibold text-success">
                  <i className="bi bi-shield-check me-1" />
                  Control de Calidad
                </h6>
                <p className="small text-muted mb-0">
                  Los lotes pueden marcarse en cuarentena para revisiones de calidad antes de activar.
                </p>
              </div>
              
              <div className="border-top pt-3">
                <h6 className="fw-semibold text-info">
                  <i className="bi bi-gear me-1" />
                  Configuración JSON
                </h6>
                <p className="small text-muted mb-0">
                  Utiliza el campo de configuración para almacenar metadatos específicos del lote en formato JSON.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}