/**
 * EDIT DISCOUNT RULE PAGE
 * Pagina para editar una regla de descuento existente
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EditDiscountRuleWrapper } from '@/modules/sales'

export const metadata: Metadata = {
  title: 'Editar Regla de Descuento - Sales',
  description: 'Editar una regla de descuento'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDiscountRulePage({ params }: PageProps) {
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
      <EditDiscountRuleWrapper ruleId={id} />
    </Suspense>
  )
}
