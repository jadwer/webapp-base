'use client'

// Rediseno de Compras (2026-11-17): edicion de datos y partidas en @lwm/purchase
import { use } from 'react'
import { usePurchaseOrder, usePurchaseOrderItems, PurchaseOrderEditor } from '@/modules/purchase'

export default function EditPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { purchaseOrder, isLoading, error, mutate } = usePurchaseOrder(id)
  const { purchaseOrderItems, isLoading: itemsLoading, mutate: mutateItems } = usePurchaseOrderItems(id)

  if (isLoading || itemsLoading) {
    return <div className="container-fluid py-5 text-center"><span className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando orden…</span></span></div>
  }
  if (error || !purchaseOrder) {
    return <div className="container-fluid py-4"><div className="alert alert-warning">{error ? 'No se pudo cargar la orden de compra.' : 'No se encontró la orden de compra.'}</div></div>
  }
  return (
    <PurchaseOrderEditor
      key={`${purchaseOrder.id}-${purchaseOrder.updatedAt}`}
      purchaseOrder={purchaseOrder}
      items={purchaseOrderItems}
      onSaved={async () => { await Promise.all([mutate(), mutateItems()]) }}
    />
  )
}
