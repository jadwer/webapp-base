'use client'

import React from 'react'
import { BrandFormWrapper } from '@/modules/products/components/BrandFormWrapper'
import { useRouter } from 'next/navigation'

interface EditBrandPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBrandPage({ params }: EditBrandPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard/products/brands')
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-pencil-square text-warning me-2" />
                Editar Marca
              </h1>
              <p className="text-muted mb-0">Modificar los datos de la marca</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <BrandFormWrapper
                    brandId={resolvedParams.id}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}