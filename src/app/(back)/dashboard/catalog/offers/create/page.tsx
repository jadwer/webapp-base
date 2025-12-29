'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import OfferForm from '@/modules/catalog/components/OfferForm'

export default function CreateOfferPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard/catalog/offers')
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
                <i className="bi bi-percent text-success me-2" />
                Nueva Oferta
              </h1>
              <p className="text-muted mb-0">Crear una nueva oferta o promocion</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <OfferForm
                    onSubmit={async () => handleSuccess()}
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
