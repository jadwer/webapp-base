'use client'

import { InventoryMovementForm } from './InventoryMovementForm'
import { useInventoryMovementsMutations } from '../hooks'

export const CreateMovementWrapper = () => {
  const { createMovement } = useInventoryMovementsMutations()
  
  return (
    <InventoryMovementForm
      onSubmit={createMovement}
    />
  )
}