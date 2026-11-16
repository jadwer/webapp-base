'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { WarehouseForm, type LocationDraft } from './WarehouseForm'
import { useWarehousesMutations } from '../hooks'
import { locationsService } from '../services'
import { apiErrorMessage } from '../utils/listing'
import type { CreateWarehouseData, UpdateWarehouseData } from '../types'

const LIST_HREF = '/dashboard/inventory/warehouses'

export const CreateWarehouseWrapper = () => {
  const navigation = useNavigationProgress()
  const { createWarehouse } = useWarehousesMutations()

  const handleSubmit = async (data: CreateWarehouseData | UpdateWarehouseData, locations: LocationDraft[]) => {
    const created = await createWarehouse(data as CreateWarehouseData)
    const warehouseId = String(created?.data?.id ?? '')

    // El almacen ya existe: si una ubicacion falla se avisa con el motivo y se manda a su consulta
    // para completarla ahi, en vez de dejar el formulario en un estado a medias.
    const failed: string[] = []
    for (const location of locations) {
      try {
        await locationsService.create({ ...location, warehouseId })
      } catch (err) {
        failed.push(`${location.name}: ${apiErrorMessage(err, 'no se pudo crear')}`)
      }
    }

    if (failed.length > 0) {
      toast.error(`Almacén creado, pero faltaron ubicaciones. ${failed.join(' · ')}`)
      navigation.push(`${LIST_HREF}/${warehouseId}`)
      return
    }
    toast.success(locations.length > 0 ? `Almacén creado con ${locations.length} ubicaciones` : 'Almacén creado')
    navigation.push(warehouseId ? `${LIST_HREF}/${warehouseId}` : LIST_HREF)
  }

  return <WarehouseForm onSubmit={handleSubmit} onCancel={() => navigation.push(LIST_HREF)} backHref={LIST_HREF} />
}
