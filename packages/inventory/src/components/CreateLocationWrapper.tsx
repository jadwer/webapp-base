'use client'

import { LocationForm } from './LocationForm'
import { useLocationsMutations } from '../hooks'
import type { CreateLocationData, UpdateLocationData } from '../types'

export const CreateLocationWrapper = () => {
  const { createLocation } = useLocationsMutations()
  
  const handleSubmit = async (data: CreateLocationData | UpdateLocationData) => {
    await createLocation(data as CreateLocationData)
  }
  
  return (
    <LocationForm
      onSubmit={handleSubmit}
    />
  )
}