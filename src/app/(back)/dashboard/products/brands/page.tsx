'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { BrandsAdminTemplate } from '@/ui/components/products'

export default function BrandsPage() {
  const navigation = useNavigationProgress()

  const handleCreateBrand = () => {
    // TODO: Implement brand creation modal or navigate to create page
    console.log('Create brand')
  }

  const handleEditBrand = (brandId: string) => {
    // TODO: Implement brand edit modal or navigate to edit page
    console.log('Edit brand:', brandId)
  }

  const handleViewBrand = (brandId: string) => {
    // TODO: Implement brand view modal or navigate to view page
    console.log('View brand:', brandId)
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

      {/* Brands Admin Template with Pagination */}
      <BrandsAdminTemplate
        onCreateBrand={handleCreateBrand}
        onEditBrand={handleEditBrand}
        onViewBrand={handleViewBrand}
      />
    </div>
  )
}