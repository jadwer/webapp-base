'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { StockForm } from './StockForm'
import { useStockMutations } from '../hooks'
import type { CreateStockData, UpdateStockData } from '../types'

const LIST_HREF = '/dashboard/inventory/stock'

export const CreateStockWrapper = () => {
  const navigation = useNavigationProgress()
  const { createStock } = useStockMutations()

  const handleSubmit = async (data: CreateStockData | UpdateStockData) => {
    await createStock(data as CreateStockData)
    toast.success('Registro de stock creado')
    navigation.push(LIST_HREF)
  }

  return <StockForm onSubmit={handleSubmit} onCancel={() => navigation.push(LIST_HREF)} backHref={LIST_HREF} />
}
