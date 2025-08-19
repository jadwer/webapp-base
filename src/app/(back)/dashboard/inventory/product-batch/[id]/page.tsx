/**
 * PRODUCT BATCH DETAIL PAGE
 * Página de detalle de lote de producto
 * Siguiendo patrón establecido en inventory module
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductBatchDetail } from '@/modules/inventory'
import Link from 'next/link'

// ✅ Next.js 15 - Props con Promise para params
interface PageProps {
  params: Promise<{ id: string }>
}

// ✅ Next.js 15 metadata generada dinámicamente
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `Lote de Producto ${id} - Inventory`,
    description: `Detalles completos del lote de producto con seguimiento de stock y vencimientos`
  }
}

export default async function ProductBatchDetailPage({ params }: PageProps) {
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
              <li className="breadcrumb-item active" aria-current="page">
                Lote #{id}
              </li>
            </ol>
          </nav>
          
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 mb-1">
                <i className="bi bi-box text-primary me-2" />
                Detalle del Lote
              </h1>
              <p className="text-muted mb-0">
                Información completa del lote de producto #{id}
              </p>
            </div>
            
            <div className="d-flex gap-2">
              <Link
                href={`/dashboard/inventory/product-batch/${id}/edit`}
                className="btn btn-warning"
              >
                <i className="bi bi-pencil me-1" />
                Editar
              </Link>
              
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
      </div>

      {/* Detail Content */}
      <Suspense fallback={
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando lote...</span>
                </div>
                <p className="text-muted">Cargando información del lote...</p>
              </div>
            </div>
          </div>
        </div>
      }>
        <ProductBatchDetail productBatchId={id} />
      </Suspense>
    </div>
  )
}