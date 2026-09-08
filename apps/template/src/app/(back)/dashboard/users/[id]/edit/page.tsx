'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { UserForm, useUser } from '@/modules/users'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { user, isLoading, error } = useUser(resolvedParams.id)

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

  if (error || !user) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'Usuario no encontrado'}
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-link text-muted p-0 me-3"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-pencil-square text-warning me-2" />
                Editar Usuario
              </h1>
              <p className="text-muted mb-0 text-truncate" title={user.name}>
                Modificar los datos de {user.name}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <UserForm
                user={user}
                onSuccess={() => router.push(`/dashboard/users/${user.id}`)}
                onCancel={() => router.back()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
