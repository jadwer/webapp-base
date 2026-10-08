'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { WarehouseForm } from './WarehouseForm'
import { FormStateCard } from './FormStateCard'
import { useWarehouse, useWarehousesMutations } from '../hooks'
import type { CreateWarehouseData, UpdateWarehouseData } from '../types'

interface EditWarehouseWrapperProps {
  warehouseId: string
}

const LIST_HREF = '/dashboard/inventory/warehouses'

export const EditWarehouseWrapper = ({ warehouseId }: EditWarehouseWrapperProps) => {
  const navigation = useNavigationProgress()
  const detailHref = `${LIST_HREF}/${warehouseId}`
  const { warehouse, isLoading, error } = useWarehouse(warehouseId)
  const { updateWarehouse } = useWarehousesMutations()

  const handleSubmit = async (data: CreateWarehouseData | UpdateWarehouseData) => {
    await updateWarehouse(warehouseId, data as UpdateWarehouseData)
    toast.success('Almacén actualizado')
    navigation.push(detailHref)
  }

  if (isLoading) {
    return <FormStateCard state="loading" title="Editar almacén" backHref={detailHref} message="Cargando almacén..." />
  }
  if (error) {
    return <FormStateCard state="error" title="Editar almacén" backHref={LIST_HREF} message={error.message || 'No se pudo cargar el almacén.'} />
  }
  if (!warehouse) {
    return <FormStateCard state="not-found" title="Editar almacén" backHref={LIST_HREF} icon="bi-building" message="El almacén no existe o no está disponible." />
  }

  return <WarehouseForm warehouse={warehouse} onSubmit={handleSubmit} onCancel={() => navigation.push(detailHref)} backHref={detailHref} />
}
