'use client'

import { toast, useNavigationProgress } from '@lwm/ui'
import { LocationForm } from './LocationForm'
import { FormStateCard } from './FormStateCard'
import { useLocation, useLocationsMutations } from '../hooks'
import type { CreateLocationData, UpdateLocationData } from '../types'

interface EditLocationWrapperProps {
  locationId: string
}

const LIST_HREF = '/dashboard/inventory/locations'

export const EditLocationWrapper = ({ locationId }: EditLocationWrapperProps) => {
  const navigation = useNavigationProgress()
  const detailHref = `${LIST_HREF}/${locationId}`
  const { location, isLoading, error } = useLocation(locationId, ['warehouse'])
  const { updateLocation } = useLocationsMutations()

  const handleSubmit = async (data: CreateLocationData | UpdateLocationData) => {
    await updateLocation(locationId, data as UpdateLocationData)
    toast.success('Ubicación actualizada')
    navigation.push(detailHref)
  }

  if (isLoading) {
    return <FormStateCard state="loading" title="Editar ubicación" backHref={detailHref} message="Cargando ubicación..." />
  }
  if (error) {
    return <FormStateCard state="error" title="Editar ubicación" backHref={LIST_HREF} message={error.message || 'No se pudo cargar la ubicación.'} />
  }
  if (!location) {
    return <FormStateCard state="not-found" title="Editar ubicación" backHref={LIST_HREF} icon="bi-geo-alt" message="La ubicación no existe o no está disponible." />
  }

  return <LocationForm location={location} onSubmit={handleSubmit} onCancel={() => navigation.push(detailHref)} backHref={detailHref} />
}
