/**
 * CYCLE COUNTS MAIN PAGE
 * Dashboard principal para gestion de conteos ciclicos de inventario
 * Backend v1.1 - ABC Analysis cycle counting
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CycleCountsAdminPageReal } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Conteos Ciclicos - Inventory',
  description: 'Gestion de conteos ciclicos de inventario con analisis ABC'
}

export default function CycleCountsPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando conteos...</span>
          </div>
        </div>
      }
    >
      <CycleCountsAdminPageReal />
    </Suspense>
  )
}
