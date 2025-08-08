'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { UnitsAdminTemplate } from '@/ui/components/products'

export default function UnitsPage() {
  const navigation = useNavigationProgress()

  const handleCreateUnit = () => {
    // TODO: Implement unit creation modal or navigate to create page
    console.log('Create unit')
  }

  const handleEditUnit = (unitId: string) => {
    // TODO: Implement unit edit modal or navigate to edit page
    console.log('Edit unit:', unitId)
  }

  const handleViewUnit = (unitId: string) => {
    // TODO: Implement unit view modal or navigate to view page
    console.log('View unit:', unitId)
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

      {/* Units Admin Template with Pagination */}
      <UnitsAdminTemplate
        onCreateUnit={handleCreateUnit}
        onEditUnit={handleEditUnit}
        onViewUnit={handleViewUnit}
      />
    </div>
  )
}