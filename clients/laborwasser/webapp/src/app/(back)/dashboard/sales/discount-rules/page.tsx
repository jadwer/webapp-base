/**
 * DISCOUNT RULES MAIN PAGE
 * Dashboard principal para gestion de reglas de descuento automaticas
 * Backend v1.1 - SA-M003
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DiscountRulesAdminPage } from '@/modules/sales'

export const metadata: Metadata = {
  title: 'Reglas de Descuento - Sales',
  description: 'Gestion de reglas de descuento automaticas para ventas'
}

export default function DiscountRulesPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando reglas...</span>
          </div>
        </div>
      }
    >
      <DiscountRulesAdminPage />
    </Suspense>
  )
}
