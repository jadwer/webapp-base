'use client'

import { StockForm } from './StockForm'
import { useStockMutations } from '../hooks'
import type { CreateStockData } from '../types'

export const CreateStockWrapper = () => {
  const { createStock } = useStockMutations()
  
  const handleSubmit = async (data: CreateStockData) => {
    await createStock(data)
  }
  
  return (
    <StockForm
      onSubmit={handleSubmit}
    />
  )
}