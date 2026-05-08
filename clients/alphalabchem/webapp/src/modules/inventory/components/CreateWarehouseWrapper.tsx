'use client'

import { WarehouseForm } from './WarehouseForm'
import { useWarehousesMutations } from '../hooks'
import type { CreateWarehouseData, UpdateWarehouseData } from '../types'

export const CreateWarehouseWrapper = () => {
  const { createWarehouse, isLoading } = useWarehousesMutations()
  
  const handleSubmit = async (data: CreateWarehouseData | UpdateWarehouseData) => {
    await createWarehouse(data as CreateWarehouseData)
  }
  
  return (
    <WarehouseForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  )
}