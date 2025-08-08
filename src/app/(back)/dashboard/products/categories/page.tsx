'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { CategoriesAdminTemplate } from '@/ui/components/products'

export default function CategoriesPage() {
  const navigation = useNavigationProgress()

  const handleCreateCategory = () => {
    // TODO: Implement category creation modal or navigate to create page
    console.log('Create category')
  }

  const handleEditCategory = (categoryId: string) => {
    // TODO: Implement category edit modal or navigate to edit page
    console.log('Edit category:', categoryId)
  }

  const handleViewCategory = (categoryId: string) => {
    // TODO: Implement category view modal or navigate to view page
    console.log('View category:', categoryId)
  }

  return (
    <div className="container-fluid py-4">
      {/* Breadcrumb */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button
          size="small"
          variant="secondary"
          buttonStyle="ghost"
          onClick={() => navigation.push('/dashboard/products')}
        >
          <i className="bi bi-arrow-left me-1" />
          Productos
        </Button>
      </div>

      {/* Categories Admin Template with Pagination */}
      <CategoriesAdminTemplate
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onViewCategory={handleViewCategory}
      />
    </div>
  )
}