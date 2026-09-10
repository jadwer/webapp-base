'use client'

import { StockForm } from './StockForm'
import { useStockMutations } from '../hooks'
import type { CreateStockData, UpdateStockData } from '../types'

export const CreateStockWrapper = () => {
  const { createStock } = useStockMutations()
  
  const handleSubmit = async (data: CreateStockData | UpdateStockData) => {
    await createStock(data as CreateStockData)
  }
  
  return (
    <StockForm
      onSubmit={handleSubmit}
    />
  )
}