'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { StockForm } from './StockForm'
import { FormStateCard } from './FormStateCard'
import { useStockItem, useStockMutations } from '../hooks'
import type { CreateStockData, UpdateStockData } from '../types'

interface EditStockWrapperProps {
  stockId: string
}

const LIST_HREF = '/dashboard/inventory/stock'

export const EditStockWrapper = ({ stockId }: EditStockWrapperProps) => {
  const navigation = useNavigationProgress()
  const detailHref = `${LIST_HREF}/${stockId}`
  const { stockItem: stock, isLoading, error } = useStockItem(stockId, ['product', 'warehouse', 'location'])
  const { updateStock } = useStockMutations()

  const handleSubmit = async (data: CreateStockData | UpdateStockData) => {
    await updateStock(stockId, data as UpdateStockData)
    toast.success('Registro de stock actualizado')
    navigation.push(detailHref)
  }

  if (isLoading) {
    return <FormStateCard state="loading" title="Editar registro de stock" backHref={detailHref} message="Cargando registro..." />
  }
  if (error) {
    return <FormStateCard state="error" title="Editar registro de stock" backHref={LIST_HREF} message={error.message || 'No se pudo cargar el registro.'} />
  }
  if (!stock) {
    return <FormStateCard state="not-found" title="Editar registro de stock" backHref={LIST_HREF} icon="bi-boxes" message="El registro de stock no existe o no está disponible." />
  }

  return <StockForm stock={stock} onSubmit={handleSubmit} onCancel={() => navigation.push(detailHref)} backHref={detailHref} />
}
