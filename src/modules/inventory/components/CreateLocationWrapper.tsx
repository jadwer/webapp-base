'use client'

import { LocationForm } from './LocationForm'
import { useLocationsMutations } from '../hooks'
import type { CreateLocationData } from '../types'

export const CreateLocationWrapper = () => {
  const { createLocation } = useLocationsMutations()
  
  const handleSubmit = async (data: CreateLocationData) => {
    await createLocation(data)
  }
  
  return (
    <LocationForm
      onSubmit={handleSubmit}
    />
  )
}