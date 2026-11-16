'use client'

import React from 'react'
import { toast, useNavigationProgress } from '@lwm/ui'
import { CycleCountForm } from './CycleCountForm'
import { FormStateCard } from './FormStateCard'
import { useCycleCount } from '../hooks/useCycleCount'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { apiErrorList } from '../utils/listing'
import type { CycleCountFormData } from '../types'

const LIST_HREF = '/dashboard/inventory/cycle-counts'

interface EditCycleCountWrapperProps {
  id: string
}

export const EditCycleCountWrapper: React.FC<EditCycleCountWrapperProps> = ({ id }) => {
  const navigation = useNavigationProgress()
  const { cycleCount, isLoading: loadingData, error: loadError } = useCycleCount({ id })
  const { updateCycleCount, isLoading: updating } = useCycleCountMutations()
  const [errors, setErrors] = React.useState<string[]>([])
  const detailHref = `${LIST_HREF}/${id}`

  if (loadingData) return <FormStateCard state="loading" title="Editar conteo" backHref={LIST_HREF} message="Cargando conteo..." />
  if (loadError) return <FormStateCard state="error" title="Editar conteo" backHref={LIST_HREF} message={loadError.message || 'No se pudo cargar el conteo.'} />
  if (!cycleCount) return <FormStateCard state="not-found" title="Editar conteo" backHref={LIST_HREF} icon="bi-clipboard-check" message="El conteo no existe o no está disponible." />
  if (cycleCount.status !== 'scheduled') {
    return <FormStateCard state="error" title={`Conteo ${cycleCount.countNumber}`} backHref={detailHref} message="Solo se edita un conteo programado. Este ya se inició, se registró o se canceló." />
  }

  const handleSubmit = async (data: CycleCountFormData) => {
    try {
      setErrors([])
      await updateCycleCount(id, {
        warehouseId: data.warehouseId,
        productId: data.productId,
        scheduledDate: data.scheduledDate,
        warehouseLocationId: data.warehouseLocationId ?? null,
        abcClass: data.abcClass ?? null,
        notes: data.notes ?? null,
      })
      toast.success('Conteo actualizado')
      navigation.push(detailHref)
    } catch (err) {
      setErrors(apiErrorList(err, 'No se pudo guardar el conteo.'))
    }
  }

  return (
    <CycleCountForm
      initialData={{
        warehouseId: cycleCount.warehouse?.id || '',
        productId: cycleCount.product?.id || '',
        scheduledDate: cycleCount.scheduledDate,
        warehouseLocationId: cycleCount.warehouseLocation?.id,
        abcClass: cycleCount.abcClass ?? undefined,
        notes: cycleCount.notes ?? undefined,
      }}
      initialProduct={cycleCount.product ?? null}
      onSubmit={handleSubmit}
      isLoading={updating}
      isEdit
      countNumber={cycleCount.countNumber}
      backHref={detailHref}
      submitErrors={errors}
    />
  )
}
