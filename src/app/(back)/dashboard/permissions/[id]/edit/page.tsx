'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { PermissionForm, usePermission, usePermissionActions } from '@/modules/permissions'
import { PermissionFormData } from '@/modules/permissions/types/permission'

interface EditPermissionPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPermissionPage({ params }: EditPermissionPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { permission, isLoading } = usePermission(resolvedParams.id)
  const { update, isSubmitting } = usePermissionActions()

  const handleSubmit = async (data: PermissionFormData) => {
    await update(resolvedParams.id, data)
    router.push('/dashboard/permissions')
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!permission) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Permiso no encontrado
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
        </button>
      </div>
    )
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
                Editar Permiso
              </h1>
              <p className="text-muted mb-0">Modificar permiso: {permission.name}</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <PermissionForm
                    permission={permission}
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
