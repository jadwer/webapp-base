'use client'

import { WarehouseForm } from './WarehouseForm'
import { useWarehousesMutations } from '../hooks'
import type { CreateWarehouseData } from '../types'

export const CreateWarehouseWrapper = () => {
  const { createWarehouse, isLoading } = useWarehousesMutations()
  
  const handleSubmit = async (data: CreateWarehouseData) => {
    await createWarehouse(data)
  }
  
  return (
    <WarehouseForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  )
}