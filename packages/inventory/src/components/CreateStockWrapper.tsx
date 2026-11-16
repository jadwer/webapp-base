'use client'

/**
 * Alta de stock (decision 2026-11-15): la cantidad entra como un movimiento de entrada
 * (InventoryMovementService crea o suma el registro y su costo promedio) y despues se
 * guardan en ese registro el estatus y los niveles. Sin cantidad solo se fijan niveles.
 */

import { toast, useNavigationProgress } from '@lwm/ui'
import { useAuth } from '@lwm/auth'
import { useSWRConfig } from 'swr'
import { StockForm, type StockFormResult } from './StockForm'
import { inventoryMovementsService, stockService } from '../services'
import { processJsonApiResponse } from '../utils/jsonApi'
import type { CreateStockData, Stock } from '../types'

const LIST_HREF = '/dashboard/inventory/stock'

/** Registro de stock del producto en ese almacen y ubicacion (sin ubicacion = el general). */
export const findStockRow = async (productId: string, warehouseId: string, locationId?: string): Promise<Stock | undefined> => {
  const response = await stockService.getAll({ filters: { productId, warehouseId }, pagination: { size: 50 } })
  const rows = processJsonApiResponse<Stock[]>(response).data ?? []
  const wanted = locationId ? String(locationId) : ''
  return rows.find((row) => String(row.locationId ?? row.warehouseLocationId ?? '') === wanted)
}

export const CreateStockWrapper = () => {
  const navigation = useNavigationProgress()
  const { user } = useAuth()
  const { mutate } = useSWRConfig()

  const handleSubmit = async ({ settings, entry }: StockFormResult) => {
    const s = settings as CreateStockData
    if (entry) {
      if (!user?.id) throw new Error('No se pudo identificar al usuario. Vuelve a iniciar sesión.')
      await inventoryMovementsService.create({
        movementType: 'entry',
        referenceType: 'manual',
        movementDate: new Date().toISOString(),
        description: 'Alta desde Control de Stock',
        quantity: entry.quantity,
        unitCost: entry.unitCost,
        status: 'completed',
        productId: s.productId,
        warehouseId: s.warehouseId,
        locationId: s.warehouseLocationId,
        userId: String(user.id),
      })
    }

    const levels = { status: s.status, minimumStock: s.minimumStock, maximumStock: s.maximumStock, reorderPoint: s.reorderPoint }
    const row = await findStockRow(s.productId, s.warehouseId, s.warehouseLocationId)
    if (row) {
      await stockService.update(String(row.id), levels)
    } else {
      // Sin entrada: el registro nace en cero solo con sus niveles
      await stockService.create(s)
    }

    mutate((key) => Array.isArray(key) && (key[0] === 'stock' || key[0] === 'stocks' || key[0] === 'inventory-movements'))
    toast.success(entry ? `Entrada de ${entry.quantity} registrada` : 'Niveles de stock guardados')
    navigation.push(LIST_HREF)
  }

  return <StockForm onSubmit={handleSubmit} onCancel={() => navigation.push(LIST_HREF)} backHref={LIST_HREF} />
}
