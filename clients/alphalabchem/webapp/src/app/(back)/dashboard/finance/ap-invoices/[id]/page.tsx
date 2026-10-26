'use client'

import { useParams } from 'next/navigation'
import { InvoiceDetail } from '@/modules/finance'

export default function APInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  return <InvoiceDetail kind="ap" id={id} />
}
