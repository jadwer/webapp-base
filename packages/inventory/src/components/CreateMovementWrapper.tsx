'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast, useNavigationProgress } from '@lwm/ui'
import { useAuth } from '@lwm/auth'
import { InventoryMovementForm, type MovementFormData, type MovementFormDefaults, type MovementType } from './InventoryMovementForm'
import { FormStateCard } from './FormStateCard'
import { useInventoryMovementsMutations, useWarehouses } from '../hooks'
import { MOVEMENT_TYPE } from '../utils/labels'
import type { CreateMovementData, UpdateMovementData } from '../types'

const LIST_HREF = '/dashboard/inventory/movements'

const readDefaults = (params: URLSearchParams): MovementFormDefaults => {
  const type = params.get('type')
  return {
    movementType: type && type in MOVEMENT_TYPE ? (type as MovementType) : undefined,
    productId: params.get('productId') || undefined,
    warehouseId: params.get('warehouseId') || undefined,
    locationId: params.get('locationId') || undefined,
  }
}

const CreateMovementContent = () => {
  const navigation = useNavigationProgress()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { createMovement } = useInventoryMovementsMutations()
  const { warehouses, isLoading } = useWarehouses({
    filters: { isActive: true },
    pagination: { size: 100 },
  })

  const handleSubmit = async (data: MovementFormData | UpdateMovementData) => {
    if (!user?.id) throw new Error('No se pudo identificar al usuario. Vuelve a iniciar sesión.')
    await createMovement({ ...(data as MovementFormData), userId: String(user.id) } as CreateMovementData)
    toast.success('Movimiento registrado')
    navigation.push(LIST_HREF)
  }

  if (isLoading && warehouses.length === 0) {
    return <FormStateCard state="loading" title="Nuevo movimiento" backHref={LIST_HREF} message="Cargando almacenes..." />
  }

  return (
    <InventoryMovementForm
      onSubmit={handleSubmit}
      onCancel={() => navigation.push(LIST_HREF)}
      warehouses={warehouses}
      defaults={readDefaults(searchParams)}
      backHref={LIST_HREF}
    />
  )
}

/** useSearchParams exige un limite de Suspense en paginas estaticas */
export const CreateMovementWrapper = () => (
  <Suspense fallback={<FormStateCard state="loading" title="Nuevo movimiento" backHref={LIST_HREF} />}>
    <CreateMovementContent />
  </Suspense>
)
