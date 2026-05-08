'use client'

import { use } from 'react'
import { FractionationDetail } from '@/modules/inventory'

export default function FractionationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <FractionationDetail fractionationId={id} />
}
