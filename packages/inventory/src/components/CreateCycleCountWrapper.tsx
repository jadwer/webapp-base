'use client'

import React from 'react'
import { toast, useNavigationProgress } from '@lwm/ui'
import { CycleCountForm } from './CycleCountForm'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { apiErrorList } from '../utils/listing'
import type { CycleCountFormData } from '../types'

const LIST_HREF = '/dashboard/inventory/cycle-counts'

export const CreateCycleCountWrapper: React.FC = () => {
  const navigation = useNavigationProgress()
  const { createCycleCount, isLoading } = useCycleCountMutations()
  const [errors, setErrors] = React.useState<string[]>([])

  const handleSubmit = async (data: CycleCountFormData) => {
    try {
      setErrors([])
      const created = await createCycleCount({
        warehouseId: data.warehouseId,
        productId: data.productId,
        scheduledDate: data.scheduledDate,
        warehouseLocationId: data.warehouseLocationId,
        assignedTo: data.assignedTo,
        abcClass: data.abcClass,
        notes: data.notes,
      })
      toast.success(`Conteo ${created.countNumber} programado`)
      navigation.push(`${LIST_HREF}/${created.id}`)
    } catch (err) {
      setErrors(apiErrorList(err, 'No se pudo programar el conteo.'))
    }
  }

  return <CycleCountForm onSubmit={handleSubmit} isLoading={isLoading} backHref={LIST_HREF} submitErrors={errors} />
}
