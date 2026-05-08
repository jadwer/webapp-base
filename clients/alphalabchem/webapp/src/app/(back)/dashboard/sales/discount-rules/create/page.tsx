/**
 * CREATE DISCOUNT RULE PAGE
 * Pagina para crear una nueva regla de descuento
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CreateDiscountRuleWrapper } from '@/modules/sales'

export const metadata: Metadata = {
  title: 'Nueva Regla de Descuento - Sales',
  description: 'Crear una nueva regla de descuento automatico'
}

export default function CreateDiscountRulePage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      }
    >
      <CreateDiscountRuleWrapper />
    </Suspense>
  )
}
