'use client'

import { LocationForm } from './LocationForm'
import { useLocationsMutations } from '../hooks'

export const CreateLocationWrapper = () => {
  const { createLocation } = useLocationsMutations()
  
  return (
    <LocationForm
      onSubmit={createLocation}
    />
  )
}