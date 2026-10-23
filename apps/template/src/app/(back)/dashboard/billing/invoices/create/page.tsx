'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@lwm/ui'
import { FreeInvoiceForm } from '@/modules/billing'

export default function CreateInvoicePage() {
  const router = useRouter()

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Nueva factura"
        subtitle="Factura libre: cliente, serie y conceptos. Se guarda como borrador y se timbra desde su detalle."
        icon="bi-file-earmark-text"
        backHref="/dashboard/billing/invoices"
      />
      <FreeInvoiceForm
        onCreated={(id) => router.push(`/dashboard/billing/invoices/${id}`)}
        onCancel={() => router.back()}
      />
    </div>
  )
}
