'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { WarehouseForm } from './WarehouseForm'
import { useWarehousesMutations } from '../hooks'
import type { CreateWarehouseData, UpdateWarehouseData } from '../types'

const LIST_HREF = '/dashboard/inventory/warehouses'

export const CreateWarehouseWrapper = () => {
  const navigation = useNavigationProgress()
  const { createWarehouse } = useWarehousesMutations()

  const handleSubmit = async (data: CreateWarehouseData | UpdateWarehouseData) => {
    await createWarehouse(data as CreateWarehouseData)
    toast.success('Almacén creado')
    navigation.push(LIST_HREF)
  }

  return <WarehouseForm onSubmit={handleSubmit} onCancel={() => navigation.push(LIST_HREF)} backHref={LIST_HREF} />
}
