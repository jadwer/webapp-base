'use client'

import { StockForm } from './StockForm'
import { useStockMutations } from '../hooks'

export const CreateStockWrapper = () => {
  const { createStock } = useStockMutations()
  
  return (
    <StockForm
      onSubmit={createStock}
    />
  )
}