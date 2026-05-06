/**
 * VIEW DISCOUNT RULE PAGE
 * Pagina para ver detalle de una regla de descuento
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ViewDiscountRuleWrapper } from '@/modules/sales'

export const metadata: Metadata = {
  title: 'Detalle de Regla - Sales',
  description: 'Ver detalle de una regla de descuento'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewDiscountRulePage({ params }: PageProps) {
  const { id } = await params

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
      <ViewDiscountRuleWrapper ruleId={id} />
    </Suspense>
  )
}
