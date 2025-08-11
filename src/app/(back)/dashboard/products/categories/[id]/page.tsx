'use client'

import React from 'react'
import { CategoryView } from '@/modules/products'
import { useRouter } from 'next/navigation'

interface CategoryViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CategoryViewPage({ params }: CategoryViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/dashboard/products/categories/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/products/categories')
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver a categorías"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-tag-fill text-primary me-2" />
                Detalles de Categoría
              </h1>
              <p className="text-muted mb-0">Información completa de la categoría</p>
            </div>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <CategoryView
                categoryId={resolvedParams.id}
                onEdit={handleEdit}
                onBack={handleBack}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}