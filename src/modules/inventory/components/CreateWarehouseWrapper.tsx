'use client'

import { WarehouseForm } from './WarehouseForm'
import { useWarehousesMutations } from '../hooks'

export const CreateWarehouseWrapper = () => {
  const { createWarehouse, isLoading } = useWarehousesMutations()
  
  return (
    <WarehouseForm
      onSubmit={createWarehouse}
      isLoading={isLoading}
    />
  )
}