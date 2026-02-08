'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BrandForm } from './BrandForm'
import { useBrand, useBrandMutations } from '../hooks'
import { useToast } from '@/ui/hooks/useToast'
import type { CreateBrandData, UpdateBrandData } from '../types'

interface BrandFormWrapperProps {
  brandId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const BrandFormWrapper: React.FC<BrandFormWrapperProps> = ({
  brandId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter()
  const toast = useToast()
  const { brand, isLoading: brandLoading, error: brandError } = useBrand(brandId)
  const { createBrand, updateBrand, isLoading: mutationLoading } = useBrandMutations()

  const handleSubmit = async (formData: CreateBrandData | UpdateBrandData) => {
    try {
      if (brandId && brand) {
        await updateBrand(brandId, formData as UpdateBrandData)
        toast.success('Marca actualizada exitosamente')
      } else {
        await createBrand(formData as CreateBrandData)
        toast.success('Marca creada exitosamente')
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/products/brands')
      }
    } catch {
      toast.error(brandId ? 'Error al actualizar la marca' : 'Error al crear la marca')
    }
  }

  // Loading state for existing brand
  if (brandId && brandLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <div className="placeholder col-4 mb-3" style={{ height: '2rem' }}></div>
            <div className="placeholder col-12 mb-3"></div>
            <div className="placeholder col-8 mb-3"></div>
            <div className="placeholder col-6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state for existing brand
  if (brandId && brandError) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger d-flex align-items-start">
            <i className="bi bi-exclamation-triangle-fill me-2 mt-1" />
            <div>
              <strong>Error al cargar la marca</strong>
              <div className="small mt-1">
                {brandError.message || 'No se pudo obtener la información de la marca'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Brand not found
  if (brandId && !brand && !brandLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-award" />
          </div>
          <h3 className="text-muted mb-2">Marca no encontrada</h3>
          <p className="text-muted mb-4">La marca que buscas no existe o ha sido eliminada</p>
        </div>
      </div>
    )
  }

  return (
    <BrandForm
      brand={brand}
      isLoading={mutationLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default BrandFormWrapper