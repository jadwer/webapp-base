'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast, useNavigationProgress } from '@lwm/ui'
import { LocationForm } from './LocationForm'
import { FormStateCard } from './FormStateCard'
import { useLocationsMutations } from '../hooks'
import type { CreateLocationData, UpdateLocationData } from '../types'

const LIST_HREF = '/dashboard/inventory/locations'

const CreateLocationContent = () => {
  const navigation = useNavigationProgress()
  const searchParams = useSearchParams()
  const { createLocation } = useLocationsMutations()
  // Desde el detalle del almacen llega ?warehouseId= y se regresa ahi
  const warehouseId = searchParams.get('warehouseId') || undefined
  const returnHref = warehouseId ? `/dashboard/inventory/warehouses/${warehouseId}` : LIST_HREF

  const handleSubmit = async (data: CreateLocationData | UpdateLocationData) => {
    await createLocation(data as CreateLocationData)
    toast.success('Ubicación creada')
    navigation.push(returnHref)
  }

  return (
    <LocationForm
      onSubmit={handleSubmit}
      onCancel={() => navigation.push(returnHref)}
      defaultWarehouseId={warehouseId}
      backHref={returnHref}
    />
  )
}

/** useSearchParams exige un limite de Suspense en paginas estaticas */
export const CreateLocationWrapper = () => (
  <Suspense fallback={<FormStateCard state="loading" title="Nueva ubicación" backHref={LIST_HREF} />}>
    <CreateLocationContent />
  </Suspense>
)
