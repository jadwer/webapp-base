'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { InventoryMovementForm, type MovementFormData } from './InventoryMovementForm'
import { FormStateCard } from './FormStateCard'
import { useInventoryMovement, useInventoryMovementsMutations, useWarehouses } from '../hooks'
import type { UpdateMovementData } from '../types'

interface EditMovementWrapperProps {
  movementId: string
}

const LIST_HREF = '/dashboard/inventory/movements'

export const EditMovementWrapper = ({ movementId }: EditMovementWrapperProps) => {
  const navigation = useNavigationProgress()
  const detailHref = `${LIST_HREF}/${movementId}`
  const { movement, isLoading: isLoadingMovement, error } = useInventoryMovement(movementId, ['product', 'warehouse', 'location'])
  const { updateMovement } = useInventoryMovementsMutations()
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses({
    filters: { isActive: true },
    pagination: { size: 100 },
  })

  const handleSubmit = async (data: MovementFormData | UpdateMovementData) => {
    await updateMovement(movementId, data as UpdateMovementData)
    toast.success('Movimiento actualizado')
    navigation.push(detailHref)
  }

  if (isLoadingMovement || (isLoadingWarehouses && warehouses.length === 0)) {
    return <FormStateCard state="loading" title="Editar movimiento" backHref={detailHref} message="Cargando movimiento..." />
  }
  if (error) {
    return <FormStateCard state="error" title="Editar movimiento" backHref={LIST_HREF} message={error.message || 'No se pudo cargar el movimiento.'} />
  }
  if (!movement) {
    return <FormStateCard state="not-found" title="Editar movimiento" backHref={LIST_HREF} icon="bi-arrow-left-right" message="El movimiento no existe o no está disponible." />
  }

  // Un almacen inactivo del movimiento sigue disponible en la edicion
  const current = movement.warehouse
  const options = current && !warehouses.some((w) => w.id === String(current.id))
    ? [current, ...warehouses]
    : warehouses

  return (
    <InventoryMovementForm
      movement={movement}
      onSubmit={handleSubmit}
      onCancel={() => navigation.push(detailHref)}
      warehouses={options}
      backHref={detailHref}
    />
  )
}
