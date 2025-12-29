'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { PermissionForm, usePermissionActions } from '@/modules/permissions'
import { PermissionFormData } from '@/modules/permissions/types/permission'

export default function CreatePermissionPage() {
  const router = useRouter()
  const { create, isSubmitting } = usePermissionActions()

  const handleSubmit = async (data: PermissionFormData) => {
    await create(data)
    router.push('/dashboard/permissions')
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
                <i className="bi bi-shield-plus text-success me-2" />
                Nuevo Permiso
              </h1>
              <p className="text-muted mb-0">Crear un nuevo permiso del sistema</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <PermissionForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
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
