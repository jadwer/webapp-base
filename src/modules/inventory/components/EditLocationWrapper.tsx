'use client'

import { LocationForm } from './LocationForm'
import { useLocation, useLocationsMutations } from '../hooks'

interface EditLocationWrapperProps {
  locationId: string
}

export const EditLocationWrapper = ({ locationId }: EditLocationWrapperProps) => {
  const { location, isLoading: isLoadingLocation, error } = useLocation(locationId, ['warehouse'])
  const { updateLocation } = useLocationsMutations()
  
  const handleSubmit = async (data: any) => {
    await updateLocation(locationId, data)
  }
  
  if (isLoadingLocation) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando datos de la ubicación...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-danger">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 text-danger">Error al cargar la ubicación</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información de la ubicación'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!location) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-geo-alt" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Ubicación no encontrada</h4>
                <p className="text-muted">La ubicación solicitada no existe o no está disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Convert JSON:API format to form format  
  const locationForForm = {
    ...location.attributes,
    id: location.id
  }
  
  return (
    <LocationForm
      location={locationForForm}
      onSubmit={handleSubmit}
      isEditing={true}
    />
  )
}