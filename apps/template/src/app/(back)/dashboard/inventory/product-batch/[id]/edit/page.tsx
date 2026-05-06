/**
 * EDIT PRODUCT BATCH PAGE
 * Página para editar lotes de productos existentes
 * Siguiendo patrón establecido en inventory module
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EditProductBatchWrapper } from '@/modules/inventory'
import Link from 'next/link'

// ✅ Next.js 15 - Props con Promise para params
interface PageProps {
  params: Promise<{ id: string }>
}

// ✅ Next.js 15 metadata generada dinámicamente
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `Editar Lote ${id} - Inventory`,
    description: `Editar información del lote de producto incluyendo stock y estado`
  }
}

export default async function EditProductBatchPage({ params }: PageProps) {
  // ✅ Awaiting params as required by Next.js 15
  const { id } = await params

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
              <li className="breadcrumb-item">
                <Link href={`/dashboard/inventory/product-batch/${id}`} className="text-decoration-none">
                  Lote #{id}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Editar
              </li>
            </ol>
          </nav>
          
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 mb-1">
                <i className="bi bi-pencil text-warning me-2" />
                Editar Lote de Producto
              </h1>
              <p className="text-muted mb-0">
                Modificar información del lote #{id}
              </p>
            </div>
            
            <div className="d-flex gap-2">
              <Link
                href={`/dashboard/inventory/product-batch/${id}`}
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-arrow-left me-1" />
                Volver a Detalle
              </Link>
            </div>
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
                <EditProductBatchWrapper productBatchId={id} />
              </Suspense>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-4 col-xl-6">
          <div className="card bg-light">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-exclamation-triangle me-2" />
                Consideraciones Importantes
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="fw-semibold text-warning">
                  <i className="bi bi-boxes me-1" />
                  Stock Actual
                </h6>
                <p className="small text-muted mb-0">
                  Solo puedes reducir el stock actual, no aumentarlo. Para incrementar stock usa movimientos de entrada.
                </p>
              </div>
              
              <div className="mb-3">
                <h6 className="fw-semibold text-danger">
                  <i className="bi bi-calendar-x me-1" />
                  Fechas Críticas
                </h6>
                <p className="small text-muted mb-0">
                  Las fechas de manufactura y vencimiento no deberían modificarse una vez establecidas.
                </p>
              </div>
              
              <div className="mb-3">
                <h6 className="fw-semibold text-info">
                  <i className="bi bi-shield-check me-1" />
                  Estados del Lote
                </h6>
                <ul className="small text-muted mb-0">
                  <li><strong>Activo:</strong> Listo para uso</li>
                  <li><strong>Cuarentena:</strong> En revisión</li>
                  <li><strong>Vencido:</strong> No usar</li>
                  <li><strong>Retirado:</strong> Problema de calidad</li>
                  <li><strong>Consumido:</strong> Stock agotado</li>
                </ul>
              </div>
              
              <div className="border-top pt-3">
                <div className="alert alert-info mb-0">
                  <i className="bi bi-lightbulb me-2" />
                  <strong>Tip:</strong> Los cambios de estado pueden afectar la disponibilidad del lote en el sistema.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}