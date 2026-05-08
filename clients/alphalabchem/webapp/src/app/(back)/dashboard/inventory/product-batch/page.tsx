/**
 * PRODUCT BATCH MAIN PAGE
 * Dashboard principal para gestión de lotes de productos
 * Siguiendo patrón establecido en inventory module
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductBatchesAdminPageReal } from '@/modules/inventory'

// ✅ Next.js 15 metadata
export const metadata: Metadata = {
  title: 'Lotes de Productos - Inventory',
  description: 'Gestión completa de lotes de productos con seguimiento de vencimientos y stock'
}

export default function ProductBatchPage() {
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Lotes de Productos</h1>
          <p className="text-muted mb-0">
            Gestión completa de lotes con seguimiento de vencimientos, stock y calidad
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando lotes...</span>
          </div>
        </div>
      }>
        <ProductBatchesAdminPageReal />
      </Suspense>
    </div>
  )
}