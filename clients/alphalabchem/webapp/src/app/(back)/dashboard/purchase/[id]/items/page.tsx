'use client'

// Rediseno de Compras (2026-11-17): las partidas se ven en la consulta y se editan en
// "Editar orden"; esta ruta vieja lleva a la consulta.
import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PurchaseOrderItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  useEffect(() => { router.replace(`/dashboard/purchase/${id}`) }, [id, router])
  return null
}
