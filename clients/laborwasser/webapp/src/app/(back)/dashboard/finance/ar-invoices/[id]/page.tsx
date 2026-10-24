'use client'

import { useParams } from 'next/navigation'
import { InvoiceDetail } from '@/modules/finance'

export default function ARInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  return <InvoiceDetail kind="ar" id={id} />
}
