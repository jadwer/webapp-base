'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CategoryForm } from './CategoryForm'
import { useCategory, useCategoryMutations } from '../hooks'
import { useToast } from '@/ui/hooks/useToast'
import { Alert } from '@/ui/components/base'
import type { CreateCategoryData, UpdateCategoryData } from '../types'

interface CategoryFormWrapperProps {
  categoryId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const CategoryFormWrapper: React.FC<CategoryFormWrapperProps> = ({
  categoryId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter()
  const toast = useToast()
  const { category, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId)
  const { createCategory, updateCategory, isLoading: mutationLoading } = useCategoryMutations()

  const handleSubmit = async (formData: CreateCategoryData | UpdateCategoryData) => {
    try {
      if (categoryId && category) {
        await updateCategory(categoryId, formData as UpdateCategoryData)
        toast.success('Categoría actualizada exitosamente')
      } else {
        await createCategory(formData as CreateCategoryData)
        toast.success('Categoría creada exitosamente')
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/products/categories')
      }
    } catch {
      toast.error(categoryId ? 'Error al actualizar la categoría' : 'Error al crear la categoría')
    }
  }

  // Loading state for existing category
  if (categoryId && categoryLoading) {
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

  // Error state for existing category
  if (categoryId && categoryError) {
    return (
      <div className="card">
        <div className="card-body">
          <Alert 
            variant="danger" 
            title="Error al cargar la categoría"
            showIcon={true}
          >
            {categoryError.message || 'No se pudo obtener la información de la categoría'}
          </Alert>
        </div>
      </div>
    )
  }

  // Category not found
  if (categoryId && !category && !categoryLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-tag" />
          </div>
          <h3 className="text-muted mb-2">Categoría no encontrada</h3>
          <p className="text-muted mb-4">La categoría que buscas no existe o ha sido eliminada</p>
        </div>
      </div>
    )
  }

  return (
    <CategoryForm
      category={category}
      isLoading={mutationLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default CategoryFormWrapper